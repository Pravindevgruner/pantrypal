const express = require('express');
const router = express.Router();
const { getAdminDashboard, getUsers, updateUserStatus, getReports } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/dashboard', protect, authorize('ADMIN'), getAdminDashboard);
router.get('/users', protect, authorize('ADMIN'), getUsers);
router.put('/users/:id/status', protect, authorize('ADMIN'), updateUserStatus);
router.get('/reports', protect, authorize('ADMIN'), getReports);

module.exports = router;
