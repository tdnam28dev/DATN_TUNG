const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');

// Lấy danh sách món ăn
router.get('/', menuItemController.getAll);
// Tạo mới món ăn
router.post('/', menuItemController.create);
// Lấy thông tin món ăn theo id
router.get('/:id', menuItemController.getById);
// Cập nhật món ăn
router.put('/:id', menuItemController.update);
// Xóa món ăn
router.delete('/:id', menuItemController.delete);

module.exports = router;
