import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/userModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../services/email.service.js";
import { sendVerificationCall } from "../services/voice.service.js";


/**
 * @description Register a new user and send a verification code.
 * @route POST /api/v1/users/register
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, phone, verificationMethod } = req.body;

    if (!username || !email || !password || !phone || !verificationMethod) {
        throw new ApiError(400, "Username, email, password, phone, and verification method are required");
    }

    if (!['email', 'phone'].includes(verificationMethod)) {
        throw new ApiError(400, "Invalid verification method. Choose 'email' or 'phone'.");
    }

    const existedUser = await User.findOne({ $or: [{ email }, { isVerified: true, phone }] });

    if (existedUser) {
        throw new ApiError(409, "User with this email or verified phone already exists");
    }
    
    // Purane unverified user ko update ya naya create karo
    let user = await User.findOne({ email, isVerified: false });
    if(user){
        user.password = password;
        user.username = username;
    } else {
        user = await User.create({ username, email, password });
    }

    const verificationCode = user.generateVerificationCode();
    await user.save({ validateBeforeSave: false });

    // Send verification code
    try {
        if (verificationMethod === 'email') {
            const message = `<h2>Welcome to Sanjeevani!</h2><p>Your verification code is: <strong>${verificationCode}</strong></p><p>This code will expire in 10 minutes.</p>`;
            await sendEmail({
                email: user.email,
                subject: "Sanjeevani - Verify Your Account",
                message,
            });
        } else { // 'phone'
            await sendVerificationCall(phone, verificationCode);
        }

        return res.status(200).json(
            new ApiResponse(200, { email: user.email }, `Verification code sent to your ${verificationMethod}.`)
        );

    } catch (error) {
        // Agar code bhejne me fail ho, toh user ko DB se delete kar do taaki woh dobara try kar sake
        await User.deleteOne({ _id: user._id });
        throw new ApiError(500, `Failed to send verification code via ${verificationMethod}. Please try again.`);
    }
});


/**
 * @description Verify user account with OTP.
 * @route POST /api/v1/users/verify
 * @access Public
 */
const verifyUser = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  console.log("Attempting verification for:", email, "with code:", code);

  if (!email || !code) {
    console.log("❌ Missing email or code in request body");
    throw new ApiError(400, "Email and verification code are required");
  }

  const user = await User.findOne({
    email,
    verificationCode: code,
    verificationCodeExpiry: { $gt: Date.now() },
  });

  console.log("Fetched user from DB:", user ? user.email : "None");

  if (!user) {
    console.log("❌ Invalid or expired verification code");
    throw new ApiError(400, "Invalid or expired verification code.");
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpiry = undefined;
  await user.save();

  console.log("✅ Verification successful for", user.email);

  return res.status(200).json(
    new ApiResponse(200, {}, "Account verified successfully. You can now log in.")
  );
});



/**
 * @description Resend a new verification code to an unverified user.
 * @route POST /api/v1/users/resend-otp
 * @access Public
 */
const resendOtp = asyncHandler(async (req, res) => { // <--- NEW CONTROLLER FUNCTION
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required to resend the verification code.");
    }
    
    // 1. Find the user. Must be UNVERIFIED.
    const user = await User.findOne({ email, isVerified: false });

    if (!user) {
        // Return a 404/400 error if the user is not found or is already verified
        throw new ApiError(404, "User not found or already verified."); 
    }
    
    // 2. Generate and save a new verification code
    const verificationCode = user.generateVerificationCode();
    await user.save({ validateBeforeSave: false });

    // 3. Send verification code
    try {
        // Assuming verification method is email for simplicity of resend, 
        // but ideally check user.verificationMethod if you support phone
        const message = `<h2>Sanjeevani - New Verification Code</h2><p>Your NEW verification code is: <strong>${verificationCode}</strong></p><p>This code will expire in 10 minutes.</p>`;
        await sendEmail({
            email: user.email,
            subject: "Sanjeevani - Resend Verification Code",
            message,
        });

        return res.status(200).json(
            new ApiResponse(200, { email: user.email }, "A new verification code has been successfully sent to your email.")
        );

    } catch (error) {
        throw new ApiError(500, "Failed to send new verification code. Please check your system settings.");
    }
});


/**
 * @description Log in an existing and verified user.
 * @route POST /api/v1/users/login
 * @access Public
 */
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError(404, "User does not exist.");
    }
    
    // --- IMPORTANT: Check if user is verified ---
    if (!user.isVerified) {
        throw new ApiError(403, "Account not verified. Please verify your account first."); // 403: Forbidden
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const accessToken = user.generateAccessToken();
    const loggedInUser = await User.findById(user._id).select("-password");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "strict"
    };

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken }, "User logged in successfully"));
});


/**
 * @description Log out the current user.
 * @route POST /api/v1/users/logout
 * @access Private
 */
const logoutUser = asyncHandler(async (req, res) => {
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "strict"
    };
    return res.status(200)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});


/**
 * @description Get the profile of the currently logged-in user.
 * @route GET /api/v1/users/me
 * @access Private
 */
const getMyProfile = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(new ApiResponse(200, req.user, "User profile fetched successfully"));
});

/**
 * @description Request password reset by sending OTP to user's email.
 * @route POST /api/v1/users/forgot-password
 * @access Public
 */
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * @desc Request password reset (sends OTP)
 * @route POST /api/v1/users/forgot-password
 * @access Public
 */
const forgotPasswordRequest = asyncHandler(async (req, res) => {
  let { email } = req.body;

  if (!email) throw new ApiError(400, "Email is required");

  email = email.trim().toLowerCase();

  const user = await User.findOne({ email, isVerified: true });
  if (!user) throw new ApiError(404, "No verified user found with this email");

  // Generate OTP
  const otp = user.generateResetPasswordCode(); // <-- Use model method
  await user.save({ validateBeforeSave: false });

  // Send email
  const message = `<h2>Password Reset Request</h2>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This code expires in 10 minutes.</p>`;

  try {
    await sendEmail({ email: user.email, subject: "Password Reset OTP", message });
    res.status(200).json(new ApiResponse(200, { email: user.email }, "Password reset OTP sent."));
  } catch (err) {
    console.error("Email sending error:", err);
    throw new ApiError(500, "Failed to send OTP email");
  }
});

/**
 * @desc Verify password reset OTP
 * @route POST /api/v1/users/verify-reset-otp
 * @access Public
 */
const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) throw new ApiError(400, "Email and OTP are required");

  console.log("Verify OTP request:", { email, code });

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
    resetPasswordCode: code,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Invalid or expired OTP");

  res.status(200).json(new ApiResponse(200, { email: user.email }, "OTP verified"));
});

/**
 * @desc Reset password after OTP verification
 * @route POST /api/v1/users/reset-password
 * @access Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword)
    throw new ApiError(400, "Email, OTP, and new password are required");

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
    resetPasswordCode: code,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Invalid or expired OTP");

  user.password = newPassword; // pre-save middleware will hash
  user.resetPasswordCode = undefined;
  user.resetPasswordExpiry = undefined;

  await user.save();

  res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});

export {
  registerUser,
  verifyUser,
  loginUser,
  logoutUser,
  getMyProfile,
  resendOtp,
  forgotPasswordRequest,
  verifyResetOtp,
  resetPassword
};