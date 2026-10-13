const express = require('express');
const router = express.Router();
const {
  getCustomerExpiryItems,
  addExpiryItem,
  updateExpiryItem,
  deleteExpiryItem,
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
router.post('/', protect, addExpiryItem);
router.put('/:id', protect, updateExpiryItem);
router.delete('/:id', protect, deleteExpiryItem);

router.get('/fresh', protect, getFreshItems);
router.get('/expiring-soon', protect, getExpiringSoonItems);
router.get('/expired', protect, getExpiredItems);
router.get('/insights', protect, getWastageInsights);
router.get('/analytics', protect, getWastageInsights);

router.put('/:id/consume', protect, markAsConsumed);
router.patch('/:id/consume', protect, markAsConsumed);
router.patch('/:id/consumed', protect, markAsConsumed);

router.put('/:id/discard', protect, markAsDiscarded);
router.patch('/:id/discard', protect, markAsDiscarded);
router.patch('/:id/discarded', protect, markAsDiscarded);

// On-demand trigger for testing background cron job
router.post('/run-check', protect, triggerExpiryCheck);
router.post('/scan', protect, triggerExpiryCheck);

module.exports = router;
