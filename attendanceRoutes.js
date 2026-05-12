const express = require('express');
const router = express.Router();

router.post('/mark', (req, res) => {
  res.json({ success: true, message: 'Attendance mark route works' });
});

module.exports = router;