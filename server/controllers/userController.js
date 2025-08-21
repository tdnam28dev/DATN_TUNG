// Controller quản lý người dùng
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Lấy danh sách người dùng, có thể lọc theo trạng thái hoạt động
exports.getAll = async (req, res) => {
  try {
    const { isActive } = req.query;
    let filter = {};
    if (isActive === 'true') filter.isActive = true;
    if (isActive === 'false') filter.isActive = false;
    const users = await User.find(filter);
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
// Đăng nhập, trả về access token, hỗ trợ multi-role, kiểm tra trạng thái hoạt động
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    if (!user.isActive) return res.status(403).json({ error: 'Tài khoản đã bị khóa hoặc vô hiệu hóa' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Sai mật khẩu' });

    // Trả về roles, actions, restaurant, name, ...
    const token = jwt.sign({
      id: user._id,
      username: user.username,
      role: user.role,
      roles: user.roles,
      actions: user.actions,
      restaurant: user.restaurant,
      name: user.name
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      id: user._id,
      username: user.username,
      role: user.role,
      roles: user.roles,
      actions: user.actions,
      restaurant: user.restaurant,
      name: user.name
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy thông tin người dùng theo id, gán vào req.userDoc để middleware kiểm tra resource
exports.getById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    req.userDoc = user; // Gán cho middleware phân quyền resource
    if (typeof next === 'function') return next();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Cập nhật người dùng, gán req.userDoc cho middleware resource
exports.update = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    req.userDoc = user;
    if (typeof next === 'function') return next();
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await require('bcryptjs').hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }
    const updated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }
};

// Xóa mềm người dùng (chỉ set isActive = false)
exports.delete = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    res.json({ message: 'Đã xóa (ẩn) người dùng', user });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Khôi phục người dùng (set isActive = true)
exports.restore = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    res.json({ message: 'Đã khôi phục người dùng', user });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};
