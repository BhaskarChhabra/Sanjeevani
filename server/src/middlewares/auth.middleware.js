import { User } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
    // 1. Token nikaalo (cookie se ya header se)
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    // 2. Agar token nahi hai, toh error bhejo
    if (!token) {
        throw new ApiError(401, "Unauthorized request. Please log in.");
    }

    try {
        // 3. Token ko verify karo. Hamari secret key use hogi.
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // 4. Token se user ID nikaal kar database se user ko dhundo
        // Password field mat select karna
        const user = await User.findById(decodedToken?._id).select("-password");

        // 5. Agar user nahi milta (ho sakta hai user delete ho gaya ho), toh error bhejo
        if (!user) {
            throw new ApiError(401, "Invalid Access Token. User not found.");
        }

        // 6. User object ko request me attach kar do, taaki aage ke controllers use kar sakein
        req.user = user;

        // 7. Sab theek hai, ab agle middleware ya controller par jao
        next();
    } catch (error) {
        // Agar token galat hai ya expire ho gaya hai, toh error bhejo
        throw new ApiError(401, error?.message || "Invalid Access Token.");
    }
}); 