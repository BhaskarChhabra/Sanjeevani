import axios from "axios";
import { sendEmail } from "../services/email.service.js"; // your existing email service

const AI_API_URL = "http://127.0.0.1:5020/predict"; // Flask AI API

export const checkAndSendReminder = async (dose) => {
  try {
    // Call Python AI API
    const response = await axios.post(AI_API_URL, {
      scheduled_time: dose.scheduledTime, // e.g., "09:00"
    });

    const { probability_missed } = response.data;

    const THRESHOLD_MISS = 0.3; // 30% chance

    if (probability_missed >= THRESHOLD_MISS) {
      // Send extra email
      await sendEmail({
        email: dose.userEmail,
        subject: "Friendly Reminder: Take your medicine",
        message: `<p>Hey! Our AI noticed you usually forget your dose at ${dose.scheduledTime}. Just a friendly reminder 🙂</p>`
      });

      console.log(`✅ Extra reminder sent to ${dose.userEmail}`);
    } else {
      console.log(`ℹ️ No reminder needed for ${dose.userEmail}`);
    }
  } catch (err) {
    console.error("Error checking AI model or sending email:", err.message);
  }
};
