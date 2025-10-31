const { createClerkClient } = require('@clerk/backend');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
require('dotenv').config();

// ✅ Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * Verify a Clerk-issued JWT using Clerk's backend SDK.
 */
const verifyClerkToken = async (token) => {
  if (!token) throw new Error('Missing token');
  return await clerkClient.verifyToken(token);
};

/**
 * Combined Clerk + Local JWT authentication middleware.
 * - Verifies Clerk token first.
 * - Falls back to local JWT (for manual admin access or testing).
 * - Attaches user data from MongoDB to `req.user`.
 */
const clerkAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization') || '';
    const altHeader = req.header('Clerk-Auth-Token') || '';
    const token = authHeader.replace('Bearer ', '').trim() || altHeader.trim();

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    let user;

    // -------------------------------
    // 1️⃣  Try verifying via Clerk
    // -------------------------------
    try {
      const decoded = await verifyClerkToken(token);
      const clerkId = decoded.sub;
      const orgId = decoded.org_id || null;

      user = await User.findOne({ clerkId });

      // If not found in MongoDB, fetch Clerk data and create user
      if (!user) {
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
      } else {
        // Update last login + org if changed
        user.lastLogin = new Date();
        if (orgId) user.orgId = orgId;
        await user.save();
      }

      // -------------------------------
      // 👑 Auto-elevate to Admin (Bootstrap)
      // -------------------------------
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
        console.log(`👑 Elevated ${user.email} to admin (via ADMIN_EMAILS)`);
      }

      // ✅ Attach Clerk user
      req.user = {
        id: user._id.toString(),
        clerkId: user.clerkId || null,
        email: user.email,
        name: user.name,
        role: user.role,
        orgId: user.orgId || null,
        image: user.image,
      };

      return next();

      // -------------------------------
      // 2️⃣  Fallback: Local JWT (manual admins)
      // -------------------------------
    } catch (clerkError) {
      console.warn('⚠️ Clerk verification failed:', clerkError.message);

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'defaultSecret'
        );
        user = await User.findById(decoded.id);

        if (!user) {
          return res
            .status(401)
            .json({ success: false, message: 'Invalid local user token' });
        }

        req.user = {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };

        console.log(`🔐 Local JWT auth success: ${user.email}`);
        return next();
      } catch (jwtError) {
        console.error('❌ Auth verification failed:', jwtError.message);
        return res
          .status(401)
          .json({ success: false, message: 'Invalid or expired token' });
      }
    }
  } catch (err) {
    console.error('❌ Clerk/local auth error:', err.message);
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

/**
 * Restricts access to admin users.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ success: false, message: 'Admin privileges required' });
  }

  next();
};

/**
 * Restricts access to any authenticated user.
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: 'Authentication required' });
  }
  next();
};

module.exports = { clerkAuth, requireAdmin, requireAuth, verifyClerkToken };
