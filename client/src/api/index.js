import apiClient from './apiClient';

// --- User Authentication ---
export const registerUser = (userData) => apiClient.post('/users/register', userData);

// This is the new function to request a fresh OTP from the server
export const resendOtp = (emailData) => apiClient.post('/users/resend-otp', emailData); 

export const verifyUser = (otpData) => apiClient.post('/users/verify', otpData);
export const loginUser = (credentials) => apiClient.post('/users/login', credentials);
export const logoutUser = () => apiClient.post('/users/logout');
export const getMe = () => apiClient.get('/users/me');

// --- Medication Management ---
export const getAllMedications = () => apiClient.get('/medications/all');
export const addMedication = (medData) => apiClient.post('/medications/add', medData);
export const updateMedication = (id, medData) => apiClient.put(`/medications/update/${id}`, medData);
export const deleteMedication = (id) => apiClient.delete(`/medications/delete/${id}`);

// --- Dose Logging & Stats ---
export const logDose = (doseData) => apiClient.post('/doses/log', doseData);
export const getDashboardStats = () => apiClient.get('/dashboard/stats');

// --- AI Chatbot ---
export const askAI = (prompt) => apiClient.post('/ai/ask', prompt);

// --- Google Calendar Integration ---
// This function now correctly calls the /api/v1/google/auth-url endpoint
export const getGoogleAuthUrl = () => {
  return apiClient.get('/google/auth-url');
};

export const getGoogleStatus = () => apiClient.get('/google/status'); 
export const disconnectGoogle = () => apiClient.post('/google/disconnect'); 

export const getAdherencePrediction = (id) => 
  apiClient.get(`/medications/${id}/adherence-prediction`);

export const checkDrugInteractions = (medications) =>
  apiClient.post('/medications/interactions', { medications });




// --- Chat History ---
export const saveChatHistory = (chatData) =>
  apiClient.post('/chat/save', chatData);

export const getChatHistory = (userId) =>
  apiClient.get(`/chat/${userId}`);

