import React from 'react';
import Button from '../common/Button';

// Utility to check if a frequency means 'today'
const isScheduledForToday = (frequency) => {
    // For MVP, we assume any frequency is active today, 
    // except for more complex types like 'Weekly' or 'Every other day'
    // which need date logic (beyond simple frequency string comparison).
    
    // For now, we only exclude specific future complexities
    if (frequency === 'Every other day' || frequency === 'Weekly') {
        // Implement full date checking logic here later if needed.
        // For simplicity, we assume Daily/Twice a day is for today.
        return true; 
    }
    return true; // Assume true for simple frequencies like "Daily", "Twice a day"
};

const ScheduleList = ({ medications, onEdit, onDelete, onLogDose }) => {
    
    // A helper function to generate today's schedule from the medication list
    const generateTodaysSchedule = () => {
        const schedule = [];
        medications.forEach(med => {
            // Check if the medication is scheduled to be taken today
            if (isScheduledForToday(med.frequency)) {
                med.times.forEach(time => {
                    schedule.push({
                        _id: med._id, // medicationId
                        pillName: med.pillName,
                        dosage: med.dosage,
                        scheduledTime: time,
                        // Future improvement: Add 'logStatus' here based on DoseLog history
                    });
                });
            }
        });
        // Sort the schedule by time
        return schedule.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    };

    const todaysSchedule = generateTodaysSchedule();

    if (todaysSchedule.length === 0) {
        return <p>You have no doses scheduled for today.</p>;
    }

    // --- Styling ---
    const itemStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '10px',
        backgroundColor: '#f9f9f9',
    };
    const buttonGroupStyle = { display: 'flex', gap: '10px' };

    return (
        <div style={{ marginTop: '1rem' }}>
            <h3>Today's Doses</h3>
            {todaysSchedule.map((dose, index) => (
                <div key={`${dose._id}-${dose.scheduledTime}-${index}`} style={itemStyle}>
                    <div style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, marginRight: '15px' }}>
                                {dose.pillName} ({dose.dosage})
                            </h4>
                            {/* --- ADD Edit/Delete Buttons here to fulfill requirement --- */}
                            <Button 
                                onClick={() => onEdit({ _id: dose._id, pillName: dose.pillName, dosage: dose.dosage, times: [dose.scheduledTime] })}
                                style={{ backgroundColor: '#ffc107', color: '#333', padding: '5px 10px' }} 
                            >
                                Edit
                            </Button>
                            <Button 
                                onClick={() => onDelete(dose._id)}
                                style={{ backgroundColor: '#dc3545', padding: '5px 10px', marginLeft: '5px' }} 
                            >
                                Delete
                            </Button>
                        </div>
                        <p style={{ margin: '5px 0 0 0' }}>Scheduled for: <strong>{dose.scheduledTime}</strong></p>
                    </div>
                    
                    {/* Log Dose Buttons */}
                    <div style={buttonGroupStyle}>
                        <Button 
                            onClick={() => onLogDose(dose._id, 'Taken', dose.scheduledTime)}
                            style={{ backgroundColor: '#28a745' }} // Green
                        >
                            Mark as Taken
                        </Button>
                        <Button 
                            onClick={() => onLogDose(dose._id, 'Missed', dose.scheduledTime)}
                            style={{ backgroundColor: '#dc3545' }} // Red
                        >
                            Mark as Missed
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ScheduleList;