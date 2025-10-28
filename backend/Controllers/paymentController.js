// backend/Controllers/paymentController.js
const Order = require('../Models/Order');
const { sendPaymentSuccess } = require('../services/emailService');
const User = require('../Models/User');

// Update order status (used by MPesa callback or admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId, status, paymentReference } = req.body;
    if (!orderId || !status) return res.status(400).json({ message: 'orderId and status required' });
    const update = { status };
    if (status === 'confirmed' || status === 'processing') {
      // no payment change
    }
    if (status === 'delivered') {
      update.deliveredAt = new Date();
    }
    if (status === 'paid' || status === 'processing' || status === 'confirmed') {
      // allow payment reference updates
      if (paymentReference) update.paymentReference = paymentReference;
    }

    const order = await Order.findByIdAndUpdate(orderId, update, { new: true }).populate('user');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Payment success flow
    if (status === 'paid') {
      order.paymentStatus = 'paid';
      order.paidAt = new Date();
      if (paymentReference) order.paymentReference = paymentReference;
      await order.save();
      try { await sendPaymentSuccess(order, order.user); } catch (_) {}
      // emit socket event
      try {
        const io = req.app.get('io');
        if (io) io.to(order.user._id.toString()).emit('order_updated', { orderId: order._id, paymentStatus: order.paymentStatus, status: order.status });
      } catch (_) {}
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};
