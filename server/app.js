require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });
const cors = require('cors');
app.use(cors());

// Tích hợp socket.io cho nhân viên
io.on('connection', (socket) => {
  // Nhân viên gửi restaurantId để join phòng
  socket.on('joinRoom', (restaurantId) => {
    socket.join(`restaurant_${restaurantId}`);
    console.log(`Nhân viên đã vào phòng: restaurant_${restaurantId}`);
    // Gửi thông báo vào phòng cho nhân viên vừa join
    socket.emit('notification', {
      type: 'success',
      message: `Đã kết nối tới nhà hàng: ${restaurantId}`,
      time: new Date(),
    });
  });
});

// Cho phép truy cập io từ controller
app.set('io', io);
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
const discountRoutes = require('./routes/discount');
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



app.use('/api/menu-items', authMiddleware, menuItemRoutes); // API quản lý món ăn

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/restaurants', authMiddleware, restaurantRoutes); // API quản lý nhà hàng
app.use('/api/tables', authMiddleware, tableRoutes); // API quản lý bàn
app.use('/api/menus', authMiddleware, menuRoutes); // API quản lý thực đơn
app.use('/api/orders', authMiddleware, orderRoutes); // API quản lý đơn hàng
app.use('/api/menutype', authMiddleware, menuTypeRoutes); // API loại menu
app.use('/api/customers', authMiddleware, customerRoutes); // API quản lý khách hàng
app.use('/api/warehouses', authMiddleware, warehouseRoutes); // API quản lý kho hàng/nguyên liệu
app.use('/api/preorders', authMiddleware, preOrderRoutes); // API quản lý đặt bàn/đặt món trước
app.use('/api/payments', authMiddleware, paymentRoutes); // API quản lý phương thức thanh toán
app.use('/api/discounts', authMiddleware, discountRoutes); // API quản lý giảm giá
app.use('/api/auth', authRoutes); // API đăng ký, đăng nhập
app.use('/api/users', authMiddleware, userRoutes); // API quản lý người dùng (cần xác thực)

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0'; // Cho phép truy cập từ các máy khác trong mạng LAN
server.listen(PORT, HOST, () => {
  console.log(`Backend server đang chạy tại http://${HOST}:${PORT}`);
});
