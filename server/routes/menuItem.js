
const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

// Lấy danh sách món ăn (admin, staff)
router.get('/', auth, role(['admin', 'staff']), menuItemController.getAll);
// Tạo mới món ăn (admin)
router.post('/', auth, role(['admin']), menuItemController.create);
// Lấy thông tin món ăn theo id (admin, staff)
router.get('/:id', auth, role(['admin', 'staff']), menuItemController.getById);
// Cập nhật món ăn (admin)
router.put('/:id', auth, role(['admin']), menuItemController.update);
// Xóa món ăn (admin)
router.delete('/:id', auth, role(['admin']), menuItemController.delete);

module.exports = router;
