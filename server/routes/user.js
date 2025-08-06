const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Lấy danh sách người dùng
router.get('/', userController.getAll);
// Tạo mới người dùng
router.post('/', userController.create);
// Lấy thông tin người dùng theo id
router.get('/:id', userController.getById);
// Cập nhật người dùng
router.put('/:id', userController.update);
// Xóa người dùng
router.delete('/:id', userController.delete);

module.exports = router;
