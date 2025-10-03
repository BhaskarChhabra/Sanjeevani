import twilio from 'twilio';
import { ApiError } from '../utils/ApiError.js';

// Initialize the Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendVerificationCall = async (phone, code) => {
    // Validate if Twilio credentials are set
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
        console.error("Twilio credentials are not set in the .env file.");
        throw new ApiError(500, "Voice call service is not configured.");
    }

    try {
        // Create a spaced-out format for the code for better pronunciation
        const spacedCode = code.toString().split("").join(" ");

        // Make the API call to Twilio
        await twilioClient.calls.create({
            twiml: `<Response><Say>Your verification code for Sanjeevani is ${spacedCode}. I repeat, your code is ${spacedCode}.</Say></Response>`,
            to: phone, // The user's phone number
            from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
        });
        console.log(`Verification call initiated to ${phone}`);
    } catch (error) {
        console.error("Twilio API Error:", error.message);
        // Throw a specific error that the controller can catch
        throw new ApiError(500, "Failed to make the verification call.");
    }
};

export { sendVerificationCall };