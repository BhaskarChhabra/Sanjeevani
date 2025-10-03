import cron from 'node-cron'; // You need to install this: npm install node-cron
import { Medication } from "../models/medicationModel.js";
import { DoseLog } from "../models/doseLogModel.js";
import { sendEmail } from "../services/email.service.js"; // Existing service
import { sendVerificationCall } from "../services/voice.service.js"; // Existing service
import { User } from "../models/userModel.js"; // To get user details (email, phone, verification method)

// Helper function to format time (e.g., "09:00") to be slightly in the future
const getFutureTimeCheck = () => {
    const now = new Date();
    // Check for doses scheduled in the next 1 minute (12:00:00 to 12:00:59)
    now.setMinutes(now.getMinutes() + 1); 
    return now.toTimeString().substring(0, 5); // Returns "HH:MM"
};

/**
 * @description The main function that runs periodically to check and send reminders.
 */
const checkAndSendReminders = async () => {
    try {
        const targetTime = getFutureTimeCheck();
        
        // 1. Find all medications that are due in the target time slot (e.g., "09:00")
        // We look for any medication whose 'times' array contains the targetTime string.
        const dueMedications = await Medication.find({
            times: { $in: [targetTime] },
            isDeleted: false // Don't send reminders for deleted schedules
        }).populate({
            path: 'user', // Populate user details to get email, phone, and verification preference
            select: 'email phone verificationMethod' // Select only necessary fields
        });

        if (dueMedications.length === 0) {
            console.log(`[Scheduler] No doses due at ${targetTime}.`);
            return;
        }

        console.log(`[Scheduler] Found ${dueMedications.length} doses due at ${targetTime}. Initiating reminders...`);

        for (const med of dueMedications) {
            // Check if the dose has already been logged for today to prevent double reminder (CRITICAL STEP)
            // Note: This check needs to be more robust for different frequencies and timezones. 
            // For MVP, we check if a log exists for today with the specific scheduledTime.
            const today = new Date().toISOString().substring(0, 10); // YYYY-MM-DD
            
            const alreadyLogged = await DoseLog.findOne({
                medication: med._id,
                scheduledTime: targetTime,
                createdAt: { // Check only logs created today
                    $gte: new Date(today),
                    $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1))
                }
            });

            if (alreadyLogged) {
                console.log(`[Scheduler] Dose for ${med.pillName} already logged or missed. Skipping reminder.`);
                continue;
            }

            // --- Send Reminder ---
            const userEmail = med.user.email;
            const userPhone = med.user.phone;
            const verificationMethod = med.user.verificationMethod; 
            
            const reminderMessage = `It's time for your ${med.pillName} (${med.dosage}) scheduled for ${targetTime}. Don't miss your dose!`;

            if (verificationMethod === 'email') {
                await sendEmail({
                    email: userEmail,
                    subject: "Sanjeevani: Time for your Medication!",
                    message: `<p>${reminderMessage}</p><p>Please log your dose in the Sanjeevani app.</p>`
                });
                console.log(`[Reminder SENT] Email sent to ${userEmail} for ${med.pillName}.`);

            } else if (verificationMethod === 'phone' && userPhone) {
                // Assuming sendVerificationCall can be re-used to send a simple reminder call
                await sendVerificationCall(userPhone, reminderMessage); 
                console.log(`[Reminder SENT] Voice call initiated to ${userPhone} for ${med.pillName}.`);
            }
            
            // FUTURE IMPROVEMENT: Log that a reminder was sent in a new 'ReminderSentLog' model
        }

    } catch (error) {
        console.error("[CRON ERROR] Failed to run reminder job:", error);
    }
};

/**
 * @description Initializes the cron job to run every minute.
 * The job runs at the start of every minute (e.g., 12:00:00, 12:01:00, etc.)
 */
const initializeReminderScheduler = () => {
    // Schedule to run every minute
    cron.schedule('* * * * *', checkAndSendReminders, {
        scheduled: true,
        timezone: "Asia/Kolkata" // IMPORTANT: Use your server's timezone or UTC
    });
    console.log("✅ Reminder Scheduler initialized: Running every minute.");
};

export { initializeReminderScheduler };