// backend/seed/adminSeed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('../db');
const User = require('../Models/User');

dotenv.config({ path: './backend/.env' });

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin already exists. No new admin created.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const adminUser = new User({
      name: 'Super Admin',
      email: 'admin@benmarket.com',
      password: hashedPassword,
      role: 'admin',
      clerkId: 'manual-seed-admin', // fake ID for non-Clerk users
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${adminUser.email}`);
    console.log('🔑 Password: Admin@123');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding admin: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
