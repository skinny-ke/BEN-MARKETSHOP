const express = require('express');
const router = express.Router();
const Order = require('../Models/Order');
const { clerkAuth, requireAdmin } = require('../middleware/clerkAuth');

// ✅ GET order tracking by ID (user or admin)
router.get('/:orderId', clerkAuth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('items.product', 'name image price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Only owner or admin can access
    if (order.user._id.toString() !== req.auth.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order._id,
        status: order.status,
        trackingNumber: order.trackingNumber,
        timeline: order.timeline,
        estimatedDelivery: order.estimatedDelivery,
        items: order.items,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        notes: order.notes || null,
      },
    });
  } catch (error) {
    console.error('Error fetching order tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order tracking',
    });
  }
});

// ✅ POST update order status and add tracking event (admin only)
router.post('/:orderId/update', clerkAuth, requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, notes, description } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Map status to titles
    const statusTitles = {
      'pending': 'Order Pending',
      'confirmed': 'Order Confirmed',
      'processing': 'Processing Order',
      'shipped': 'Order Shipped',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Order Cancelled',
    };

    // Push new timeline event
    order.timeline.push({
      status: status || order.status,
      title: statusTitles[status] || 'Status Updated',
      description: description || notes || 'Order status has been updated',
      timestamp: new Date(),
    });

    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.notes = notes;

    await order.save();

    res.json({
      success: true,
      data: order,
      message: 'Order status updated successfully',
    });
  } catch (error) {
    console.error('Error updating order tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order tracking',
    });
  }
});

module.exports = router;
