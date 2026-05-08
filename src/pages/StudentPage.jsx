// ============================================================
// StudentPage.jsx — Student view: scan QR to mark attendance
// ============================================================

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { markAttendance } from "../services/api";
import QrScanner from "../components/QrScanner";

// Attendance status constants
const STATUS = {
  IDLE:    "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR:   "error",
};

export default function StudentPage() {
  const { user, signOut } = useAuth();

  const [status,  setStatus]  = useState(STATUS.IDLE);
  const [message, setMessage] = useState("");
  const [scanTime, setScanTime] = useState("");

  // Called by QrScanner component when a QR code is detected
  async function handleScan(qrValue) {
    if (status === STATUS.SUCCESS || status === STATUS.LOADING) return;

    setStatus(STATUS.LOADING);

    const res = await markAttendance(qrValue);

    if (res.success) {
      setStatus(STATUS.SUCCESS);
      setMessage(res.message);
      setScanTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    } else {
      setStatus(STATUS.ERROR);
      setMessage(res.message);
    }
  }

  function handleReset() {
    setStatus(STATUS.IDLE);
    setMessage("");
    setScanTime("");
  }

  return (
    <div style={styles.page}>

      {/* Top navbar */}
      <nav style={styles.nav}>
        <div style={styles.navBrand}>
          <QrIcon />
          <span style={styles.navTitle}>Smart Attendance</span>
        </div>
        <div style={styles.navRight}>
          <span style={styles.navName}>{user?.name}</span>
          <button style={styles.logoutBtn} onClick={signOut}>Sign Out</button>
        </div>
      </nav>

      {/* Main content */}
      <main style={styles.main}>

        {/* Session info banner */}
        <div style={styles.sessionBanner}>
          <div style={styles.sessionDot} />
          <span style={styles.sessionText}>
            Active Session — <strong>Cloud Computing</strong> &nbsp;|&nbsp; 10:00 AM
          </span>
        </div>

        {/* Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Mark Your Attendance</h2>
          <p style={styles.cardSubtitle}>
            Scan the QR code displayed by your instructor to register your attendance.
          </p>

          {/* ── IDLE / LOADING: show scanner ── */}
          {(status === STATUS.IDLE || status === STATUS.LOADING) && (
            <div style={styles.scannerWrap}>
              <QrScanner onScan={handleScan} />
              {status === STATUS.LOADING && (
                <div style={styles.loadingOverlay}>
                  <div style={styles.spinner} />
                  <p style={styles.loadingText}>Verifying QR code...</p>
                </div>
              )}
            </div>
          )}

          {/* ── SUCCESS ── */}
          {status === STATUS.SUCCESS && (
            <div style={styles.resultBox("#e8f7f0", "#1a7a4a")}>
              <SuccessIcon />
              <h3 style={styles.resultTitle}>Attendance Recorded!</h3>
              <p style={styles.resultSub}>
                <strong>Cloud Computing</strong> &nbsp;·&nbsp; {scanTime}
              </p>
              <p style={styles.resultMsg}>{message}</p>
            </div>
          )}

          {/* ── ERROR ── */}
          {status === STATUS.ERROR && (
            <div style={styles.resultBox("#fdf0ef", "#c0392b")}>
              <ErrorIcon />
              <h3 style={styles.resultTitle}>Scan Failed</h3>
              <p style={styles.resultMsg}>{message}</p>
              <button style={styles.retryBtn} onClick={handleReset}>
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Student info footer */}
        <div style={styles.infoRow}>
          <InfoItem label="Student ID" value={user?.id} />
          <InfoItem label="Name"       value={user?.name} />
          <InfoItem label="Course"     value="Cloud Computing" />
        </div>

      </main>
    </div>
  );
}

// ─────────────────────────────────────────
// Small reusable components
// ─────────────────────────────────────────

function InfoItem({ label, value }) {
  return (
    <div style={styles.infoItem}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  );
}

function QrIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"/>
    </svg>
  );
}

function SuccessIcon() {
  return (
    <div style={{ ...styles.resultIcon, background: "#1a7a4a" }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
  );
}

function ErrorIcon() {
  return (
    <div style={{ ...styles.resultIcon, background: "#c0392b" }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6"  y1="6" x2="18" y2="18"/>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f5",
    display: "flex",
    flexDirection: "column",
  },
  nav: {
    background: "#fff",
    borderBottom: "1px solid #eee",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  navTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#111",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  navName: {
    fontSize: "13px",
    color: "#555",
  },
  logoutBtn: {
    fontSize: "13px",
    color: "#888",
    background: "none",
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "5px 12px",
    cursor: "pointer",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 24px",
    gap: "20px",
  },
  sessionBanner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "13px",
    color: "#444",
  },
  sessionDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#27ae60",
    flexShrink: 0,
  },
  sessionText: {
    fontSize: "13px",
    color: "#444",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "32px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
    textAlign: "center",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#111",
    margin: "0 0 8px",
  },
  cardSubtitle: {
    fontSize: "14px",
    color: "#888",
    margin: "0 0 24px",
    lineHeight: "1.5",
  },
  scannerWrap: {
    position: "relative",
  },
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(255,255,255,0.85)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    gap: "12px",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #eee",
    borderTop: "3px solid #111",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: "14px",
    color: "#555",
    margin: 0,
  },
  resultBox: (bg, color) => ({
    padding: "28px 20px",
    background: bg,
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  }),
  resultIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "4px",
  },
  resultTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111",
    margin: 0,
  },
  resultSub: {
    fontSize: "13px",
    color: "#555",
    margin: 0,
  },
  resultMsg: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
  },
  retryBtn: {
    marginTop: "8px",
    padding: "9px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#fff",
    background: "#c0392b",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  infoRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  infoItem: {
    background: "#fff",
    borderRadius: "10px",
    padding: "12px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: "120px",
    textAlign: "center",
    border: "1px solid #eee",
  },
  infoLabel: {
    fontSize: "11px",
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111",
  },
};
