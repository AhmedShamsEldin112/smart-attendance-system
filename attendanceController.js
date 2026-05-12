const { pool, poolConnect, sql } = require('../db');

async function markAttendance(req, res) {
  try {
    const { qr_token } = req.body;
    const student_id = req.student.student_id;
    if (!qr_token) {
      return res.status(400).json({ success: false, message: 'qr_token is required.' });
    }
    await poolConnect;

    const qrRequest = pool.request();
    qrRequest.input('qr_token', sql.VarChar, qr_token);
    const qrResult = await qrRequest.query('SELECT * FROM qr_codes WHERE qr_token = @qr_token');

    if (qrResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'QR code not found.' });
    }
    const qrRecord = qrResult.recordset[0];

    const now = new Date();
    const expiryTime = new Date(qrRecord.expiry_time);
    if (now > expiryTime) {
      return res.status(410).json({ success: false, message: 'QR code has expired.', expired_at: expiryTime.toISOString() });
    }

    const dupRequest = pool.request();
    dupRequest.input('student_id', sql.VarChar, student_id);
    dupRequest.input('session_id', sql.VarChar, qrRecord.session_id);
    const dupResult = await dupRequest.query('SELECT id FROM attendance_records WHERE student_id = @student_id AND session_id = @session_id');
    if (dupResult.recordset.length > 0) {
      return res.status(409).json({ success: false, message: 'Attendance already recorded for this session.', session_id: qrRecord.session_id });
    }

    const insertRequest = pool.request();
    insertRequest.input('student_id', sql.VarChar, student_id);
    insertRequest.input('session_id', sql.VarChar, qrRecord.session_id);
    await insertRequest.query('INSERT INTO attendance_records (student_id, session_id) VALUES (@student_id, @session_id)');

    return res.status(201).json({
      success: true,
      message: 'Attendance marked successfully!',
      data: { student_id, student_name: req.student.name, session_id: qrRecord.session_id, attendance_time: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    return res.status(500).json({ success: false, message: 'Server error while marking attendance.' });
  }
}

module.exports = { markAttendance };
