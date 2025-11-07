// backend/db.js
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' }); // ✅ only once

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) throw new Error('❌ MONGO_URI not found in .env file');

    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
