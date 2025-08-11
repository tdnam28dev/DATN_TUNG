const mongoose = require('mongoose');

// Model User dùng để lưu thông tin người dùng hệ thống (admin, nhân viên)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Tên đăng nhập
  password: { type: String, required: true }, // Mật khẩu
  role: { type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' }, // Vai trò người dùng
  name: { type: String }, // Tên người dùng
  phone: { type: String }, // Số điện thoại
  // Nếu là staff hoặc manager thì cần thuộc tính restaurant, admin thì không cần
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }
});

module.exports = mongoose.model('User', UserSchema);
