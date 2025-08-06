const mongoose = require('mongoose');

// Model Restaurant dùng để lưu thông tin nhà hàng
const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên nhà hàng
  address: { type: String, required: true }, // Địa chỉ nhà hàng
  phone: { type: String }, // Số điện thoại liên hệ
  description: { type: String }, // Mô tả nhà hàng
  createdAt: { type: Date, default: Date.now } // Ngày tạo
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
