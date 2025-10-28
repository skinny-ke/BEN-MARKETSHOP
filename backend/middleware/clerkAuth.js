const { createClerkClient } = require('@clerk/backend');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
require('dotenv').config();

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
});

// ✅ Reusable Clerk JWT verification using Clerk SDK (uses JWKS under the hood)
// Returns decoded token on success; throws on failure
const verifyClerkToken = async (token) => {
  if (!token) {
    throw new Error('Missing token');
  }
  const decoded = await clerkClient.verifyToken(token);
  return decoded;
};

// 🔐 Clerk + Local Auth Middleware
const clerkAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization') || '';
    const tokenHeader = req.header('Clerk-Auth-Token') || '';
    const token = (authHeader.replace('Bearer ', '').trim()) || tokenHeader.trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    let user;

    // ✅ 1. Try Clerk verification first
    try {
      const decoded = await verifyClerkToken(token);
      const clerkId = decoded.sub;
      const orgId = decoded.org_id || null;

      user = await User.findOne({ clerkId });

      if (!user) {
        const clerkUser = await clerkClient.users.getUser(clerkId);

        user = await User.create({
          clerkId,
          name: clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.username || 'User',
          email:
            clerkUser.emailAddresses[0]?.emailAddress ||
            `user-${clerkId}@unknown.com`,
          role: 'user',
          orgId: orgId,
          profileImage: clerkUser.imageUrl || '',
          isActive: true
        });

        console.log(`✅ Created new Clerk user: ${user.name}`);
      } else {
        user.lastLogin = new Date();
        if (orgId) user.orgId = orgId;
        await user.save();
      }

      // 🔓 Bootstrap admin: elevate role if email matches ADMIN_EMAILS
      try {
        const adminList = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
        if (user.email && adminList.includes(user.email.toLowerCase()) && user.role !== 'admin') {
          user.role = 'admin';
          await user.save();
          console.log(`👑 Elevated ${user.email} to admin via ADMIN_EMAILS`);
        }
      } catch (_) {}
    } catch (clerkError) {
      console.log('⚠️ Clerk verification failed, trying JWT fallback...', clerkError.message);
      // ✅ 2. Fallback to Local JWT (for manual admin users)
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultSecret');
        user = await User.findById(decoded.id);

        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Invalid local user token'
          });
        }
      } catch (jwtError) {
        console.error('Auth verification failed:', jwtError.message);
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      clerkId: user.clerkId || null,
      email: user.email,
      name: user.name,
      role: user.role,
      orgId: user.orgId || null,
      profileImage: user.profileImage
    };

    next();
  } catch (err) {
    console.error('Clerk/local auth error:', err);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// ✅ Admin check
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin privileges required' });
  }

  next();
};

// ✅ Generic auth check
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  next();
};

module.exports = { clerkAuth, requireAdmin, requireAuth, verifyClerkToken };
