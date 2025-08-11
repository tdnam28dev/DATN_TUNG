const mongoose = require('mongoose');

// Model MenuItem dùng để lưu thông tin từng món ăn trong thực đơn
const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên món ăn
  price: { type: Number, required: true }, // Giá món ăn
  description: { type: String }, // Mô tả món ăn
  image: { type: String }, // Đường dẫn hoặc URL hình ảnh món ăn
  menu: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' } // Tham chiếu đến thực đơn
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
