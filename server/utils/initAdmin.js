// utils/initAdmin.js
// Hàm khởi tạo tài khoản admin mặc định nếu chưa có
const User = require('../models/user');
const bcrypt = require('bcryptjs');

async function initDefaultAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'Admin';

  const existed = await User.findOne({ username });
  if (existed) {
    console.log('Tài khoản admin mặc định đã tồn tại!');
    return;
  }
  console.log('Chưa có tài khoản admin mặc định, đang khởi tạo...');
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    username,
    password: hashedPassword,
    role: 'admin',
    roles: ['admin'],
    actions: ['read', 'create', 'update', 'delete', 'restore'],
    name,
    isActive: true
  });
  console.log('Đã tạo tài khoản admin mặc định thành công!');
}

module.exports = initDefaultAdmin;
