const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { pool, poolConnect, sql } = require('../db');
require('dotenv').config();

async function generateQR(req, res) {
  try {
    const { session_id } = req.body;
    if (!session_id) {
      return res.status(400).json({ success: false, message: 'session_id is required.' });
    }
    const qr_token = uuidv4();
    const expirySeconds = parseInt(process.env.QR_EXPIRY_SECONDS) || 30;
    const expiry_time = new Date(Date.now() + expirySeconds * 1000);

    await poolConnect;
    const request = pool.request();
    request.input('session_id', sql.VarChar, session_id);
    request.input('qr_token', sql.VarChar, qr_token);
    request.input('expiry_time', sql.DateTime, expiry_time);
    await request.query('INSERT INTO qr_codes (session_id, qr_token, expiry_time) VALUES (@session_id, @qr_token, @expiry_time)');

    const qrCodeData = JSON.stringify({ token: qr_token, session_id: session_id });
    const qrImageBase64 = await QRCode.toDataURL(qrCodeData, { width: 300, margin: 2 });

    return res.status(201).json({
      success: true,
      message: 'QR code generated! Expires in ' + expirySeconds + ' seconds.',
      data: { session_id, qr_token, expires_at: expiry_time.toISOString(), expires_in_seconds: expirySeconds, qr_image_base64: qrImageBase64 }
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return res.status(500).json({ success: false, message: 'Server error while generating QR code.' });
  }
}

async function getSessionQRs(req, res) {
  try {
    const { session_id } = req.params;
    await poolConnect;
    const request = pool.request();
    request.input('session_id', sql.VarChar, session_id);
    const result = await request.query(
      "SELECT id, session_id, qr_token, expiry_time, created_at, CASE WHEN expiry_time > GETDATE() THEN 'active' ELSE 'expired' END AS status FROM qr_codes WHERE session_id = @session_id ORDER BY created_at DESC"
    );
    return res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Get session QRs error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { generateQR, getSessionQRs };
