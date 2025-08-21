// controllers/preOrderController.js
// CRUD cho đặt bàn/đặt món trước
const PreOrder = require('../models/preOrder');

// Lấy danh sách đặt bàn/đặt món
exports.getAll = async (req, res) => {
  try {
    const { status, restaurant, customer, type, date } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (restaurant) filter.restaurant = restaurant;
    if (customer) filter.customer = customer;
    if (type) filter.type = type;
    if (date) filter.date = date;
    const preOrders = await PreOrder.find(filter)
      .populate('customer')
      .populate('restaurant')
      .populate('table')
      .populate('items.menuItem');
    res.json(preOrders);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
};

// Lấy chi tiết đặt bàn/đặt món
exports.getById = async (req, res) => {
  try {
    const preOrder = await PreOrder.findById(req.params.id)
      .populate('customer')
      .populate('restaurant')
      .populate('table')
      .populate('items.menuItem');
    if (!preOrder) return res.status(404).json({ error: 'Không tìm thấy phiếu đặt!' });
    res.json(preOrder);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
};

// Thêm mới đặt bàn/đặt món
exports.create = async (req, res) => {
  try {
    const preOrder = new PreOrder(req.body);
    await preOrder.save();
    res.status(201).json(preOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Cập nhật đặt bàn/đặt món
exports.update = async (req, res) => {
  try {
    const preOrder = await PreOrder.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!preOrder) return res.status(404).json({ error: 'Không tìm thấy phiếu đặt!' });
    res.json(preOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa đặt bàn/đặt món
exports.delete = async (req, res) => {
  try {
    const preOrder = await PreOrder.findByIdAndDelete(req.params.id);
    if (!preOrder) return res.status(404).json({ error: 'Không tìm thấy phiếu đặt!' });
    res.json({ message: 'Đã xóa phiếu đặt!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
};
