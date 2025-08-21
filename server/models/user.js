
const mongoose = require('mongoose');

// Model User hỗ trợ multi-role, actions, phân quyền động
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // roles: mảng role, role: role chính (tương thích cũ)
  roles: [{ type: String, enum: ['admin', 'manager', 'staff'] }],
  role: { type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' },
  actions: [{ type: String }], // các quyền động (nếu cần)
  name: { type: String },
  phone: { type: String, index: true },
  isActive: { type: Boolean, default: true, index: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Tự động cập nhật updatedAt khi save
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
UserSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('User', UserSchema);
