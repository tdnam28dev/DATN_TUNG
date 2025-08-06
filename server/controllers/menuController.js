// Controller quản lý thực đơn
const Menu = require('../models/menu');

// Lấy danh sách thực đơn
exports.getAll = async (req, res) => {
  try {
    const menus = await Menu.find();
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Tạo mới thực đơn
exports.create = async (req, res) => {
  try {
    const menu = new Menu(req.body);
    await menu.save();
    res.status(201).json(menu);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }
};

// Lấy thông tin thực đơn theo id
exports.getById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ error: 'Không tìm thấy thực đơn' });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Cập nhật thực đơn
exports.update = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!menu) return res.status(404).json({ error: 'Không tìm thấy thực đơn' });
    res.json(menu);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }
};

// Xóa thực đơn
exports.delete = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) return res.status(404).json({ error: 'Không tìm thấy thực đơn' });
    res.json({ message: 'Đã xóa thực đơn' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};
