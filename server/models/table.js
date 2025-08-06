const mongoose = require('mongoose');

// Model Table dùng để lưu thông tin bàn trong nhà hàng
const TableSchema = new mongoose.Schema({
  number: { type: Number, required: true }, // Số hiệu bàn
  seats: { type: Number, required: true }, // Số ghế của bàn
  status: { type: String, enum: ['available', 'reserved', 'occupied'], default: 'available' }, // Trạng thái bàn
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' } // Tham chiếu đến nhà hàng
});

module.exports = mongoose.model('Table', TableSchema);
