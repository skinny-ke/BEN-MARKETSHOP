const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUserRole,
  deactivateUser,
  getUserStats
} = require('../Controllers/userController');
const { clerkAuth, requireAdmin } = require('../middleware/clerkAuth');

// Get all users (admin only)
router.get('/', clerkAuth, requireAdmin, getAllUsers);

// Get user statistics (admin only)
router.get('/stats', clerkAuth, requireAdmin, getUserStats);

// Update user role (admin only)
router.put('/:userId/role', clerkAuth, requireAdmin, updateUserRole);

// Deactivate user (admin only)
router.delete('/:userId', clerkAuth, requireAdmin, deactivateUser);

module.exports = router;
