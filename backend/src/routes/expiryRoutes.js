const express = require('express');
const router = express.Router();
const {
  getCustomerExpiryItems,
  getFreshItems,
  getExpiringSoonItems,
  getExpiredItems,
  markAsConsumed,
  markAsDiscarded,
  triggerExpiryCheck,
  getWastageInsights,
} = require('../controllers/expiryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCustomerExpiryItems);
router.get('/fresh', protect, getFreshItems);
router.get('/expiring-soon', protect, getExpiringSoonItems);
router.get('/expired', protect, getExpiredItems);
router.get('/insights', protect, getWastageInsights);
router.put('/:id/consume', protect, markAsConsumed);
router.put('/:id/discard', protect, markAsDiscarded);

// On-demand trigger for testing background cron job
router.post('/run-check', protect, triggerExpiryCheck);

module.exports = router;
