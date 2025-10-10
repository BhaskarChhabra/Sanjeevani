// ai.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { DoseLog } from "../models/doseLogModel.js";
import { Medication } from "../models/medicationModel.js";
import { getAIResponse } from "../services/ai.service.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const askAIController = asyncHandler(async (req, res) => {
  const { query } = req.body;
  if (!query || query.trim() === "") throw new ApiError(400, "Query cannot be empty.");

  const userId = req.user._id;
  const sessionId = userId.toString();

  try {
    // --- 1. Fetch all active medications ---
    const medications = await Medication.find({ user: userId })
      .select("pillName dosage times frequency dayOfWeek googleCalendarEventIds")
      .lean();

    console.log("[DEBUG] Medications fetched:", JSON.stringify(medications, null, 2));

    // --- 2. Fetch last dose log ---
    const lastDoseLog = await DoseLog.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .populate({ path: "medication", select: "pillName dosage times" })
      .lean();

    console.log("[DEBUG] Last dose log:", JSON.stringify(lastDoseLog, null, 2));

    // --- 3. Fetch past 7 days of dose logs ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const pastDoseLogs = await DoseLog.find({
      user: userId,
      createdAt: { $gte: sevenDaysAgo }
    })
      .populate({ path: "medication", select: "pillName times" })
      .lean();

    const pastLogsForAI = pastDoseLogs
  .filter(log => log.medication)
  .map(log => {
    const scheduled = new Date(log.scheduledTime); // use scheduledTime field
    const validDate = isNaN(scheduled.getTime()) ? null : scheduled.toDateString();

    return {
      pillName: log.medication.pillName,
      time: log.medication.times?.[0] || "09:00",
      date: validDate || "Unknown",
      status: log.status // Taken / Missed
    };
  })
  .filter(log => log.date !== "Unknown"); // remove invalid ones


    // --- 4. Compute adherence stats ---
    const stats = await DoseLog.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    let totalDoses = 0, takenDoses = 0;
    stats.forEach(group => {
      if (group._id === "Taken") takenDoses = group.count;
      totalDoses += group.count;
    });
    const missedDoses = totalDoses - takenDoses;
    const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
    const dashboardStats = { totalDoses, takenDoses, missedDoses, adherenceRate };
    console.log("[DEBUG] Dashboard stats:", dashboardStats);

    // --- 5. Prepare upcoming meds (next 7 days) ---
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const upcomingLogsForAI = [];

    const parseTimeToMinutes = (s) => {
      if (!s) return null;
      s = s.trim().toLowerCase();
      let m = s.match(/^(\d{1,2}):(\d{2})$/);
      if (m) return Number(m[1]) * 60 + Number(m[2]);
      m = s.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
      if (m) {
        let hh = Number(m[1]), mm = Number(m[2]), ap = m[3].toLowerCase();
        if (ap === "pm" && hh !== 12) hh += 12;
        if (ap === "am" && hh === 12) hh = 0;
        return hh * 60 + mm;
      }
      return null;
    };

    for (const med of medications) {
      const medTimes = med.times.length ? med.times : ["09:00"];
      for (const t of medTimes) {
        const tMinutes = parseTimeToMinutes(String(t));
        if (tMinutes === null) continue;

        for (let offset = 0; offset <= 7; offset++) { // next 7 days only
          const medDate = new Date(todayDate);
          medDate.setDate(medDate.getDate() + offset);
          medDate.setHours(Math.floor(tMinutes / 60), tMinutes % 60, 0, 0);

          upcomingLogsForAI.push({
            pillName: med.pillName,
            dosage: med.dosage,
            time: t,
            date: medDate.toDateString(),
            status: "Upcoming"
          });
        }
      }
    }

    // --- 6. Combine past + upcoming logs for AI context ---
    const doseLogsForAI = [...pastLogsForAI, ...upcomingLogsForAI];
    console.log("[DEBUG] Dose logs for AI (14-day window):", JSON.stringify(doseLogsForAI, null, 2));

    // --- 7. Prepare healthData and call AI ---
    const healthData = { medications, lastDoseLog, dashboardStats, doseLogs: doseLogsForAI };
    console.log("[DEBUG] Health Data sent to AI:", JSON.stringify(healthData, null, 2));

    console.log("[DEBUG] Calling AI with query:", query);
    const aiAnswer = await getAIResponse(query, sessionId, healthData);
    console.log("[DEBUG] AI Response received:", aiAnswer);

    return res.status(200).json(new ApiResponse(200, {
      answer: aiAnswer,
      dashboardStats
    }, "AI response with past and upcoming doses sent successfully."));

  } catch (error) {
    console.error("❌ AI Controller Error:", error);
    return res.status(500).json(new ApiResponse(500, {
      answer: "System error while fetching your medication data. Try again.",
      dashboardStats: {}
    }, "Internal system error."));
  }
});

export { askAIController };
