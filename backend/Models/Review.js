const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userId: { type: String, required: true, index: true }, // Clerk user ID
  userName: { type: String, required: true },
  userAvatar: { type: String, default: '' },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  images: [{
    type: String, // Cloudinary URLs
    default: []
  }],
  verified: {
    type: Boolean,
    default: false // true if user purchased the product
  },
  helpful: [{
    userId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  reported: {
    type: Boolean,
    default: false
  },
  response: {
    adminId: { type: String },
    adminName: { type: String },
    message: { type: String },
    timestamp: { type: Date }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true }); // One review per user per product
reviewSchema.index({ rating: 1, product: 1 });

// Virtual for helpful count
reviewSchema.virtual('helpfulCount').get(function() {
  return this.helpful.length;
});

// Ensure virtual fields are serialized
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema);