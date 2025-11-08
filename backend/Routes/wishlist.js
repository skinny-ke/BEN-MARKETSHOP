const express = require('express');
const Wishlist = require('../Models/Wishlist');
const { clerkAuth } = require('../middleware/clerkAuth');

const router = express.Router();

// ✅ Get user's wishlist (protected) - uses Clerk userId
router.get('/', clerkAuth, async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const wishlist = await Wishlist.findOne({ clerkId }).populate('products.productId');
    if (!wishlist) {
      return res.json({ success: true, products: [] });
    }
    res.json({ success: true, products: wishlist.products });
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ success: false, message: 'Error fetching wishlist' });
  }
});

// ✅ Add item to wishlist (protected) - uses Clerk userId
router.post('/', clerkAuth, async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    let wishlist = await Wishlist.findOne({ clerkId });

    if (!wishlist) {
      wishlist = new Wishlist({ clerkId, products: [] });
    }

    // Check if product already exists in wishlist
    const existingProduct = wishlist.products.find(p => p.productId.toString() === productId);
    if (existingProduct) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }

    // Add product to wishlist
    wishlist.products.push({
      productId,
      name: req.body.name || '',
      price: req.body.price || 0,
      image: req.body.image || '',
      addedAt: new Date()
    });

    await wishlist.save();
    await wishlist.populate('products.productId');

    res.json({ success: true, products: wishlist.products });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({ success: false, message: 'Error adding to wishlist' });
  }
});

// ✅ Remove item from wishlist (protected) - uses Clerk userId
router.delete('/:productId', clerkAuth, async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ clerkId });

    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    // Remove product from wishlist
    wishlist.products = wishlist.products.filter(p => p.productId.toString() !== productId);
    await wishlist.save();

    res.json({ success: true, products: wishlist.products });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ success: false, message: 'Error removing from wishlist' });
  }
});

module.exports = router;
