import { User } from "./src/models/userModel.js";
import { Medication } from "./src/models/medicationModel.js";
import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://Sanjeevani4all:Password321@cluster0.fczs2z9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const addParacetamolForLast7Days = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get a user (replace with your specific logic if needed)
    const user = await User.findOne();
    if (!user) throw new Error('❌ No user found in DB');

    console.log('Using User:', { _id: user._id, name: user.name || user.email });

    const today = new Date();
    const medications = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

      medications.push({
        pillName: 'VitaminC',
        dosage: '500mg',
        frequency: '2 times a day',
        times: ['09:00', '21:00'],
        user: user._id,
        active: true,
        dayOfWeek: [dayOfWeek],
      });

      console.log(`Prepared medication for ${dayOfWeek}: Vitamin, 500mg`);
    }

    const inserted = await Medication.insertMany(medications);
    console.log(`✅ Successfully inserted ${inserted.length} medications:`);

    inserted.forEach((med) => {
      console.log(`- ID: ${med._id} | ${med.pillName} | Days: ${med.dayOfWeek.join(', ')} | Times: ${med.times.join(', ')}`);
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error:', err);
    await mongoose.disconnect();
  }
};

addParacetamolForLast7Days();
