const mongoose = require('mongoose');

// 🧩 Tracking event schema
const trackingEventSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ],
    default: 'pending'
  },
  title: { type: String, required: true },
  description: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

// 🧩 Shipping address schema
const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  county: { type: String },
  postalCode: { type: String },
  country: { type: String, default: 'Kenya' },
}, { _id: false });

// 🧩 Main order schema
const OrderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null // allow guest checkouts
  },
  items: [
    {
      product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
      },
      quantity: { type: Number, required: true, default: 1 },
      price: { type: Number, required: true }, // store product price at purchase time
    },
  ],
  subtotal: { type: Number, required: true },
  vatAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: shippingAddressSchema, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['mpesa', 'card', 'cod', 'wallet', 'other'],
    default: 'cod'
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ],
    default: 'pending'
  },
  trackingNumber: { type: String, default: null },
  timeline: [trackingEventSchema],
  estimatedDelivery: { type: Date },
  notes: { type: String },
}, { timestamps: true });

// ⚡ Indexes for performance
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ trackingNumber: 1 }, { sparse: true });

// 🧠 Auto-create initial tracking event
OrderSchema.pre('save', function(next) {
  if (this.isNew && (!this.timeline || this.timeline.length === 0)) {
    this.timeline = [{
      status: this.status || 'pending',
      title: 'Order Placed',
      description: 'Your order has been placed successfully',
      timestamp: new Date()
    }];
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
