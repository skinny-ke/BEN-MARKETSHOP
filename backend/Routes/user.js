const express = require('express');
const router = express.Router();
const { clerkAuth, requireAdmin } = require('../middleware/clerkAuth');
const User = require('../Models/User');

/**
 * @route   GET /api/users/profile
 * @desc    Get the current authenticated user's profile
 * @access  Private (Authenticated)
 */
router.get('/profile', clerkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
        profileImage: user.profileImage,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update current authenticated user's profile
 * @access  Private (Authenticated)
 */
router.put('/profile', clerkAuth, async (req, res) => {
  try {
    const { name, profileImage } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(name && { name }),
        ...(profileImage && { profileImage }),
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

/**
 * @route   GET /api/users/:userId
 * @desc    Get a user by ID (admin or self)
 * @access  Private (Self or Admin)
 */
router.get('/:userId', clerkAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Only admins or the user themselves can access this route
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('❌ Error fetching user by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get('/', clerkAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('❌ Error fetching all users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

module.exports = router;
