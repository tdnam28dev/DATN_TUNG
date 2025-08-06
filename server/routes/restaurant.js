const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

// Lấy danh sách nhà hàng
router.get('/', restaurantController.getAll);
// Tạo mới nhà hàng
router.post('/', restaurantController.create);
// Lấy thông tin nhà hàng theo id
router.get('/:id', restaurantController.getById);
// Cập nhật nhà hàng
router.put('/:id', restaurantController.update);
// Xóa nhà hàng
router.delete('/:id', restaurantController.delete);

module.exports = router;
