import { Medication } from "../models/medicationModel.js";
import { getCurrentDayCode } from "./reminderUtils.js"; // Assume this import is correct

export const checkDueMedications = async () => {
    const now = new Date();
    // Format the current time into a standardized "HH:mm" string
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    console.log(`[DEBUG] Current system time for check: ${currentTimeStr}`);

    // 🛑 FINAL FIX: Include .populate() to ensure user data is attached 🛑
    const meds = await Medication.find({ active: true }).populate({
        path: 'user',
        select: 'email username isVerified verificationMethod'
    });
    console.log(`[DEBUG] Total active medications fetched: ${meds.length}`);

    const dueMeds = [];
    const todayDayCode = getCurrentDayCode();

    for (const med of meds) {
        // If population failed (user deleted or link broken), skip early
        if (!med.user || !med.user.email) {
            // This safety check should rarely be hit now that populate is running.
            console.log(`[SKIP] Medication ${med.pillName} has no valid user email/reference.`);
            continue;
        }

        const freq = med.frequency.toLowerCase().trim();
        let isDueToday = false;
        
        const doseTimes = Array.isArray(med.times) 
            ? med.times 
            : String(med.times).split(',').map(t => t.trim()).filter(t => t.length > 0);
        
        // --- DETERMINE IF DUE TODAY ---
        if (freq.includes("as needed")) continue;

        if (freq === "weekly") {
            if (med.dayOfWeek?.includes(todayDayCode)) {
                isDueToday = true;
            } else {
                continue;
            }
        }
        
        if (freq === "daily") {
            isDueToday = true;
        }

        // --- CHECK TIME MATCH ---
        if (isDueToday && doseTimes.length > 0) {
            const isTimeMatch = doseTimes.some(scheduledTime => {
                return scheduledTime === currentTimeStr;
            });

            if (isTimeMatch) {
                dueMeds.push(med);
                console.log(`✅ [DUE] Medication: ${med.pillName} is due at ${currentTimeStr}`);
            }
        }
    }

    console.log(`[DEBUG] Medications due now: ${dueMeds.length}`);
    return dueMeds;
};