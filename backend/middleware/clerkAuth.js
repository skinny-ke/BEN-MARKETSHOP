const { createClerkClient } = require('@clerk/backend');
const { requireAuth: clerkRequireAuth } = require('@clerk/express');
const User = require('../Models/User');
require('dotenv').config();

// ✅ Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// ✅ Middleware: Clerk auth
const clerkAuth = async (req, res, next) => {
  try {
    // Use Clerk's Express requireAuth
    await clerkRequireAuth({
      secretKey: process.env.CLERK_SECRET_KEY,
    })(req, res, async () => {
      const clerkId = req.auth.userId;
      const orgId = req.auth.orgId || null;

      if (!clerkId) {
        return res.status(401).json({ success: false, message: 'Not signed in' });
      }

      // Find or create user in MongoDB
      let user = await User.findOne({ clerkId });
      if (!user) {
        try {
          const clerkUser = await clerkClient.users.getUser(clerkId);
          user = await User.create({
            clerkId,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User',
            email: clerkUser.emailAddresses?.[0]?.emailAddress || `user-${clerkId}@unknown.com`,
            role: 'user',
            orgId,
            image: clerkUser.imageUrl || '',
            isActive: true,
          });
          console.log(`✅ Created new Clerk user in MongoDB: ${user.email}`);
        } catch (clerkApiError) {
          console.warn('⚠️ Could not fetch Clerk user details:', clerkApiError.message);
          // fallback minimal user
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
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);

      if (user.email && adminList.includes(user.email.toLowerCase()) && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
        console.log(`👑 Elevated ${user.email} to admin`);
      }

      // Attach user to request
      req.user = {
        id: user._id.toString(),
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        role: user.role,
        orgId: user.orgId,
        image: user.image,
      };

      next();
    });
  } catch (err) {
    console.error('❌ Clerk auth error:', err.message);
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

// ✅ Middleware: require admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin privileges required' });
  }
  next();
};

// ✅ Middleware: require auth (any user)
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  next();
};

module.exports = { clerkAuth, requireAdmin, requireAuth };
