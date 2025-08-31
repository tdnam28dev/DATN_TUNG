// Định tuyến CRUD cho PaymentMethod
const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

// Lấy danh sách phương thức thanh toán (admin, staff)
router.get('/', auth, role(['admin', 'staff']), paymentMethodController.getAll);
// Lấy chi tiết phương thức thanh toán
router.get('/:id', auth, role(['admin', 'staff']), paymentMethodController.getById);
// Tạo mới phương thức thanh toán (admin)
router.post('/', auth, role(['admin']), paymentMethodController.create);
// Cập nhật phương thức thanh toán (admin)
router.put('/:id', auth, role(['admin']), paymentMethodController.update);
// Xóa phương thức thanh toán (admin)
router.delete('/:id', auth, role(['admin']), paymentMethodController.delete);

module.exports = router;
