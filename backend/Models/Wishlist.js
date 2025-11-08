const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, index: true, unique: true }, // Clerk user ID
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      image: { type: String, default: '' },
      addedAt: { type: Date, default: Date.now }
    }
  ],
}, { timestamps: true });

// Indexes
wishlistSchema.index({ clerkId: 1 });
wishlistSchema.index({ 'products.productId': 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);
