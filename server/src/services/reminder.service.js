import { Medication } from "../models/medicationModel.js";

// Utility to get the current day code (e.g., 'TH') for comparison with DB
const getCurrentDayCode = () => {
    const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    // Date.getDay() returns 0 for Sunday, 1 for Monday, etc.
    return days[new Date().getDay()];
};

export const checkDueMedications = async () => {
    const now = new Date();
    // Format the current time into a standardized "HH:mm" string for easy comparison
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    
    console.log(`[DEBUG] Current system time for check: ${currentTimeStr}`);

    // Fetch all active medications
    const meds = await Medication.find({ active: true });
    console.log(`[DEBUG] Total active medications fetched: ${meds.length}`);

    const dueMeds = [];
    const todayDayCode = getCurrentDayCode();

    for (const med of meds) {
        const freq = med.frequency.toLowerCase().trim();
        let isDueToday = false;
        
        // --- 1. DEFENSIVELY GET DOSE TIMES ---
        // Handles the issue where med.times might be saved as a comma-separated string
        const doseTimes = Array.isArray(med.times) 
            ? med.times 
            : String(med.times).split(',').map(t => t.trim()).filter(t => t.length > 0);
        
        // --- 2. DETERMINE IF DUE TODAY ---
        
        // Skip "As Needed" medications
        if (freq.includes("as needed")) {
            continue;
        }

        // Check Weekly medications
        if (freq === "weekly") {
            // FIX: Check against the 2-letter day code saved in the DB
            if (med.dayOfWeek?.includes(todayDayCode)) {
                isDueToday = true;
            } else {
                continue; // Not the scheduled day
            }
        }
        
        // Daily and all other scheduled frequencies (if not 'weekly' or 'as needed')
        if (freq === "daily") {
            isDueToday = true;
        }

        // --- 3. CHECK TIME MATCH ---
        if (isDueToday && doseTimes.length > 0) {
            const isTimeMatch = doseTimes.some(scheduledTime => {
                // FIX: Direct comparison of normalized HH:mm strings
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