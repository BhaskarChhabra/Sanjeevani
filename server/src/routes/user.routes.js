import { Router } from "express";

// Controller se saare zaroori functions import karo
import {
    registerUser,
    verifyUser,
    loginUser,
    logoutUser,
    getMyProfile,
    resendOtp,          // OTP resend
    forgotPasswordRequest, // <-- NAYA: forgot password request
    verifyResetOtp,        // <-- NAYA: verify OTP for reset
    resetPassword          // <-- NAYA: reset password
} from "../controllers/user.controller.js";

// Hamara security guard (middleware) import karo
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

// --- PUBLIC ROUTES (Login Zaroori Nahi) ---
router.route("/register").post(registerUser);
router.route("/verify").post(verifyUser);
router.route("/login").post(loginUser);
router.route("/resend-otp").post(resendOtp);

// --- FORGOT PASSWORD FLOW ---
// Step 1: User email submit karega, OTP send hoga
router.route("/forgot-password").post(forgotPasswordRequest);

// Step 2: User OTP verify karega
router.route("/verify-reset-otp").post(verifyResetOtp);

// Step 3: User naya password set karega
router.route("/reset-password").post(resetPassword);

// --- SECURED ROUTES (Login Zaroori Hai) ---
router.route("/logout").post(isAuthenticated, logoutUser);
router.route("/me").get(isAuthenticated, getMyProfile);

export default router;
