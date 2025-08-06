const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');

// Lấy danh sách bàn
router.get('/', tableController.getAll);
// Tạo mới bàn
router.post('/', tableController.create);
// Lấy thông tin bàn theo id
router.get('/:id', tableController.getById);
// Cập nhật bàn
router.put('/:id', tableController.update);
// Xóa bàn
router.delete('/:id', tableController.delete);

module.exports = router;
