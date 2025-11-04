const express = require('express');
const Wishlist = require('../Models/Wishlist');
const { clerkAuth } = require('../middleware/clerkAuth');

const router = express.Router();

// ✅ Get user's wishlist (protected)
router.get('/:userId', clerkAuth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId });
    res.json(wishlist || { wishlist: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
});

// ✅ Add item to wishlist (protected)
router.post('/:userId', clerkAuth, async (req, res) => {
  try {
    const { product } = req.body;
    let wishlist = await Wishlist.findOne({ userId: req.params.userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.params.userId, wishlist: [] });
    }

    if (!wishlist.wishlist.some(p => p._id.toString() === product._id.toString())) {
      wishlist.wishlist.push(product);
      await wishlist.save();
    }

    res.json(wishlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding to wishlist' });
  }
});

// ✅ Remove item from wishlist (protected)
router.delete('/:userId/:productId', clerkAuth, async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const wishlist = await Wishlist.findOne({ userId });

    if (wishlist) {
      wishlist.wishlist = wishlist.wishlist.filter(p => p._id.toString() !== productId.toString());
      await wishlist.save();
    }

    res.json(wishlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error removing from wishlist' });
  }
});

module.exports = router; // ✅ Proper CommonJS export
