// ai.controller.js (Final Corrected Code)

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Medication } from "../models/medicationModel.js"; // Needs to be defined
import { DoseLog } from "../models/doseLogModel.js"; // Needs to be defined
import { getAIResponse } from "../services/ai.service.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * @description Handle user's question to the AI chatbot, fetching personalized data.
 * @route POST /api/v1/ai/ask
 * @access Private
 */
const askAIController = asyncHandler(async (req, res) => {
    const { query } = req.body; 
    
    if (!query || query.trim() === "") {
        throw new ApiError(400, "Query cannot be empty.");
    }
    
    const userId = req.user._id;
    const sessionId = userId.toString(); // Use userId as sessionId

    try {
        
        // --- 1. Fetch user medications (Only essential fields selected for efficiency) ---
        const medications = await Medication.find({ 
            user: userId,
            isDeleted: false 
        }).select('pillName dosage times').lean(); 
        
        // --- 2. Fetch only the VERY LAST dose log (Optimization) ---
        const lastDoseLog = await DoseLog.findOne({
            user: userId,
        })
        .sort({ createdAt: -1 })
        .populate({
            path: 'medication', 
            select: 'pillName', 
            model: 'Medication'
        })
        .lean(); 

        // 3. Clean and prepare minimal JSON-safe data (HEALTHDATA IS INITIALIZED HERE)
        const healthData = {
            medications: JSON.parse(JSON.stringify(medications)), 
            lastDoseLog: lastDoseLog ? JSON.parse(JSON.stringify(lastDoseLog)) : null
        };
        
        // --- 🚨 DEBUG LOGGING AND CUSTOM RESPONSE (NOW PLACED CORRECTLY) ---
        console.log('User ID:', userId);
        console.log('Medications Found:', healthData.medications.length);
        
        if (healthData.medications.length === 0) {
            console.warn('CRITICAL: No active medications found for this user! Sending custom response.');
            
            const noMedsMessage = "I can't check your schedule because you currently don't have any active medications listed in your profile. Please add a medication schedule first, and I'll be ready to help!";

            return res
                .status(200)
                .json(new ApiResponse(200, { answer: noMedsMessage }, "No active medications found."));
        }
        // --- END DEBUG/FIX ---

        // 4. Call AI service with query, sessionId, AND the minimal healthData
        const aiAnswer = await getAIResponse(query, sessionId, healthData); 

        return res
            .status(200)
            .json(new ApiResponse(200, { answer: aiAnswer }, "Sanjeevani AI response generated successfully"));
            
    } catch (error) {
        // Log the error for internal debugging
        console.error("❌ Sanjeevani AI Controller Error:", error.message, error);
        
        // Return a generic error message to the client
        const fallbackMessage = "I encountered a system error while trying to fetch your personal data. Please try again or check your account settings.";
        
        return res
            .status(500)
            .json(new ApiResponse(500, { answer: fallbackMessage }, "Internal system error."));
    }
});

export { askAIController };