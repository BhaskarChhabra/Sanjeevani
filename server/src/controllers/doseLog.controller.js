import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { DoseLog } from "../models/doseLogModel.js";
import { Medication } from "../models/medicationModel.js";

// Log a dose
const logDose = asyncHandler(async (req, res) => {
  const { medicationId, status, scheduledTime, doseDate } = req.body;

  if (!medicationId || !status || !scheduledTime || !doseDate) {
    throw new ApiError(400, "Medication ID, status, scheduled time, and dose date are required.");
  }

  if (!["Taken", "Missed"].includes(status)) {
    throw new ApiError(400, "Invalid status. Must be 'Taken' or 'Missed'.");
  }

  const medication = await Medication.findById(medicationId);
  if (!medication) throw new ApiError(404, "Medication not found.");
  if (medication.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized.");
  }

  const [hours, minutes] = scheduledTime.split(":").map(Number);
  const targetDate = new Date(doseDate); // local midnight
  targetDate.setHours(hours, minutes, 0, 0); // local time

  const timeWindow = 30 * 60 * 1000; // 30 minutes
  const existingLog = await DoseLog.findOne({
    medication: medicationId,
    user: req.user._id,
    scheduledTime: {
      $gte: new Date(targetDate.getTime() - timeWindow),
      $lte: new Date(targetDate.getTime() + timeWindow),
    },
  });

  if (existingLog) {
    existingLog.status = status;
    await existingLog.save();
    return res.status(200).json(new ApiResponse(200, existingLog, "Dose status updated successfully"));
  }

  const doseLog = await DoseLog.create({
    medication: medicationId,
    user: req.user._id,
    status,
    scheduledTime: targetDate,
  });

  return res.status(201).json(new ApiResponse(201, doseLog, "Dose logged successfully"));
});

// Get dose logs for a specific medication
const getDoseLogs = asyncHandler(async (req, res) => {
  const { medicationId } = req.params;
  if (!medicationId) throw new ApiError(400, "Medication ID is required.");

  const logs = await DoseLog.find({
    medication: medicationId,
    user: req.user._id,
  }).sort({ scheduledTime: -1 });

  return res.status(200).json(new ApiResponse(200, logs, "Dose logs fetched successfully"));
});

export { logDose, getDoseLogs };
