const express = require('express');
const router = express.Router();

router.get('/attendance', (req, res) => {
  res.json({ success: true, message: 'Reports attendance route works' });
});

router.get('/session/:id/summary', (req, res) => {
  res.json({ success: true, message: 'Session summary route works' });
});

router.get('/student/:id', (req, res) => {
  res.json({ success: true, message: 'Student report route works' });
});

module.exports = router;