import axios from "axios";

// Use Vite env variable `VITE_API_BASE` when provided, fallback to localhost for development
const rawBase = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
const BASE = rawBase.endsWith("/api")
  ? rawBase
  : rawBase.replace(/\/+$/, "") + "/api";

const API = axios.create({
  baseURL: BASE,
});

// attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;