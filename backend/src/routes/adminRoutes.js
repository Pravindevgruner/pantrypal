const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getUsers,
  updateUserStatus,
  updateUserRole,
  createDeliveryPartner,
  deleteUser,
  getAllExpiryItems,
  triggerManualExpiryScan,
  bulkRestockLowStock,
  simulateTestOrder,
  getReports,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getUsers);
router.post('/users/delivery-partner', createDeliveryPartner);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/expiry/all', getAllExpiryItems);
router.post('/expiry/scan', triggerManualExpiryScan);

router.post('/inventory/bulk-restock', bulkRestockLowStock);
router.post('/simulate-order', simulateTestOrder);

router.get('/reports', getReports);

module.exports = router;
