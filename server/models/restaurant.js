const mongoose = require('mongoose');

// Model Restaurant dùng để lưu thông tin nhà hàng
const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên nhà hàng
  address: { type: String, required: true }, // Địa chỉ nhà hàng
  phone: { type: String }, // Số điện thoại liên hệ
  description: { type: String }, // Mô tả nhà hàng
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' }, // Trạng thái hoạt động
  openTime: { type: String, default: '09:00' }, // Giờ mở cửa
  closeTime: { type: String, default: '24:00' }, // Giờ đóng cửa
  capacity: { type: Number, default: 500 }, // Sức chứa
  area: { type: Number, default: 1100 }, // Diện tích (m2)
  floors: { type: Number, default: 2 }, // Số tầng
  createdAt: { type: Date, default: Date.now } // Ngày tạo
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
