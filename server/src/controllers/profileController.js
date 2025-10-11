import { User } from '../models/userModel.js';
import { Profile } from '../models/Profile.js';

/**
 * @desc   Get user profile
 * @route  GET /api/v1/profile/:userId
 * @access Private
 */
export const getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("[GET PROFILE] Requested userId:", userId);

        // User ki profile find karo
        const profile = await Profile.findOne({ user: userId });
        console.log("[GET PROFILE] Found profile:", profile);

        const user = await User.findById(userId).select('username email');
        console.log("[GET PROFILE] Found user:", user);

        if (!user) {
            console.warn("[GET PROFILE] User not found:", userId);
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (!profile) {
            console.log("[GET PROFILE] Profile not found, sending basic user info.");
            return res.status(200).json({
                success: true,
                message: "Profile not created yet, sending basic user data.",
                data: {
                    username: user.username,
                    email: user.email,
                }
            });
        }

        const userProfile = {
            ...profile.toObject(),
            username: user.username,
            email: user.email,
        };

        console.log("[GET PROFILE] Sending full userProfile:", userProfile);
        res.status(200).json({
            success: true,
            message: "Profile fetched successfully.",
            data: userProfile
        });

    } catch (error) {
        console.error("[GET PROFILE] Error fetching profile:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc   Create or Update user profile
 * @route  PUT /api/v1/profile/:userId
 * @access Private
 */
export const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("[UPDATE PROFILE] Requested userId:", userId);
        console.log("[UPDATE PROFILE] Body received:", req.body);

        const {
            username,
            dob,
            gender,
            phone,
            emergencyContact,
            medicalInfo,
            avatarUrl,
        } = req.body;

        // 1. User Model me username update karo
        const user = await User.findById(userId);
        console.log("[UPDATE PROFILE] Found user:", user);

        if (!user) {
            console.warn("[UPDATE PROFILE] User not found:", userId);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (username) {
            user.username = username;
            await user.save();
            console.log("[UPDATE PROFILE] Username updated:", username);
        }

        // 2. Profile find karo ya naya banao
        const updatedProfile = await Profile.findOneAndUpdate(
            { user: userId },
            {
                $set: {
                    dob,
                    gender,
                    phone,
                    emergencyContact,
                    medicalInfo,
                    avatarUrl
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        ).populate('user', 'username email');

        console.log("[UPDATE PROFILE] Profile updated successfully:", updatedProfile);
        res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            data: updatedProfile
        });

    } catch (error) {
        console.error("[UPDATE PROFILE] Error updating profile:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
