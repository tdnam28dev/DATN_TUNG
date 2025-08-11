// Controller quản lý món ăn
const MenuItem = require('../models/menuItem');

// Lấy danh sách món ăn, lọc theo nhà hàng nếu là nhân viên/manager
exports.getAll = async (req, res) => {
  try {
    let query = {};
    if (req.user && req.user.role !== 'admin' && req.user.restaurant) {
      query.restaurant = req.user.restaurant;
    }
  const items = await MenuItem.find(query).populate('restaurant');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Tạo mới món ăn
exports.create = async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    await item.save();
    // Cập nhật trường items của menu tương ứng
    if (item.menu) {
      const Menu = require('../models/menu');
      await Menu.findByIdAndUpdate(item.menu, { $addToSet: { items: item._id } });
    }
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }
};

// Lấy thông tin món ăn theo id
exports.getById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Không tìm thấy món ăn' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Cập nhật món ăn
exports.update = async (req, res) => {
  try {
    const Menu = require('../models/menu');
    // Lấy thông tin món ăn cũ
    const oldItem = await MenuItem.findById(req.params.id);
    if (!oldItem) return res.status(404).json({ error: 'Không tìm thấy món ăn' });
    const oldMenuId = oldItem.menu ? oldItem.menu.toString() : null;
    const newMenuId = req.body.menu;
    // Cập nhật món ăn
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // Nếu menu thay đổi thì cập nhật lại trường items của menu cũ và menu mới
    if (oldMenuId && oldMenuId !== newMenuId) {
      await Menu.findByIdAndUpdate(oldMenuId, { $pull: { items: item._id } });
    }
    if (newMenuId && oldMenuId !== newMenuId) {
      await Menu.findByIdAndUpdate(newMenuId, { $addToSet: { items: item._id } });
    }
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }
};

// Xóa món ăn
exports.delete = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Không tìm thấy món ăn' });
    // Xóa _id món ăn khỏi trường items của menu tương ứng
    if (item.menu) {
      const Menu = require('../models/menu');
      await Menu.findByIdAndUpdate(item.menu, { $pull: { items: item._id } });
    }
    res.json({ message: 'Đã xóa món ăn' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};
