import apiClient from './apiClient';

// --- User Authentication ---

/**
 * Registers a new user.
 * @param {object} userData - User registration data (e.g., name, email, password).
 * @returns {Promise} A promise that resolves with the server response.
 */
export const registerUser = (userData) => apiClient.post('/users/register', userData);

/**
 * Requests a new OTP to be sent to the user's email.
 * @param {object} emailData - The user's email, e.g., { email: 'user@example.com' }.
 * @returns {Promise} A promise that resolves with the server response.
 */
export const resendOtp = (emailData) => apiClient.post('/users/resend-otp', emailData);

/**
 * Verifies a user's account with an OTP.
 * @param {object} otpData - The verification data, e.g., { email: 'user@example.com', otp: '123456' }.
 * @returns {Promise} A promise that resolves with the server response.
 */
export const verifyUser = (otpData) => apiClient.post('/users/verify', otpData);

/**
 * Logs in a user.
 * @param {object} credentials - User login credentials ({ email, password }).
 * @returns {Promise} A promise that resolves with the server response, typically containing a token.
 */
export const loginUser = (credentials) => apiClient.post('/users/login', credentials);

/**
 * Logs out the currently authenticated user.
 * @returns {Promise} A promise that resolves with the server response.
 */
export const logoutUser = () => apiClient.post('/users/logout');

/**
 * Fetches the profile of the currently authenticated user.
 * @returns {Promise} A promise that resolves with the user's profile data.
 */
export const getMe = () => apiClient.get('/users/me');

// --- Medication Management ---

/**
 * Retrieves all medications for the authenticated user.
 * @returns {Promise} A promise that resolves with an array of medications.
 */
export const getAllMedications = () => apiClient.get('/medications/all');

/**
 * Adds a new medication.
 * @param {object} medData - Data for the new medication.
 * @returns {Promise} A promise that resolves with the newly created medication data.
 */
export const addMedication = (medData) => apiClient.post('/medications/add', medData);

/**
 * Updates an existing medication.
 * @param {string} id - The ID of the medication to update.
 * @param {object} medData - The updated medication data.
 * @returns {Promise} A promise that resolves with the updated medication data.
 */
export const updateMedication = (id, medData) => apiClient.put(`/medications/update/${id}`, medData);

/**
 * Deletes a medication.
 * @param {string} id - The ID of the medication to delete.
 * @returns {Promise} A promise that resolves with a success message.
 */
export const deleteMedication = (id) => apiClient.delete(`/medications/delete/${id}`);

// --- Dose Logging & Stats ---

/**
 * Logs that a dose of a medication has been taken.
 * @param {object} doseData - Information about the dose being logged.
 * @returns {Promise} A promise that resolves with the newly created dose log.
 */
export const logDose = (doseData) => apiClient.post('/doses/log', doseData);

/**
 * Fetches dashboard statistics for the user.
 * @returns {Promise} A promise that resolves with dashboard stats.
 */
export const getDashboardStats = () => apiClient.get('/dashboard/stats');

/**
 * Retrieves the dose history for a specific medication.
 * @param {string} medicationId - The ID of the medication to fetch logs for.
 * @returns {Promise} A promise that resolves with an array of dose logs.
 */
export const getDoseLogs = (medicationId) => apiClient.get(`/doses/logs/${medicationId}`);

// --- AI Chatbot ---

/**
 * Sends a prompt to the AI chatbot.
 * @param {object} prompt - The user's prompt for the AI, e.g., { prompt: 'What are the side effects?' }.
 * @returns {Promise} A promise that resolves with the AI's response.
 */
export const askAI = (prompt) => apiClient.post('/ai/ask', prompt);

// --- Google Calendar Integration ---

/**
 * Fetches the Google authentication URL from the backend.
 * @returns {Promise} A promise that resolves with the Google auth URL.
 */
export const getGoogleAuthUrl = () => apiClient.get('/google/auth-url');

/**
 * Checks the status of the user's Google Calendar integration.
 * @returns {Promise} A promise that resolves with the integration status.
 */
export const getGoogleStatus = () => apiClient.get('/google/status');

/**
 * Disconnects the user's Google Calendar integration.
 * @returns {Promise} A promise that resolves with a success message.
 */
export const disconnectGoogle = () => apiClient.post('/google/disconnect');

// --- Reminder AI ---

/**
 * Initiates the training process for the reminder AI model.
 * @returns {Promise} A promise that resolves with the training status.
 */
export const trainReminderModel = () => apiClient.post('/reminder-ai/train-model');

/**
 * Gets a reminder prediction from the AI model.
 * @param {object} inputData - Data for the prediction model.
 * @returns {Promise} A promise that resolves with the prediction result.
 */
export const predictReminder = (inputData) => apiClient.post('/reminder-ai/predict', inputData);

// --- Chat History ---

/**
 * Saves a user's chat session history.
 * @param {object} chatData - The chat history to save.
 * @returns {Promise} A promise that resolves with the saved chat data.
 */
export const saveChatHistory = (chatData) => apiClient.post('/chat/save', chatData);

/**
 * Retrieves the entire chat history for a user.
 * @param {string} userId - The ID of the user whose chat history to retrieve.
 * @returns {Promise} A promise that resolves with the user's chat history.
 */
export const getChatHistory = (userId) => apiClient.get(`/chat/${userId}`);

/**
 * Retrieves a specific chat session by its ID.
 * @param {string} chatId - The ID of the specific chat session.
 * @returns {Promise} A promise that resolves with the specific chat session data.
 */
export const getChatById = (chatId) => apiClient.get(`/chat/session/${chatId}`);

// --- Medical Information Summarizer ---

/**
 * Generates a summary for a given block of medical text.
 * @param {object} data - An object containing the text and its category.
 * @param {string} data.text - The medical text to summarize.
 * @param {string} data.category - The category of the text (e.g., 'report', 'article').
 * @returns {Promise} A promise that resolves with the generated summary.
 */
export const generateMedicalSummary = ({ text, category }) => apiClient.post('/medical-summary/summary', { text, category });

// --- Google Places / Sanjeevani Locator ---

/**
 * Fetches nearby places based on location, radius, and type.
 * @param {object} params - The query parameters.
 * @param {number} params.lat - Latitude of the search center.
 * @param {number} params.lng - Longitude of the search center.
 * @param {number} params.radius - Search radius in meters.
 * @param {string} params.type - Type of place to search for (e.g., 'hospital').
 * @returns {Promise} A promise that resolves with a list of nearby places.
 */
export const getNearbyPlaces = (params) => apiClient.get('/places/nearby', { params });

/**
 * Fetches detailed information for a specific place.
 * @param {string} place_id - The Google Place ID for which to fetch details.
 * @returns {Promise} A promise that resolves with the place details.
 */
export const getPlaceDetails = (place_id) => apiClient.get('/places/details', { params: { place_id } });

// --- Forgot Password / Reset Password ---

/**
 * Requests a password reset OTP to be sent to the user's email.
 * @param {object} emailData - e.g., { email: 'user@example.com' }
 * @returns {Promise} Resolves with server response
 */
export const forgotPasswordRequest = (emailData) => 
    apiClient.post('/users/forgot-password', emailData);

/**
 * Verifies the OTP sent for password reset.
 * @param {object} otpData - e.g., { email: 'user@example.com', code: '123456' }
 * @returns {Promise} Resolves with server response
 */
export const verifyResetOtp = (otpData) =>
    apiClient.post('/users/verify-reset-otp', otpData);

/**
 * Resets the password after OTP verification.
 * @param {object} resetData - e.g., { email: 'user@example.com', code: '123456', newPassword: 'newPass123' }
 * @returns {Promise} Resolves with server response
 */
export const resetPassword = (resetData) =>
    apiClient.post('/users/reset-password', resetData);

// Corrected API functions
export const getProfile = (userId) => apiClient.get(`/profile/${userId}`);
export const updateProfile = (userId, profileData) => apiClient.put(`/profile/${userId}`, profileData);
