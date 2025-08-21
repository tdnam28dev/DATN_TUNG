// routes/warehouse.js
// Định tuyến CRUD cho kho hàng/nguyên liệu

const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

// Lấy danh sách nguyên liệu (admin, staff)
router.get('/', auth, role(['admin', 'staff']), warehouseController.getAll);
// Lấy chi tiết nguyên liệu (admin, staff)
router.get('/:id', auth, role(['admin', 'staff']), warehouseController.getById);
// Thêm nguyên liệu mới (admin)
router.post('/', auth, role(['admin']), warehouseController.create);
// Cập nhật nguyên liệu (admin)
router.put('/:id', auth, role(['admin']), warehouseController.update);
// Xóa mềm nguyên liệu (admin)
router.delete('/:id', auth, role(['admin']), warehouseController.delete);
// Khôi phục nguyên liệu (admin)
router.patch('/:id/restore', auth, role(['admin']), warehouseController.restore);

module.exports = router;
