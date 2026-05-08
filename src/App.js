// ============================================================
// App.jsx — Main app router + protected route logic
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import LoginPage      from "./pages/LoginPage";
import StudentPage    from "./pages/StudentPage";
import InstructorPage from "./pages/InstructorPage";

// ─────────────────────────────────────────
// ProtectedRoute — blocks unauthenticated users
// requiredRole: "student" | "instructor" | null (any logged-in user)
// ─────────────────────────────────────────
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Wrong role — redirect to their own page
    return <Navigate to={user.role === "instructor" ? "/instructor" : "/student"} replace />;
  }

  return children;
}

// ─────────────────────────────────────────
// AppRoutes — all routes defined here
// ─────────────────────────────────────────
function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to={user.role === "instructor" ? "/instructor" : "/student"} replace />
            : <LoginPage />
        }
      />

      {/* Student only */}
      <Route
        path="/student"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentPage />
          </ProtectedRoute>
        }
      />

      {/* Instructor only */}
      <Route
        path="/instructor"
        element={
          <ProtectedRoute requiredRole="instructor">
            <InstructorPage />
          </ProtectedRoute>
        }
      />

      {/* Default — redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// ─────────────────────────────────────────
// App — root component
// ─────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
