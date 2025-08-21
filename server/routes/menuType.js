// Route cho loại menu (MenuType)

const express = require('express');
const router = express.Router();
const menuTypeController = require('../controllers/menuTypeController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

// Lấy tất cả loại menu (admin, staff)
router.get('/', auth, role(['admin', 'staff']), menuTypeController.getAllMenuTypes);
// Thêm loại menu (admin)
router.post('/', auth, role(['admin']), menuTypeController.createMenuType);
// Cập nhật loại menu (admin)
router.put('/:id', auth, role(['admin']), menuTypeController.updateMenuType);
// Xóa loại menu (admin)
router.delete('/:id', auth, role(['admin']), menuTypeController.deleteMenuType);

module.exports = router;
