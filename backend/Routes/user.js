const express = require('express');
const router = express.Router();
const { clerkAuth } = require('../middleware/clerkAuth');
const User = require('../Models/User');

// Get current user's profile
router.get('/profile', clerkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
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
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

// Update current user's profile
router.put('/profile', clerkAuth, async (req, res) => {
  try {
    const { name, profileImage } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(name && { name }),
        ...(profileImage !== undefined && { profileImage })
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get user by ID (for admins or the user themselves)
router.get('/:userId', clerkAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Only admins or the user themselves can access
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

module.exports = router;
