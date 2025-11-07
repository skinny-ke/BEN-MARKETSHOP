const { createClerkClient, verifyToken } = require('@clerk/backend');
const jwt = require('jsonwebtoken');
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
 * Combined Clerk + Local JWT authentication middleware.
 */
const clerkAuth = async (req, res, next) => {
  try {
    const rawAuth =
      req.header('Authorization') ||
      req.header('authorization') ||
      req.header('Clerk-Auth-Token') ||
      '';

    const token = rawAuth.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    let user;

    // -------------------------------
    // 1️⃣ Try verifying via Clerk
    // -------------------------------
    try {
      const decoded = await verifyClerkToken(token);
      if (!decoded) {
        throw new Error('Clerk token verification returned null');
      }
      const clerkId = decoded.sub;
      const orgId = decoded.org_id || null;

      // find or create the user
      user = await User.findOne({ clerkId });
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
    } catch (clerkError) {
      console.warn('⚠️ Clerk verification failed:', clerkError.message);
      // Continue to fallback JWT verification
    }

    // -------------------------------
    // 2️⃣ Fallback: Local JWT
    // -------------------------------
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
  } catch (err) {
    console.error('❌ Clerk/local auth error:', err.message);
    return res
      .status(401)
      .json({ success: false, message: 'Authentication failed' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user)
    return res
      .status(401)
      .json({ success: false, message: 'Authentication required' });

  if (req.user.role !== 'admin')
    return res
      .status(403)
      .json({ success: false, message: 'Admin privileges required' });

  next();
};

const requireAuth = (req, res, next) => {
  if (!req.user)
    return res
      .status(401)
      .json({ success: false, message: 'Authentication required' });
  next();
};

module.exports = { clerkAuth, requireAdmin, requireAuth, verifyClerkToken };
