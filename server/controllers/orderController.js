// Controller quản lý đơn hàng
const Order = require('../models/order');

// Lấy danh sách đơn hàng, lọc theo nhà hàng nếu là nhân viên/manager
exports.getAll = async (req, res) => {
  try {
    let query = {};
    if (req.user && req.user.role !== 'admin' && req.user.restaurant) {
      query.restaurant = req.user.restaurant;
    }
  const orders = await Order.find(query);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Tạo mới đơn hàng
const Table = require('../models/table');
exports.create = async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    // Nếu trạng thái là pending thì chuyển trạng thái bàn sang 'occupied'
    if (order.status === 'pending') {
      await Table.findByIdAndUpdate(order.table, { status: 'occupied' });
    }
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }
};

// Lấy thông tin đơn hàng theo id
exports.getById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Cập nhật đơn hàng
exports.update = async (req, res) => {
  try {
    const oldOrder = await Order.findById(req.params.id);
    if (!oldOrder) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // Nếu chuyển sang completed hoặc cancelled thì chuyển trạng thái bàn về 'available'
    if (order.status === 'completed' || order.status === 'cancelled') {
      await Table.findByIdAndUpdate(order.table, { status: 'available' });
    }
    // Nếu chuyển sang pending thì chuyển trạng thái bàn sang 'occupied'
    if (order.status === 'pending') {
      await Table.findByIdAndUpdate(order.table, { status: 'occupied' });
    }
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }
};

// API tạm lưu hóa đơn (giữ trạng thái pending, chuyển bàn sang occupied)
exports.savePending = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: 'pending' }, { new: true });
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    await Table.findByIdAndUpdate(order.table, { status: 'occupied' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }
};

// API hủy hóa đơn (chuyển trạng thái cancelled, bàn về available, không xóa hóa đơn)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    await Table.findByIdAndUpdate(order.table, { status: 'available' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }
};

// API thanh toán hóa đơn (chuyển trạng thái completed, bàn về available)
exports.payOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: 'completed' }, { new: true });
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    await Table.findByIdAndUpdate(order.table, { status: 'available' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
  }
};

// Xóa đơn hàng
exports.delete = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    res.json({ message: 'Đã xóa đơn hàng' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};
