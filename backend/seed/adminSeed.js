// backend/seed/adminSeed.js
// Run: node backend/seed/adminSeed.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const connectDB = require('../db');

(async () => {
  try {
    await connectDB();
    const existing = await User.findOne({ email: 'admin@benmarket.local' });
    if (existing) {
      console.log('Admin already exists');
      process.exit(0);
    }
    const hashed = await bcrypt.hash('AdminPass123!', 10);
    const admin = new User({ name: 'Admin', email: 'admin@benmarket.local', password: hashed, role: 'admin' });
    await admin.save();
    console.log('Admin user created: admin@benmarket.local / AdminPass123!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
