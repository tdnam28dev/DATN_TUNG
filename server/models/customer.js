// models/customer.js
// Model Customer cho MongoDB sử dụng Mongoose
// Tạo bởi AI - luôn tuân thủ mô hình MVC

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
      },
      message: props => `${props.value} không phải là email hợp lệ!`
    },
    index: true
  },
  address: {
    type: String,
    trim: true,
  },
  note: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other',
  },
  birthday: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});


// Tự động cập nhật updatedAt khi save
customerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
// Tự động cập nhật updatedAt khi update
customerSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Index cho phone và email để tìm kiếm nhanh
customerSchema.index({ phone: 1 });
customerSchema.index({ email: 1 });

module.exports = mongoose.model('Customer', customerSchema);
