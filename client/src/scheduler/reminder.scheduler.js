import cron from 'node-cron';
import { Medication } from "../models/medicationModel.js";
import { DoseLog } from "../models/doseLogModel.js";
import { sendEmail } from "../services/email.service.js";
import { sendVerificationCall } from "../services/voice.service.js";

// Helper: Get current time in "HH:mm" format
const getCurrentTimeStr = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

// Helper: Get 2-letter day code (SU, MO, TU, etc.)
const getCurrentDayCode = () => {
    const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    return days[new Date().getDay()];
};

// Main reminder function
const checkAndSendReminders = async () => {
    try {
        const currentTime = getCurrentTimeStr();
        const todayDayCode = getCurrentDayCode();

        // Fetch active medications due at current time
        const dueMedications = await Medication.find({
            active: true,
            times: currentTime // exact match HH:mm
        }).populate({
            path: 'user',
            select: 'email username phone isVerified verificationMethod'
        });

        if (dueMedications.length === 0) {
            console.log(`[Scheduler] No doses due at ${currentTime}.`);
            return;
        }

        console.log(`[Scheduler] Found ${dueMedications.length} doses due at ${currentTime}.`);

        for (const med of dueMedications) {
            const user = med.user;

            // Defensive checks
            if (!user) {
                console.log(`[SKIP] Medication ${med.pillName} has no assigned user.`);
                continue;
            }
            if (!user.isVerified) {
                console.log(`[SKIP] User ${user.email || user._id} is not verified.`);
                continue;
            }

            // Check if already logged today
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            // Build today's scheduled timestamp for comparison
const [hours, minutes] = currentTime.split(":").map(Number);
const today = new Date();
today.setHours(hours, minutes, 0, 0);
const startOfMinute = new Date(today);
const endOfMinute = new Date(today);
endOfMinute.setSeconds(59, 999);

// Check if dose already logged today for that scheduled minute
const alreadyLogged = await DoseLog.findOne({
  medication: med._id,
  scheduledTime: { $gte: startOfMinute, $lte: endOfMinute },
  createdAt: { $gte: todayStart, $lte: todayEnd }
});


            if (alreadyLogged) {
                console.log(`[SKIP] Dose for ${med.pillName} already logged today.`);
                continue;
            }

            // Check frequency
            const freq = (med.frequency || '').toLowerCase().trim();
            let isDueToday = false;

            if (freq === 'daily') {
                isDueToday = true;
            } else if (freq === 'weekly') {
                if (med.dayOfWeek?.includes(todayDayCode)) {
                    isDueToday = true;
                }
            } else if (freq.includes('as needed')) {
                console.log(`[INFO] Medication ${med.pillName} is 'as needed'. Skipping automated reminder.`);
                continue;
            }

            if (!isDueToday) continue;

            // Prepare reminder
            const reminderMessage = `It's time for your ${med.pillName} (${med.dosage}) scheduled for ${currentTime}. Don't miss your dose!`;
            const method = user.verificationMethod || 'email';

            try {
                if (method === 'email' && user.email) {
                    await sendEmail({
                        email: user.email,
                        subject: "Sanjeevani: Time for your Medication!",
                        message: `<p>Hi ${user.username},</p><p>${reminderMessage}</p><p>Please log your dose in the app.</p>`
                    });
                    console.log(`[Reminder SENT] Email sent to ${user.email} for ${med.pillName}.`);
                } else if (method === 'phone' && user.phone) {
                    await sendVerificationCall(user.phone, reminderMessage);
                    console.log(`[Reminder SENT] Voice call to ${user.phone} for ${med.pillName}.`);
                } else {
                    console.log(`[WARN] No valid contact method for ${user.email || user._id}.`);
                }
            } catch (err) {
                console.error(`[ERROR] Failed to send reminder for ${med.pillName}:`, err.message);
            }
        }

    } catch (err) {
        console.error("[CRON ERROR] Failed to run reminder job:", err);
    }
};

// Initialize cron job
const initializeReminderScheduler = () => {
    cron.schedule('* * * * *', checkAndSendReminders, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
    console.log("✅ Reminder Scheduler initialized: Running every minute.");
};

export { initializeReminderScheduler };
