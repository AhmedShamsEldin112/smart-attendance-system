// ============================================================
// LoginPage.jsx — Login form for both students and instructors
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/api";

export default function LoginPage() {
  const navigate    = useNavigate();
  const { signIn }  = useAuth();

  const [id,       setId]       = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!id.trim() || !password.trim()) {
      setError("Please enter your ID and password.");
      return;
    }

    setLoading(true);
    const res = await login(id.trim(), password.trim());
    setLoading(false);

    if (!res.success) {
      setError(res.message || "Login failed. Please try again.");
      return;
    }

    signIn(res.user, res.token);
    navigate(res.user.role === "instructor" ? "/instructor" : "/student");
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconWrap}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"/>
            </svg>
          </div>
          <h1 style={styles.title}>Smart Attendance</h1>
          <p style={styles.subtitle}>Sign in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>

          <div style={styles.field}>
            <label style={styles.label}>Student / Instructor ID</label>
            <input
              type="text"
              placeholder="e.g. ST-2024-001 or INS-001"
              value={id}
              onChange={(e) => setId(e.target.value)}
              style={styles.input}
              autoComplete="username"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              autoComplete="current-password"
            />
          </div>

          {/* Error message */}
          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Mock credentials hint */}
        <div style={styles.hint}>
          <p style={styles.hintTitle}>Mock credentials (no backend needed)</p>
          <p style={styles.hintRow}><strong>Student:</strong> ST-2024-001 / 1234</p>
          <p style={styles.hintRow}><strong>Instructor:</strong> INS-001 / admin</p>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f5f5",
    padding: "24px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  iconWrap: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    background: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#111",
    margin: "0 0 6px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#888",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#444",
  },
  input: {
    padding: "10px 14px",
    fontSize: "14px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.15s",
    background: "#fafafa",
  },
  error: {
    fontSize: "13px",
    color: "#c0392b",
    background: "#fdf0ef",
    padding: "10px 14px",
    borderRadius: "8px",
    margin: 0,
  },
  btn: {
    padding: "12px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#fff",
    background: "#111",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "4px",
    transition: "opacity 0.15s",
  },
  hint: {
    marginTop: "24px",
    padding: "14px",
    background: "#f9f9f9",
    borderRadius: "8px",
    border: "1px dashed #ddd",
  },
  hintTitle: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#888",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  hintRow: {
    fontSize: "13px",
    color: "#555",
    margin: "2px 0",
  },
};
