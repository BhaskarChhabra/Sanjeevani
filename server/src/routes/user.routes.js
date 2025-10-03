import { Router } from "express";

// Controller se saare zaroori functions import karo
import {
    registerUser,
    verifyUser,
    loginUser,
    logoutUser,
    getMyProfile,
    resendOtp, // <--- NAYA IMPORT: resendOtp function import kiya
} from "../controllers/user.controller.js";

// Hamara security guard (middleware) import karo
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();


// --- PUBLIC ROUTES (Login Zaroori Nahi) ---

// Step 1: User register karega aur OTP/Verification code receive karega
router.route("/register").post(registerUser);

// Step 2: User email aur code bhej kar apne account ko verify karega
router.route("/verify").post(verifyUser); 

// Step 3: Verified user ab login kar sakta hai
router.route("/login").post(loginUser);

// Step 4: Unverified user dobara OTP maang sakta hai
router.route("/resend-otp").post(resendOtp); // <--- NAYA ROUTE ADD KIYA

// --- SECURED ROUTES (Login Zaroori Hai) ---
// In routes ko access karne se pehle 'isAuthenticated' middleware chalega

router.route("/logout").post(isAuthenticated, logoutUser);
router.route("/me").get(isAuthenticated, getMyProfile);


export default router;