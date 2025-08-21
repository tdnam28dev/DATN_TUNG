// models/warehouse.js
// Model lưu kho hàng/nguyên liệu cho nhà hàng
const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  code: {
    type: String,
    trim: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: ['food', 'drink', 'spice', 'other'],
    default: 'food',
    required: true
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  price: {
    type: Number,
    default: 0
  },
  supplier: {
    type: String,
    trim: true
  },
  note: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
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
warehouseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
warehouseSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Warehouse', warehouseSchema);
