const express = require('express');
const router = express.Router();
const { clerkAuth, requireAdmin } = require('../middleware/clerkAuth');
const Product = require('../Models/Product');
const Order = require('../Models/Order');

/**
 * Export products to CSV
 */
router.get('/products/export', clerkAuth, requireAdmin, async (req, res) => {
  try {
    const products = await Product.find().lean();
    
    // CSV header
    const headers = ['ID', 'Name', 'Description', 'Price', 'Cost', 'Category', 'Stock', 'SKU', 'Brand', 'Featured', 'On Sale', 'Sale Price', 'Image'];
    let csvContent = headers.join(',') + '\n';
    
    // CSV rows
    products.forEach(product => {
      const row = [
        product._id,
        `"${(product.name || '').replace(/"/g, '""')}"`,
        `"${(product.description || '').replace(/"/g, '""')}"`,
        product.price || 0,
        product.cost || 0,
        product.category || '',
        product.stock || 0,
        product.sku || '',
        product.brand || '',
        product.featured ? 'Yes' : 'No',
        product.onSale ? 'Yes' : 'No',
        product.salePrice || '',
        product.image || ''
      ];
      csvContent += row.join(',') + '\n';
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products-export.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting products:', error);
    res.status(500).json({ success: false, message: 'Failed to export products' });
  }
});

/**
 * Import products from CSV
 */
router.post('/products/import', clerkAuth, requireAdmin, async (req, res) => {
  try {
    const { csvData } = req.body;
    
    if (!csvData) {
      return res.status(400).json({ success: false, message: 'CSV data is required' });
    }
    
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return res.status(400).json({ success: false, message: 'CSV must have at least a header and one data row' });
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const products = [];
    const errors = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }
      
      const productData = {};
      headers.forEach((header, index) => {
        const value = values[index];
        switch (header.toLowerCase()) {
          case 'name':
            productData.name = value;
            break;
          case 'description':
            productData.description = value;
            break;
          case 'price':
            productData.price = parseFloat(value) || 0;
            break;
          case 'cost':
            productData.cost = parseFloat(value) || 0;
            break;
          case 'category':
            productData.category = value;
            break;
          case 'stock':
            productData.stock = parseInt(value) || 0;
            break;
          case 'sku':
            productData.sku = value;
            break;
          case 'brand':
            productData.brand = value;
            break;
          case 'featured':
            productData.featured = value.toLowerCase() === 'yes';
            break;
          case 'on sale':
          case 'onsale':
            productData.onSale = value.toLowerCase() === 'yes';
            break;
          case 'sale price':
          case 'saleprice':
            productData.salePrice = parseFloat(value) || null;
            break;
          case 'image':
            productData.image = value;
            break;
        }
      });
      
      if (!productData.name || !productData.price) {
        errors.push(`Row ${i + 1}: Missing required fields (name, price)`);
        continue;
      }
      
      products.push(productData);
    }
    
    if (products.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid products to import', errors });
    }
    
    // Insert products
    const result = await Product.insertMany(products, { ordered: false });
    
    res.json({
      success: true,
      message: `Successfully imported ${result.length} products`,
      imported: result.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error importing products:', error);
    res.status(500).json({ success: false, message: 'Failed to import products', error: error.message });
  }
});

/**
 * Export orders to CSV
 */
router.get('/orders/export', clerkAuth, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const query = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (status) query.status = status;
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .lean();
    
    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Total Amount', 'Status', 'Payment Status', 'Payment Method', 'Date', 'Items'];
    let csvContent = headers.join(',') + '\n';
    
    orders.forEach(order => {
      const items = order.items.map(item => `${item.product?.name || 'N/A'} x${item.quantity}`).join('; ');
      const row = [
        order._id,
        `"${(order.user?.name || 'Guest').replace(/"/g, '""')}"`,
        order.user?.email || 'N/A',
        order.totalAmount || 0,
        order.status || 'pending',
        order.paymentStatus || 'pending',
        order.paymentMethod || 'N/A',
        new Date(order.createdAt).toISOString(),
        `"${items.replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders-export.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting orders:', error);
    res.status(500).json({ success: false, message: 'Failed to export orders' });
  }
});

module.exports = router;

