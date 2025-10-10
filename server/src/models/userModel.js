import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [6, "Password must be at least 6 characters long"],
        select: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },

    // --- Account verification ---
    verificationCode: String,
    verificationCodeExpiry: Date,

    // --- Password reset ---
    resetPasswordCode: String,
    resetPasswordExpiry: Date,

    // --- Google Calendar tokens ---
    google: {
        accessToken: { type: String },
        refreshToken: { type: String },
        expiryDate: { type: Number },
    },

}, { timestamps: true });

// --- MIDDLEWARE ---
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// --- METHODS ---
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, email: this.email, username: this.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

// Generate account verification code
userSchema.methods.generateVerificationCode = function () {
    const verificationCode = Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit
    this.verificationCode = verificationCode;
    this.verificationCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    return verificationCode;
};

// Generate password reset code
userSchema.methods.generateResetPasswordCode = function () {
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    this.resetPasswordCode = resetCode;
    this.resetPasswordExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetCode;
};

export const User = mongoose.model("User", userSchema);
