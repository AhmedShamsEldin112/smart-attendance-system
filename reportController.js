const { pool, poolConnect, sql } = require('../db');

async function getAttendanceReport(req, res) {
  try {
    const { session_id, student_id, date } = req.query;
    await poolConnect;
    const request = pool.request();
    let query = 'SELECT ar.id, ar.student_id, s.name AS student_name, s.email AS student_email, ar.session_id, ar.attendance_time FROM attendance_records ar JOIN students s ON ar.student_id = s.student_id WHERE 1=1';
    if (session_id) { query += ' AND ar.session_id = @session_id'; request.input('session_id', sql.VarChar, session_id); }
    if (student_id) { query += ' AND ar.student_id = @student_id'; request.input('student_id', sql.VarChar, student_id); }
    if (date) { query += ' AND CAST(ar.attendance_time AS DATE) = @date'; request.input('date', sql.Date, date); }
    query += ' ORDER BY ar.attendance_time DESC';
    const result = await request.query(query);
    return res.status(200).json({ success: true, total_records: result.recordset.length, filters_applied: { session_id, student_id, date }, data: result.recordset });
  } catch (error) {
    console.error('Report error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching report.' });
  }
}

async function getSessionSummary(req, res) {
  try {
    const { session_id } = req.params;
    await poolConnect;
    const request = pool.request();
    request.input('session_id', sql.VarChar, session_id);
    const attended = await request.query('SELECT ar.student_id, s.name, s.email, ar.attendance_time FROM attendance_records ar JOIN students s ON ar.student_id = s.student_id WHERE ar.session_id = @session_id ORDER BY ar.attendance_time ASC');
    const totalResult = await pool.request().query('SELECT COUNT(*) AS total FROM students');
    const total = totalResult.recordset[0].total;
    return res.status(200).json({
      success: true,
      data: {
        session_id,
        total_students_registered: total,
        total_attended: attended.recordset.length,
        attendance_rate: total > 0 ? Math.round((attended.recordset.length / total) * 100) + '%' : '0%',
        students_attended: attended.recordset
      }
    });
  } catch (error) {
    console.error('Session summary error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

async function getStudentReport(req, res) {
  try {
    const { student_id } = req.params;
    await poolConnect;
    const studentRequest = pool.request();
    studentRequest.input('student_id', sql.VarChar, student_id);
    const studentResult = await studentRequest.query('SELECT id, student_id, name, email FROM students WHERE student_id = @student_id');
    if (studentResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    const recordsRequest = pool.request();
    recordsRequest.input('student_id', sql.VarChar, student_id);
    const records = await recordsRequest.query('SELECT session_id, attendance_time FROM attendance_records WHERE student_id = @student_id ORDER BY attendance_time DESC');
    return res.status(200).json({ success: true, data: { student: studentResult.recordset[0], total_sessions_attended: records.recordset.length, sessions: records.recordset } });
  } catch (error) {
    console.error('Student report error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getAttendanceReport, getSessionSummary, getStudentReport };
