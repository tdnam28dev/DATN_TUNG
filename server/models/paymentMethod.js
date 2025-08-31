// Model phương thức thanh toán
const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Tên phương thức (card, bank, momo, ...)
  description: { type: String }, // Nội dung chuyển khoản hoặc thông tin thêm
  accountNumber: { type: String }, // Số tài khoản ngân hàng
  bankName: { type: String }, // Tên ngân hàng
  bankCode: { type: String }, // Mã ngân hàng
  accountHolder: { type: String }, // Tên người thụ hưởng
  template: { type: String, default: 'compact' }, // Template hiển thị (compact, compact2, qr_only, print)
  active: { type: Boolean, default: true }, // Có đang sử dụng không
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

PaymentMethodSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
PaymentMethodSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema);
