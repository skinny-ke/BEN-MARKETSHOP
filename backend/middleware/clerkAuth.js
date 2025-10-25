const jwt = require('jsonwebtoken');
const User = require('../Models/User');
require('dotenv').config();

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

    // Verify the Clerk JWT token
    const decoded = jwt.verify(token, process.env.CLERK_JWT_SECRET || process.env.JWT_SECRET);
    
    // Find or create user from Clerk data
    const user = await User.findOrCreateFromClerk(decoded);
    
    // Attach user info to request
    req.user = {
      id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      role: user.role,
      profileImage: user.profileImage
    };
    
    next();
  } catch (err) {
    console.error('Clerk auth error:', err);
    return res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
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
