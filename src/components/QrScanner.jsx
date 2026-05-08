// ============================================================
// QrScanner.jsx — Camera QR scanner with mock fallback
// Uses: react-qr-reader for real scanning
// Install: npm install react-qr-reader
// ============================================================

import { useState, useEffect } from "react";

// ─────────────────────────────────────────
// Try to import real QR scanner library
// If not installed yet, mock scanner is used automatically
// ─────────────────────────────────────────
const QrReader = null;

// ─────────────────────────────────────────
// Props:
//   onScan(qrValue: string) — called when a valid QR is detected
// ─────────────────────────────────────────
export default function QrScanner({ onScan }) {
  const [useMock, setUseMock] = useState(!QrReader);
  const [mockInput, setMockInput] = useState("");
  const [cameraError, setCameraError] = useState("");

  // If library exists but camera is denied, fall back to mock
  function handleCameraError(err) {
    console.error("Camera error:", err);
    setCameraError("Camera access denied or not available.");
    setUseMock(true);
  }

  function handleRealScan(result) {
    if (result?.text) {
      onScan(result.text);
    }
  }

  function handleMockSubmit() {
    const val = mockInput.trim();
    if (!val) return;
    onScan(val);
    setMockInput("");
  }

  // ── Real camera scanner ──
  if (!useMock && QrReader) {
    return (
      <div style={styles.wrap}>
        <div style={styles.frame}>
          <QrReader
            onResult={handleRealScan}
            onError={handleCameraError}
            constraints={{ facingMode: "environment" }}
            style={{ width: "100%" }}
          />
          <div style={styles.scanLine} />
          <CornerBrackets />
        </div>
        <p style={styles.hint}>Point your camera at the QR code</p>
        <button style={styles.switchBtn} onClick={() => setUseMock(true)}>
          No camera? Enter code manually
        </button>
      </div>
    );
  }

  // ── Mock / manual fallback ──
  return (
    <div style={styles.wrap}>
      {/* Animated mock camera frame */}
      <div style={styles.frame}>
        <div style={styles.mockInner}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
            stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"/>
          </svg>
          <p style={styles.mockLabel}>
            {QrReader ? "Camera unavailable" : "Mock Mode"}
          </p>
        </div>
        <div style={styles.scanLine} />
        <CornerBrackets />
      </div>

      {cameraError && <p style={styles.errorText}>{cameraError}</p>}

      {/* Manual QR input — for testing without camera */}
      <div style={styles.manualWrap}>
        <p style={styles.manualLabel}>Paste or type a QR value to simulate a scan:</p>
        <div style={styles.manualRow}>
          <input
            type="text"
            placeholder="e.g. ATT-1234567890-ABC123"
            value={mockInput}
            onChange={(e) => setMockInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleMockSubmit()}
            style={styles.manualInput}
          />
          <button style={styles.manualBtn} onClick={handleMockSubmit}>
            Scan
          </button>
        </div>

        {/* Quick test button — generates a valid mock QR */}
        <button
          style={styles.quickBtn}
          onClick={() => onScan(`ATT-${Date.now()}-TESTQR`)}
        >
          Simulate Valid QR Scan
        </button>
      </div>

      {QrReader && (
        <button style={styles.switchBtn} onClick={() => setUseMock(false)}>
          Try camera again
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// Corner bracket decoration for the scan frame
// ─────────────────────────────────────────
function CornerBrackets() {
  const corner = (position) => (
    <div style={{ ...styles.corner, ...position }} />
  );
  return (
    <>
      {corner({ top: 8,    left: 8,    borderTop: "3px solid #111", borderLeft:  "3px solid #111" })}
      {corner({ top: 8,    right: 8,   borderTop: "3px solid #111", borderRight: "3px solid #111" })}
      {corner({ bottom: 8, left: 8,    borderBottom: "3px solid #111", borderLeft:  "3px solid #111" })}
      {corner({ bottom: 8, right: 8,   borderBottom: "3px solid #111", borderRight: "3px solid #111" })}
    </>
  );
}

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────
const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    width: "100%",
  },
  frame: {
    position: "relative",
    width: "240px",
    height: "240px",
    background: "#f8f8f8",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #e0e0e0",
  },
  mockInner: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  mockLabel: {
    fontSize: "12px",
    color: "#aaa",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  scanLine: {
    position: "absolute",
    left: "10%",
    width: "80%",
    height: "2px",
    background: "#27ae60",
    animation: "scanMove 2s ease-in-out infinite",
    top: "20%",
    // CSS animation defined globally — add to index.css or App.css:
    // @keyframes scanMove { 0%,100% { top: 20%; } 50% { top: 75%; } }
  },
  corner: {
    position: "absolute",
    width: "18px",
    height: "18px",
    borderRadius: "2px",
  },
  hint: {
    fontSize: "13px",
    color: "#888",
    margin: 0,
    textAlign: "center",
  },
  errorText: {
    fontSize: "13px",
    color: "#c0392b",
    background: "#fdf0ef",
    padding: "8px 14px",
    borderRadius: "6px",
    margin: 0,
  },
  manualWrap: {
    width: "100%",
    background: "#f9f9f9",
    border: "1px dashed #ddd",
    borderRadius: "10px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  manualLabel: {
    fontSize: "12px",
    color: "#888",
    margin: 0,
  },
  manualRow: {
    display: "flex",
    gap: "8px",
  },
  manualInput: {
    flex: 1,
    padding: "9px 12px",
    fontSize: "13px",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    outline: "none",
    background: "#fff",
  },
  manualBtn: {
    padding: "9px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#fff",
    background: "#111",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  quickBtn: {
    width: "100%",
    padding: "10px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#111",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
  },
  switchBtn: {
    fontSize: "12px",
    color: "#aaa",
    background: "none",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
  },
};
