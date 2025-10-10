// models/Profile.js
import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // one profile per user
  },
  dob: { type: Date },
  gender: { type: String, enum: ["Male", "Female", "Other", "Prefer not to say"] },
  phone: { type: String },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relationship: { type: String },
  },
  medicalInfo: {
    allergies: { type: String },
    conditions: { type: String },
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
  },
  avatarUrl: { type: String },
}, { timestamps: true });

export const Profile = mongoose.model("Profile", profileSchema);
