import { google } from 'googleapis';
import { User } from '../models/userModel.js';

// Using hardcoded values for debugging as you requested (Keeping this block for context)
const oauth2Client = new google.auth.OAuth2(
    "1007356636975-07ja5d68pnfmous5qhqcp2ippl48uhnk.apps.googleusercontent.com", 
    "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",
    "http://localhost:5000/api/v1/google/callback" 
);

// Helper function to get an authenticated client
const getAuthenticatedClient = async (userId) => {
    console.log(`[DEBUG] getAuthenticatedClient: Called for user ID: ${userId}`);
    const user = await User.findById(userId);

    if (!user || !user.google || !user.google.accessToken) {
        console.error(`[DEBUG] getAuthenticatedClient: FAILED. User ${userId} is not connected to Google Calendar or tokens are missing.`);
        return null;
    }
    console.log(`[DEBUG] getAuthenticatedClient: Found Google tokens for user.`);
    
    // Recreate the client here to attach the tokens
    const authClient = new google.auth.OAuth2(
        "1007356636975-07ja5d68pnfmous5qhqcp2ippl48uhnk.apps.googleusercontent.com", 
        "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",  
        "http://localhost:5000/api/v1/google/callback"
    );

    authClient.setCredentials({
        access_token: user.google.accessToken,
        refresh_token: user.google.refreshToken,
        expiry_date: user.google.expiryDate,
    });

    authClient.on('tokens', async (tokens) => {
        console.log('[DEBUG] getAuthenticatedClient: Google tokens were refreshed.');
        if (tokens.refresh_token) user.google.refreshToken = tokens.refresh_token;
        user.google.accessToken = tokens.access_token;
        user.google.expiryDate = tokens.expiry_date;
        // Ensure nested object is marked for Mongoose saving
        user.markModified('google'); 
        await user.save({ validateBeforeSave: false });
        console.log('[DEBUG] getAuthenticatedClient: Refreshed tokens saved to DB.');
    });

    return authClient;
};


export const createCalendarEvents = async (userId, medicationDetails) => {
    console.log(`[DEBUG] createCalendarEvents: Called for user ${userId}`);
    
    const { pillName, dosage, times, frequency } = medicationDetails;
    
    // --- FIX: IMMEDIATELY SKIP "AS NEEDED" MEDICATIONS ---
    if (frequency && frequency.toLowerCase().includes('as needed')) {
        console.log('[DEBUG] createCalendarEvents: Skipping As Needed medication.');
        return [];
    }
    // -----------------------------------------------------

    console.log(`[CRITICAL DEBUG] medicationDetails received:`, medicationDetails);
    console.log(`[CRITICAL DEBUG] Incoming frequency value is: '${frequency}' (type: ${typeof frequency})`);

    try {
        const auth = await getAuthenticatedClient(userId);
        if (!auth) return [];

        const calendar = google.calendar({ version: 'v3', auth });
        const eventSummary = `${pillName} - ${dosage}`;
        const eventIds = [];

        // 1. Determine Recurrence Rule based on frequency
        let recurrenceRule;
        const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        const today = new Date();
        const currentDayOfWeek = days[today.getDay()];

        console.log(`[CRITICAL DEBUG] Comparing frequency: '${frequency}' === 'Weekly' ?`);

        if (frequency && frequency.toLowerCase() === 'weekly') { 
            // FIX: Ensure FREQ is WEEKLY and includes the day the medication was created.
            recurrenceRule = `RRULE:FREQ=WEEKLY;BYDAY=${currentDayOfWeek};COUNT=52`; 
            console.log(`[DEBUG] Recurrence set to Weekly on: ${currentDayOfWeek}`);
        } else {
            // Default to Daily for all others (Daily, Twice a day, etc.)
            recurrenceRule = `RRULE:FREQ=DAILY;COUNT=365`;
            console.log(`[DEBUG] Recurrence set to Daily.`);
        }

        // 2. Create Events
        for (const time of times) {
            const [hour, minute] = time.split(':');
            const eventStartTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute);
            const eventEndTime = new Date(eventStartTime.getTime() + 30 * 60000);

            console.log(`[DEBUG] Preparing event at ${eventStartTime} with recurrence: ${recurrenceRule}`);

            const event = {
                summary: eventSummary,
                description: 'Time to take your scheduled medication from Sanjeevani.',
                start: { dateTime: eventStartTime.toISOString(), timeZone: 'Asia/Kolkata' },
                end: { dateTime: eventEndTime.toISOString(), timeZone: 'Asia/Kolkata' },
                recurrence: [recurrenceRule],
                reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 10 }] },
            };

            const createdEvent = await calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            });

            if (createdEvent.data.id) {
                eventIds.push(createdEvent.data.id);
                console.log(`✅ [SUCCESS] Event created: ${createdEvent.data.htmlLink}`);
            }
        }
        return eventIds;

    } catch (error) {
        console.error('❌ [ERROR] createCalendarEvents:', error.message);
        return [];
    }
};

// Function to delete calendar events
export const deleteCalendarEvents = async (userId, eventIds) => {
    if (!eventIds || eventIds.length === 0) {
        console.log('[DEBUG] deleteCalendarEvents: No event IDs provided, skipping.');
        return;
    }
    console.log(`[DEBUG] deleteCalendarEvents: Called for user ${userId} to delete ${eventIds.length} event(s).`);

    try {
        const auth = await getAuthenticatedClient(userId);
        if (!auth) return;

        const calendar = google.calendar({ version: 'v3', auth });
        for (const eventId of eventIds) {
            console.log(`[DEBUG] deleteCalendarEvents: Attempting to delete event ID: ${eventId}`);
            await calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId,
            });
            console.log(`✅ [SUCCESS] deleteCalendarEvents: Deleted event with ID: ${eventId}`);
        }
    } catch (error) {
        if (error.code !== 404) { // It's okay if the event is already gone (404)
            console.error('❌ [ERROR] deleteCalendarEvents: Failed to delete Google Calendar events:', error.message);
        } else {
            console.log(`[DEBUG] deleteCalendarEvents: Event was already deleted on Google's side.`);
        }
    }
};