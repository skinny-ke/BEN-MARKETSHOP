const express = require('express');
const router = express.Router();
const { clerkAuth, requireAdmin } = require('../middleware/clerkAuth');
const {
  getLoyaltyProgram,
  getUserLoyalty,
  redeemPoints,
  getLoyaltyStats,
  manageLoyaltyProgram,
  generateReferralCode
} = require('../Controllers/loyaltyController');

// ✅ Get loyalty program details (public)
router.get('/program', getLoyaltyProgram);

// ✅ Get user's loyalty status (authenticated)
router.get('/', clerkAuth, getUserLoyalty);

// ✅ Redeem points (authenticated)
router.post('/redeem', clerkAuth, redeemPoints);

// ✅ Generate referral code (authenticated)
router.post('/referral', clerkAuth, generateReferralCode);

// ✅ Get loyalty statistics (admin only)
router.get('/admin/stats', clerkAuth, requireAdmin, getLoyaltyStats);

// ✅ Create/update loyalty program (admin only)
router.post('/admin/program', clerkAuth, requireAdmin, manageLoyaltyProgram);

module.exports = router;