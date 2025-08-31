// Controller CRUD cho PaymentMethod
const PaymentMethod = require('../models/paymentMethod');

// Lấy danh sách phương thức thanh toán
exports.getAll = async (req, res) => {
  try {
    const methods = await PaymentMethod.find();
    res.json(methods);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy chi tiết phương thức thanh toán
exports.getById = async (req, res) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);
    if (!method) return res.status(404).json({ error: 'Không tìm thấy phương thức thanh toán' });
    res.json(method);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Tạo mới phương thức thanh toán
exports.create = async (req, res) => {
  try {
    const method = new PaymentMethod(req.body);
    await method.save();
    res.status(201).json(method);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ', detail: err.message });
  }
};

// Cập nhật phương thức thanh toán
exports.update = async (req, res) => {
  try {
    const method = await PaymentMethod.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!method) return res.status(404).json({ error: 'Không tìm thấy phương thức thanh toán' });
    res.json(method);
  } catch (err) {
    res.status(400).json({ error: 'Dữ liệu không hợp lệ', detail: err.message });
  }
};

// Xóa phương thức thanh toán
exports.delete = async (req, res) => {
  try {
    const method = await PaymentMethod.findByIdAndDelete(req.params.id);
    if (!method) return res.status(404).json({ error: 'Không tìm thấy phương thức thanh toán' });
    res.json({ message: 'Đã xóa phương thức thanh toán' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};
