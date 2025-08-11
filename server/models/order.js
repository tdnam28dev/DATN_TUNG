const mongoose = require('mongoose');

// Model Order dùng để lưu thông tin đơn đặt món của khách
// Một bàn tại một thời điểm chỉ có một hóa đơn
// Một hóa đơn có thể gọi nhiều món
const OrderSchema = new mongoose.Schema({
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true }, // Mỗi bàn chỉ có 1 hóa đơn đang hoạt động
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true }, // Món ăn được gọi
    quantity: { type: Number, required: true } // Số lượng món
  }],
  total: { type: Number, required: true }, // Tổng tiền hóa đơn
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }, // Trạng thái hóa đơn
  createdAt: { type: Date, default: Date.now }, // Ngày tạo hóa đơn
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true } // Nhà hàng của hóa đơn
});

module.exports = mongoose.model('Order', OrderSchema);
