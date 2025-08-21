
const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

// Lấy danh sách nhà hàng (admin, staff)
router.get('/', auth, role(['admin', 'staff']), restaurantController.getAll);
// Tạo mới nhà hàng (admin)
router.post('/', auth, role(['admin']), restaurantController.create);
// Lấy thông tin nhà hàng theo id (admin, staff)
router.get('/:id', auth, role(['admin', 'staff']), restaurantController.getById);
// Cập nhật nhà hàng (admin)
router.put('/:id', auth, role(['admin']), restaurantController.update);
// Xóa nhà hàng (admin)
router.delete('/:id', auth, role(['admin']), restaurantController.delete);

module.exports = router;
