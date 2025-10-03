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
    scheduledTime: { // Kaun se time ki dawai thi (e.g., "09:00")
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["Taken", "Missed"], // Sirf ye do values hi ho sakti hain
        required: true,
    },
    loggedAt: { // User ne kab "Taken" ya "Missed" mark kiya
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

export const DoseLog = mongoose.model("DoseLog", doseLogSchema);