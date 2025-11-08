// backend/Controllers/paymentController.js
const Order = require('../Models/Order');
const Product = require('../Models/Product');
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

      // ✅ Decrement stock for each product in the order (safely, never below zero)
      try {
        const populated = await Order.findById(order._id).populate('items.product');
        for (const item of populated.items) {
          const productId = item.product?._id || item.product;
          const qty = Math.max(1, item.quantity || 1);
          try {
            const product = await Product.findById(productId);
            if (!product) continue;
            const current = typeof product.stock === 'number' ? product.stock : 0;
            const nextStock = Math.max(0, current - qty);
            if (nextStock !== current) {
              product.stock = nextStock;
              // Check for low stock alert (less than 5 items)
              if (nextStock <= 5 && nextStock > 0) {
                console.log(`⚠️ LOW STOCK ALERT: ${product.name} has only ${nextStock} items remaining`);
                // TODO: Send email alert to admin
              } else if (nextStock === 0) {
                console.log(`🚨 OUT OF STOCK: ${product.name} is now out of stock`);
                // TODO: Send email alert to admin
              }
              await product.save();
            }
          } catch (stockError) {
            console.error(`❌ Error updating stock for product ${productId}:`, stockError);
          }
        }
      } catch (stockError) {
        console.error('❌ Error processing stock updates:', stockError);
      }

      // Send payment success email
      try {
        if (order.user && order.user.email) {
          await sendPaymentSuccess(order, order.user);
          console.log('✅ Payment success email sent');
        }
      } catch (emailError) {
        console.error('❌ Failed to send payment success email:', emailError);
      }
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
