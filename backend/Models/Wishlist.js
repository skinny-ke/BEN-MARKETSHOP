import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  wishlist: { type: Array, default: [] },
}, { timestamps: true });

export default mongoose.model('Wishlist', wishlistSchema);
