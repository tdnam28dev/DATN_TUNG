
const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

// Lấy danh sách thực đơn (admin, staff)
router.get('/', auth, role(['admin', 'staff']), menuController.getAll);
// Tạo mới thực đơn (admin)
router.post('/', auth, role(['admin']), menuController.create);
// Lấy thông tin thực đơn theo id (admin, staff)
router.get('/:id', auth, role(['admin', 'staff']), menuController.getById);
// Cập nhật thực đơn (admin)
router.put('/:id', auth, role(['admin']), menuController.update);
// Xóa thực đơn (admin)
router.delete('/:id', auth, role(['admin']), menuController.delete);

module.exports = router;
