const mongoose = require('mongoose');
const { InventoryLog, InventoryAlert, Supplier, PurchaseOrder } = require('../Models/Inventory');
const Product = require('../Models/Product');
const User = require('../Models/User');

const seedInventoryData = async () => {
  try {
    console.log('🌱 Seeding inventory data...');

    // Create sample suppliers
    const suppliers = [
      {
        name: 'TechSupply Kenya Ltd',
        contactPerson: 'John Mwangi',
        email: 'john@techsupply.co.ke',
        phone: '+254712345678',
        address: {
          street: '123 Moi Avenue',
          city: 'Nairobi',
          state: 'Nairobi',
          zipCode: '00100',
          country: 'Kenya'
        },
        paymentTerms: 'Net 30',
        isActive: true,
        notes: 'Primary electronics supplier'
      },
      {
        name: 'Global Gadgets Ltd',
        contactPerson: 'Sarah Wanjiku',
        email: 'sarah@globalgadgets.co.ke',
        phone: '+254723456789',
        address: {
          street: '456 Luthuli Avenue',
          city: 'Nairobi',
          state: 'Nairobi',
          zipCode: '00200',
          country: 'Kenya'
        },
        paymentTerms: 'Net 15',
        isActive: true,
        notes: 'Specializes in consumer electronics'
      }
    ];

    const createdSuppliers = await Supplier.insertMany(suppliers);
    console.log('✅ Created suppliers');

    // Get sample products and admin user
    const products = await Product.find().limit(5);
    const adminUser = await User.findOne({ role: 'admin' });

    if (products.length === 0 || !adminUser) {
      console.log('⚠️ No products or admin user found, skipping inventory logs');
      return;
    }

    // Create sample inventory logs
    const inventoryLogs = [];
    for (const product of products) {
      inventoryLogs.push({
        productId: product._id,
        type: 'stock_in',
        quantity: Math.floor(Math.random() * 50) + 10,
        previousStock: 0,
        newStock: Math.floor(Math.random() * 50) + 10,
        reason: 'Initial stock setup',
        performedBy: adminUser._id,
        cost: product.cost || Math.floor(Math.random() * 1000) + 100,
        notes: 'Seeded data'
      });
    }

    await InventoryLog.insertMany(inventoryLogs);
    console.log('✅ Created inventory logs');

    // Create sample purchase orders
    const purchaseOrders = [
      {
        supplierId: createdSuppliers[0]._id,
        items: [
          {
            productId: products[0]._id,
            quantity: 25,
            unitCost: products[0].cost || 500,
            totalCost: (products[0].cost || 500) * 25
          },
          {
            productId: products[1]._id,
            quantity: 15,
            unitCost: products[1].cost || 300,
            totalCost: (products[1].cost || 300) * 15
          }
        ],
        status: 'confirmed',
        totalAmount: ((products[0].cost || 500) * 25) + ((products[1].cost || 300) * 15),
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        notes: 'Urgent restock order',
        createdBy: adminUser._id
      },
      {
        supplierId: createdSuppliers[1]._id,
        items: [
          {
            productId: products[2]._id,
            quantity: 30,
            unitCost: products[2].cost || 200,
            totalCost: (products[2].cost || 200) * 30
          }
        ],
        status: 'sent',
        totalAmount: (products[2].cost || 200) * 30,
        expectedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        notes: 'Monthly restock',
        createdBy: adminUser._id
      }
    ];

    await PurchaseOrder.insertMany(purchaseOrders);
    console.log('✅ Created purchase orders');

    // Create sample alerts for low stock items
    const lowStockProducts = products.filter(p => p.stock <= 10);
    if (lowStockProducts.length > 0) {
      const alerts = lowStockProducts.map(product => ({
        productId: product._id,
        type: 'low_stock',
        threshold: 10,
        currentStock: product.stock,
        message: `${product.name} is running low on stock (${product.stock} remaining)`
      }));

      await InventoryAlert.insertMany(alerts);
      console.log('✅ Created inventory alerts');
    }

    console.log('🎉 Inventory data seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding inventory data:', error);
  }
};

module.exports = seedInventoryData;

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('../db');

  connectDB().then(() => {
    seedInventoryData().then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    }).catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
  });
}