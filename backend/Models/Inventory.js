const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: ['stock_in', 'stock_out', 'adjustment', 'sale', 'return'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  reference: {
    type: String, // Order ID, supplier ID, etc.
    default: null
  },
  performedBy: {
    type: String, // Clerk user ID
    required: true
  },
  cost: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const inventoryAlertSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: ['low_stock', 'out_of_stock', 'overstock', 'expiring'],
    required: true
  },
  threshold: {
    type: Number,
    required: true
  },
  currentStock: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  acknowledgedBy: [{
    userId: String,
    acknowledgedAt: Date
  }]
}, { timestamps: true });

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  contactPerson: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentTerms: {
    type: String,
    default: 'Net 30'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const purchaseOrderSchema = new mongoose.Schema({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unitCost: {
      type: Number,
      required: true
    },
    totalCost: {
      type: Number,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'sent', 'confirmed', 'received', 'cancelled'],
    default: 'draft'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  expectedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Indexes
inventoryLogSchema.index({ productId: 1, createdAt: -1 });
inventoryAlertSchema.index({ type: 1, isActive: 1 });
supplierSchema.index({ name: 1 });
purchaseOrderSchema.index({ status: 1, createdAt: -1 });

module.exports = {
  InventoryLog: mongoose.model('InventoryLog', inventoryLogSchema),
  InventoryAlert: mongoose.model('InventoryAlert', inventoryAlertSchema),
  Supplier: mongoose.model('Supplier', supplierSchema),
  PurchaseOrder: mongoose.model('PurchaseOrder', purchaseOrderSchema)
};