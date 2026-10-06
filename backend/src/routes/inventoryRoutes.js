const express = require('express');
const router = express.Router();
const { getInventoryList, getLowStockAlerts, updateInventoryStock } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('ADMIN'), getInventoryList);
router.get('/low-stock', protect, authorize('ADMIN'), getLowStockAlerts);
router.put('/:id', protect, authorize('ADMIN'), updateInventoryStock);

module.exports = router;
