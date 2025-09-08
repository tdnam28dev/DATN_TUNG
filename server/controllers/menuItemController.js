const MenuItem = require('../models/menuItem');
const Menu = require('../models/menu');
const path = require('path');
const fs = require('fs');

// Multer cấu hình upload file ảnh (chỉ export để dùng ở routes)
const multer = require('multer');
const uploadDir = path.join(__dirname, '../../client/public/menuItem');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Tên file là id của món ăn, phần mở rộng giữ nguyên
      const ext = path.extname(file.originalname);
      // Nếu có id thì dùng, nếu chưa có thì dùng Date.now
      const id = req.params?.id || req.body?._id || Date.now();
      cb(null, id + ext);
    }
  })
});
module.exports.upload = upload;


// Lấy danh sách món ăn, lọc theo menu thuộc nhà hàng nếu là nhân viên/manager
exports.getAll = async (req, res) => {
  try {
    let query = {};
    const restaurantId = req.query.restaurantId;
    if (restaurantId) {
      // Lấy danh sách menu thuộc nhà hàng
      const menus = await Menu.find({ restaurant: restaurantId }, '_id');
      const menuIds = menus.map(m => m._id);
      query.menu = { $in: menuIds };
    } else if (req.user && req.user.role !== 'admin' && req.user.restaurant) {
      // Nếu là nhân viên/manager thì chỉ lấy món ăn thuộc menu của nhà hàng đó
      const menus = await Menu.find({ restaurant: req.user.restaurant }, '_id');
      const menuIds = menus.map(m => m._id);
      query.menu = { $in: menuIds };
    }
    const items = await MenuItem.find(query);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};


// Tạo mới món ăn (hỗ trợ upload ảnh)
exports.create = async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    await item.save();
    // Nếu có file ảnh thì lưu đường dẫn
    if (req.file) {
      item.imagePath = `/menuItem/${req.file.filename}`;
      await item.save();
    }
    // Cập nhật trường items của menu tương ứng
    if (item.menu) {
      const Menu = require('../models/menu');
      await Menu.findByIdAndUpdate(item.menu, { $addToSet: { items: item._id } });
    }
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
    console.error(err);
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


// Cập nhật món ăn (hỗ trợ upload ảnh mới)
exports.update = async (req, res) => {
  try {
    // Lấy thông tin món ăn cũ
    const oldItem = await MenuItem.findById(req.params.id);
    if (!oldItem) return res.status(404).json({ error: 'Không tìm thấy món ăn' });
    const oldMenuId = oldItem.menu ? oldItem.menu.toString() : null;
    let newMenuId = req.body.menu || req.body['menu'];
    let updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;
    if (req.file) {
      updateData.imagePath = `/menuItem/${req.file.filename}`;
    }
    const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, updateData, { new: true });
    const MenuModel = require('../models/menu');
    if (updatedItem) {
      if (oldMenuId && oldMenuId !== newMenuId) {
        await MenuModel.findByIdAndUpdate(oldMenuId, { $pull: { items: updatedItem._id } });
      }
      if (newMenuId && oldMenuId !== newMenuId) {
        await MenuModel.findByIdAndUpdate(newMenuId, { $addToSet: { items: updatedItem._id } });
      }
    }
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
    console.error(err);
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
