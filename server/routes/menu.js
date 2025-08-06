const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Lấy danh sách thực đơn
router.get('/', menuController.getAll);
// Tạo mới thực đơn
router.post('/', menuController.create);
// Lấy thông tin thực đơn theo id
router.get('/:id', menuController.getById);
// Cập nhật thực đơn
router.put('/:id', menuController.update);
// Xóa thực đơn
router.delete('/:id', menuController.delete);

module.exports = router;
