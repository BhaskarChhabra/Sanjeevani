import mongoose from "mongoose";

const MONGO_URI =
  "mongodb+srv://Sanjeevani4all:Password321@cluster0.fczs2z9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

await mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log("✅ Connected to MongoDB");

// Your User ID and pill name
const userId = "68dc1f90ed63b50126fd01f9";
const pillName = "vitamin";

try {
  // 1️⃣ Find all medications for the user
  const meds = await mongoose.connection
    .collection("medications")
    .find({ user: new mongoose.Types.ObjectId(userId) })
    .toArray();

  console.log("💊 All medications for user:");
  console.log(meds);

  // 2️⃣ Find medication by exact pillName
  const med = await mongoose.connection
    .collection("medications")
    .findOne({
      user: new mongoose.Types.ObjectId(userId),
      pillName: pillName, // exact match
    });

  if (!med) {
    console.log("❌ No medication found for this user and pill");
  } else {
    console.log("✅ Medication found:", med);
  }

  // 3️⃣ Fetch corresponding dose logs
  if (med) {
    const logs = await mongoose.connection
      .collection("dose_logs")
      .find({ medication: med._id, user: new mongoose.Types.ObjectId(userId) })
      .sort({ scheduledTime: 1 })
      .toArray();

    console.log("🩺 Dose logs for this medication:");
    console.log(logs);
  }
} catch (err) {
  console.error(err);
} finally {
  await mongoose.connection.close();
  console.log("🔒 MongoDB connection closed");
}
