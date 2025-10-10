import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1/reminder-ai"; // Express proxy URL

export const trainLSTMReminderModel = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/train-model`, data, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error training model:", error);
    throw error;
  }
};

export const predictLSTMReminder = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/predict`, data, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error predicting reminder:", error);
    throw error;
  }
};
