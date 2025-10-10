import mongoose from "mongoose";
import { Medication } from "./src/models/medicationModel.js";
import { DoseLog } from "./src/models/doseLogModel.js";

const MONGO_URI =
  "mongodb+srv://Sanjeevani4all:Password321@cluster0.fczs2z9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

await mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log("✅ Connected to MongoDB");

try {
  const medDel = await Medication.deleteMany({});
  const logDel = await DoseLog.deleteMany({});
  console.log(`🧹 Cleared data:
  - Medications deleted: ${medDel.deletedCount}
  - DoseLogs deleted: ${logDel.deletedCount}`);
} catch (err) {
  console.error("❌ Error clearing DB:", err);
} finally {
  await mongoose.connection.close();
  console.log("🔒 MongoDB connection closed");
}
