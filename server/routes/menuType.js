// Route cho loại menu (MenuType)
const express = require('express');
const router = express.Router();
const menuTypeController = require('../controllers/menuTypeController');
const auth = require('../middlewares/auth');

// Lấy tất cả loại menu
router.get('/', auth, menuTypeController.getAllMenuTypes);
// Thêm loại menu
router.post('/', auth, menuTypeController.createMenuType);
// Cập nhật loại menu
router.put('/:id', auth, menuTypeController.updateMenuType);
// Xóa loại menu
router.delete('/:id', auth, menuTypeController.deleteMenuType);

module.exports = router;
