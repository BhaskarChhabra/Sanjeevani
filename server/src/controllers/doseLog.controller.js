import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { DoseLog } from "../models/doseLogModel.js";
import { Medication } from "../models/medicationModel.js"; // Security check ke liye zaroori

/**
 * @description Log a dose as 'Taken' or 'Missed'
 * @route POST /api/v1/doses/log
 * @access Private
 */
const logDose = asyncHandler(async (req, res) => {
    // 1. Frontend se data lo
    const { medicationId, status, scheduledTime } = req.body;

    // 2. Validation
    if (!medicationId || !status || !scheduledTime) {
        throw new ApiError(400, "Medication ID, status, and scheduled time are required.");
    }
    if (!["Taken", "Missed"].includes(status)) {
        throw new ApiError(400, "Invalid status. Must be 'Taken' or 'Missed'.");
    }

    // 3. Security Check: Kya yeh medication sach me isi user ki hai?
    const medication = await Medication.findById(medicationId);
    if (!medication) {
        throw new ApiError(404, "Medication not found.");
    }
    if (medication.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to log a dose for this medication.");
    }

    // 4. Naya dose log create karo
    const doseLog = await DoseLog.create({
        medication: medicationId,
        user: req.user._id,
        status,
        scheduledTime
    });

    // 5. Success response bhejo
    return res.status(201).json(
        new ApiResponse(201, doseLog, `Dose logged as '${status}' successfully`)
    );
});

export { logDose };