
const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

// Lấy danh sách bàn (admin, staff)
router.get('/', auth, role(['admin', 'staff']), tableController.getAll);
// Tạo mới bàn (admin)
router.post('/', auth, role(['admin']), tableController.create);
// Lấy thông tin bàn theo id (admin, staff)
router.get('/:id', auth, role(['admin', 'staff']), tableController.getById);
// Cập nhật bàn (admin)
router.put('/:id', auth, role(['admin']), tableController.update);
// Xóa bàn (admin)
router.delete('/:id', auth, role(['admin']), tableController.delete);

module.exports = router;
