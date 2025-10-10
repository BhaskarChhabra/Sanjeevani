import mongoose from 'mongoose';
import { User } from './src/models/userModel.js'; // Adjust path as needed

// 🛑 Use your actual MongoDB connection string 🛑
const MONGODB_URI = "mongodb+srv://Sanjeevani4all:Password321@cluster0.fczs2z9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; 
const TARGET_USER_ID = "68dc1aefed63b50126fd01ce"; 

const checkUser = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB connected.");

        const user = await User.findById(TARGET_USER_ID).select('email isVerified');

        if (!user) {
            console.error(`\n❌ ERROR: User ID ${TARGET_USER_ID} NOT FOUND in the database.`);
            console.log("Solution: Find a valid user ID and run the FIX SCRIPT one last time.");
        } else {
            console.log(`\n✅ User Found. Data Check:`);
            console.log(`Email: ${user.email}`);
            console.log(`Verified: ${user.isVerified}`);
            
            if (!user.email) {
                console.error("\n❌ CRITICAL ERROR: The user's 'email' field is empty/null!");
            }
            if (!user.isVerified) {
                console.warn("\n⚠️ WARNING: User is not verified. Your scheduler should skip sending mail unless you remove the verification check.");
            }
        }

    } catch (error) {
        console.error("❌ DB Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

checkUser();