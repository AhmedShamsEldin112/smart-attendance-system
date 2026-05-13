// ============================================================
// api.js — Real API calls to backend at http://localhost:5000
// ============================================================

import axios from "axios";

const BASE_URL = "http://localhost:5000";

// Helper — adds JWT token to every request
function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────
export async function login(id, password) {
  const res = await axios.post(`${BASE_URL}/login`, { id, password });
  return res.data;
}

// ─────────────────────────────────────────
// QR CODE
// ─────────────────────────────────────────
export async function generateQR() {
  const res = await axios.post(`${BASE_URL}/generate-qr`, {}, { headers: authHeader() });
  return res.data;
}

export async function markAttendance(qrValue) {
  const res = await axios.post(`${BASE_URL}/mark-attendance`, { qrValue }, { headers: authHeader() });
  return res.data;
}

// ─────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────
export async function getAttendanceReport() {
  const res = await axios.get(`${BASE_URL}/report`, { headers: authHeader() });
  return res.data;
}