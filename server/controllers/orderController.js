// Controller quản lý đơn hàng
const Order = require('../models/order');
const PaymentMethod = require('../models/paymentMethod');
const Table = require('../models/table');


// Lấy danh sách đơn hàng, lọc theo nhà hàng nếu là nhân viên/manager
// Lấy danh sách đơn hàng, có thể lọc theo paidBy qua query (?paidBy=...)
exports.getAll = async (req, res) => {
  try {
    let query = {};
    // Lọc theo nhà hàng nếu truyền restaurant hoặc là nhân viên/manager
    if (req.query.restaurant) {
      query.restaurant = req.query.restaurant;
    } else if (req.user && req.user.role !== 'admin' && req.user.restaurant) {
      query.restaurant = req.user.restaurant;
    }
    // Lọc theo người thanh toán nếu truyền paidBy
    if (req.query.paidBy) {
      query.paidBy = req.query.paidBy;
    }
    // Lọc theo trạng thái nếu truyền status
    if (req.query.status) {
      query.status = req.query.status;
    }
    // Lọc theo thời gian nếu truyền startDate/endDate
    let timeFilter = {};
    if (req.query.startDate || req.query.endDate) {
      timeFilter.createdAt = {};
      if (req.query.startDate) {
        timeFilter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        timeFilter.createdAt.$lt = new Date(req.query.endDate);
      }
    }
    const orders = await Order.find({ ...query, ...timeFilter });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Tạo mới đơn hàng
exports.create = async (req, res) => {
  try {
    // Nếu là khách (token có isCustomer) thì không gán createdBy
    let orderData = { ...req.body };
    if (req.user && req.user._id && !req.user.isCustomer) {
      orderData.createdBy = req.user._id;
    }
    const order = new Order(orderData);
    await order.save();
    // Nếu trạng thái là pending thì chuyển trạng thái bàn sang 'occupied'
    if (order.status === 'pending') {
      await Table.findByIdAndUpdate(order.table, { status: 'occupied' });
    }
    // Nếu là khách hàng thì gửi thông báo đến nhân viên qua socket.io
    if (req.user && req.user.isCustomer) {
      const io = req.app.get('io');
      if (io) {
        io.to(`restaurant_${order.restaurant}`).emit('customer_order', {
          type: 'create',
          table: order.table,
          restaurant: order.restaurant,
          orderId: order._id,
          items: order.items,
          total: order.total,
          time: new Date(),
        });
      }
    }
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ', detail: err.message });
    console.error(err);
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
    // Nếu là khách hàng thì gửi thông báo đến nhân viên qua socket.io
    if (req.user && req.user.isCustomer) {
      // Tìm các món mới hoặc món tăng số lượng
      const oldItems = Array.isArray(oldOrder.items) ? oldOrder.items : [];
      const newItems = Array.isArray(order.items) ? order.items : [];
      // Map món cũ theo menuItem để dễ tra cứu
      const oldMap = {};
      oldItems.forEach(i => {
        oldMap[i.menuItem.toString()] = i.quantity;
      });
      // Tìm món mới hoặc tăng số lượng
      const notifyItems = [];
      newItems.forEach(i => {
        const id = i.menuItem.toString();
        if (!oldMap[id]) {
          // Món mới
          notifyItems.push({ menuItem: i.menuItem, quantity: i.quantity, type: 'new' });
        } else if (i.quantity > oldMap[id]) {
          // Món gọi thêm
          notifyItems.push({ menuItem: i.menuItem, quantity: i.quantity - oldMap[id], type: 'add' });
        }
      });
      // Nếu có món mới hoặc gọi thêm thì mới gửi thông báo
      if (notifyItems.length > 0) {
        const io = req.app.get('io');
        if (io) {
          io.to(`restaurant_${order.restaurant}`).emit('customer_order', {
            type: 'update',
            table: order.table,
            restaurant: order.restaurant,
            orderId: order._id,
            items: notifyItems,
            total: order.total,
            time: new Date(),
          });
        }
      }
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

// API thanh toán hóa đơn (chuyển trạng thái completed, bàn về available, lưu người thanh toán từ user đăng nhập)
exports.payOrder = async (req, res) => {
  try {
    // Lấy người thanh toán từ user đăng nhập
    const paidBy = req.user && req.user._id ? req.user._id : undefined;
    if (!paidBy) {
      return res.status(401).json({ error: 'Bạn chưa đăng nhập hoặc token không hợp lệ!' });
    }
  // Lấy thông tin từ body
  const { paymentMethod, customerId, paymentId, total, discount } = req.body;
    // Tìm đơn hàng
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });

  // Lưu thông tin thanh toán
  order.status = 'completed';
  order.paidBy = paidBy;
  order.paymentMethod = paymentMethod;
  if (paymentId) order.paymentId = paymentId;
  if (customerId) order.customerId = customerId;
  if (typeof total === 'number') order.total = total;
  if (discount !== undefined) order.discount = discount;
  await order.save();
  await Table.findByIdAndUpdate(order.table, { status: 'available' });
  res.json(order);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ', detail: err.message });
    console.error(err);
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
