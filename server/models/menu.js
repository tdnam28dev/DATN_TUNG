const mongoose = require('mongoose');

// Model Menu dùng để lưu thông tin thực đơn của nhà hàng
const MenuSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên thực đơn
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }], // Danh sách món ăn thuộc thực đơn
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' } // Tham chiếu đến nhà hàng
});

module.exports = mongoose.model('Menu', MenuSchema);
