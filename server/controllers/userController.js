// Controller quản lý người dùng
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Lấy danh sách người dùng
exports.getAll = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Tạo mới người dùng, mã hóa mật khẩu
exports.create = async (req, res) => {
  try {
    const { username, password, role, name, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role, name, phone });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }
};
// Đăng nhập, trả về access token
exports.login = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Sai mật khẩu' });
    if (role === 'admin' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Bạn không có quyền admin' });
    }
    const token = jwt.sign({
      id: user._id,
      username: user.username,
      role: user.role,
      restaurant: user.restaurant // thêm trường restaurant vào token
    }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, id: user._id });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy thông tin người dùng theo id
exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Cập nhật người dùng
exports.update = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }
};

// Xóa người dùng
exports.delete = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    res.json({ message: 'Đã xóa người dùng' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};
