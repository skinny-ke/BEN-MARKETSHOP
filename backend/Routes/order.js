const express = require('express');
const router = express.Router();
const Order = require('../Models/Order');
const { clerkAuth, requireAdmin } = require('../middleware/clerkAuth');
const { body, param } = require('express-validator');

// ✅ GET all orders for current user (authenticated)
router.get('/', clerkAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// ✅ GET single order (authenticated - own orders only)
router.get('/:id', clerkAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user owns this order (unless admin)
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// ✅ POST create new order (authenticated)
router.post(
  '/',
  clerkAuth,
  [
    body('items').isArray({ min: 1 }),
    body('items.*.product').isString().isLength({ min: 8 }),
    body('items.*.quantity').isInt({ min: 1 }),
    body('totalAmount').isFloat({ gt: 0 }),
    body('shippingAddress').isString().isLength({ min: 5 }),
  ],
  async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;
    
    const newOrder = new Order({
      user: req.user.id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    const order = await newOrder.save();
    await order.populate('items.product');
    
    // Generate a simple tracking number
    const trackingNumber = `BEN-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    order.trackingNumber = trackingNumber;
    await order.save();
    
    res.json({
      success: true,
      data: {
        ...order.toObject(),
        trackingNumber
      },
      message: 'Order created successfully'
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// ✅ GET all orders (admin only)
router.get('/admin/all', clerkAuth, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Receipt endpoint
router.get('/:id/receipt', clerkAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product').populate('user', 'email name');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({
      orderId: order._id,
      paidAt: order.paidAt || null,
      paymentStatus: order.paymentStatus,
      paymentReference: order.paymentReference || null,
      totalAmount: order.totalAmount,
      items: order.items.map(i => ({ name: i.product.name, qty: i.quantity, price: i.product.price })),
      user: { email: order.user.email, name: order.user.name },
    });
  } catch (err) {
    console.error('Error generating receipt:', err);
    res.status(500).json({ message: 'Failed to generate receipt' });
  }
});

module.exports = router;
