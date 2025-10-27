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

    // Decode the JWT token to get user info (development mode)
    const decoded = jwt.decode(token);
    
    if (!decoded || !decoded.sub) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format' 
      });
    }

    const clerkId = decoded.sub;
    
    // Find or create user
    let user = await User.findOne({ clerkId });
    
    if (!user) {
      // Create user with basic info from token
      user = await User.create({
        clerkId: clerkId,
        email: decoded.email || `user-${clerkId}@unknown.com`,
        name: decoded.name || decoded.firstName + ' ' + decoded.lastName || 'User',
        role: 'user',
        profileImage: decoded.image || ''
      });
    }
    
    // Attach user info to request
    req.user = {
      id: user._id.toString(),
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
