const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Đăng ký tài khoản
router.post('/register', userController.create);
// Đăng nhập, trả về access token
router.post('/login', userController.login);

module.exports = router;
