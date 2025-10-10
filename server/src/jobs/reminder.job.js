import cron from 'node-cron';
import { checkDueMedications } from './checkDueMedications.js';
import { sendEmail } from '../services/email.service.js';

const startReminderService = () => {
    console.log('⏰ Reminder service started. Checking for due medications every minute.');

    cron.schedule('* * * * *', async () => {
        console.log('⏰ Running reminder check...');

        let dueMedications;
        try {
            dueMedications = await checkDueMedications();
            console.log(`[DEBUG] Medications due now: ${dueMedications.length}`);
        } catch (err) {
            console.error("[ERROR] Failed to fetch due medications:", err);
            return;
        }

        if (!dueMedications || dueMedications.length === 0) {
            console.log("No medications due at this time.");
            return;
        }

        for (const med of dueMedications) {
            const user = med.user;
            
            console.log(`[DEBUG] Processing medication: ${med.pillName} for user: ${user?.email || 'unpopulated/null'}`);

            // Check 1: Ensure user object and email exist (redundant but safe after checkDueMedications update)
            if (!user || !user.email) {
                console.log(`[SKIP] Medication ${med.pillName} skipped: User or Email is missing.`);
                continue;
            }
            
            // Check 2: Verification check
            if (!user.isVerified) {
                console.warn(`[WARN] User ${user.email} is not verified. Skipping email.`);
                continue;
            }

            try {
                console.log(`Sending email to ${user.email}...`);
                
                await sendEmail({
                    email: user.email, 
                    subject: `Reminder: ${med.pillName}`,
                    message: `
                        <h2>Hi ${user.username || user.email}, it's time for your medication!</h2>
                        <p>Take your <strong>${med.pillName} (${med.dosage})</strong> now.</p>
                        <p>- Team Sanjeevani</p>
                    `,
                });
                console.log(`✅ Email sent to ${user.email}`);
            } catch (err) {
                console.error(`❌ Failed to send email to ${user.email || 'unknown'}:`, err.message || err);
            }
        }
    });
};

export { startReminderService };