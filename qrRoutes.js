const express = require('express');
const router = express.Router();

router.post('/generate', (req, res) => {
  res.json({ success: true, message: 'QR generate route works' });
});

router.get('/session/:id', (req, res) => {
  res.json({ success: true, message: 'QR session route works' });
});

module.exports = router;