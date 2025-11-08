const express = require('express');
const router = express.Router();
const Order = require('../Models/Order');
const { clerkAuth, requireAdmin } = require('../middleware/clerkAuth');
const { body } = require('express-validator');

// ✅ GET all orders for current user (authenticated)
router.get('/', clerkAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.auth.userId })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
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
        message: 'Order not found',
      });
    }

    // Check if user owns this order (unless admin)
    if (order.user.toString() !== req.auth.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
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
        user: req.auth.userId,
        items,
        totalAmount,
        shippingAddress,
        paymentMethod,
        status: 'pending',
        paymentStatus: 'pending',
      });

      const order = await newOrder.save();
      await order.populate('items.product');

      // Generate a simple tracking number
      const trackingNumber = `BEN-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 5)
        .toUpperCase()}`;
      order.trackingNumber = trackingNumber;
      await order.save();

      res.json({
        success: true,
        data: {
          ...order.toObject(),
          trackingNumber,
        },
        message: 'Order created successfully',
      });
    } catch (err) {
      console.error('Error creating order:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
      });
    }
  }
);

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
      data: orders,
    });
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
    });
  }
});

// ✅ Generate receipt (user or admin)
router.get('/:id/receipt', clerkAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'email name');

    if (!order)
      return res.status(404).json({ message: 'Order not found' });

    if (order.user._id.toString() !== req.auth.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      orderId: order._id,
      paidAt: order.paidAt || null,
      paymentStatus: order.paymentStatus,
      paymentReference: order.paymentReference || null,
      totalAmount: order.totalAmount,
      items: order.items.map((i) => ({
        name: i.product.name,
        qty: i.quantity,
        price: i.product.price,
      })),
      user: { email: order.user.email, name: order.user.name },
    });
  } catch (err) {
    console.error('Error generating receipt:', err);
    res.status(500).json({ message: 'Failed to generate receipt' });
  }
});

// ✅ UPDATE order status (admin only)
router.put('/:id/status', clerkAuth, requireAdmin, async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.status = status;

    // Add to order timeline
    order.timeline.push({
      status,
      title: `Order ${status.replace(/_/g, ' ')}`,
      description: note || `Order updated to "${status}" by admin`,
      timestamp: new Date(),
    });

    // Update estimated delivery if applicable
    if (status === 'shipped' || status === 'out_for_delivery') {
      const estDays = status === 'shipped' ? 5 : 1;
      order.estimatedDelivery = new Date(
        Date.now() + estDays * 24 * 60 * 60 * 1000
      );
    }

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to "${status}"`,
      data: order,
    });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
    });
  }
});

// ✅ USER can view order timeline
router.get('/:id/timeline', clerkAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure the user owns the order or is admin
    if (order.user.toString() !== req.auth.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({
      success: true,
      timeline: order.timeline,
      currentStatus: order.status,
      estimatedDelivery: order.estimatedDelivery || null,
    });
  } catch (err) {
    console.error('Error fetching order timeline:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch timeline' });
  }
});

module.exports = router;
