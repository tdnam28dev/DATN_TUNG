// Mô hình dữ liệu giảm giá cho hệ thống nhà hàng
// Tuân thủ mô hình MVC, comment tiếng Việt
const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
	code: { type: String, required: true, unique: true }, // Mã giảm giá
	type: { type: String, enum: ['percent', 'amount'], default: 'amount' }, // Loại giảm giá: phần trăm, số tiền
	value: { type: Number, required: true }, // Giá trị giảm giá (phần trăm, số tiền)
	minOrder: { type: Number, default: 0 }, // Giá trị đơn hàng tối thiểu để áp dụng
	maxDiscount: { type: Number, default: 0 }, // Số tiền giảm tối đa
	startDate: { type: Date }, // Ngày bắt đầu áp dụng
	endDate: { type: Date }, // Ngày kết thúc áp dụng
	active: { type: Boolean, default: true }, // Trạng thái hoạt động
	description: { type: String }, // Mô tả chương trình giảm giá
	createdAt: { type: Date, default: Date.now }, // Ngày tạo
	updatedAt: { type: Date, default: Date.now } // Ngày cập nhật
});

module.exports = mongoose.model('Discount', discountSchema);
