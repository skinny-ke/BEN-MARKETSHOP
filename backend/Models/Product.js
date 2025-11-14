const mongoose = require('mongoose');

// Variant schema for product variations (size, color, etc.)
const VariantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Size", "Color"
  value: { type: String, required: true }, // e.g., "M", "Red"
  priceModifier: { type: Number, default: 0 }, // Additional cost for this variant
  stock: { type: Number, default: 0 }, // Stock specific to this variant
  sku: { type: String }, // Stock keeping unit
  image: { type: String }, // Variant-specific image
});

// Bundle item schema for product bundles
const BundleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
  discount: { type: Number, default: 0 }, // Percentage discount for this item in bundle
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  // Optional cost for COGS/profit analytics
  cost: { type: Number, default: 0 },
  image: { type: String },
  images: [{ type: String }], // Multiple images
  category: { type: String },
  stock: { type: Number, default: 0 },

  // New fields for variants and bundles
  isVariant: { type: Boolean, default: false }, // Is this a variant product?
  parentProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Parent product for variants
  variants: [VariantSchema], // Array of variants

  isBundle: { type: Boolean, default: false }, // Is this a product bundle?
  bundleItems: [BundleItemSchema], // Items in the bundle
  bundleDiscount: { type: Number, default: 0 }, // Overall bundle discount percentage

  // Additional product features
  tags: [{ type: String }], // Product tags for better search
  weight: { type: Number }, // For shipping calculations
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number }
  },
  brand: { type: String },
  sku: { type: String }, // Master SKU
  featured: { type: Boolean, default: false }, // Featured product
  onSale: { type: Boolean, default: false }, // On sale flag
  salePrice: { type: Number }, // Sale price if different from regular
  saleStart: { type: Date },
  saleEnd: { type: Date },
}, { timestamps: true });

// Indexes
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ onSale: 1 });
ProductSchema.index({ 'variants.sku': 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ name: 'text', description: 'text' }); // Text search

module.exports = mongoose.model('Product', ProductSchema);
