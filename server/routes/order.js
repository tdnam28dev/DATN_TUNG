const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const roleMiddleware = require('../middlewares/role');
const authMiddleware = require('../middlewares/auth');


// Lấy danh sách đơn hàng (nhân viên và admin đều xem được)
router.get('/', authMiddleware, roleMiddleware(['admin', 'staff']), orderController.getAll);
// Tạo mới đơn hàng (chỉ nhân viên và admin)
router.post('/', authMiddleware, roleMiddleware(['admin', 'staff']), orderController.create);
// Lấy thông tin đơn hàng theo id (nhân viên và admin)
router.get('/:id', authMiddleware, roleMiddleware(['admin', 'staff']), orderController.getById);

// Cập nhật đơn hàng (admin)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), orderController.update);
// Tạm lưu hóa đơn (staff, admin)
router.patch('/:id/save-pending', authMiddleware, roleMiddleware(['admin', 'staff']), orderController.savePending);
// Hủy hóa đơn (staff, admin)
router.patch('/:id/cancel', authMiddleware, roleMiddleware(['admin', 'staff']), orderController.cancelOrder);
// Thanh toán hóa đơn (staff, admin)
router.patch('/:id/pay', authMiddleware, roleMiddleware(['admin', 'staff']), orderController.payOrder);
// Xóa đơn hàng (chỉ admin)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), orderController.delete);

module.exports = router;
