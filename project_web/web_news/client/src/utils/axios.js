import axios from "axios";

// Configure axios to send credentials (cookies) with all requests
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8800/api";

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

