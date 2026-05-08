// ============================================================
// InstructorPage.jsx — Instructor dashboard
// Features: QR generation, live countdown, attendance table
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { generateQR, getAttendanceReport } from "../services/api";
import QRCode from "react-qr-code";

const QR_DURATION_SECONDS = 300; // 5 minutes

export default function InstructorPage() {
  const { user, signOut } = useAuth();

  // QR state
  const [qrValue,    setQrValue]    = useState("");
  const [expiresAt,  setExpiresAt]  = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [qrLoading,  setQrLoading]  = useState(false);
  const [qrExpired,  setQrExpired]  = useState(false);

  // Attendance state
  const [stats,   setStats]   = useState(null);
  const [records, setRecords] = useState([]);
  const [repLoading, setRepLoading] = useState(true);

  // ── Load attendance report on mount ──
  useEffect(() => {
    async function fetchReport() {
      setRepLoading(true);
      const res = await getAttendanceReport();
      if (res.success) {
        setStats(res.stats);
        setRecords(res.records);
      }
      setRepLoading(false);
    }
    fetchReport();
  }, []);

  // ── Countdown timer ──
  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.round((expiresAt - Date.now()) / 1000);
      if (remaining <= 0) {
        setSecondsLeft(0);
        setQrExpired(true);
        clearInterval(interval);
      } else {
        setSecondsLeft(remaining);
        setQrExpired(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // ── Generate a new QR code ──
  const handleGenerateQR = useCallback(async () => {
    setQrLoading(true);
    const res = await generateQR();
    if (res.success) {
      setQrValue(res.qrValue);
      setExpiresAt(res.expiresAt);
      setSecondsLeft(QR_DURATION_SECONDS);
      setQrExpired(false);
    }
    setQrLoading(false);
  }, []);

  // Auto-generate QR on first load
  useEffect(() => { handleGenerateQR(); }, []);

  // ── Format countdown as MM:SS ──
  function formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // Countdown color: green → amber → red
  function countdownColor() {
    if (secondsLeft > 120) return "#27ae60";
    if (secondsLeft > 60)  return "#e67e22";
    return "#c0392b";
  }

  return (
    <div style={styles.page}>

      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navBrand}>
          <QrIcon />
          <span style={styles.navTitle}>Smart Attendance</span>
        </div>
        <div style={styles.navRight}>
          <span style={styles.navName}>{user?.name}</span>
          <span style={styles.roleBadge}>Instructor</span>
          <button style={styles.logoutBtn} onClick={signOut}>Sign Out</button>
        </div>
      </nav>

      <main style={styles.main}>

        {/* Page title */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Dashboard</h1>
          <span style={styles.courseTag}>Cloud Computing — Session Today</span>
        </div>

        {/* ── Stats row ── */}
        {stats && (
          <div style={styles.statsGrid}>
            <StatCard label="Total Students"  value={stats.total}      color="#111" />
            <StatCard label="Present Today"   value={stats.present}    color="#27ae60" />
            <StatCard label="Attendance Rate" value={`${stats.percentage}%`} color="#e67e22" />
            <StatCard label="Absent"          value={stats.absent}     color="#c0392b" />
          </div>
        )}

        <div style={styles.twoCol}>

          {/* ── QR Code panel ── */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Session QR Code</h2>
              {qrValue && !qrExpired && (
                <span style={{ ...styles.countdown, color: countdownColor() }}>
                  {formatTime(secondsLeft)}
                </span>
              )}
            </div>

            {/* QR display */}
            <div style={{ ...styles.qrWrap, opacity: qrExpired ? 0.3 : 1 }}>
              {qrValue ? (
                <QRCode
                  value={qrValue}
                  size={180}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
              ) : (
                <div style={styles.qrPlaceholder}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none"
                    stroke="#ccc" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                    <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"/>
                  </svg>
                </div>
              )}
            </div>

            {qrExpired && (
              <p style={styles.expiredText}>QR code expired — generate a new one</p>
            )}

            <button
              style={styles.genBtn}
              onClick={handleGenerateQR}
              disabled={qrLoading}
            >
              {qrLoading ? "Generating..." : qrExpired ? "Generate New QR" : "Regenerate QR"}
            </button>

            {/* QR value for testing */}
            {qrValue && (
              <div style={styles.qrValueBox}>
                <span style={styles.qrValueLabel}>QR Value (for testing)</span>
                <code style={styles.qrValueText}>{qrValue}</code>
              </div>
            )}
          </div>

          {/* ── Attendance table ── */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Attendance Records</h2>
              <span style={styles.recordCount}>{records.length} students</span>
            </div>

            {repLoading ? (
              <div style={styles.loadingWrap}>
                <div style={styles.spinner} />
                <p style={styles.loadingText}>Loading records...</p>
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Student</th>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Time</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec) => (
                      <tr key={rec.studentId} style={styles.tr}>
                        <td style={styles.td}>{rec.studentName}</td>
                        <td style={{ ...styles.td, color: "#888", fontSize: "12px" }}>{rec.studentId}</td>
                        <td style={styles.td}>{rec.time}</td>
                        <td style={styles.td}>
                          <StatusBadge status={rec.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────

function StatCard({ label, value, color }) {
  return (
    <div style={styles.statCard}>
      <span style={styles.statLabel}>{label}</span>
      <span style={{ ...styles.statValue, color }}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const isPresent = status === "present";
  return (
    <span style={{
      ...styles.badge,
      background: isPresent ? "#e8f7f0" : "#fdf0ef",
      color:      isPresent ? "#1a7a4a" : "#c0392b",
    }}>
      {isPresent ? "Present" : "Absent"}
    </span>
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
  navBrand: { display: "flex", alignItems: "center", gap: "8px" },
  navTitle: { fontSize: "15px", fontWeight: "600", color: "#111" },
  navRight: { display: "flex", alignItems: "center", gap: "12px" },
  navName:  { fontSize: "13px", color: "#555" },
  roleBadge: {
    fontSize: "11px", fontWeight: "600", color: "#fff",
    background: "#111", padding: "3px 10px", borderRadius: "99px",
  },
  logoutBtn: {
    fontSize: "13px", color: "#888", background: "none",
    border: "1px solid #ddd", borderRadius: "6px",
    padding: "5px 12px", cursor: "pointer",
  },
  main: { flex: 1, padding: "28px 24px", maxWidth: "1100px", margin: "0 auto", width: "100%" },
  pageHeader: { display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "20px" },
  pageTitle:  { fontSize: "22px", fontWeight: "600", color: "#111", margin: 0 },
  courseTag:  { fontSize: "13px", color: "#888" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "20px",
  },
  statCard: {
    background: "#fff", borderRadius: "12px", padding: "16px 20px",
    border: "1px solid #eee", display: "flex", flexDirection: "column", gap: "6px",
  },
  statLabel: { fontSize: "12px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "500" },
  statValue: { fontSize: "26px", fontWeight: "700" },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1.6fr",
    gap: "16px",
    alignItems: "start",
  },
  card: {
    background: "#fff", borderRadius: "16px",
    padding: "24px", border: "1px solid #eee",
  },
  cardHeader: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: "20px",
  },
  cardTitle:    { fontSize: "16px", fontWeight: "600", color: "#111", margin: 0 },
  countdown:    { fontSize: "20px", fontWeight: "700", fontVariantNumeric: "tabular-nums" },
  recordCount:  { fontSize: "13px", color: "#aaa" },
  qrWrap: {
    width: "180px", margin: "0 auto 16px",
    transition: "opacity 0.3s",
  },
  qrPlaceholder: {
    width: "180px", height: "180px",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#f8f8f8", borderRadius: "8px",
  },
  expiredText: { fontSize: "13px", color: "#c0392b", textAlign: "center", margin: "0 0 12px" },
  genBtn: {
    width: "100%", padding: "11px",
    fontSize: "14px", fontWeight: "600",
    color: "#fff", background: "#111",
    border: "none", borderRadius: "8px", cursor: "pointer",
    marginBottom: "12px",
  },
  qrValueBox: {
    background: "#f8f8f8", borderRadius: "8px",
    padding: "10px 12px", display: "flex",
    flexDirection: "column", gap: "4px",
  },
  qrValueLabel: { fontSize: "11px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" },
  qrValueText:  { fontSize: "11px", color: "#555", wordBreak: "break-all", lineHeight: "1.5" },
  tableWrap: { overflowX: "auto" },
  table:     { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  th: {
    textAlign: "left", padding: "8px 12px",
    fontSize: "11px", fontWeight: "600", color: "#aaa",
    textTransform: "uppercase", letterSpacing: "0.5px",
    borderBottom: "1px solid #eee",
  },
  tr: { borderBottom: "1px solid #f5f5f5" },
  td: { padding: "11px 12px", color: "#333" },
  badge: {
    display: "inline-block", padding: "3px 10px",
    borderRadius: "99px", fontSize: "12px", fontWeight: "600",
  },
  loadingWrap: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "12px", padding: "32px",
  },
  spinner: {
    width: "28px", height: "28px",
    border: "3px solid #eee", borderTop: "3px solid #111",
    borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },
  loadingText: { fontSize: "13px", color: "#aaa", margin: 0 },
};

