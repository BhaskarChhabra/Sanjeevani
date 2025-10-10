import nodemailer from "nodemailer";
import { ApiError } from "../utils/ApiError.js";
import { checkAndSendReminder } from "../utils/aiReminder.js";
import { DoseLog } from "../models/doseLogModel.js";

// --- FUNCTION TO FETCH DOSES AND TRIGGER AI REMINDERS ---
export const sendAIDoseReminders = async () => {
  try {
    // Step 1: Define today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Step 2: Fetch today's doses from MongoDB
    const doses = await DoseLog.find({
      scheduledTime: { $gte: startOfDay, $lte: endOfDay }
    }).populate("user");

    if (!doses || doses.length === 0) {
      console.log("ℹ️ No doses found for today.");
      return;
    }

    // Step 3: Loop through each dose and call AI reminder
    for (const dose of doses) {
      if (dose.user && dose.user.email) {
        await checkAndSendReminder({
          scheduledTime: dose.scheduledTime,
          userEmail: dose.user.email,
        });
      }
    }

    console.log("✅ AI reminder check completed.");
  } catch (error) {
    console.error("Error in sendAIDoseReminders:", error.message);
  }
};

// --- EXISTING EMAIL SENDER FUNCTION ---
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use STARTTLS
    auth: {
      user: "noreply.sanjeevani@gmail.com",
      pass: "eagj zrff ffxl jkrr", // app password
    },
  });

  const mailOptions = {
    from: 'Sanjeevani <noreply.sanjeevani@gmail.com>',
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.email}!`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ApiError(500, "Failed to send email.");
  }
};

export { sendEmail };
