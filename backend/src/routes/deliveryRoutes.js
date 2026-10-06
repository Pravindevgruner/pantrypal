const express = require('express');
const router = express.Router();
const { getAssignedOrders, acceptOrder, rejectOrder, updateDeliveryStatus, getEarningsSummary } = require('../controllers/deliveryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/orders', protect, authorize('DELIVERY_PARTNER'), getAssignedOrders);
router.post('/orders/:id/accept', protect, authorize('DELIVERY_PARTNER'), acceptOrder);
router.post('/orders/:id/reject', protect, authorize('DELIVERY_PARTNER'), rejectOrder);
router.put('/orders/:id/status', protect, authorize('DELIVERY_PARTNER'), updateDeliveryStatus);
router.get('/earnings', protect, authorize('DELIVERY_PARTNER'), getEarningsSummary);

module.exports = router;
