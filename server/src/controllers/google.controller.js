import { google } from 'googleapis';
import { User } from '../models/userModel.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

// Using hardcoded values for debugging as you requested
const oauth2Client = new google.auth.OAuth2(
    "1007356636975-07ja5d68pnfmous5qhqcp2ippl48uhnk.apps.googleusercontent.com", 
    "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",
    "http://localhost:5000/api/v1/google/callback" 
);

/**
 * @description Generates the Google login URL and tags it with the user's ID.
 */
export const getAuthUrl = asyncHandler(async (req, res) => {
    const scopes = [
        'https://www.googleapis.com/auth/calendar'
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
 prompt: 'consent', 
        state: req.user._id.toString(),
    });
    
    console.log('[DEBUG] Generated Google Auth URL with state:', url);
    return res.status(200).json(new ApiResponse(200, { url }, "Google Auth URL generated successfully."));
});


/**
 * @description Handles the callback from Google using the "tag" to find the user.
 */
export const handleAuthCallback = asyncHandler(async (req, res) => {
    const { code, state } = req.query;
    const userId = state;

    console.log('[DEBUG] Received callback from Google with state (userId):', userId);

    if (!code) throw new ApiError(400, "Google authorization code is missing.");
    if (!userId) throw new ApiError(400, "User ID from state parameter is missing.");

     try {
        const { tokens } = await oauth2Client.getToken(code);
        
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found for the provided ID.");

        // --- THE SAVE FIX IS HERE ---
        user.google = {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || user.google?.refreshToken,
            expiryDate: tokens.expiry_date,
        };
        
        // IMPORTANT FIX: Mark the nested 'google' object as modified
        // This is crucial for Mongoose to save changes to nested objects.
        user.markModified('google'); 
        
        await user.save({ validateBeforeSave: false });

        console.log(`[DEBUG] Google tokens saved successfully for user: ${user.email}`);

        // Redirect back to the frontend dashboard
        res.redirect('http://localhost:5173/dashboard');

    } catch (error) {
        console.error("Error exchanging code for tokens:", error);
        throw new ApiError(500, "Failed to authenticate with Google.");
    }
});

/**
 * @description Check if the current user has Google Calendar tokens saved.
 * @route GET /api/v1/google/status
 * @access Private (Requires isAuthenticated middleware)
 */
export const getGoogleStatus = asyncHandler(async (req, res) => {
    // --- STEP 1: LOG THE USER & TOKEN VALUE ---
    console.log("--- DEBUG: getGoogleStatus ---");
    console.log("User ID checking status:", req.user._id);

    // --- FIX APPLIED HERE: Check the correct nested field: google.refreshToken ---
    const tokenValue = req.user.google?.refreshToken;
    
    console.log("Value of google.refreshToken:", !!tokenValue ? 'Token EXISTS (length: ' + tokenValue.length + ')' : 'Token is MISSING/NULL');

    // Check if the refreshToken field exists and is not empty/null.
    const isConnected = !!tokenValue; 

    // --- STEP 2: LOG THE FINAL RESULT ---
    console.log("Final isConnected status being sent:", isConnected);
    console.log("-------------------------------");


    return res.status(200).json(
        new ApiResponse(200, { isConnected }, "Google connection status fetched.")
    );
});


/**
 * @description Disconnect Google Calendar by clearing tokens from the database.
 * @route POST /api/v1/google/disconnect
 * @access Private (Requires isAuthenticated middleware)
 */
export const disconnectGoogle = asyncHandler(async (req, res) => {
    // Get the user from the request object
    // We need to fetch the user again to ensure we don't accidentally clear other props on 'google'
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    // --- FIX APPLIED HERE: Clear the specific nested token field ---
    if(user.google) {
        user.google.refreshToken = undefined; 
        user.google.accessToken = undefined; // Also clear the access token
        user.google.expiryDate = undefined; // Also clear the expiry date
    }
    
    await user.save({ validateBeforeSave: false }); // Save the user

    return res.status(200).json(
        new ApiResponse(200, {}, "Google Calendar successfully disconnected.")
    );
});