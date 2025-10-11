"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
// Yeh imports waise hi rahenge kyunki yeh external libraries aur data stores hain
import useAuthStore from "../store/useAuthStore";
import useMedicationStore from "../store/useMedicationStore";
import {
    addMedication,
    updateMedication,
    deleteMedication,
    logDose,
    getDoseLogs,
    getGoogleAuthUrl,
    getGoogleStatus,
    disconnectGoogle,
} from "../api";


// Is component ki CSS file
import './MedicationsPage.css';

// ---------------------- Helper Functions (Yeh calculations ke liye zaroori hain) ----------------------
const formatDate = (date) => new Date(date).toISOString().split("T")[0];
const parseTimeToMinutes = (s) => {
    if (!s && s !== 0) return null;
    s = String(s).trim();
    const hhmm = s.match(/^(\d{1,2}):(\d{2})$/);
    if (hhmm) return Number(hhmm[1]) * 60 + Number(hhmm[2]);
    const iso = new Date(s);
    if (!isNaN(iso.getTime())) return iso.getHours() * 60 + iso.getMinutes();
    return null;
};
const minutesToAMPM = (mins) => {
    if (mins === null || mins === undefined) return "N/A";
    let hh = Math.floor(mins / 60);
    let mm = mins % 60;
    const ap = hh >= 12 ? "PM" : "AM";
    if (hh > 12) hh -= 12;
    if (hh === 0) hh = 12;
    return `${hh}:${String(mm).padStart(2, "0")} ${ap}`;
};
const minutesToHHMM = (mins) => {
    if (mins === null || mins === undefined) return null;
    const hh = String(Math.floor(mins / 60)).padStart(2, "0");
    const mm = String(mins % 60).padStart(2, "0");
    return `${hh}:${mm}`;
};
const getDayCodeFromDate = (dateStr) => {
    const daysMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    return daysMap[new Date(dateStr).getUTCDay()];
};
const isScheduledForDate = (medication, dateStr) => {
    if (medication.frequency.toLowerCase().includes('as needed') || !medication.times || medication.times.length === 0) return false;
    const dayCode = getDayCodeFromDate(dateStr);
    if (!medication.dayOfWeek || medication.dayOfWeek.length === 0) return true;
    return medication.dayOfWeek.includes(dayCode);
};
const getWeekOfDate = (dateStr) => {
    const d = new Date(dateStr);
    d.setUTCHours(0, 0, 0, 0);
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(d.setUTCDate(diff));
    const week = [];
    for (let i = 0; i < 7; i++) {
        const temp = new Date(startOfWeek);
        temp.setUTCDate(startOfWeek.getUTCDate() + i);
        week.push(formatDate(temp));
    }
    return week;
};


// ---------------------- MODAL COMPONENT (Isi file ke andar define kiya hai) ----------------------
const MedicationModal = ({ medication, onClose, onSubmit }) => {
    // Modal ke form ke liye state
    const [formData, setFormData] = useState({
        pillName: '',
        dosage: '',
        frequency: 'Daily',
        times: ['09:00'],
    });

    // Jab component load ho, aur agar 'medication' prop me data hai (edit mode), toh form ko uss data se bharo
    useEffect(() => {
        if (medication) {
            setFormData({
                pillName: medication.pillName || '',
                dosage: medication.dosage || '',
                frequency: medication.frequency || 'Daily',
                times: medication.times || ['09:00'],
            });
        }
    }, [medication]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTimeChange = (index, value) => {
        const newTimes = [...formData.times];
        newTimes[index] = value;
        setFormData(prev => ({ ...prev, times: newTimes }));
    };

    const addTimeField = () => {
        setFormData(prev => ({ ...prev, times: [...prev.times, ''] }));
    };

    const removeTimeField = (index) => {
        if (formData.times.length > 1) {
            const newTimes = formData.times.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, times: newTimes }));
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{medication ? 'Edit Medication' : 'Add New Medication'}</h2>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Pill Name</label>
                        <input type="text" name="pillName" value={formData.pillName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Dosage (e.g., 500mg)</label>
                        <input type="text" name="dosage" value={formData.dosage} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Frequency</label>
                        <select name="frequency" value={formData.frequency} onChange={handleChange}>
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="As Needed">As Needed</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Times to Take</label>
                        {formData.times.map((time, index) => (
                            <div key={index} className="time-input-group">
                                <input type="time" value={time} onChange={(e) => handleTimeChange(index, e.target.value)} />
                                <button type="button" onClick={() => removeTimeField(index)} className="btn-remove-time">-</button>
                            </div>
                        ))}
                        <button type="button" onClick={addTimeField} className="btn-add-time">+ Add Time</button>
                    </div>
                    <div className="modal-footer">
                        <button type="submit" className="btn-submit">Save Medication</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ---------------------- MEDICATION CARD COMPONENT (Isi file ke andar) ----------------------
const MedicationCard = ({ medication, logs, last7Days, onLogDose, onEdit, onDelete, getDoseStatusForDay }) => {
    
    const today = formatDate(new Date());

    const nextDose = useMemo(() => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        const scheduledMinutes = (medication.times || []).map(parseTimeToMinutes).filter(v => v !== null).sort((a, b) => a - b);
        const takenTodayMinutes = (logs || []).filter(l => l.doseDate === today && l.status === "Taken").map(l => parseTimeToMinutes(l.scheduledTime));
        let nextTime = scheduledMinutes.find(t => t > currentMinutes && !takenTodayMinutes.includes(t));
        
        if (nextTime !== undefined) return { time: minutesToAMPM(nextTime), day: "(Today)" };
        if (scheduledMinutes.length > 0) return { time: minutesToAMPM(scheduledMinutes[0]), day: "(Tomorrow)" };
        return { time: "N/A", day: "" };
    }, [medication.times, logs, today]);
    
    const dosesToLogToday = useMemo(() => {
        const todayLogs = logs.filter(l => l.doseDate === today);
        return (medication.times || []).map(timeStr => {
            const timeMin = parseTimeToMinutes(timeStr);
            const hasBeenTaken = todayLogs.some(l => l.status === 'Taken' && Math.abs(parseTimeToMinutes(l.scheduledTime) - timeMin) <= 1);
            return { timeStr, timeMin, hasBeenTaken };
        }).filter(dose => !dose.hasBeenTaken);
    }, [medication.times, logs, today]);

    return (
        <div className="med-card">
            <div className="med-card-header">
                <h3>{medication.pillName}</h3>
                <span>{medication.dosage}</span>
            </div>
            <div className="weekly-adherence">
                <p>Weekly Adherence</p>
                <div className="adherence-icons">
                    {last7Days.map(day => {
                        const status = getDoseStatusForDay(medication._id, day);
                        const dayOfMonth = new Date(day).getUTCDate();
                        return (
                            <div key={day} className="day-icon-container">
                                <div className={`adherence-icon status-${status}`}></div>
                                <span>{String(dayOfMonth).padStart(2, '0')}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className={`next-dose ${nextDose.day === '(Tomorrow)' ? 'tomorrow' : 'today'}`}>
                <p>🕒 Next Dose Due: <strong>{nextDose.time} {nextDose.day}</strong></p>
            </div>
            <div className="log-dose-section">
                <p>Log Dose for Today:</p>
                {dosesToLogToday.length > 0 ? dosesToLogToday.map(({ timeStr, timeMin }) => (
                     <div key={timeStr} className="log-entry">
                        <span>Scheduled: {minutesToAMPM(timeMin)}</span>
                        <div className="log-buttons">
                            <button className="btn-log taken" onClick={() => onLogDose(medication._id, timeStr, "Taken")}>Taken</button>
                            <button className="btn-log missed" onClick={() => onLogDose(medication._id, timeStr, "Missed")}>Missed</button>
                        </div>
                    </div>
                )) : (
                    <div className="log-entry-done">All doses for today logged!</div>
                )}
            </div>
            <div className="med-card-footer">
                <button className="btn-edit" onClick={onEdit}>Edit</button>
                <button className="btn-delete" onClick={onDelete}>Delete</button>
            </div>
        </div>
    );
};


// ---------------------- MAIN PAGE COMPONENT (THE BOSS) ----------------------
const MedicationsPage = () => {
    // State Management
    const { medications, fetchMedications } = useMedicationStore(state => state);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [medToEdit, setMedToEdit] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isGoogleConnected, setIsGoogleConnected] = useState(false);
    const [medLogsMap, setMedLogsMap] = useState({});

    // Data fetching aur handlers
    const refreshMedsAndLogs = useCallback(async () => {
        await fetchMedications();
    }, [fetchMedications]);

    useEffect(() => {
        const fetchInitialData = async () => {
            await refreshMedsAndLogs();
            try {
                const res = await getGoogleStatus();
                setIsGoogleConnected(!!res?.data?.data?.isConnected);
            } catch (e) { console.error("Failed to get Google status", e); }
        };
        fetchInitialData();
    }, [refreshMedsAndLogs]);
    
    useEffect(() => {
        const fetchAllLogs = async () => {
            if (!medications || medications.length === 0) return;
            const map = {};
            const logsPromises = medications.map(async (med) => {
                try {
                    const res = await getDoseLogs(med._id);
                    map[med._id] = (res?.data?.data || []).map(l => ({...l, doseDate: formatDate(l.doseDate || l.scheduledTime)}));
                } catch (err) { map[med._id] = []; }
            });
            await Promise.all(logsPromises);
            setMedLogsMap(map);
        };

        if (medications.length > 0) fetchAllLogs();
    }, [medications]);

    const handleLogDose = async (medId, time, status) => {
        const today = formatDate(new Date());
        const scheduledTimeHHMM = minutesToHHMM(parseTimeToMinutes(time));
        const payload = { medicationId: medId, status, scheduledTime: scheduledTimeHHMM, doseDate: today };
        try {
            await logDose(payload);
            const res = await getDoseLogs(medId);
             setMedLogsMap(prev => ({...prev, [medId]: (res?.data?.data || []).map(l => ({...l, doseDate: formatDate(l.doseDate || l.scheduledTime)}))}));
        } catch (err) { console.error("Dose log karne me error:", err); }
    };
    
    const handleModalSubmit = async (data) => {
        try {
            if (medToEdit) await updateMedication(medToEdit._id, data);
            else await addMedication(data);
            setIsModalOpen(false);
            setMedToEdit(null);
            await refreshMedsAndLogs();
        } catch (err) { console.error(err); }
    };
    
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await deleteMedication(id);
            await refreshMedsAndLogs();
        } catch (err) { console.error(err); }
    };

    const handleGoogleConnect = async () => {
        try { 
            const res = await getGoogleAuthUrl(); 
            if(res?.data?.data?.url) window.location.href = res.data.data.url; 
        } catch(err){ console.error(err); }
    };

    const handleGoogleDisconnect = async () => {
        try { 
            await disconnectGoogle(); 
            setIsGoogleConnected(false); 
        } catch(err){ console.error(err); }
    };

    // Derived State and Calculations
    const filteredMeds = useMemo(() => (medications || []).filter(m => m.pillName.toLowerCase().includes(searchQuery.toLowerCase())), [medications, searchQuery]);
    const last7Days = useMemo(() => getWeekOfDate(formatDate(new Date())), []);
    
    const getDoseStatusForDay = useCallback((medId, date) => {
        const med = medications.find(m => m._id === medId);
        if (!med || !isScheduledForDate(med, date)) return "NotScheduled";
        const logs = medLogsMap[medId] || [];
        const logsForDate = logs.filter(l => l.doseDate === date);
        const scheduledMinutes = med.times.map(parseTimeToMinutes).filter(v => v !== null);
        if (scheduledMinutes.length === 0) return "NotScheduled";
        const today = formatDate(new Date());
        const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
        let takenCount = 0, missedCount = 0;
        scheduledMinutes.forEach(scheduledMin => {
            const hasTakenLog = logsForDate.some(l => l.status === "Taken" && Math.abs(parseTimeToMinutes(l.scheduledTime) - scheduledMin) <= 1);
            if (hasTakenLog) takenCount++;
            else if (date < today || (date === today && scheduledMin < nowMinutes)) missedCount++;
        });
        if (missedCount > 0) return "Missed";
        if (takenCount === scheduledMinutes.length) return "Taken";
        if (takenCount > 0 && takenCount < scheduledMinutes.length) return "Partial";
        return "Upcoming";
    }, [medications, medLogsMap]);

    const overallAdherence = useMemo(() => {
        let totalScheduledDoses = 0, totalTakenDoses = 0;
        const today = formatDate(new Date()), nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
        medications.forEach(med => {
            const logs = medLogsMap[med._id] || [];
            last7Days.forEach(date => {
                if (isScheduledForDate(med, date)) {
                    med.times.forEach(timeStr => {
                        const scheduledMin = parseTimeToMinutes(timeStr);
                        if (date < today || (date === today && scheduledMin < nowMinutes)) {
                            totalScheduledDoses++;
                            if (logs.some(l => l.doseDate === date && l.status === "Taken" && Math.abs(parseTimeToMinutes(l.scheduledTime) - scheduledMin) <= 1)) totalTakenDoses++;
                        }
                    });
                }
            });
        });
        if (totalScheduledDoses === 0) return 100;
        return Math.round((totalTakenDoses / totalScheduledDoses) * 100);
    }, [medications, medLogsMap, last7Days]);
    
    // ---------------------- JSX RENDER (Final UI) ----------------------
    return (
        <div className="meds-page-container">
            {/* Top Dashboard Section */}
            <div className="dashboard-header">
                <h1 className="dashboard-title">Manage Your Medications</h1>
                <p className="dashboard-subtitle">Track your medications and set reminders</p>
                <div className="adherence-section">
                    <p>Overall Dose Adherence: <strong>{overallAdherence}%</strong></p>
                    <div className="progress-bar-bg"><div className="progress-bar-fg" style={{ width: `${overallAdherence}%` }}></div></div>
                </div>
                <input type="text" placeholder="Search by medication, dosage, frequency, or notes..." className="main-search-bar" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {/* Google Calendar & Add Med Section */}
            <div className="actions-card">
                <img src="/medication/medicationimg.png" alt="Doctor with Calendar" className="actions-card-img" />
                <div className="actions-card-content">
                    <h2>Never Miss a Dose Again</h2>
                    <p>Stay on top of your health with smart medication reminders synced to Google Calendar.</p>
                </div>
                <div className="actions-card-buttons">
                    {isGoogleConnected ? (
                        <button className="btn-google-disconnect" onClick={handleGoogleDisconnect}>Disconnect Google Calendar</button>
                    ) : (
                        <button className="btn-google-connect" onClick={handleGoogleConnect}>Connect Google Calendar</button>
                    )}
                    {/* YEH HAI MAIN BUTTON, AB NORMAL <button> HAI */}
                    <button className="btn-add-med" onClick={() => { setMedToEdit(null); setIsModalOpen(true); }}>+ Add Medication</button>
                </div>
            </div>

            {/* Medications Grid Section */}
            <main className="meds-grid">
                {filteredMeds.map((med) => (
                    <MedicationCard
                        key={med._id} medication={med} logs={medLogsMap[med._id] || []} last7Days={last7Days}
                        onLogDose={handleLogDose} onEdit={() => { setMedToEdit(med); setIsModalOpen(true); }}
                        onDelete={() => handleDelete(med._id)} getDoseStatusForDay={getDoseStatusForDay}
                    />
                ))}
            </main>
            
            {/* Modal ka conditional render */}
            {isModalOpen && (
                <MedicationModal medication={medToEdit} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} />
            )}
        </div>
    );
};

export default MedicationsPage;