// ============================================================
// AuthContext.jsx — Global authentication state
// Wrap your app with <AuthProvider> to access auth anywhere
// ============================================================

import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// ─────────────────────────────────────────
// Provider — wrap the whole app with this
// ─────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);  // { id, name, role }
  const [token, setToken] = useState(null);  // JWT token (mock for now)

  // Call this after a successful login API response
  function signIn(userData, authToken) {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("token", authToken); // persist across refresh
  }

  // Call this on logout button
  function signOut() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  }

  const isAuthenticated = !!user;
  const isInstructor    = user?.role === "instructor";
  const isStudent       = user?.role === "student";

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isInstructor, isStudent, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────
// Hook — use this in any component
// Usage: const { user, signIn, signOut } = useAuth();
// ─────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
