import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Medication } from "../models/medicationModel.js";
import { createCalendarEvents, deleteCalendarEvents } from "../services/googleCalendar.service.js";

// --- UTILITY FUNCTIONS ---
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
    if (hour >= 0 && hour <= 23) return `${String(hour).padStart(2, '0')}:00`;
  }
  if (cleanTime.includes('am') || cleanTime.includes('pm')) {
    let period = cleanTime.includes('am') ? 'am' : 'pm';
    let timePart = cleanTime.replace(period, '');
    let [hourStr, minuteStr = '00'] = timePart.split(':');
    let hour = parseInt(hourStr);
    if (period === 'pm' && hour !== 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${minuteStr.padStart(2, '0')}`;
  }
  return '00:00';
};

const getTodayDayCode = () => {
  const daysMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  return daysMap[new Date().getDay()];
};

const normalizeTimesArray = (times = []) => {
  return (Array.isArray(times) ? times : []).map(normalizeTime).filter(t => t !== '00:00');
};

// --- CONTROLLERS ---
const addMedication = asyncHandler(async (req, res) => {
  let { pillName, dosage, frequency, times } = req.body;
  if (!pillName || !dosage || !frequency || !Array.isArray(times)) {
    throw new ApiError(400, "Pill name, dosage, frequency, and times are required.");
  }

  let daysToSave = [];
  let normalizedTimes = normalizeTimesArray(times);

  if (frequency.toLowerCase().includes('as needed')) normalizedTimes = [];
  else if (frequency.toLowerCase() === 'weekly') daysToSave = [getTodayDayCode()];
  else if (frequency.toLowerCase() === 'daily') daysToSave = ['SU','MO','TU','WE','TH','FR','SA'];

  const medication = await Medication.create({
    pillName,
    dosage,
    frequency,
    times: normalizedTimes,
    user: req.user._id,
    active: true,
    dayOfWeek: daysToSave,
  });

  if (normalizedTimes.length > 0) {
    const eventIds = await createCalendarEvents(req.user._id, medication);
    if (eventIds.length > 0) {
      medication.googleCalendarEventIds = eventIds;
      await medication.save({ validateBeforeSave: false });
    }
  }

  return res.status(201).json(new ApiResponse(201, medication, "Medication added successfully"));
});

const updateMedication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let { pillName, dosage, frequency, times, active } = req.body;

  const medication = await Medication.findById(id);
  if (!medication) throw new ApiError(404, "Medication not found.");
  if (medication.user.toString() !== req.user._id.toString()) throw new ApiError(403, "Unauthorized.");

  let daysToUpdate = [];
  let normalizedTimes = normalizeTimesArray(times);

  if (frequency.toLowerCase().includes('as needed')) normalizedTimes = [];
  else if (frequency.toLowerCase() === 'weekly') daysToUpdate = [getTodayDayCode()];
  else if (frequency.toLowerCase() === 'daily') daysToUpdate = ['SU','MO','TU','WE','TH','FR','SA'];

  medication.pillName = pillName;
  medication.dosage = dosage;
  medication.frequency = frequency;
  medication.times = normalizedTimes;
  medication.active = active !== undefined ? active : medication.active;
  medication.dayOfWeek = daysToUpdate;

  await deleteCalendarEvents(req.user._id, medication.googleCalendarEventIds);
  medication.googleCalendarEventIds = [];
  if (normalizedTimes.length > 0) {
    const newEventIds = await createCalendarEvents(req.user._id, medication);
    medication.googleCalendarEventIds = newEventIds;
  }

  const updatedMedication = await medication.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, updatedMedication, "Medication updated successfully"));
});

const deleteMedication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const medication = await Medication.findById(id);
  if (!medication) throw new ApiError(404, "Medication not found.");
  if (medication.user.toString() !== req.user._id.toString()) throw new ApiError(403, "Unauthorized.");

  await deleteCalendarEvents(req.user._id, medication.googleCalendarEventIds);
  await Medication.findByIdAndDelete(id);

  return res.status(200).json(new ApiResponse(200, {}, "Medication deleted successfully"));
});

const getAllMedications = asyncHandler(async (req, res) => {
  const medications = await Medication.find({ user: req.user._id });
  return res.status(200).json(new ApiResponse(200, medications, "User medications fetched successfully"));
});

export {
  addMedication,
  updateMedication,
  deleteMedication,
  getAllMedications,
};
