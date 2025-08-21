// controllers/customerController.js
// Controller CRUD cho Customer
const Customer = require('../models/customer');

// Lấy danh sách khách hàng
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
};

// Lấy chi tiết 1 khách hàng
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Không tìm thấy khách hàng!' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
};

// Thêm khách hàng mới
exports.createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Cập nhật khách hàng
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) return res.status(404).json({ error: 'Không tìm thấy khách hàng!' });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa khách hàng
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Không tìm thấy khách hàng!' });
    res.json({ message: 'Đã xóa khách hàng!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server!' });
  }
};
