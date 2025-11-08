const Order = require('../Models/Order');
const { sendOrderConfirmation, sendPaymentSuccess, sendOrderStatusUpdate } = require('../services/emailService');

/**
 * @desc Create a new order
 * @route POST /api/orders
 * @access Private (User or Guest)
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

    // ✅ Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid total amount' });
    }

    if (!shippingAddress || !shippingAddress.fullName) {
      return res.status(400).json({ message: 'Shipping address is incomplete' });
    }

    // ✅ Calculate VAT (16% in Kenya)
    const VAT_RATE = 0.16;
    const subtotal = totalAmount;
    const vatAmount = subtotal * VAT_RATE;
    const totalWithVAT = subtotal + vatAmount;

    // ✅ Create the order
    const order = new Order({
      user: req.user ? req.auth.userId : null, // guest or logged-in user
      items,
      subtotal,
      vatAmount,
      totalAmount: totalWithVAT,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod', // Default to cash on delivery
      status: 'pending',
      paymentStatus: paymentMethod === 'mpesa' ? 'pending' : 'pending', // M-Pesa starts as pending, COD as pending
    });

    await order.save();

    // Send order confirmation email if user is logged in
    if (req.user && req.user.email) {
      try {
        await sendOrderConfirmation(order, req.user);
        console.log('✅ Order confirmation email sent');
      } catch (emailError) {
        console.error('❌ Failed to send order confirmation email:', emailError);
        // Don't fail the order creation if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('❌ Order creation error:', error);
    next(error);
  }
};

/**
 * @desc Get a single order by ID
 * @route GET /api/orders/:id
 * @access Private (User/Admin)
 */
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // ✅ Restrict access (user can only view their own order)
    if (req.user && order.user && order.user.toString() !== req.auth.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Fetch order error:', error);
    next(error);
  }
};

/**
 * @desc Get all orders (Admin only)
 * @route GET /api/orders
 * @access Private/Admin
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments();

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      orders,
    });
  } catch (error) {
    console.error('❌ Fetch all orders error:', error);
    next(error);
  }
};

/**
 * @desc Update order status (Admin)
 * @route PUT /api/orders/:id/status
 * @access Private/Admin
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Send status update email if user exists and status changed
    if (req.user && req.user.email && oldStatus !== status) {
      try {
        await sendOrderStatusUpdate(order, req.user, status);
        console.log('✅ Order status update email sent');
      } catch (emailError) {
        console.error('❌ Failed to send order status update email:', emailError);
        // Don't fail the status update if email fails
      }
    }

    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    console.error('❌ Update order status error:', error);
    next(error);
  }
};
