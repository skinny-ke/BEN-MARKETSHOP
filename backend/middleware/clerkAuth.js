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

<<<<<<< HEAD
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
=======
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
>>>>>>> c1393abc190a111e5e7d412a53d0cf21466b43ae
        user.role = 'admin';
        await user.save();
        console.log(`👑 Elevated ${user.email} to admin`);
      }

<<<<<<< HEAD
=======
      // Attach user to request
>>>>>>> c1393abc190a111e5e7d412a53d0cf21466b43ae
      req.user = {
        id: user._id.toString(),
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        role: user.role,
        orgId: user.orgId,
        image: user.image,
      };

<<<<<<< HEAD
      return next();
    } catch (err) {
      console.error('❌ Clerk auth error:', err.message);
      return res
        .status(401)
        .json({ success: false, message: 'Authentication failed' });
    }
=======
      next();
    });
  } catch (err) {
    console.error('❌ Clerk auth error:', err.message);
    return res.status(401).json({ success: false, message: 'Authentication failed' });
>>>>>>> c1393abc190a111e5e7d412a53d0cf21466b43ae
  }
});

// ✅ Middleware: require admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin privileges required' });
  }
  next();
};

<<<<<<< HEAD
const checkAuth = (req, res, next) => {
  if (!req.auth || !req.auth.userId)
    return res
      .status(401)
      .json({ success: false, message: 'Authentication required' });
  next();
};

module.exports = { clerkAuth, requireAdmin, checkAuth, verifyClerkToken };
=======
// ✅ Middleware: require auth (any user)
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  next();
};

module.exports = { clerkAuth, requireAdmin, requireAuth };
>>>>>>> c1393abc190a111e5e7d412a53d0cf21466b43ae
