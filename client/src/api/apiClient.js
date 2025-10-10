import axios from 'axios';
axios.defaults.proxy = false;
// Create a central, pre-configured Axios instance.
// Using an environment variable for the URL is the best practice for security and flexibility.
const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  withCredentials: true, // This is crucial for cookie-based authentication.
});

export default apiClient;
