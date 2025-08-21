// controllers/warehouseController.js
// CRUD cho kho hàng/nguyên liệu
const Warehouse = require('../models/warehouse');

// Lấy danh sách nguyên liệu
exports.getAll = async (req, res) => {
  try {
    const { isActive, type, search, restaurant } = req.query;
    let filter = {};
    if (isActive === 'true') filter.isActive = true;
    if (isActive === 'false') filter.isActive = false;
    if (type) filter.type = type;
    if (restaurant) filter.restaurant = restaurant;
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { code: regex },
        { supplier: regex }
      ];
    }
    const items = await Warehouse.find(filter);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
};

// Lấy chi tiết nguyên liệu
exports.getById = async (req, res) => {
  try {
    const item = await Warehouse.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Không tìm thấy nguyên liệu!' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
};

// Thêm nguyên liệu mới
exports.create = async (req, res) => {
  try {
    const item = new Warehouse(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Cập nhật nguyên liệu
exports.update = async (req, res) => {
  try {
    const item = await Warehouse.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ error: 'Không tìm thấy nguyên liệu!' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa mềm nguyên liệu
exports.delete = async (req, res) => {
  try {
    const item = await Warehouse.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) return res.status(404).json({ error: 'Không tìm thấy nguyên liệu!' });
    res.json({ message: 'Đã xóa (ẩn) nguyên liệu', item });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
};

// Khôi phục nguyên liệu
exports.restore = async (req, res) => {
  try {
    const item = await Warehouse.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!item) return res.status(404).json({ error: 'Không tìm thấy nguyên liệu!' });
    res.json({ message: 'Đã khôi phục nguyên liệu', item });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
};
