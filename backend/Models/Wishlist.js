import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true }, // ✅ indexed for faster queries
  wishlist: [
    {
      _id: { type: String, required: true }, // product ID
      name: { type: String, required: true },
      price: { type: Number, default: 0 },
      image: { type: String, default: '' },
      quantity: { type: Number, default: 1 },
    }
  ],
}, { timestamps: true });

export default mongoose.model('Wishlist', wishlistSchema);
