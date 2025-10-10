import mongoose from 'mongoose';
import { Medication } from './src/models/medicationModel.js'; // Adjust path as needed

// =================================================================
// 🛑 CRITICAL: UPDATE THESE TWO CONSTANTS 🛑
// =================================================================

// 🛑 1. Your MongoDB Atlas Connection String 🛑
const MONGODB_URI = "mongodb+srv://Sanjeevani4all:Password321@cluster0.fczs2z9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; 

// 🛑 2. A Valid User ID to link the orphaned medication to 🛑
const VALID_USER_ID = "68dc1aefed63b50126fd01ce"; 

// =================================================================

const fixBrokenMedication = async () => {
    const medicationName = "vitamin";

    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB connected successfully for cleanup.");

        console.log(`Attempting to reset user link for medication: ${medicationName}...`);
        
        // 1. FILTER: Find all medications named "vitamin", ignoring case (i).
        // This is the guaranteed fix for the "No documents updated" warning.
        const filter = { 
            pillName: { $regex: new RegExp(`^${medicationName}$`, 'i') } 
        };
        
        // 2. UPDATE: Unconditionally set the 'user' field to the valid ID
        const update = { $set: { user: VALID_USER_ID } }; 

        // 3. EXECUTE: Update all matching documents
        const updateResult = await Medication.updateMany(filter, update);

        if (updateResult.modifiedCount > 0) {
            console.log(`\n🎉 SUCCESS: ${updateResult.modifiedCount} document(s) updated!`);
            console.log(`'${medicationName}' is now forcefully linked to user ID: ${VALID_USER_ID}`);
            console.log("Please restart your server and scheduler job.");
        } else {
            // This warning now means either the pill name is incorrect/misspelled, or the document doesn't exist.
            console.log("\n⚠️ WARNING: No documents were updated.");
            console.log("This means NO pill named 'vitamin' (case-insensitive) was found.");
            console.log("If the pill exists, double-check the spelling in the database.");
        }

    } catch (error) {
        console.error("\n❌ CRITICAL ERROR during DB operation:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\nConnection closed.");
    }
};

fixBrokenMedication();