
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');


// Lấy danh sách người dùng (admin, manager)
router.get('/', auth, role({ roles: ['admin', 'manager'], actions: ['read'] }), userController.getAll);
// Tạo mới người dùng (admin)
router.post('/', auth, role({ roles: ['admin'], actions: ['create'] }), userController.create);
// Lấy thông tin người dùng theo id (admin, manager, chính chủ)
router.get('/:id', auth, userController.getById, role({ roles: ['admin', 'manager', 'staff'], actions: ['read'], resource: 'userDoc' }), (req, res) => res.json(req.userDoc));
// Cập nhật người dùng (admin, chính chủ)
router.put('/:id', auth, userController.update, role({ roles: ['admin'], actions: ['update'], resource: 'userDoc' }), async (req, res) => {
	const updated = await require('../models/user').findByIdAndUpdate(req.params.id, req.body, { new: true });
	res.json(updated);
});

// Xóa mềm người dùng (admin)
router.delete('/:id', auth, role({ roles: ['admin'], actions: ['delete'] }), userController.delete);
// Khôi phục người dùng (admin)
router.patch('/:id/restore', auth, role({ roles: ['admin'], actions: ['restore'] }), userController.restore);

module.exports = router;
