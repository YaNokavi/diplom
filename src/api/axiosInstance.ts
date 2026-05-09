import axios from "axios";
import { v4 as uuidv4 } from "uuid";

// В dev-режиме пустой baseURL — запросы идут через Vite proxy (/api -> http://localhost)
// В продакшн задай VITE_API_BASE_URL в .env
export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

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
