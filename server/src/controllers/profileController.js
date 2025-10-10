// controllers/profileController.js
import { Profile } from "../models/Profile.js";
import { User } from "../models/userModel.js";

export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("GET Profile request for userId:", userId);

    const profile = await Profile.findOne({ user: userId }).populate("user", "username email");

    if (!profile) {
      console.log("No profile found. Returning basic user info:", req.user);
      return res.status(200).json({
        success: true,
        data: { username: req.user.username, email: req.user.email },
      });
    }

    console.log("Profile found:", profile);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    console.log("UPDATE Profile request for userId:", userId);
    console.log("Data received:", updateData);

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    console.log("Profile after update:", updatedProfile);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};
