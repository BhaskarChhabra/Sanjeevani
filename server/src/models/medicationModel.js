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
        type: [String], // e.g., ["09:00", "21:00"]
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    googleCalendarEventIds: {
        type: [String],
        default: [],
    },
    active: { 
        type: Boolean, 
        default: true
    },
    dayOfWeek: { 
        type: [String], 
        default: [] 
    },
}, { timestamps: true });

export const Medication = mongoose.model('Medication', medicationSchema);
