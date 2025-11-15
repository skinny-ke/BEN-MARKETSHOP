const { createClerkClient, verifyToken } = require('@clerk/backend');
const { requireAuth } = require('@clerk/express');
const User = require('../Models/User');
require('dotenv').config();

// ✅ Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// ✅ Verify a Clerk-issued JWT using Clerk's backend SDK
const verifyClerkToken = async (token) => {
  if (!token) throw new Error('Missing token');
  if (!token.includes('.')) throw new Error('Malformed JWT'); // prevent Clerk crash

  try {
    const { payload } = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    return payload;
  } catch (error) {
    // If Clerk verification fails, return null instead of throwing
    console.warn('⚠️ Clerk token verification failed:', error.message);
    return null;
  }
};

/**
 * Clerk-only authentication middleware using requireAuth from @clerk/express.
 * This replaces the combined JWT + Clerk middleware.
 */
const clerkAuth = requireAuth({
  secretKey: process.env.CLERK_SECRET_KEY,
  onError: (err, req, res) => {
    console.error('❌ Clerk auth error:', err.message);
    return res
      .status(401)
      .json({ success: false, message: 'Authentication failed' });
  },
  onSuccess: async (req, res, next) => {
    try {
      // If we get here, Clerk auth passed
      const clerkId = req.auth.userId;
      const orgId = req.auth.orgId || null;

      // Find or create the user in our database
      let user = await User.findOne({ clerkId });
      if (!user) {
        try {
          const clerkUser = await clerkClient.users.getUser(clerkId);
          user = await User.create({
            clerkId,
            name:
              `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
              clerkUser.username ||
              'User',
            email:
              clerkUser.emailAddresses?.[0]?.emailAddress ||
              `user-${clerkId}@unknown.com`,
            role: 'user',
            orgId,
            image: clerkUser.imageUrl || '',
            isActive: true,
          });
          console.log(`✅ Created new Clerk user in MongoDB: ${user.email}`);
        } catch (clerkApiError) {
          console.warn('⚠️ Could not fetch Clerk user details:', clerkApiError.message);
          // Create user with minimal info
          user = await User.create({
            clerkId,
            name: 'User',
            email: `user-${clerkId}@unknown.com`,
            role: 'user',
            orgId,
            image: '',
            isActive: true,
          });
        }
      } else {
        user.lastLogin = new Date();
        if (orgId) user.orgId = orgId;
        await user.save();
      }

      // 👑 Admin auto-elevation
      const adminList = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      if (
        user.email &&
        adminList.includes(user.email.toLowerCase()) &&
        user.role !== 'admin'
      ) {
        user.role = 'admin';
        await user.save();
        console.log(`👑 Elevated ${user.email} to admin`);
      }

      req.user = {
        id: user._id.toString(),
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        role: user.role,
        orgId: user.orgId,
        image: user.image,
      };

      return next();
    } catch (err) {
      console.error('❌ Clerk auth error:', err.message);
      return res
        .status(401)
        .json({ success: false, message: 'Authentication failed' });
    }
  }
});

const requireAdmin = (req, res, next) => {
  if (!req.auth || !req.auth.userId)
    return res
      .status(401)
      .json({ success: false, message: 'Authentication required' });

  if (!req.user || req.user.role !== 'admin')
    return res
      .status(403)
      .json({ success: false, message: 'Admin privileges required' });

  next();
};

const checkAuth = (req, res, next) => {
  if (!req.auth || !req.auth.userId)
    return res
      .status(401)
      .json({ success: false, message: 'Authentication required' });
  next();
};

module.exports = { clerkAuth, requireAdmin, checkAuth, verifyClerkToken };
