// models/preOrder.js
// Model lưu thông tin đặt bàn/đặt món trước
const mongoose = require('mongoose');

const preOrderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table'
  },
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    quantity: { type: Number, min: 1, default: 1 }
  }],
  date: {
    type: Date,
    required: true // Ngày đặt bàn/đặt món
  },
  time: {
    type: String // Giờ dự kiến đến (ví dụ: "18:30")
  },
  people: {
    type: Number,
    min: 1,
    required: true // Số lượng người để chọn bàn phù hợp
  },
  type: {
    type: String,
    enum: ['eat-in', 'delivery'],
    default: 'eat-in', // Đặt tại nhà hàng hay ship tận nơi
    required: true
  },
  address: {
    type: String, // Địa chỉ giao hàng nếu là delivery
    trim: true
  },
  note: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Tự động cập nhật updatedAt khi save/update
preOrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
preOrderSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('PreOrder', preOrderSchema);
