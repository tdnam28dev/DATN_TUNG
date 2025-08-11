// Controller cho loại menu (MenuType)
const MenuType = require('../models/menuType');

// Lấy tất cả loại menu
exports.getAllMenuTypes = async (req, res) => {
  try {
    const types = await MenuType.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
};

// Thêm loại menu mới
exports.createMenuType = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Tên loại menu là bắt buộc!' });
    const existed = await MenuType.findOne({ name });
    if (existed) return res.status(400).json({ error: 'Tên loại menu đã tồn tại!' });
    const type = await MenuType.create({ name, description });
    res.json(type);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
};

// Cập nhật loại menu
exports.updateMenuType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const type = await MenuType.findByIdAndUpdate(id, { name, description }, { new: true });
    if (!type) return res.status(404).json({ error: 'Không tìm thấy loại menu!' });
    res.json(type);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
};

// Xóa loại menu
exports.deleteMenuType = async (req, res) => {
  try {
    const { id } = req.params;
    const type = await MenuType.findByIdAndDelete(id);
    if (!type) return res.status(404).json({ error: 'Không tìm thấy loại menu!' });
    res.json(type);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
};
