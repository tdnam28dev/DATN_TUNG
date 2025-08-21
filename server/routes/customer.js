// routes/customer.js
// Định tuyến CRUD cho Customer

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

// Lấy danh sách khách hàng (admin, staff)
router.get('/', auth, role(['admin', 'staff']), customerController.getAllCustomers);
// Lấy chi tiết 1 khách hàng (admin, staff)
router.get('/:id', auth, role(['admin', 'staff']), customerController.getCustomerById);
// Thêm khách hàng mới (admin)
router.post('/', auth, role(['admin']), customerController.createCustomer);
// Cập nhật khách hàng (admin)
router.put('/:id', auth, role(['admin']), customerController.updateCustomer);
// Xóa khách hàng (admin)
router.delete('/:id', auth, role(['admin']), customerController.deleteCustomer);

module.exports = router;
