// seedMedData.js
import mongoose from "mongoose";
import { Medication } from "./src/models/medicationModel.js";
import { DoseLog } from "./src/models/doseLogModel.js";

const MONGO_URI =
  "mongodb+srv://Sanjeevani4all:Password321@cluster0.fczs2z9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const USER_ID = "68dc1f90ed63b50126fd01f9"; // 🔹 replace with an actual user's ObjectId

async function seedMedication() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("✅ Connected to MongoDB");

  try {
    // 1️⃣ Clear old data
    await Medication.deleteMany({});
    await DoseLog.deleteMany({});
    console.log("🧹 Old Medication & DoseLog cleared");

    // 2️⃣ Create one sample medicine
    const medication = await Medication.create({
      pillName: "Paracetamol 500mg",
      dosage: "1 tablet",
      frequency: "2 times/day",
      times: ["09:00", "21:00"],
      user: USER_ID,
      dayOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    });

    console.log("💊 Added medication:", medication.pillName);

    // 3️⃣ Generate dose logs from 3 Oct → today
    const startDate = new Date("2024-10-03T09:00:00Z");
    const today = new Date();

    const logs = [];
    const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      // Morning dose
      const morning = new Date(currentDate);
      morning.setHours(9, 0, 0, 0);

      // Night dose
      const night = new Date(currentDate);
      night.setHours(21, 0, 0, 0);

      // Randomly mark some as Taken / Missed
      const statusMorning = Math.random() > 0.3 ? "Taken" : "Missed"; // 70% chance taken
      const statusNight = Math.random() > 0.3 ? "Taken" : "Missed";

      logs.push({
        medication: medication._id,
        user: USER_ID,
        scheduledTime: morning,
        status: statusMorning,
      });
      logs.push({
        medication: medication._id,
        user: USER_ID,
        scheduledTime: night,
        status: statusNight,
      });
    }

    const result = await DoseLog.insertMany(logs);
    console.log(`🗓️ Inserted ${result.length} dose logs from 3 Oct → ${today.toDateString()}`);

  } catch (err) {
    console.error("❌ Error seeding data:", err);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 MongoDB connection closed");
  }
}

seedMedication();
