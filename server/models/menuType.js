// Mô hình loại menu (MenuType)
// Sử dụng Mongoose để định nghĩa schema cho loại menu

const mongoose = require('mongoose');

// Định nghĩa schema cho loại menu
const menuTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // Tên loại menu, ví dụ: "Món chính", "Đồ uống", ...
  },
  description: {
    type: String,
    default: '',
    // Mô tả chi tiết về loại menu
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // Thời gian tạo
  }
});

// Xuất model
module.exports = mongoose.model('MenuType', menuTypeSchema);
