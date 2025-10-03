import { Medication } from "../models/medicationModel.js";

// Utility to get the current day code for comparison (e.g., 'TH')
const getCurrentDayCode = () => {
    const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    return days[new Date().getDay()];
};

export const checkDueMedications = async () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  // Format current time for comparison (e.g., '12:14')
  const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
  console.log(`[DEBUG] Current system time for check: ${currentTimeStr}`);

  // Fetch all active medications for all users
  const meds = await Medication.find({ active: true });
  console.log("All active medications retrieved:", meds.length);

  const todayDayCode = getCurrentDayCode(); // e.g., 'TH'

  const dueMeds = [];

  for (const med of meds) {
    const freq = med.frequency.toLowerCase().trim();
    
    // --- FIX 1: DEFENSIVELY HANDLE TIMES STRING/ARRAY ---
    // This converts a comma-separated string back into an array of clean time strings.
    const doseTimes = Array.isArray(med.times) 
        ? med.times 
        : String(med.times).split(',').map(t => t.trim()).filter(t => t.length > 0);
    // ----------------------------------------------------

    let isDueToday = false;
    
    // --- LOGIC 1: Weekly Medication Check ---
    if (freq === "weekly") {
        // FIX 2: Check against the 2-letter day code saved by the controller (e.g., 'MO', 'WE')
        if (med.dayOfWeek?.includes(todayDayCode)) {
            isDueToday = true;
        } else {
            // console.log(`[DEBUG] Medication ${med.pillName} skipped: Today (${todayDayCode}) not in dayOfWeek array (${med.dayOfWeek}).`);
            continue; // Skip if it's not the scheduled day
        }
    }
    
    // --- LOGIC 2: Daily Medication Check ---
    // 'daily' must run every day. 'as_needed' should be ignored by the reminder service.
    if (freq === "daily") {
        isDueToday = true;
    }

    // --- LOGIC 3: Skip "As Needed" medications from reminders ---
    if (freq.includes("as needed")) {
        // console.log(`[DEBUG] Medication ${med.pillName} skipped: As Needed frequency.`);
        continue;
    }


    // --- FINAL TIME CHECK ---
    if (isDueToday) {
        const isTimeMatch = doseTimes.some(scheduledTime => {
            // FIX 3: Compare the already normalized HH:mm string from the DB
            // against the current HH:mm string we just formatted.
            return scheduledTime === currentTimeStr;
        });

        if (isTimeMatch) {
            dueMeds.push(med);
            console.log(`✅ [DUE] Medication: ${med.pillName} is due at ${currentTimeStr}`);
        }
    }
  }

  console.log("Medications due now:", dueMeds.length);
  return dueMeds;
};