import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
    pillName: {
        type: String,
        required: true,
        trim: true,
    },
    dosage: {
        type: String,
        required: true,
        trim: true,
    },
    frequency: {
        type: String,
        required: true,
    },
    times: {
        type: [String], // An array of time strings, e.g., ["09:00", "21:00"]
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    googleCalendarEventIds: {
        type: [String],
        default: [], // Default to an empty array
    },
    
    // --- NEW REQUIRED FIELDS ---
    active: { 
        type: Boolean, 
        default: true // Default to true, as the medication is active upon creation
    },
    dayOfWeek: { 
        type: [String], // Array to store 2-letter day codes (e.g., ['MO', 'WE', 'FR'])
        default: [] 
    },
    // ----------------------------
}, { timestamps: true });

export const Medication = mongoose.model('Medication', medicationSchema);