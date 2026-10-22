const express = require('express');
const router = express.Router();
const { createOrder, getCustomerOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus, getOrderInvoice } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, createOrder);
router.get('/', protect, getCustomerOrders);
router.get('/admin/all', protect, authorize('ADMIN'), getAllOrders);
router.get('/delivery/assigned', protect, authorize('DELIVERY_PARTNER', 'ADMIN'), getAllOrders);
router.get('/:id', protect, getOrderById);
router.get('/:id/invoice', protect, getOrderInvoice);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/status', protect, authorize('ADMIN', 'DELIVERY_PARTNER'), updateOrderStatus);
router.patch('/:id/status', protect, authorize('ADMIN', 'DELIVERY_PARTNER'), updateOrderStatus);

module.exports = router;
