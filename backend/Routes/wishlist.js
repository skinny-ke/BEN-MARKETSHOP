import express from 'express';
import Wishlist from '../Models/Wishlist.js'; // mongoose model
const router = express.Router();

// Get user's wishlist
router.get('/:userId', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId });
    res.json(wishlist || { wishlist: [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
});

// Add item
router.post('/:userId', async (req, res) => {
  try {
    const { product } = req.body;
    let wishlist = await Wishlist.findOne({ userId: req.params.userId });
    if (!wishlist) wishlist = new Wishlist({ userId: req.params.userId, wishlist: [] });
    if (!wishlist.wishlist.some(p => p._id === product._id)) {
      wishlist.wishlist.push(product);
      await wishlist.save();
    }
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Error adding to wishlist' });
  }
});

// Remove item
router.delete('/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const wishlist = await Wishlist.findOne({ userId });
    if (wishlist) {
      wishlist.wishlist = wishlist.wishlist.filter(p => p._id !== productId);
      await wishlist.save();
    }
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Error removing from wishlist' });
  }
});

export default router;
