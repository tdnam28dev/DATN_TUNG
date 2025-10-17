
const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

// Lấy danh sách nhà hàng (admin, staff)
router.get('/', auth, role({ roles: ['admin', 'manager', 'staff'], actions: ['read'] }), restaurantController.getAll);
// Tạo mới nhà hàng (admin)
router.post('/', auth, role({ roles: ['admin'] }), restaurantController.create);
// Lấy thông tin nhà hàng theo id (admin, staff)
router.get('/:id', auth, role({ roles: ['admin', 'manager', 'staff'], actions: ['read'] }), restaurantController.getById);
// Cập nhật nhà hàng (admin, manager)
// Thêm resource: 'restaurantDoc' để middleware role kiểm tra quyền trên tài nguyên nhà hàng
router.put('/:id', auth, (req, res, next) => {
	// Lấy thông tin nhà hàng theo id và gán vào req.restaurantDoc để middleware role kiểm tra
	const Restaurant = require('../models/restaurant');
	Restaurant.findById(req.params.id)
		.then(doc => {
			if (!doc) {
				return res.status(404).json({ error: 'Không tìm thấy nhà hàng' });
			}
			req.restaurantDoc = doc;
			next();
		})
		.catch(err => res.status(500).json({ error: 'Lỗi truy vấn nhà hàng', detail: err.message }));
}, role({ roles: ['admin', 'manager', 'staff'], actions: ['update'], resource: 'restaurantDoc' }), restaurantController.update);
// Xóa nhà hàng (admin)
router.delete('/:id', auth, role({ roles: ['admin'], actions: ['delete'] }), restaurantController.delete);

module.exports = router;
