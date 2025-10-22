const Order = require('../Models/Order');

exports.createOrder = async (req, res, next) => {
  try {
    const { items, totalAmount, shippingAddress } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: 'No items' });
    const order = new Order({ user: req.user ? req.user.id : null, items, totalAmount, shippingAddress });
    await order.save();
    res.status(201).json(order);
  } catch (err) { next(err); }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { next(err); }
};
