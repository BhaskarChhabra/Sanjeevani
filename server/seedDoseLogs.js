import mongoose from "mongoose"; 
import { DoseLog } from "./src/models/doseLogModel.js";
import { Medication } from "./src/models/medicationModel.js";

const MONGO_URI = "mongodb+srv://Sanjeevani4all:Password321@cluster0.fczs2z9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
await mongoose.connect(MONGO_URI);
console.log("✅ Connected to MongoDB");

const userId = "68dc1f90ed63b50126fd01f9";
const userIdObj = new mongoose.Types.ObjectId(userId); // ✅ use 'new'
const pillName = "vitamin";

try {
  const med = await Medication.findOne({ user: userIdObj, pillName });
  if (!med) throw new Error("❌ Medication not found");

  console.log("💊 Medication found:", med.pillName, med.times);

  await DoseLog.deleteMany({ user: userIdObj, medication: med._id });

  const sampleLogs = [
    { date: "2025-10-05", time: "13:30", status: "Taken" },
    { date: "2025-10-06", time: "13:30", status: "Missed" },
    { date: "2025-10-07", time: "13:30", status: "Taken" },
    { date: "2025-10-08", time: "13:30", status: "Missed" },
    { date: "2025-10-09", time: "13:30", status: "Taken" },
  ];

  const docs = sampleLogs.map((log) => ({
    medication: med._id,
    user: userIdObj,       
    scheduledTime: new Date(`${log.date}T${log.time}:00Z`),
    status: log.status,
  }));

  await DoseLog.insertMany(docs);
  console.log(`✅ Inserted ${docs.length} dose logs successfully!`);

  const inserted = await DoseLog.find({ medication: med._id, user: userIdObj }).sort({ scheduledTime: 1 });
  console.log("🩺 Inserted dose logs:");
  inserted.forEach((log) => console.log(`${log.scheduledTime.toISOString()} — ${log.status}`));

} catch (err) {
  console.error(err);
} finally {
  await mongoose.connection.close();
  console.log("🔒 MongoDB connection closed");
}
