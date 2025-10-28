// backend/Routes/auth_refresh.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const { clerkAuth, requireAdmin } = require('../middleware/clerkAuth');

// Deprecated: kept for maintenance use only (admin)
router.post('/refresh', clerkAuth, requireAdmin, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token required' });
    // Verify token without expiration enforcement
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    } catch (e) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    // issue new token
    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const newToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token: newToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
