import React, { useState } from "react";
import { trainLSTMReminderModel, predictLSTMReminder } from "../services/reminderAIService.js";

export default function ReminderAIPage() {
  const [userId, setUserId] = useState("68dc1f90ed63b50126fd01f9"); // Default ID for testing
  const [pillName, setPillName] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [result, setResult] = useState(null);

  const handleTrain = async () => {
    if (!userId || !pillName) return alert("Enter User ID and Pill Name");

    try {
      const res = await trainLSTMReminderModel({ user_id: userId, pill_name: pillName });
      alert(res.message || "Training completed");
    } catch (err) {
      console.error("Error training model:", err);
      alert("Error training model: Check console for details.");
    }
  };

  const handlePredict = async () => {
    if (!userId || !pillName || !scheduledTime) return alert("Fill all fields");

    try {
      const res = await predictLSTMReminder({ 
        user_id: userId, 
        pill_name: pillName, 
        scheduled_time: scheduledTime 
      });
      setResult(res);
    } catch (err) {
      console.error("Error predicting:", err);
      alert("Error predicting: Check console for details.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Reminder AI (LSTM Prediction)</h1>

      <div>
        <label>User ID:</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter User ID"
        />
      </div>
      
      <div>
        <label>Pill Name:</label>
        <input
          type="text"
          value={pillName}
          onChange={(e) => setPillName(e.target.value)}
          placeholder="Enter pill name"
        />
      </div>

      <div>
        <label>Scheduled Time:</label>
        <input
          type="time"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
        />
      </div>

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleTrain}>Train Model</button>
        <button onClick={handlePredict} style={{ marginLeft: "10px" }}>Predict</button>
      </div>

      {result && result.error ? (
        <p style={{ color: 'red' }}>Error: {result.error}</p>
      ) : result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Prediction Result:</h3>
          <p>Scheduled Time: {result.scheduled_time}</p>
          <p>Probability Taken: {result.probability_taken}</p>
          <p>Probability Missed: {result.probability_missed}</p>
        </div>
      )}
    </div>
  );
}
