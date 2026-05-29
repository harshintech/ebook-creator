import axios from "axios";

// Backend is running on port 8000
const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Automatically inject JWT token into requests
API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
