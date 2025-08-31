require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
//routes
const restaurantRoutes = require('./routes/restaurant');
const tableRoutes = require('./routes/table');
const menuRoutes = require('./routes/menu');
const menuItemRoutes = require('./routes/menuItem');
const orderRoutes = require('./routes/order');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const menuTypeRoutes = require('./routes/menuType');
const customerRoutes = require('./routes/customer');
const warehouseRoutes = require('./routes/warehouse');
const preOrderRoutes = require('./routes/preOrder');
const paymentRoutes = require('./routes/paymentMethod');
//auth
const authMiddleware = require('./middlewares/auth');
//init addmin
const initDefaultAdmin = require('./utils/initAdmin');

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Kết nối MongoDB thành công');
  await initDefaultAdmin();
}).catch((err) => {
  console.error('Lỗi kết nối MongoDB:', err);
});


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/api/restaurants', authMiddleware, restaurantRoutes); // API quản lý nhà hàng
app.use('/api/tables', authMiddleware, tableRoutes); // API quản lý bàn
app.use('/api/menus', authMiddleware, menuRoutes); // API quản lý thực đơn
app.use('/api/menu-items', authMiddleware, menuItemRoutes); // API quản lý món ăn
app.use('/api/orders', authMiddleware, orderRoutes); // API quản lý đơn hàng
app.use('/api/menutype', authMiddleware, menuTypeRoutes); // API loại menu
app.use('/api/customers', authMiddleware, customerRoutes); // API quản lý khách hàng
app.use('/api/warehouses', authMiddleware, warehouseRoutes); // API quản lý kho hàng/nguyên liệu
app.use('/api/preorders', authMiddleware, preOrderRoutes); // API quản lý đặt bàn/đặt món trước
app.use('/api/payments', authMiddleware, paymentRoutes); // API quản lý phương thức thanh toán
app.use('/api/auth', authRoutes); // API đăng ký, đăng nhập
app.use('/api/users', authMiddleware, userRoutes); // API quản lý người dùng (cần xác thực)

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0'; // Cho phép truy cập từ các máy khác trong mạng LAN
app.listen(PORT, HOST, () => {
  console.log(`Backend server đang chạy tại http://${HOST}:${PORT}`);
});
