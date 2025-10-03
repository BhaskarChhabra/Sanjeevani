import cron from 'node-cron';
import { checkDueMedications } from './checkDueMedications.js';
import { sendEmail } from '../services/email.service.js';

const startReminderService = () => {
    console.log('⏰ Reminder service started. Checking for due medications every minute.');

    cron.schedule('* * * * *', async () => {
        try {
            const dueMedications = await checkDueMedications();

            if (dueMedications.length === 0) {
                console.log("No medications due at this time.");
                return;
            }

            for (const med of dueMedications) {
                const user = med.user;
                if (user && user.isVerified) {
                    console.log(`Sending reminder to ${user.email} for ${med.pillName}`);

                    const message = `
                        <h2>Hi ${user.username}, it's time for your medication!</h2>
                        <p>This is a friendly reminder to take your <strong>${med.pillName} (${med.dosage})</strong>.</p>
                        <p>Stay healthy!</p>
                        <p>- Team Sanjeevani</p>
                    `;

                    await sendEmail({
                        email: user.email,
                        subject: `Reminder: Time for your ${med.pillName}`,
                        message,
                    });
                }
            }
        } catch (error) {
            console.error("Error running reminder job:", error);
        }
    });
};

export { startReminderService };
