// Controller quản lý nhà hàng
const Restaurant = require('../models/restaurant');

// Lấy danh sách nhà hàng
exports.getAll = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Tạo mới nhà hàng
exports.create = async (req, res) => {
  try {
    const restaurant = new Restaurant(req.body);
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }
};

// Lấy thông tin nhà hàng theo id
exports.getById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Không tìm thấy nhà hàng' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Cập nhật nhà hàng
exports.update = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!restaurant) return res.status(404).json({ error: 'Không tìm thấy nhà hàng' });
    res.json(restaurant);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }
};

// Xóa nhà hàng
exports.delete = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Không tìm thấy nhà hàng' });
    res.json({ message: 'Đã xóa nhà hàng' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};
