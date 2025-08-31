const Customer = require('../models/customer');

// Lấy danh sách khách hàng
exports.getAllCustomers = async (req, res) => {
  try {
    // Nếu có query ?phone=... hoặc ?id=... thì tìm kiếm
    const { phone, id } = req.query;
    let customers = [];
    if (phone) {
      customers = await Customer.find({ phone: phone });
    } else if (id) {
      const customer = await Customer.findById(id);
      if (customer) customers = [customer];
    } else {
      customers = await Customer.find();
    }
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
    // Kiểm tra khách hàng đã tồn tại theo số điện thoại
    const { phone } = req.body;
    let existed = null;
    if (phone) {
      existed = await Customer.findOne({ phone: phone });
    }
    if (existed) {
      // Nếu đã có thì trả về dữ liệu khách hàng cũ
      return res.status(200).json(existed);
    }
    // Nếu chưa có thì tạo mới
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
