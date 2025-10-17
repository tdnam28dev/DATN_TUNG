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

// Cập nhật nhà hàng (tham khảo userController)
exports.update = async (req, res) => {
  try {
    // Nếu đã qua middleware kiểm tra resource, có thể dùng req.restaurantDoc
    if (req.restaurantDoc) {
      const user = req.user;
      const isManager = Array.isArray(user.roles) ? user.roles.includes('manager') : user.role === 'manager';
      if (isManager) {
        // Cho phép manager sửa tất cả các trường của nhà hàng mình quản lý
        const updateData = { ...req.body };
        const updated = await Restaurant.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updated) return res.status(404).json({ error: 'Không tìm thấy nhà hàng' });
        return res.json(updated);
      }
      // Nếu là admin thì cho sửa toàn bộ
    }
    // Trường hợp không qua kiểm tra resource (admin), cho sửa toàn bộ
    const updated = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Không tìm thấy nhà hàng' });
    res.json(updated);
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
