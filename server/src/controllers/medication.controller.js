// medication.controller.js

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Medication } from "../models/medicationModel.js";
import { createCalendarEvents, deleteCalendarEvents } from '../services/googleCalendar.service.js';

// --- ROBUST UTILITY FUNCTION: FIXES TIME FORMATTING ---
const normalizeTime = (timeString) => {
    const cleanTime = String(timeString).trim().toLowerCase().replace(/\s/g, '');

    if (/^\d{1,2}:\d{2}$/.test(cleanTime)) {
        let [h, m] = cleanTime.split(':');
        h = h.padStart(2, '0');
        m = m.padStart(2, '0');
        return `${h}:${m}`;
    }
    
    if (/^\d{1,2}$/.test(cleanTime)) {
        let hour = parseInt(cleanTime);
        if (hour >= 0 && hour <= 23) {
            return String(hour).padStart(2, '0') + ':00';
        }
    }

    if (cleanTime.includes('am') || cleanTime.includes('pm')) {
        let period = cleanTime.includes('am') ? 'am' : 'pm';
        let timePart = cleanTime.replace(period, '');
        let [hourStr, minuteStr = '00'] = timePart.split(':');
        let hour = parseInt(hourStr);

        if (period === 'pm' && hour !== 12) {
            hour += 12;
        } else if (period === 'am' && hour === 12) {
            hour = 0;
        }
        return `${String(hour).padStart(2, '0')}:${minuteStr.padStart(2, '0')}`;
    }

    return '00:00'; 
};
// -------------------------------------------------------------------

// Utility function to get the 2-letter day code (SU, MO, TU, etc.)
const getTodayDayCode = () => {
    const daysMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    return daysMap[new Date().getDay()];
};


const addMedication = asyncHandler(async (req, res) => {
    console.log('[DEBUG] addMedication: Controller reached.');
    let { pillName, dosage, frequency, times } = req.body;
    
    if (!pillName || !dosage || !frequency || !Array.isArray(times)) {
        throw new ApiError(400, "Pill name, dosage, frequency, and times are required.");
    }

    let daysToSave = [];
    let normalizedTimes = (Array.isArray(times) ? times : []).map(normalizeTime).filter(t => t !== '00:00'); 

    if (frequency.toLowerCase().includes('as needed')) {
        normalizedTimes = []; 
    } 
    else if (frequency.toLowerCase() === 'weekly') {
        const currentDayCode = getTodayDayCode();
        daysToSave = [currentDayCode];
    } 

    const medication = await Medication.create({
        pillName,
        dosage,
        frequency,
        times: normalizedTimes, 
        user: req.user._id,
        active: true, 
        dayOfWeek: daysToSave, 
    });
    console.log(`[DEBUG] addMedication: Medication saved to DB. ID: ${medication._id}`);

    if (!frequency.toLowerCase().includes('as needed')) {
        const eventIds = await createCalendarEvents(req.user._id, medication);
        
        if (eventIds.length > 0) {
            medication.googleCalendarEventIds = eventIds;
            await medication.save({ validateBeforeSave: false });
        } 
    } 

    return res.status(201).json(new ApiResponse(201, medication, "Medication added successfully"));
});

const updateMedication = asyncHandler(async (req, res) => {
    console.log(`[DEBUG] updateMedication: Controller reached for med ID: ${req.params.id}`);
    const { id } = req.params;
    let { pillName, dosage, frequency, times, active } = req.body; 

    const medication = await Medication.findById(id);
    if (!medication) throw new ApiError(404, "Medication not found.");
    if (medication.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this medication.");
    }
    
    let daysToUpdate = [];
    let normalizedTimes = (Array.isArray(times) ? times : []).map(normalizeTime).filter(t => t !== '00:00'); 

    if (frequency.toLowerCase().includes('as needed')) {
        normalizedTimes = [];
    } 
    else if (frequency.toLowerCase() === 'weekly') {
        daysToUpdate = [getTodayDayCode()]; 
    } 
    
    medication.pillName = pillName;
    medication.dosage = dosage;
    medication.frequency = frequency;
    medication.times = normalizedTimes;
    medication.active = (active !== undefined) ? active : medication.active; 
    medication.dayOfWeek = daysToUpdate; 

    await deleteCalendarEvents(req.user._id, medication.googleCalendarEventIds);
    medication.googleCalendarEventIds = []; 

    if (!frequency.toLowerCase().includes('as needed')) {
        const newEventIds = await createCalendarEvents(req.user._id, medication);
        medication.googleCalendarEventIds = newEventIds;
    }
    
    const updatedMedication = await medication.save({ validateBeforeSave: false });
    
    return res.status(200).json(new ApiResponse(200, updatedMedication, "Medication updated successfully"));
});

const deleteMedication = asyncHandler(async (req, res) => {
    console.log('[DEBUG] deleteMedication: Controller reached for med ID:', req.params.id);
    const { id } = req.params;
    const medication = await Medication.findById(id);

    if (!medication) throw new ApiError(404, "Medication not found.");
    if (medication.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this medication.");
    }

    await deleteCalendarEvents(req.user._id, medication.googleCalendarEventIds);
    await Medication.findByIdAndDelete(id);

    return res.status(200).json(new ApiResponse(200, {}, "Medication deleted successfully"));
});

const getAllMedications = asyncHandler(async (req, res) => {
    const medications = await Medication.find({ user: req.user._id });
    return res.status(200).json(new ApiResponse(200, medications, "User medications fetched successfully"));
});

// --- AI/Advanced Controllers ---

// Predictive Adherence (Fixes frontend call)
const getAdherencePrediction = async (req, res) => {
    try {
        const medId = req.params.id;
        // MOCK LOGIC for now: 
        // Simulating a 50/50 prediction for demonstration
        const prediction = Math.random() > 0.5; 

        // The frontend expects { prediction: boolean }
        return res.status(200).json({ success: true, prediction });
    } catch (err) {
        console.error(err);
        // FIX: Ensure JSON is returned on error instead of defaulting to HTML 500 page
        return res.status(500).json({ success: false, error: "Failed to get adherence prediction" });
    }
};

// Drug Interactions (Fixes frontend call)
const checkDrugInteractions = async (req, res) => {
    try {
        // The frontend sends an array of medication objects/names under the 'medications' key
        const { medications } = req.body;
        
        // Ensure medications is an array before proceeding
        const medNames = Array.isArray(medications) ? medications : [];

        // 2. Perform the interaction logic (or call an external service)
        // MOCK LOGIC for now: 
        const mockInteractions = ["NSAID and SSRI: Increased risk of bleeding.", "Warfarin and Acetaminophen: Monitor INR closely."]; 
        
        // Only return interactions if two or more meds are selected
        const interactions = medNames.length >= 2 ? mockInteractions : []; 

        // 3. Send a successful JSON response 
        // The frontend is expecting the interactions array directly, not nested under "meds"
        return res.status(200).json(interactions);
    } catch (err) {
        console.error(err);
        // FIX: Ensure JSON is returned on error instead of defaulting to HTML 500 page
        return res.status(500).json([]);
    }
};

// FIX: Corrected Export Statement
export { 
    addMedication, 
    getAllMedications, 
    updateMedication, 
    deleteMedication, 
    getAdherencePrediction, 
    checkDrugInteractions 
};