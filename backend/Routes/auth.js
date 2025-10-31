// Routes/auth.js
const express = require('express');
const router = express.Router();
const { clerkAuth } = require('../middleware/clerkAuth');
const User = require('../Models/User');

/**
 * @route   GET /api/auth/me
 * @desc    Get the current authenticated user's info from Clerk + MongoDB
 * @access  Private (Authenticated)
 */
router.get('/me', clerkAuth, async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.user.id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in database' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Log out current user (frontend should also call Clerk.signOut())
 * @access  Private
 */
router.post('/logout', clerkAuth, async (req, res) => {
  try {
    // Clerk session is handled on frontend; this endpoint can be used for cleanup if needed
    res.status(200).json({ success: true, message: 'Logged out successfully (Clerk session cleared on client).' });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ success: false, message: 'Failed to log out' });
  }
});

/**
 * @route   GET /api/auth/health
 * @desc    Check server health
 * @access  Public
 */
router.get('/health', (req, res) => res.json({ ok: true, message: 'Auth service running' }));

module.exports = router;
