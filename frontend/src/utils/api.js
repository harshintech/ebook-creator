import axios from "axios";

// Backend is running on port 8000
const API = axios.create({
  baseURL: "https://ebook-creator-pgxl.onrender.com/api",
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

export const BACKEND_URL = API.defaults.baseURL.replace(/\/api$/, "");

export const getCoverUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  let cleanPath = path.replace(/\\/g, "/");
  if (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.substring(1);
  }
  if (!cleanPath.startsWith("backend/")) {
    cleanPath = "backend/" + cleanPath;
  }
  return `${BACKEND_URL}/${cleanPath}`;
};

export default API;
