// import cron from "node-cron";
// import { sendAIEmailReminders } from "../services/email.service.js"; // we will export a function from email.service.js

// // Schedule the task to run every hour at minute 0
// cron.schedule("0 * * * *", async () => {
//   console.log("🕑 Running AI reminder check...");
//   try {
//     await sendAIEmailReminders(); // this function will fetch doses and call AI
//   } catch (err) {
//     console.error("Error running AI reminders:", err.message);
//   }
// });
