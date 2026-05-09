import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  config.headers["RqUID"] = uuidv4();
  return config;
});

export default axiosInstance;
