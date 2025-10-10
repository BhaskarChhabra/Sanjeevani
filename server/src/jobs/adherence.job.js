import cron from 'node-cron';
import { Medication } from '../models/medicationModel.js';
import { DoseLog } from '../models/doseLogModel.js';
import { User } from '../models/userModel.js';
//import { getAdherencePrediction } from '../services/ai.service.js';
import { io } from '../socket.js';

const TIME_SLOTS = [
    { name: 'morning', startHour: 6, endHour: 9, minutesBefore: 30 },
    { name: 'noon', startHour: 11, endHour: 14, minutesBefore: 30 },
    { name: 'evening', startHour: 17, endHour: 20, minutesBefore: 45 },
    { name: 'night', startHour: 21, endHour: 23, minutesBefore: 30 },
];

const timeStringToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
};

const checkAdherenceAndSendNudges = async () => {
    if (!io) {
        console.error("❌ Socket.io is not yet initialized. Skipping nudge check.");
        return;
    }

    const now = new Date();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    try {
        const users = await User.find({}).select('_id');

        for (const user of users) {
            const userId = user._id.toString();
            let needsNudgeCheck = false;

            const medications = await Medication.find({ user: userId, isDeleted: false }).select('pillName dosage times').lean();
            if (!medications.length) continue;

            for (const med of medications) {
                if (Array.isArray(med.times)) {
                    for (const timeString of med.times) {
                        const scheduledTimeInMinutes = timeStringToMinutes(timeString);
                        const scheduledHour = Math.floor(scheduledTimeInMinutes / 60);
                        const timeDiff = scheduledTimeInMinutes - currentTimeInMinutes;
                        
                        const slot = TIME_SLOTS.find(s => scheduledHour >= s.startHour && scheduledHour <= s.endHour);

                        if (slot && timeDiff > 0 && timeDiff <= slot.minutesBefore) {
                            needsNudgeCheck = true;
                            break;
                        }
                    }
                }
                if (needsNudgeCheck) break;
            }

            if (needsNudgeCheck) {
                console.log(`[Scheduler] User ${userId} nudge window active. Checking AI.`);
                const fullDoseHistory = await DoseLog.find({ user: userId, createdAt: { $gte: thirtyDaysAgo } }).populate('medication', 'pillName times').lean();
                const healthData = { medications, fullDoseHistory };
                
                // This is a placeholder for your AI service call
                // const prediction = await getAdherencePrediction(healthData);
                const prediction = { nudge: "Don't forget your evening dose! Staying consistent is key." }; // Mock prediction

                if (prediction.nudge) {
                    const nudgeMessage = {
                        id: Date.now(),
                        role: 'model',
                        content: prediction.nudge,
                        pattern: prediction.pattern,
                        timestamp: new Date().toISOString()
                    };
                    io.to(userId).emit('newNudge', nudgeMessage);
                    console.log(`✅ Nudge sent to User ${userId}: "${prediction.nudge}"`);
                }
            }
        }
    } catch (error) {
        console.error("Error during adherence check:", error);
    }
};

export const startAdherenceScheduler = () => {
    cron.schedule('*/15 * * * *', checkAdherenceAndSendNudges);
    console.log('⏰ Adherence Nudge Scheduler started (runs every 15 minutes)');
};
