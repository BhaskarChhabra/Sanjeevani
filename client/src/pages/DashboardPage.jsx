"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import useAuthStore from "../store/useAuthStore"
import useMedicationStore from "../store/useMedicationStore"
import MedicationModal from "../components/dashboard/MedicationModal"
import Button from "../components/common/Button"
// Ensure these API functions are implemented to fetch from your backend
import { addMedication, updateMedication, deleteMedication, logDose } from "../api"

// Chart.js
import { Doughnut, Line } from "react-chartjs-2"
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    BarElement
} from "chart.js"
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler, BarElement)

// Icons
import { FaBrain, FaCalendarCheck, FaPills, FaChartLine, FaWalking, FaShieldAlt, FaCloudSun, FaFlask, FaDna, FaTruckLoading } from "react-icons/fa"

const THEME = {
    primary: "#00122e",
    secondary: "#1b0046",
    gold: "#ffb84d",
    emerald: "#38a169",
    emerald_light: "#68d391",
    ruby: "#cc4444",
    indigo: "#a5b4fc",
    card_bg: "rgba(30, 30, 46, 0.7)",
    accent_border: "rgba(255, 184, 77, 0.3)",
    delete_gradient: "linear-gradient(135deg, #cc4444, #a02c2c)",
    glass_bg: "rgba(255, 255, 255, 0.05)",
}

const DashboardPage = () => {
    const { user } = useAuthStore((state) => state)
    const { medications, fetchMedications } = useMedicationStore((state) => state)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [medToEdit, setMedToEdit] = useState(null)
    const [selectedMed, setSelectedMed] = useState(null) // single med for PK simulation
    const [selectedMeds, setSelectedMeds] = useState([]) // multiple meds for interactions/predictions
    const [aiPrediction, setAiPrediction] = useState([])
    const [interactions, setInteractions] = useState([])
    const [biometricData, setBiometricData] = useState(null)
    const [environmentalData, setEnvironmentalData] = useState(null)
    const [wellnessQuest, setWellnessQuest] = useState({ xp: 450, level: 4, nextLevelXp: 1000 })
    const [pkData, setPkData] = useState({ labels: [], data: [], therapeuticMin: 0, therapeuticMax: 0 })
    const [pkOptimization, setPkOptimization] = useState(null)
    const [geneticInsights, setGeneticInsights] = useState(null)
    const [supplyAlert, setSupplyAlert] = useState(null)
    const [loadingPrediction, setLoadingPrediction] = useState(false)

    const refreshDashboard = useCallback(() => fetchMedications(), [fetchMedications])
    useEffect(() => { refreshDashboard() }, [refreshDashboard])

    // --- fetchInteractions defined using useCallback for button access ---
    const fetchInteractions = useCallback(async () => {
        if (selectedMeds.length < 2) {
            setInteractions([]);
            return;
        }
        try {
            const res = await fetch("/api/v1/medications/interactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ medications: selectedMeds.map(m => m.pillName) }),
            })
            if (!res.ok) {
                const errText = await res.text()
                throw new Error(`API error: ${res.status} - ${errText}`)
            }
            const data = await res.json()
            setInteractions(data)
        } catch (err) {
            console.error("Error fetching drug interactions:", err)
            setInteractions([])
        }
    }, [selectedMeds])


    // ---------------- FETCH ENV + ADVANCED FEATURES ----------------
    useEffect(() => {
        // DEFENSIVE CHECK: Exit if no medications are loaded
        if (!medications || medications.length === 0) {
            setSelectedMed(null);
            setPkData({ labels: [], data: [], therapeuticMin: 0, therapeuticMax: 0 });
            setGeneticInsights(null);
            setAiPrediction([]);
            setInteractions([]);
            return;
        }

        // Initialize selectedMed if it's null (first load)
        if (!selectedMed) setSelectedMed(medications[0])

        // Fetch AI adherence predictions 
        const fetchPredictions = async () => {
            setLoadingPrediction(true)
            try {
                const medsToPredict = selectedMeds.length > 0 ? selectedMeds : medications;
                const predictions = await Promise.all(
                    medsToPredict.map(async (med) => {
                        const res = await fetch(`/api/v1/medications/${med._id}/adherence-prediction`)
                        // *** FIX APPLIED HERE (Line 125 in your log) ***
                        if (!res.ok) {
                            const errText = await res.text()
                            throw new Error(`API error (${med._id}): ${res.status} - ${errText.substring(0, 100)}...`)
                        }
                        const data = await res.json()
                        return { med, willMiss: data.prediction }
                    })
                )
                setAiPrediction(predictions)
            } catch (err) {
                console.error("Error fetching AI adherence predictions:", err)
                setAiPrediction(medications.map(med => ({ med, willMiss: false }))) // Fallback
            } finally {
                setLoadingPrediction(false)
            }
        }

        // Fetch Environmental Correlation
        const fetchEnvData = async () => {
            try {
                const res = await fetch("/api/environmental-correlation")
                // *** FIX APPLIED HERE (Line 144 in your log) ***
                if (!res.ok) {
                    const errText = await res.text()
                    throw new Error(`API error: ${res.status} - ${errText.substring(0, 100)}...`)
                }
                const result = await res.json()
                setEnvironmentalData(result.data)
            } catch (err) {
                console.error("Error fetching environmental data:", err)
                setEnvironmentalData({ insight: "Unable to fetch environmental data." })
            }
        }
        
        // --- Call Backend Services ---
        fetchPredictions()
        fetchEnvData()
        
        // --- Remaining Mock/Local Logic ---
        setBiometricData(getBiometricTrend())
        setSupplyAlert(getSupplyChainAlert(medications))

        // PK Logic (Feature 1 & 2 dependency)
        const currentSelectedMed = selectedMed || medications[0]

        if (currentSelectedMed) {
            const loggedTimes = currentSelectedMed.logged || []
            const newPkData = getPharmacokineticData(currentSelectedMed, loggedTimes)
            setPkData(newPkData)
            setPkOptimization(getPkOptimization(newPkData))
            setGeneticInsights(getGeneticInsights(currentSelectedMed))
        }
    }, [medications, selectedMed, selectedMeds]) // dependency array includes selectedMeds

    // ---------------- LOG DOSE ----------------
    const handleLogDose = async (medId, time) => {
        try {
            await logDose({ medicationId: medId, status: "Taken", scheduledTime: time })
            setWellnessQuest(prev => ({ ...prev, xp: prev.xp + 25 }))
            refreshDashboard()
            if (Notification.permission === "granted") {
                new Notification("Dose logged ✅", { body: `Dose taken at ${time}` })
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") new Notification("Dose logged ✅", { body: `Dose taken at ${time}` })
                })
            }
        } catch (err) {
            console.error(err)
        }
    }

    // ---------------- MODAL SUBMIT ----------------
    const handleModalSubmit = async (data) => {
        const advancedData = { ...data, inventory: parseInt(data.inventory) || 100, halfLife: parseInt(data.halfLife) || 8 }
        try {
            if (medToEdit) await updateMedication(medToEdit._id, advancedData)
            else await addMedication(advancedData)
            setIsModalOpen(false)
            refreshDashboard()
        } catch (err) { console.error(err) }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this medication?")) return
        try { await deleteMedication(id); refreshDashboard() } catch (err) { console.error(err) }
    }

    // Toggle function for selection
    const toggleMedSelection = (med) => {
        setSelectedMeds((prev) =>
            prev.some((m) => m._id === med._id)
                ? prev.filter((m) => m._id !== med._id) // remove if already selected
                : [...prev, med] // add the full med object
        );
    };

    // ---------------- MEMOIZED CHART DATA ----------------
    const adherenceData = useMemo(() => {
        const total = medications.reduce((acc, m) => acc + m.times.length, 0)
        const taken = medications.reduce((acc, m) => acc + (m.logged?.length || 0), 0)
        return { total, taken, missed: total - taken, percentage: Math.round((taken / (total || 1)) * 100) }
    }, [medications])

    const weeklyAdherence = useMemo(() => medications.map(m => ({
        med: m.pillName,
        data: Array(7).fill().map(() => Math.floor(Math.random() * 100))
    })), [medications])

    const pkChartData = useMemo(() => {
        const hasSuggestion = pkOptimization && pkOptimization.suggestedTime !== null;
        
        const suggestedMarker = hasSuggestion ? [{
            x: pkOptimization.suggestedTime,
            y: pkData.data[pkOptimization.suggestedTime] || pkData.therapeuticMin
        }] : [];

        return {
            labels: pkData.labels,
            datasets: [
                {
                    label: `${selectedMed?.pillName || "Medication"} Concentration`,
                    data: pkData.data,
                    borderColor: THEME.gold,
                    backgroundColor: "rgba(255,184,77,0.2)",
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: "Therapeutic Max",
                    data: pkData.labels.map(() => pkData.therapeuticMax),
                    borderColor: THEME.emerald,
                    borderWidth: 1,
                    pointRadius: 0,
                    borderDash: [5, 5]
                },
                {
                    label: "Therapeutic Min",
                    data: pkData.labels.map(() => pkData.therapeuticMin),
                    borderColor: THEME.ruby,
                    borderWidth: 1,
                    pointRadius: 0,
                    borderDash: [5, 5]
                },
                {
                    label: "Suggested Dose Shift",
                    data: suggestedMarker,
                    type: 'scatter',
                    backgroundColor: THEME.ruby,
                    pointRadius: 8
                }
            ]
        }
    }, [pkData, selectedMed, pkOptimization])

    const biometricEfficacyData = useMemo(() => ({
        labels: ['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'],
        datasets: [
            {
                label: 'Resting Heart Rate (BPM)',
                data: [68,65,62,63,61,60,62],
                borderColor: THEME.indigo,
                yAxisID: 'y1',
            },
            {
                label: 'Doses Taken',
                data: [3,4,4,2,4,3,4],
                type: 'bar',
                backgroundColor: THEME.gold,
                yAxisID: 'y2',
            },
        ]
    }), [])

    return (
        <div style={{ minHeight: "100vh", background: `linear-gradient(to bottom, ${THEME.primary}, ${THEME.secondary})`, padding: "2rem 1.5rem", color: "#f3f4f6", fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: "1800px", margin: "0 auto" }}>
                <header style={{ marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: "800", background: `linear-gradient(to right, ${THEME.gold}, #fff)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Sanjeevani Advanced Dashboard
                    </h1>
                    <p style={{ fontSize: "1.125rem", color: THEME.indigo }}>Your intelligent health co-pilot, {user?.username || "User"}.</p>
                </header>

                {/* --- GRID LAYOUT --- */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: "2rem" }}>
                    {/* LEFT COLUMN */}
                    <div style={{ gridColumn: "span 12 / span 12", md: { gridColumn: "span 3 / span 3" } }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            {supplyAlert && (
                                <GlassCard>
                                    <CardHeader icon={<FaTruckLoading />} title="Proactive Supply Alert" />
                                    <p style={{ color: THEME.ruby }} dangerouslySetInnerHTML={{ __html: supplyAlert }} />
                                </GlassCard>
                            )}

                            <GlassCard>
                                <CardHeader icon={<FaShieldAlt />} title="Wellness Quest" />
                                <WellnessQuestDisplay quest={wellnessQuest} />
                            </GlassCard>

                            <GlassCard>
                                <CardHeader icon={<FaBrain />} title="Predictive AI Adherence" />
                                {loadingPrediction ? (
                                    <p style={{ color: THEME.indigo }}>Loading predictions...</p>
                                ) : (
                                    aiPrediction.map(({ med, willMiss }) => (
                                        <p key={med._id} style={{ color: willMiss ? THEME.ruby : THEME.emerald_light }}>
                                            {med.pillName}: {willMiss ? "⚠️ May miss next dose" : "✅ Likely on track"}
                                        </p>
                                    ))
                                )}
                            </GlassCard>

                            {/* Drug Interaction Check Button */}
                            <Button
                                onClick={fetchInteractions}
                                disabled={selectedMeds.length < 2}
                                style={{ background: selectedMeds.length > 1 ? THEME.gold : THEME.indigo, opacity: selectedMeds.length > 1 ? 1 : 0.5, color: THEME.primary, fontWeight: 'bold' }}
                            >
                                Check {selectedMeds.length} Med Interactions
                            </Button>

                            {interactions.length > 0 && (
                                <GlassCard>
                                    <CardHeader icon={<FaFlask />} title="Drug Interactions Detected" />
                                    {interactions.map((i, idx) => <p key={idx} style={{ color: THEME.ruby }}>{i}</p>)}
                                </GlassCard>
                            )}

                            <GlassCard>
                                <CardHeader icon={<FaCloudSun />} title="Environmental Correlation" />
                                <p style={{ color: THEME.indigo }}>{environmentalData?.insight}</p>
                            </GlassCard>
                        </div>
                    </div>

                    {/* CENTER COLUMN */}
                    <div style={{ gridColumn: "span 12 / span 12", md: { gridColumn: "span 6 / span 6" } }}>
                        <GlassCard style={{ height: "100%" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                <CardHeader icon={<FaPills />} title="Medication Regimen" />
                                <Button onClick={() => { setMedToEdit(null); setIsModalOpen(true) }} style={{ background: THEME.emerald, color: "white", padding: "0.5rem 1rem", borderRadius: "0.5rem" }}>
                                    Add Medication
                                </Button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "80vh", overflowY: "auto" }}>
                                {medications.map(med => (
                                    <MedicationCard
                                        key={med._id}
                                        med={med}
                                        onEdit={setMedToEdit}
                                        onLog={handleLogDose}
                                        onDelete={handleDelete}
                                        onSelectPK={setSelectedMed}
                                        isSelectedPK={selectedMed?._id === med._id}
                                        onToggleSelect={toggleMedSelection} // Passing the toggle function
                                        selectedMeds={selectedMeds} // Passing the selected array
                                    />
                                ))}
                            </div>
                        </GlassCard>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ gridColumn: "span 12 / span 12", md: { gridColumn: "span 3 / span 3" } }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

                            <GlassCard>
                                <CardHeader icon={<FaCalendarCheck />} title="Adherence Score" />
                                <div style={{ position: "relative", height: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Doughnut
                                        data={{ labels: ["Taken", "Missed"], datasets: [{ data: [adherenceData.taken, adherenceData.missed], backgroundColor: [THEME.emerald, THEME.ruby], borderWidth: 0 }] }}
                                        options={{ cutout: "70%", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                                    />
                                    <div style={{ position: "absolute", textAlign: "center" }}>
                                        <p style={{ fontSize: "2.5rem", fontWeight: "700", color: THEME.gold }}>{adherenceData.percentage}%</p>
                                    </div>
                                </div>
                            </GlassCard>
                            
                            <GlassCard>
                                <CardHeader icon={<FaDna />} title="Genetic Dosing Insights" />
                                {geneticInsights ? (
                                    <div>
                                        <p style={{ color: THEME.gold, fontWeight: "600" }}>Metabolizer Status: {geneticInsights.cypStatus}</p>
                                        <p style={{ color: THEME.indigo }} dangerouslySetInnerHTML={{ __html: geneticInsights.recommendation }} />
                                    </div>
                                ) : <p style={{ color: THEME.indigo }}>Select a medication to load genetic data.</p>}
                            </GlassCard>

                            <GlassCard>
                                <CardHeader icon={<FaChartLine />} title="Biometric Efficacy Overlay" />
                                <div style={{ height: "200px" }}>
                                    <Line 
                                        data={biometricEfficacyData} 
                                        options={{ 
                                            maintainAspectRatio: false,
                                            scales: {
                                                y1: { type: 'linear', position: 'left', ticks: { color: THEME.indigo }, grid: { color: 'rgba(255,255,255,0.1)' } },
                                                y2: { type: 'linear', position: 'right', grid: { display: false }, ticks: { color: THEME.gold } }
                                            }
                                        }} 
                                    />
                                </div>
                                <p style={{ textAlign: 'center', color: THEME.indigo }}>See how RHR changes relative to daily dosing.</p>
                            </GlassCard>

                            <GlassCard>
                                <CardHeader icon={<FaWalking />} title="PK Optimization (AUC)" />
                                {selectedMed ? (
                                    <div>
                                        <div style={{ height: "250px", marginBottom: "1rem" }}>
                                            <Line data={pkChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                                        </div>
                                        <p style={{ color: pkOptimization?.suggestedShift > 0 ? THEME.ruby : THEME.emerald_light }}>
                                            {pkOptimization?.message}
                                        </p>
                                    </div>
                                ) : <p style={{ color: THEME.indigo }}>Select a medication to view PK simulation.</p>}
                            </GlassCard>

                            <GlassCard>
                                <CardHeader icon={<FaChartLine />} title="Weekly Adherence Trend" />
                                <div style={{ height: "200px" }}>
                                    <Line
                                        data={{
                                            labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
                                            datasets: weeklyAdherence.map((w, i) => ({
                                                label: w.med,
                                                data: w.data,
                                                borderColor: i % 2 === 0 ? THEME.gold : THEME.emerald,
                                                fill: false
                                            }))
                                        }}
                                        options={{ maintainAspectRatio: false, plugins: { legend: { display: true } } }}
                                    />
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>

                <MedicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} medicationToEdit={medToEdit} />
            </div>
        </div>
    )
}

// ---------------- Helper Components ----------------

const GlassCard = ({ children, style }) => (
    <div style={{ background: THEME.card_bg, backdropFilter: "blur(12px)", border: `1px solid ${THEME.accent_border}`, borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 8px 32px 0 rgba(0,0,0,0.37)", ...style }}>
        {children}
    </div>
)

const CardHeader = ({ icon, title }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", borderBottom: `1px solid ${THEME.accent_border}`, paddingBottom: "0.75rem" }}>
        <span style={{ color: THEME.gold }}>{icon}</span>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#f3f4f6", margin: 0 }}>{title}</h2>
    </div>
)

const MedicationCard = ({ med, onEdit, onLog, onDelete, onSelectPK, isSelectedPK, onToggleSelect, selectedMeds }) => {
    const dosesPerDay = med.times.length
    const daysRemaining = med.inventory ? Math.floor(med.inventory / dosesPerDay) : 0
    // Check if the medication is currently selected for interactions
    const isSelected = selectedMeds.some(m => m._id === med._id);

    const handleToggle = (e) => {
        e.stopPropagation();
        onToggleSelect(med); // Call the parent's toggle function with the medication object
    };

    return (
        <div style={{ border: `2px solid ${isSelectedPK ? THEME.gold : isSelected ? THEME.emerald : "transparent"}`, padding: "1rem", borderRadius: "0.75rem", background: THEME.glass_bg, cursor: "pointer", transition: "border-color 0.2s ease-in-out" }} onClick={() => onSelectPK(med)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: "0 0 0.25rem 0", fontWeight: "600" }}>{med.pillName}</h3>
                <Button 
                    onClick={handleToggle} 
                    style={{ 
                        background: isSelected ? THEME.ruby : THEME.emerald_light, 
                        color: isSelected ? 'white' : THEME.primary, 
                        padding: "0.25rem 0.5rem", 
                        fontSize: "0.75rem" 
                    }}
                >
                    {isSelected ? "Selected" : "Select"}
                </Button>
            </div>
            <p style={{ margin: 0 }}>Doses per day: {dosesPerDay} | Inventory: {med.inventory} | Days left: {daysRemaining}</p>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: 'wrap' }}>
                {med.times.map(time => (
                    <Button key={time} onClick={(e) => { e.stopPropagation(); onLog(med._id, time) }} style={{ background: THEME.emerald, color: "white", padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>{time}</Button>
                ))}
                <Button onClick={(e) => { e.stopPropagation(); onEdit(med) }} style={{ background: THEME.indigo, color: "white", padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>Edit</Button>
                <Button onClick={(e) => { e.stopPropagation(); onDelete(med._id) }} style={{ background: THEME.ruby, color: "white", padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>Delete</Button>
            </div>
        </div>
    )
}

const WellnessQuestDisplay = ({ quest }) => {
    const progressPercent = Math.min(100, Math.round((quest.xp / quest.nextLevelXp) * 100))
    return (
        <div>
            <p>Level: {quest.level} | XP: {quest.xp}/{quest.nextLevelXp}</p>
            <div style={{ background: "#2c2c3c", borderRadius: "0.5rem", height: "1rem", overflow: "hidden" }}>
                <div style={{ width: `${progressPercent}%`, background: THEME.gold, height: "100%", transition: "width 0.3s" }}></div>
            </div>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: THEME.emerald_light }}>Log more doses to level up and unlock better insights!</p>
        </div>
    )
}

// ---------------- MOCK/HELPER FUNCTIONS (Temporary until fully migrated to backend) ----------------
const getBiometricTrend = () => ({ restingHeartRate: { value: 62, trend: "down" }, sleepQuality: { value: 85, trend: "up" } })
const getPkOptimization = (pkData) => {
    const { data, therapeuticMin, therapeuticMax } = pkData
    const inRangeHours = data.filter(c => c >= therapeuticMin && c <= therapeuticMax).length

    if (inRangeHours < 16 && data.length > 0) {
        const timeToDip = data.findIndex((c, i) => c < therapeuticMin && i > 0)
        if (timeToDip > 0) {
            const suggestedHour = timeToDip - 2
            return {
                message: `AI Suggests Optimization: Concentration drops below therapeutic minimum at ${timeToDip}:00. Try shifting your dose 2 hours earlier to ${suggestedHour}:00 to maximize AUC in range.`,
                suggestedShift: 2,
                suggestedTime: suggestedHour
            }
        }
    }
    return { message: "PK profile looks stable. Keep up the consistent dosing!", suggestedShift: 0, suggestedTime: null }
}
const getGeneticInsights = (medication) => {
    if (!medication) return null
    const cypStatus = Math.random() > 0.7 ? "Rapid Metabolizer" : "Normal Metabolizer"
    const recommendation = cypStatus === "Rapid Metabolizer"
        ? `You are a **${cypStatus}** for the CYP2D6 enzyme. This may cause ${medication.pillName} to be cleared faster than average, potentially requiring a **dose increase** after consulting your doctor.`
        : `You are a **${cypStatus}** for CYP2D6. Your metabolism of ${medication.pillName} is within normal limits.`
    return { cypStatus, recommendation }
}
const getSupplyChainAlert = (medications) => {
    const outOfStockSoon = medications.filter(m => {
        const dosesPerDay = m.times.length
        const daysRemaining = m.inventory ? Math.floor(m.inventory / dosesPerDay) : 0
        return daysRemaining <= 7 && Math.random() > 0.6
    })
    if (outOfStockSoon.length > 0) {
        return `🚨 **Supply Chain Alert:** The supply risk for **${outOfStockSoon[0].pillName}** is elevated. Order your refill now and consider an extra week's buffer.`
    }
    return null
}
const getPharmacokineticData = (med, loggedTimes) => {
    const halfLifeHours = med.halfLife || 8
    const therapeuticMin = 50
    const therapeuticMax = 200

    const calculateConcentration = (timeSinceDoseHours) => {
        const absorptionRate = 1.0
        const eliminationRate = Math.log(2) / halfLifeHours
        const doseConcentration = 150
        const concentration = doseConcentration * (absorptionRate / (absorptionRate - eliminationRate)) * (Math.exp(-eliminationRate * timeSinceDoseHours) - Math.exp(-absorptionRate * timeSinceDoseHours))
        return Math.max(0, concentration)
    }

    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`)
    const data = Array(24).fill(0)
    const currentTime = new Date()

    for (let hour = 0; hour < 24; hour++) {
        let concentration = 0
        const hourTime = new Date(currentTime).setHours(hour, 0, 0, 0)
        
        loggedTimes.forEach((timeStr) => {
            const [h, m] = timeStr.split(':').map(Number)
            const doseTime = new Date(currentTime).setHours(h, m, 0, 0)
            const timeSinceDoseHours = (hourTime - doseTime) / (1000 * 60 * 60)
            if (timeSinceDoseHours >= 0) concentration += calculateConcentration(timeSinceDoseHours)
        })
        data[hour] = concentration
    }

    return { labels, data, therapeuticMin, therapeuticMax }
}

export default DashboardPage