// ============================================================
// api.js — All API calls live here
// When Backend is ready: replace mock functions with axios calls
// ============================================================

// eslint-disable-next-line no-unused-vars
import axios from "axios";

// eslint-disable-next-line no-unused-vars
const BASE_URL = "http://localhost:5000"; // Change this when Backend is ready

// ─────────────────────────────────────────
// MOCK DATA — Remove when Backend is ready
// ─────────────────────────────────────────

const MOCK_USERS = [
  { id: "ST-2024-001", password: "1234", role: "student", name: "Ahmed Mohamed" },
  { id: "ST-2024-002", password: "1234", role: "student", name: "Sara Ali" },
  { id: "ST-2024-003", password: "1234", role: "student", name: "Mahmoud Khaled" },
  { id: "INS-001",     password: "admin", role: "instructor", name: "Dr. Khaled Hassan" },
];

const MOCK_ATTENDANCE = [
  { studentId: "ST-2024-001", studentName: "Ahmed Mohamed",  time: "10:03 AM", status: "present" },
  { studentId: "ST-2024-002", studentName: "Sara Ali",       time: "10:05 AM", status: "present" },
  { studentId: "ST-2024-003", studentName: "Mahmoud Khaled", time: "—",        status: "absent"  },
  { studentId: "ST-2024-004", studentName: "Nour Hassan",    time: "10:08 AM", status: "present" },
  { studentId: "ST-2024-005", studentName: "Omar Sami",      time: "—",        status: "absent"  },
];

// Simulates network delay (ms)
const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

/**
 * Login — returns { success, user, token }
 * TO REPLACE: axios.post(`${BASE_URL}/login`, { id, password })
 */
export async function login(id, password) {
  await delay();
  const user = MOCK_USERS.find((u) => u.id === id && u.password === password);
  if (!user) return { success: false, message: "Invalid ID or password" };
  const token = `mock-token-${user.id}-${Date.now()}`;
  return { success: true, user, token };
}

// ─────────────────────────────────────────
// QR CODE
// ─────────────────────────────────────────

/**
 * Generate a new QR code for the current session
 * Returns { qrValue, expiresAt } — expiresAt is a timestamp (ms)
 * TO REPLACE: axios.post(`${BASE_URL}/generate-qr`, {}, { headers: authHeader() })
 */
export async function generateQR() {
  await delay(300);
  const qrValue  = `ATT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now
  return { success: true, qrValue, expiresAt };
}

/**
 * Mark attendance by scanning a QR code
 * Returns { success, message }
 * TO REPLACE: axios.post(`${BASE_URL}/mark-attendance`, { qrValue }, { headers: authHeader() })
 */
export async function markAttendance(qrValue) {
  await delay(400);
  // Mock validation: any QR starting with "ATT-" is valid
  if (!qrValue || !qrValue.startsWith("ATT-")) {
    return { success: false, message: "Invalid or expired QR code" };
  }
  return { success: true, message: "Attendance marked successfully" };
}

// ─────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────

/**
 * Get attendance records for today's session
 * TO REPLACE: axios.get(`${BASE_URL}/report`, { headers: authHeader() })
 */
export async function getAttendanceReport() {
  await delay(600);
  const total   = MOCK_ATTENDANCE.length;
  const present = MOCK_ATTENDANCE.filter((r) => r.status === "present").length;
  const absent  = total - present;
  const percentage = Math.round((present / total) * 100);
  return {
    success: true,
    stats: { total, present, absent, percentage },
    records: MOCK_ATTENDANCE,
  };
}

// ─────────────────────────────────────────
// HELPER — Auth header (used when Backend is ready)
// ─────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}