const express = require('express');
const router = express.Router();
const Order = require('../Models/Order');
const { clerkAuth } = require('../middleware/clerkAuth');

// Get order tracking by ID
router.get('/:orderId', clerkAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('items.product', 'name image');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user owns this order (unless admin)
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
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
        shippingAddress: order.shippingAddress
      }
    });
  } catch (error) {
    console.error('Error fetching order tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order tracking'
    });
  }
});

// Admin: Update order status and add tracking event
router.post('/:orderId/update', clerkAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, notes, description } = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Add tracking event
    const statusTitles = {
      'confirmed': 'Order Confirmed',
      'processing': 'Processing Order',
      'shipped': 'Order Shipped',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Order Cancelled'
    };
    
    order.timeline.push({
      status: status || order.status,
      title: statusTitles[status] || 'Status Updated',
      description: description || notes || 'Order status has been updated',
      timestamp: new Date()
    });
    
    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.notes = notes;
    
    await order.save();
    
    res.json({
      success: true,
      data: order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order tracking'
    });
  }
});

module.exports = router;

