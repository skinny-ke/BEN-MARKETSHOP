const mongoose = require('mongoose');

const trackingEventSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  title: { type: String, required: true },
  description: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, default: 1 },
    },
  ],
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: { type: String, default: null },
  timeline: [trackingEventSchema],
  estimatedDelivery: { type: Date },
  notes: { type: String },
}, { timestamps: true });

// Auto-create initial tracking event when order is created
OrderSchema.pre('save', function(next) {
  if (this.isNew && this.timeline.length === 0) {
    this.timeline.push({
      status: this.status || 'pending',
      title: 'Order Placed',
      description: 'Your order has been placed successfully',
      timestamp: this.createdAt || new Date()
    });
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
