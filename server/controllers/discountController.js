// Controller xử lý logic giảm giá
// Tuân thủ mô hình MVC, comment tiếng Việt
const Discount = require('../models/discount');

// Lấy tất cả giảm giá
exports.getAllDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.find();
        res.json(discounts);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server!' });
    }
};

// Tạo mới giảm giá
exports.createDiscount = async (req, res) => {
    try {
        const discount = new Discount(req.body);
        await discount.save();
        res.json(discount);
    } catch (err) {
        res.status(400).json({ error: 'Không thể tạo giảm giá!', detail: err.message });
    }
};

// Cập nhật giảm giá
exports.updateDiscount = async (req, res) => {
    try {
        const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(discount);
    } catch (err) {
        res.status(400).json({ error: 'Không thể cập nhật!', detail: err.message });
    }
};

// Xóa giảm giá
exports.deleteDiscount = async (req, res) => {
    try {
        await Discount.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: 'Không thể xóa!', detail: err.message });
    }
};

// Lấy giảm giá theo mã
exports.getDiscountByCode = async (req, res) => {
    try {
        const discount = await Discount.findOne({ code: req.params.code });
        if (!discount) return res.status(404).json({ error: 'Không tìm thấy mã giảm giá!' });
        res.json(discount);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server!' });
    }
};
