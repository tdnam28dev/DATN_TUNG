const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const roleMiddleware = require('../middlewares/role');

// Lấy danh sách đơn hàng (nhân viên và admin đều xem được)
router.get('/', roleMiddleware(['admin', 'staff']), orderController.getAll);
// Tạo mới đơn hàng (chỉ nhân viên và admin)
router.post('/', roleMiddleware(['admin', 'staff']), orderController.create);
// Lấy thông tin đơn hàng theo id (nhân viên và admin)
router.get('/:id', roleMiddleware(['admin', 'staff']), orderController.getById);
// Cập nhật đơn hàng (chỉ admin)
router.put('/:id', roleMiddleware(['admin']), orderController.update);
// Xóa đơn hàng (chỉ admin)
router.delete('/:id', roleMiddleware(['admin']), orderController.delete);

module.exports = router;
