/*
Enhanced Seed Script - Creates comprehensive test data
Run: node seed/enhancedSeed.js
*/
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../db');
const Product = require('../Models/Product');
const User = require('../Models/User');
const Order = require('../Models/Order');
const { LoyaltyProgram, UserLoyalty } = require('../Models/Loyalty');

const categories = [
  'Electronics', 'Clothing', 'Footwear', 'Accessories', 'Home & Kitchen',
  'Sports', 'Books', 'Toys', 'Beauty', 'Health', 'Automotive', 'Garden'
];

const brands = [
  'BenMarket', 'TechPro', 'StyleCo', 'FitLife', 'HomeEssentials',
  'SportMax', 'BeautyPlus', 'HealthFirst', 'AutoParts', 'GardenPro'
];

const generateProducts = () => {
  const products = [];
  const productNames = [
    // Electronics
    'Smartphone Pro Max', 'Wireless Earbuds', 'Laptop Stand', 'USB-C Cable', 'Power Bank 20000mAh',
    'Bluetooth Speaker', 'Smart Watch', 'Tablet Case', 'HD Webcam', 'Mechanical Keyboard',
    // Clothing
    'Cotton T-Shirt', 'Denim Jeans', 'Hoodie', 'Polo Shirt', 'Cargo Pants',
    'Winter Jacket', 'Summer Dress', 'Sports Shorts', 'Tank Top', 'Cardigan',
    // Footwear
    'Running Shoes', 'Casual Sneakers', 'Formal Shoes', 'Sandals', 'Boots',
    'Flip Flops', 'Basketball Shoes', 'Hiking Boots', 'Loafers', 'High Heels',
    // Accessories
    'Leather Wallet', 'Backpack', 'Sunglasses', 'Watch', 'Belt',
    'Hat', 'Scarf', 'Gloves', 'Phone Case', 'Laptop Bag',
    // Home & Kitchen
    'Coffee Maker', 'Blender', 'Dinner Set', 'Cookware Set', 'Bed Sheets',
    'Pillows', 'Curtains', 'Lamp', 'Wall Clock', 'Vase',
    // Sports
    'Yoga Mat', 'Dumbbells', 'Resistance Bands', 'Basketball', 'Football',
    'Tennis Racket', 'Golf Clubs', 'Bicycle', 'Treadmill', 'Jump Rope',
    // Books
    'Fiction Novel', 'Cookbook', 'Biography', 'Self-Help', 'Children\'s Book',
    'Textbook', 'Comic Book', 'Poetry', 'History', 'Science',
    // Toys
    'Action Figure', 'Board Game', 'Puzzle', 'Building Blocks', 'Doll',
    'Remote Car', 'Drone', 'RC Helicopter', 'LEGO Set', 'Stuffed Animal',
    // Beauty
    'Face Cream', 'Lipstick', 'Perfume', 'Shampoo', 'Body Lotion',
    'Makeup Kit', 'Hair Dryer', 'Nail Polish', 'Face Mask', 'Sunscreen',
    // Health
    'Vitamins', 'Protein Powder', 'Yoga Mat', 'Massage Oil', 'First Aid Kit',
    'Blood Pressure Monitor', 'Thermometer', 'Face Mask Pack', 'Hand Sanitizer', 'Supplements',
    // Automotive
    'Car Phone Mount', 'Car Charger', 'Floor Mats', 'Air Freshener', 'Car Cover',
    'Tire Pressure Gauge', 'Jump Starter', 'Car Vacuum', 'Dash Cam', 'Seat Covers',
    // Garden
    'Garden Tools Set', 'Plant Pots', 'Garden Hose', 'Lawn Mower', 'Pruning Shears',
    'Fertilizer', 'Seeds Pack', 'Garden Gloves', 'Watering Can', 'Garden Decor'
  ];

  productNames.forEach((name, index) => {
    const category = categories[index % categories.length];
    const brand = brands[index % brands.length];
    const basePrice = Math.floor(Math.random() * 10000) + 500; // 500-10500
    const cost = Math.floor(basePrice * 0.6); // 60% of price
    const stock = Math.floor(Math.random() * 100) + 5; // 5-105

    products.push({
      name,
      description: `High-quality ${name.toLowerCase()} from ${brand}. Perfect for everyday use with excellent durability and performance.`,
      price: basePrice,
      cost: cost,
      category,
      brand,
      stock,
      image: `https://images.unsplash.com/photo-${1500000000000 + index}?w=500`,
      tags: [category.toLowerCase(), brand.toLowerCase(), 'quality', 'premium'],
      featured: index % 10 === 0, // Every 10th product is featured
      onSale: index % 15 === 0, // Every 15th product is on sale
      salePrice: index % 15 === 0 ? Math.floor(basePrice * 0.8) : undefined,
      sku: `BM-${category.substring(0, 3).toUpperCase()}-${String(index + 1).padStart(4, '0')}`,
      weight: Math.floor(Math.random() * 5000) + 100, // 100-5100g
      dimensions: {
        length: Math.floor(Math.random() * 50) + 10,
        width: Math.floor(Math.random() * 50) + 10,
        height: Math.floor(Math.random() * 50) + 10
      }
    });
  });

  return products;
};

const generateOrders = async (users) => {
  const orders = [];
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const paymentStatuses = ['pending', 'paid', 'failed'];
  const paymentMethods = ['mpesa', 'cod', 'card'];

  // Generate 50-100 orders
  const numOrders = Math.floor(Math.random() * 50) + 50;
  
  for (let i = 0; i < numOrders; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const numItems = Math.floor(Math.random() * 5) + 1; // 1-5 items
    const items = [];
    let subtotal = 0;

    // Get random products
    const products = await Product.find().limit(20);
    
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1; // 1-3
      const price = product.onSale && product.salePrice ? product.salePrice : product.price;
      items.push({
        product: product._id,
        productName: product.name,
        quantity,
        price,
        subtotal: price * quantity
      });
      subtotal += price * quantity;
    }

    const vatAmount = subtotal * 0.16;
    const totalAmount = subtotal + vatAmount;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentStatus = status === 'cancelled' ? 'failed' : 
                         status === 'delivered' ? 'paid' : 
                         paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];

    // Random date within last 90 days
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 90));

    orders.push({
      user: user._id,
      items,
      subtotal,
      vatAmount,
      totalAmount,
      status,
      paymentStatus,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      paymentReference: paymentStatus === 'paid' ? `MPESA${Date.now()}${i}` : null,
      shippingAddress: {
        fullName: user.name,
        phone: `2547${Math.floor(Math.random() * 100000000)}`,
        address: `${Math.floor(Math.random() * 100)} Street`,
        street: `${Math.floor(Math.random() * 100)} Street`, // <-- fix for required .street
        city: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'][Math.floor(Math.random() * 5)],
        postalCode: `${Math.floor(Math.random() * 100000)}`,
        country: 'Kenya'
      },
      createdAt,
      deliveredAt: status === 'delivered' ? new Date(createdAt.getTime() + (Math.random() * 7 * 24 * 60 * 60 * 1000)) : null
    });
  }

  return orders;
};

const seedAll = async () => {
  try {
    console.log('🌱 Starting enhanced seed...');
    await connectDB();

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await Order.deleteMany({});
    // Don't delete users - they might be real Clerk users
    // await User.deleteMany({ role: { $ne: 'admin' } });

    // Seed Products
    console.log('📦 Seeding products...');
    const products = generateProducts();
    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products`);

    // Get or create test users (using Clerk IDs)
    console.log('👥 Checking users...');
    const users = await User.find();
    if (users.length === 0) {
      console.log('⚠️  No users found. Please create users through Clerk authentication first.');
      console.log('   Users will be created automatically when they sign up.');
    } else {
      console.log(`✅ Found ${users.length} users`);

      // Seed Orders (only if we have users)
      if (users.length > 0) {
        console.log('📦 Seeding orders...');
        const orders = await generateOrders(users);
        await Order.insertMany(orders);
        console.log(`✅ Seeded ${orders.length} orders`);

        // Award loyalty points for orders
        console.log('🎁 Awarding loyalty points...');
        const { awardPurchasePoints } = require('../Controllers/loyaltyController');
        for (const order of orders) {
          if (order.paymentStatus === 'paid' && order.user) {
            const user = await User.findById(order.user);
            if (user && user.clerkId && order._id) {
              await awardPurchasePoints(user.clerkId, order.totalAmount, order._id.toString());
            } else {
              console.warn(`[SEED] Skipping loyalty for order ${order._id}: missing user or clerkId.`);
            }
          }
        }
        console.log('✅ Loyalty points awarded');
      }
    }

    // Ensure loyalty program exists
    console.log('🎁 Checking loyalty program...');
    const existingProgram = await LoyaltyProgram.findOne();
    if (!existingProgram) {
      const seedLoyaltyProgram = require('./loyaltySeed');
      await seedLoyaltyProgram();
    } else {
      console.log('✅ Loyalty program already exists');
    }

    console.log('🎉 Enhanced seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Products: ${products.length}`);
    console.log(`   Users: ${users.length}`);
    const orderCount = await Order.countDocuments();
    console.log(`   Orders: ${orderCount}`);
    const loyaltyCount = await UserLoyalty.countDocuments();
    console.log(`   Loyalty Accounts: ${loyaltyCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedAll();

