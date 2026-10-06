const express = require('express');
const router = express.Router();
const { createOrder, getCustomerOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, createOrder);
router.get('/', protect, getCustomerOrders);
router.get('/admin/all', protect, authorize('ADMIN'), getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/status', protect, authorize('ADMIN'), updateOrderStatus);

module.exports = router;
