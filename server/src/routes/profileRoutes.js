// routes/profileRoutes.js
import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js"; // ✅ corrected import

const router = express.Router();

// Use the correct middleware
router.get("/:userId", isAuthenticated, getProfile);
router.put("/:userId", isAuthenticated, updateProfile);

export default router;
