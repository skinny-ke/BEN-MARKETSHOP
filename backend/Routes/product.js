const express = require('express');
const router = express.Router();
const Product = require('../Models/Product');
const { clerkAuth, requireAdmin } = require('../middleware/clerkAuth');
const { body } = require('express-validator');

// ✅ GET all products (public - anyone can read) with advanced filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      search,
      sort = 'createdAt',
      order = 'desc',
      featured,
      onSale,
      brand,
      tags
    } = req.query;

    // Build query
    let query = {};

    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (featured === 'true') query.featured = true;
    if (onSale === 'true') query.onSale = true;
    if (tags) query.tags = { $in: tags.split(',') };

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('bundleItems.product', 'name price image');

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
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

// ✅ GET product variants (public)
router.get('/:id/variants', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // If it's a variant product, get all related variants
    let variants = [];
    if (product.isVariant && product.parentProduct) {
      variants = await Product.find({ parentProduct: product.parentProduct });
    } else if (!product.isVariant) {
      variants = await Product.find({ parentProduct: product._id });
    }

    res.json({
      success: true,
      data: variants
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch variants'
    });
  }
});

// ✅ GET featured products (public)
router.get('/featured/all', async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(10);
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
});

// ✅ GET products on sale (public)
router.get('/sale/all', async (req, res) => {
  try {
    const products = await Product.find({
      onSale: true,
      saleStart: { $lte: new Date() },
      $or: [
        { saleEnd: { $gte: new Date() } },
        { saleEnd: null }
      ]
    });
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sale products'
    });
  }
});

// ✅ GET product categories (public)
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({
      success: true,
      data: categories.filter(cat => cat) // Remove null/undefined
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// ✅ GET product brands (public)
router.get('/brands/all', async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json({
      success: true,
      data: brands.filter(brand => brand) // Remove null/undefined
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brands'
    });
  }
});

// ✅ POST new product (admin only) - enhanced for variants and bundles
router.post(
  '/',
  clerkAuth,
  requireAdmin,
  [
    body('name').isString().isLength({ min: 2 }),
    body('price').isFloat({ gt: 0 }),
    body('cost').optional().isFloat({ min: 0 }),
    body('description').optional().isString(),
    body('image').optional().isURL().bail().isString(),
    body('category').optional().isString(),
    body('stock').optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const {
        name, price, cost, description, image, images, category, stock,
        isVariant, parentProduct, variants,
        isBundle, bundleItems, bundleDiscount,
        tags, weight, dimensions, brand, sku, featured, onSale, salePrice, saleStart, saleEnd
      } = req.body;

      const newProduct = new Product({
        name,
        price,
        ...(typeof cost !== 'undefined' ? { cost } : {}),
        description,
        image,
        images: images || [],
        category,
        stock,
        isVariant: isVariant || false,
        parentProduct,
        variants: variants || [],
        isBundle: isBundle || false,
        bundleItems: bundleItems || [],
        bundleDiscount: bundleDiscount || 0,
        tags: tags || [],
        weight,
        dimensions,
        brand,
        sku,
        featured: featured || false,
        onSale: onSale || false,
        salePrice,
        saleStart,
        saleEnd
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
  }
);

// ✅ PUT update product (admin only)
router.put('/:id', clerkAuth, requireAdmin, async (req, res) => {
  try {
    const update = { ...req.body };
    // Ensure cost cannot be negative
    if (typeof update.cost !== 'undefined') {
      update.cost = Math.max(0, Number(update.cost));
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    
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
