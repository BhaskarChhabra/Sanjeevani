import mongoose, { Schema } from "mongoose";

const doseLogSchema = new Schema({
  medication: {
    type: Schema.Types.ObjectId,
    ref: "Medication",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  scheduledTime: {
    type: Date, // Full timestamp
    required: true,
  },
  status: {
    type: String,
    enum: ["Taken", "Missed"],
    required: true,
  },
  loggedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export const DoseLog = mongoose.model("DoseLog", doseLogSchema);
