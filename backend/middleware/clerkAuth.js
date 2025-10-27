const { createClerkClient } = require('@clerk/backend');
const User = require('../Models/User');
require('dotenv').config();

// Initialize Clerk client
const clerkClient = createClerkClient({ 
  secretKey: process.env.CLERK_SECRET_KEY 
});

// Middleware to verify Clerk JWT token
const clerkAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token, authorization denied' 
      });
    }

    try {
      // Verify token with Clerk
      const decoded = await clerkClient.verifyToken(token);
      const clerkId = decoded.sub;
      const orgId = decoded.org_id || null;
      
      // Find user in database
      let user = await User.findOne({ clerkId });
      
      if (!user) {
        // User doesn't exist, create them
        // Get full user data from Clerk
        const clerkUser = await clerkClient.users.getUser(clerkId);
        
        user = await User.create({
          clerkId,
          name: clerkUser.firstName && clerkUser.lastName 
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.username || 'User',
          email: clerkUser.emailAddresses[0]?.emailAddress || `user-${clerkId}@unknown.com`,
          role: 'user',
          orgId: orgId,
          profileImage: clerkUser.imageUrl || '',
          isActive: true
        });
        
        console.log(`✅ Created new user: ${user.name} (${user.email})`);
      } else {
        // Update existing user's last login
        user.lastLogin = new Date();
        if (orgId) user.orgId = orgId;
        await user.save();
      }
      
      // Attach user info to request
      req.user = {
        id: user._id.toString(),
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        role: user.role,
        orgId: user.orgId,
        profileImage: user.profileImage
      };
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or expired token' 
      });
    }
  } catch (err) {
    console.error('Clerk auth error:', err);
    return res.status(401).json({ 
      success: false,
      message: 'Authentication failed' 
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin privileges required'
    });
  }
  
  next();
};

// Middleware to check if user is authenticated (any role)
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  next();
};

module.exports = {
  clerkAuth,
  requireAdmin,
  requireAuth
};
