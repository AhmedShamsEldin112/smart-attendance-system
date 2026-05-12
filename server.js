// ============================================================
// server.js - Main Entry Point
// Smart Attendance System - Express Server
// ============================================================

const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').resolve(__dirname, '.env') });

// Initialize Express app
const app = express();

// ============================================================
// Middleware
// ============================================================

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Simple request logger (helpful for development)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================================
// Routes
// ============================================================

const authRoutes       = require('./routes/authRoutes');
const qrRoutes         = require('./routes/qrRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const reportRoutes     = require('./routes/reportRoutes');

// Mount routes with base paths
app.use('/api/auth',       authRoutes);
app.use('/api/qr',         qrRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports',    reportRoutes);

// ============================================================
// Health Check Route
// ============================================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎓 Smart Attendance System API is running!',
    version: '1.0.0',
    endpoints: {
      auth:       'POST /api/auth/login | POST /api/auth/register',
      qr:         'POST /api/qr/generate | GET /api/qr/session/:id',
      attendance: 'POST /api/attendance/mark',
      reports:    'GET /api/reports/attendance | GET /api/reports/session/:id/summary | GET /api/reports/student/:id'
    }
  });
});

// ============================================================
// 404 Handler - Catch all unmatched routes
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`
  });
});

// ============================================================
// Global Error Handler
// ============================================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================================
// Start Server
// ============================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log('🎓 ====================================');
  console.log('   Smart Attendance System');
  console.log(`   Server running on port ${PORT}`);
  console.log(`   http://localhost:${PORT}`);
  console.log('======================================');
  console.log('');
});