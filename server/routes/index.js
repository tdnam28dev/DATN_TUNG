const express = require('express');
const router = express.Router();

// Route mẫu cho backend
router.get('/', (req, res) => {
  res.json({ message: 'API backend Node.js MVC hoạt động!' });
});

module.exports = router;
