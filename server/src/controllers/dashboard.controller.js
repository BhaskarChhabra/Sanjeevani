import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { DoseLog } from "../models/doseLogModel.js";
import mongoose from "mongoose";

/**
 * @description Get adherence statistics for the dashboard
 * @route GET /api/v1/dashboard/stats
 * @access Private
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    // We need the user's ID to filter their dose logs
    const userId = req.user._id;

    // --- MongoDB Aggregation Pipeline ---
    // This is like a multi-step query to process data.
    const stats = await DoseLog.aggregate([
        {
            // Step 1: Filter documents to only get logs for the current user
            $match: {
                user: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            // Step 2: Group the documents by their 'status' ('Taken' or 'Missed')
            $group: {
                _id: "$status", // Group by the 'status' field
                count: { $sum: 1 } // Count how many documents are in each group
            }
        }
    ]);

    // --- Process the Aggregation Results ---
    let totalDoses = 0;
    let takenDoses = 0;

    // The result 'stats' will be an array like: [{ _id: 'Taken', count: 50 }, { _id: 'Missed', count: 10 }]
    stats.forEach(group => {
        if (group._id === "Taken") {
            takenDoses = group.count;
        }
        totalDoses += group.count;
    });
    
    const missedDoses = totalDoses - takenDoses;

    // Calculate adherence rate, handling the case where totalDoses is 0
    const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

    // Prepare the final data object for the frontend
    const dashboardData = {
        totalDoses,
        takenDoses,
        missedDoses,
        adherenceRate, // e.g., 83
        // We can add more stats here in the future, like a 7-day trend
    };

    return res.status(200).json(
        new ApiResponse(200, dashboardData, "Dashboard statistics fetched successfully")
    );
});

export { getDashboardStats };