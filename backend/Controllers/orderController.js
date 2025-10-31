const Order = require('../Models/Order');

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

    // ✅ Create the order
    const order = new Order({
      user: req.user ? req.user.id : null, // guest or logged-in user
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'Pending',
      status: 'Pending',
    });

    await order.save();

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
    if (req.user && order.user && order.user.toString() !== req.user.id && req.user.role !== 'admin') {
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

    order.status = status;
    await order.save();

    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    console.error('❌ Update order status error:', error);
    next(error);
  }
};
