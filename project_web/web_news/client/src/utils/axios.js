import axios from "axios";

// Configure axios to send credentials (cookies) with all requests
axios.defaults.withCredentials = true;

// Build API base URL from Vite env var (VITE_API_URL). If provided without trailing '/api',
// append '/api'. In production set VITE_API_URL to your backend origin (e.g., https://api.example.com)
const envUrl = import.meta.env.VITE_API_URL;
const apiUrl = envUrl ? envUrl.replace(/\/$/, "") + "/api" : "http://localhost:8800/api";

axios.defaults.baseURL = apiUrl;
console.log("🔧 Using API base URL:", axios.defaults.baseURL);

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log("🚀 Axios Request:", config.method?.toUpperCase(), config.url);
    console.log("Request data:", config.data);
    return config;
  },
  (error) => {
    console.error("❌ Axios Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log("✅ Axios Response:", response.status, response.config.url);
    console.log("Response data:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ Axios Response Error:", error.response?.status, error.config?.url);
    console.error("Error details:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axios;

