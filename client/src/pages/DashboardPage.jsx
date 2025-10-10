"use client";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import useMedicationStore from "../store/useMedicationStore";
import { getMe, getChatHistory, getAllMedications, getDoseLogs } from "../api";

import { FaComments, FaPills, FaHeartbeat } from "react-icons/fa";
import { FiClock } from "react-icons/fi";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

import "./Dashboard.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, login } = useAuthStore();
  const { medications, fetchMedications, isLoading } = useMedicationStore();

  const [stats, setStats] = useState({
    totalChats: 0,
    totalMessages: 0,
    wellbeingScore: null,
    healthRecords: 0,
  });

  const [doseStats, setDoseStats] = useState({
    taken: 0,
    missed: 0,
    total: 0,
    adherence: 0,
  });

  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [pastDoses, setPastDoses] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [trendData, setTrendData] = useState({ labels: [], taken: [], missed: [] });
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingDoses, setLoadingDoses] = useState(true);

  // FIX: This line was added back to resolve the ReferenceError
  const [adherenceView, setAdherenceView] = useState("7days"); 

  // --- Wellbeing Status ---
  const getWellbeingStatus = (score) => {
    if (score === null) return { text: "-", class: "" };
    if (score >= 80) return { text: "Excellent", class: "excellent" };
    if (score >= 50) return { text: "Good", class: "good" };
    return { text: "Needs Attention", class: "attention" };
  };

  const handleChatClick = (chatId) =>
    navigate(`/ai-chat${chatId !== "new" ? `?sessionId=${chatId}` : ""}`);

  // --- Fetch user info ---
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user) {
          const res = await getMe();
          if (res?.data?.user) login(res.data.user);
        }
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };
    fetchUser();
  }, [user, login]);
  
  // --- FIX: Automatically fetch medications on component mount ---
  useEffect(() => {
    fetchMedications(); 
  }, [fetchMedications]);

  // --- Helper: Normalize Date to UTC YYYY-MM-DD ---
  const normalizeDateUTC = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      console.warn("⚠️ Invalid date:", dateStr);
      return null;
    }
    return d.toISOString().split("T")[0];
  };

  // --- Fetch Dose Logs and Compute Stats (Corrected Trend Logic) ---
  useEffect(() => {
    const fetchDoseStats = async () => {
      if (isLoading || medications.length === 0) {
        if (!isLoading) console.warn("⚠️ Medications array is empty, skipping dose fetch.");
        return;
      }
        
      try {
        console.log("📢 Starting fetchDoseStats...");

        const meds = medications; 

        const doseLogsPromises = meds.map((m) => getDoseLogs(m._id));
        const doseLogsResponses = await Promise.allSettled(doseLogsPromises);

        const allLogs = doseLogsResponses
          .filter((r) => r.status === "fulfilled")
          .flatMap((r) => r.value.data.data || []);

        if (allLogs.length === 0) {
          console.warn("⚠️ No dose logs found in backend!");
          setDoseStats({ taken: 0, missed: 0, total: 0, adherence: 0 });
          setTrendData({ labels: [], taken: [], missed: [] });
          return;
        }

        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          return normalizeDateUTC(d);
        }).reverse(); // Last 7 days, oldest first

        // Filter all logs down to just the logs from the last 7 days
        const last7Logs = allLogs.filter((log) => {
          const logDay = normalizeDateUTC(log.scheduledTime);
          return logDay && last7Days.includes(logDay);
        });

        // --- Adherence Stats Calculation (Correct and unchanged) ---
        const logsToUse = adherenceView === "7days" ? last7Logs : allLogs;
        const takenCount = logsToUse.filter((log) => log.status === "Taken").length;
        const missedCount = logsToUse.filter((log) => log.status === "Missed").length;
        const total = takenCount + missedCount;
        const adherence = total > 0 ? Math.round((takenCount / total) * 100) : 0;
        setDoseStats({ taken: takenCount, missed: missedCount, total, adherence });

        // --- Prepare Upcoming & Past Doses (Unchanged) ---
        const now = new Date();
        const upcoming = [];
        const past = [];
        // ... (logic for upcoming and past dose calculation remains here)
        meds.forEach((med) => {
          if (!med.times) return;
          med.times.forEach((time) => {
            const [h, m] = time.split(":").map(Number);
            const doseTime = new Date();
            doseTime.setHours(h, m, 0, 0);

            const log = allLogs.find((l) => {
              const logDate = new Date(l.scheduledTime);
              return (
                l.medication === med._id &&
                logDate.getHours() === h &&
                logDate.getMinutes() === m
              );
            });

            const doseObj = {
              id: `${med._id}-${time}`,
              time,
              name: med.pillName,
              dose: med.dosage,
              status: log?.status || "Pending",
              scheduledTime: doseTime,
            };

            if (doseTime > now) upcoming.push(doseObj);
            else past.push(doseObj);
          });
        });

        upcoming.sort((a, b) => a.scheduledTime - b.scheduledTime);
        past.sort((a, b) => b.scheduledTime - a.scheduledTime);

        setUpcomingReminders(upcoming.slice(0, 5));
        setPastDoses(past.slice(0, 5));
        
        // --- Prepare trend chart (FIXED LOGIC) ---
        
        const trendLabels = last7Days.map(day => {
            // Display date as Mon/Day for better chart readability
            const date = new Date(day);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        const takenTrend = last7Days.map(day => 
            last7Logs.filter(l => l.status === "Taken" && normalizeDateUTC(l.scheduledTime) === day).length
        );
        
        const missedTrend = last7Days.map(day => 
            last7Logs.filter(l => l.status === "Missed" && normalizeDateUTC(l.scheduledTime) === day).length
        );

        setTrendData({ labels: trendLabels, taken: takenTrend, missed: missedTrend });
        
      } catch (err) {
        console.error("❌ Failed to fetch dose logs or calculate stats:", err);
        setDoseStats({ taken: 0, missed: 0, total: 0, adherence: 0 });
        setTrendData({ labels: [], taken: [], missed: [] });
      } finally {
        setLoadingDoses(false);
      }
    };
    fetchDoseStats(); 
  }, [medications, isLoading, adherenceView]);

  // --- Fetch Chat History ---
  useEffect(() => {
    const fetchChats = async () => {
      if (!user?._id) return;
      try {
        const res = await getChatHistory(user._id);
        let allChats = res.data?.chats || [];

        allChats = allChats.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setRecentChats(allChats.slice(0, 5));

        const totalSessions = allChats.length;
        const totalMessages = allChats.reduce(
          (sum, chat) => sum + (chat.messages?.length ?? 0),
          0
        );
        setStats((prev) => ({
          ...prev,
          totalChats: totalSessions,
          totalMessages,
        }));
        setLoadingStats(false); // Set loading to false after fetching initial stats
      } catch (err) {
        console.error("Failed to load chat history:", err);
        setLoadingStats(false);
      }
    };
    fetchChats();
  }, [user]);

  const displayName = user?.username || user?.name || "User";
  const avatarSrc =
    user?.avatar ||
    `https://placehold.co/60x60/7A3F9A/ffffff?text=${displayName.charAt(0)}`;
  const lastActiveText = user?.lastActive
    ? `Last active: ${new Date(user.lastActive).toLocaleDateString()}`
    : "Last active: recently";

  const wellbeingStatus = getWellbeingStatus(stats.wellbeingScore);

  const doseData = {
    labels: ["Taken", "Missed"],
    datasets: [
      {
        label: "Dose Log",
        data: [doseStats.taken, doseStats.missed],
        backgroundColor: ["#4CAF50", "#F44336"],
        borderColor: ["#4CAF50", "#F44336"],
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: trendData.labels,
    datasets: [
      {
        label: "Taken",
        data: trendData.taken,
        borderColor: "#4CAF50",
        backgroundColor: "#4CAF5080",
        tension: 0.3,
      },
      {
        label: "Missed",
        data: trendData.missed,
        borderColor: "#F44336",
        backgroundColor: "#F4433680",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="dash-container">
      {/* --- User Header --- */}
      <div className="user-header">
        <div className="user-info">
          <img src={avatarSrc} alt="user avatar" className="user-avatar" />
          <div>
            <h3>{displayName}</h3>
            <p className="last-active">{lastActiveText}</p>
          </div>
        </div>
        <div className="status-indicator">
          <span className="status-dot"></span> Active
        </div>
      </div>

      {/* --- Welcome Section --- */}
      <div className="welcome-section">
        <h1>Welcome back, {displayName}!</h1>
        <p>Your personalized health overview for today</p>
      </div>

      {/* --- Stats Cards --- */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="card-header">
            <h4>Chat Sessions</h4>
            <div className="icon-box"><FaComments /></div>
          </div>
          <h2>{stats.totalChats}</h2>
          <p>{stats.totalMessages} total messages</p>
        </div>

        <div className="stat-card">
          <div className="card-header">
            <h4>Medications</h4>
            <div className="icon-box"><FaPills /></div>
          </div>
          <h2>{isLoading ? "..." : medications.length}</h2>
          <p>{medications.length} total medications</p>
        </div>

        <div className="stat-card">
          <div className="card-header">
            <h4>Dose Adherence</h4>
            <div className="icon-box"><FaPills /></div>
          </div>
          <h2>{loadingDoses ? "..." : `${doseStats.adherence}%`}</h2>
          <div className="adherence-details">
            <p>Taken: <span>{doseStats.taken}</span></p>
            <p>Missed: <span>{doseStats.missed}</span></p>
          </div>
          <div className="adherence-toggle">
            <button
              className={adherenceView === "7days" ? "active" : ""}
              onClick={() => setAdherenceView("7days")}
            >
              Last 7 Days
            </button>
            <button
              className={adherenceView === "all" ? "active" : ""}
              onClick={() => setAdherenceView("all")}
            >
              All Time
            </button>
          </div>
        </div>

        <div className="stat-card wellbeing-card">
          <div className="card-header">
            <h4>Wellbeing Meter</h4>
            <div className="icon-box"><FaHeartbeat /></div>
          </div>
          <h2>{loadingStats ? "..." : stats.wellbeingScore ?? "-"}</h2>
          <p className={wellbeingStatus.class}>{wellbeingStatus.text}</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${stats.wellbeingScore ?? 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* --- Bottom Sections --- */}
      <div className="bottom-sections-grid">
        <div className="reminder-section">
          <h3>Upcoming Doses</h3>
          <ul>
            {upcomingReminders.length === 0 ? (
              <li className="no-activity">No upcoming doses planned.</li>
            ) : (
              upcomingReminders.map((rem) => (
                <li key={rem.id}>
                  <FiClock style={{ marginRight: "0.75rem", color: "var(--primary-color)" }} />
                  <span className="reminder-time">{rem.time}</span> - {rem.name} ({rem.dose})
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="reminder-section">
          <h3>Past Doses</h3>
          <ul>
            {pastDoses.length === 0 ? (
              <li className="no-activity">No past doses logged yet.</li>
            ) : (
              pastDoses.map((dose) => (
                <li key={dose.id}>
                  <FiClock style={{ marginRight: "0.75rem", color: "var(--primary-color)" }} />
                  <span className="reminder-time">{dose.time}</span> - {dose.name} ({dose.dose}) —{" "}
                  <span className={dose.status === "Taken" ? "taken" : "missed"}>
                    {dose.status}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="dose-log-section">
          <h3>Dose Log Overview</h3>
          {loadingDoses ? <p>Loading chart...</p> : <Pie data={doseData} />}
        </div>

        <div className="dose-trend-section">
          <h3>Dose Trends (Last 7 Days)</h3>
          {loadingDoses ? <p>Loading chart...</p> : <Line data={lineData} />}
        </div>

        <div className="recent-section">
          <h3>Recent Chat History</h3>
          <ul>
            {recentChats.length === 0 ? (
              <li className="no-activity">No recent chats yet.</li>
            ) : (
              recentChats.map((chat) => (
                <li key={chat._id || chat.createdAt} onClick={() => handleChatClick(chat._id)}>
                  <span>
                    {chat.title ||
                      `Chat on ${new Date(chat.createdAt).toLocaleDateString()}`}
                  </span>
                  <span className="chat-time">
                    {new Date(chat.createdAt).toLocaleTimeString()}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;