const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.warn('⚠️  MONGO_URI not found in environment variables.');
      throw new Error('Missing MONGO_URI. Please check your .env file.');
    }

    // ✅ Connect to MongoDB using the new stable Mongoose connection options
    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true, // helpful during development
      maxPoolSize: 10, // better scaling
      serverSelectionTimeoutMS: 5000, // fail fast on bad connection
      socketTimeoutMS: 45000,
      family: 4, // IPv4 only
    });

    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);

    // Allow development mode to continue without DB
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  Running without database connection (development mode)');
    } else {
      process.exit(1);
    }
  }

  // Extra: Handle future connection drops gracefully
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Retrying...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected successfully');
  });
};

module.exports = connectDB;
