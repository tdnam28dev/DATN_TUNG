// Controller quản lý bàn
const Table = require('../models/table');

// Lấy danh sách bàn, lọc theo nhà hàng nếu là nhân viên/manager
exports.getAll = async (req, res) => {
  try {
    let query = {};
    if (req.user && req.user.role !== 'admin' && req.user.restaurant) {
      query.restaurant = req.user.restaurant;
    }
  const tables = await Table.find(query);
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Tạo mới bàn
exports.create = async (req, res) => {
  try {
    const table = new Table(req.body);
    await table.save();
    res.status(201).json(table);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }
};

// Lấy thông tin bàn theo id
exports.getById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ error: 'Không tìm thấy bàn' });
    res.json(table);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Cập nhật bàn
exports.update = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!table) return res.status(404).json({ error: 'Không tìm thấy bàn' });
    res.json(table);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }
};

// Xóa bàn
exports.delete = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ error: 'Không tìm thấy bàn' });
    res.json({ message: 'Đã xóa bàn' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};
