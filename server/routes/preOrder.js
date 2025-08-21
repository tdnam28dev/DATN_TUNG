// routes/preOrder.js
// Định tuyến CRUD cho đặt bàn/đặt món trước

const express = require('express');
const router = express.Router();
const preOrderController = require('../controllers/preOrderController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

// Lấy danh sách đặt bàn/đặt món (admin, staff)
router.get('/', auth, role(['admin', 'staff']), preOrderController.getAll);
// Lấy chi tiết đặt bàn/đặt món (admin, staff)
router.get('/:id', auth, role(['admin', 'staff']), preOrderController.getById);
// Thêm mới đặt bàn/đặt món (admin, staff)
router.post('/', auth, role(['admin', 'staff']), preOrderController.create);
// Cập nhật đặt bàn/đặt món (admin, staff)
router.put('/:id', auth, role(['admin', 'staff']), preOrderController.update);
// Xóa đặt bàn/đặt món (admin)
router.delete('/:id', auth, role(['admin']), preOrderController.delete);

module.exports = router;
