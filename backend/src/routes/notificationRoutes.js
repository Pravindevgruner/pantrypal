const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  updateFcmToken,
  triggerTestNotification,
  broadcastPromotion,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);
router.put('/fcm-token', updateFcmToken);
router.post('/test', triggerTestNotification);
router.post('/broadcast-promo', authorize('ADMIN'), broadcastPromotion);

module.exports = router;
