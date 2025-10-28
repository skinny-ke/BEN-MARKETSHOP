const express = require('express');
const router = express.Router();
const Product = require('../Models/Product');
const { clerkAuth, requireAdmin } = require('../middleware/clerkAuth');
const { body } = require('express-validator');

// ✅ GET all products (public - anyone can read)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// ✅ GET one product by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.json({
      success: true,
      data: product
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// ✅ POST new product (admin only)
router.post(
  '/',
  clerkAuth,
  requireAdmin,
  [
    body('name').isString().isLength({ min: 2 }),
    body('price').isFloat({ gt: 0 }),
    body('description').optional().isString(),
    body('image').optional().isURL().bail().isString(),
    body('category').optional().isString(),
    body('stock').optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
  try {
    const { name, price, description, image, category, stock } = req.body;
    
    const newProduct = new Product({
      name,
      price,
      description,
      image,
      category,
      stock
    });
    
    const product = await newProduct.save();
    
    res.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// ✅ PUT update product (admin only)
router.put('/:id', clerkAuth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// ✅ DELETE product (admin only)
router.delete('/:id', clerkAuth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

module.exports = router;
