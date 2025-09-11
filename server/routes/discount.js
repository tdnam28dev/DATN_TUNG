// API giảm giá cho hệ thống nhà hàng
// Tuân thủ mô hình MVC, comment tiếng Việt
const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');

// Lấy tất cả giảm giá
router.get('/', discountController.getAllDiscounts);

// Tạo mới giảm giá
router.post('/', discountController.createDiscount);

// Cập nhật giảm giá
router.put('/:id', discountController.updateDiscount);

// Xóa giảm giá
router.delete('/:id', discountController.deleteDiscount);

// Lấy giảm giá theo mã
router.get('/code/:code', discountController.getDiscountByCode);

module.exports = router;
