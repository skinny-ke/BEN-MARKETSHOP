// backend/Controllers/paymentController.js
const Order = require('../Models/Order');

// Update order status (used by MPesa callback or admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) return res.status(400).json({ message: 'orderId and status required' });
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};
