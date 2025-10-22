/*
Run: node seed/seedProducts.js
Creates sample products in the database.
*/
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../db');
const Product = require('../Models/Product');

const products = [
  { 
    name: 'Premium Cotton T-Shirt', 
    description: 'Soft, comfortable cotton t-shirt perfect for everyday wear. Available in multiple colors.', 
    price: 1200, 
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 
    category: 'Clothing', 
    stock: 25 
  },
  { 
    name: 'Running Sneakers', 
    description: 'High-quality running shoes with excellent cushioning and breathable material.', 
    price: 4500, 
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 
    category: 'Footwear', 
    stock: 15 
  },
  { 
    name: 'Genuine Leather Wallet', 
    description: 'Handcrafted leather wallet with multiple card slots and cash compartments.', 
    price: 900, 
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 
    category: 'Accessories', 
    stock: 12 
  },
  { 
    name: 'Wireless Bluetooth Headphones', 
    description: 'High-quality wireless headphones with noise cancellation and 20-hour battery life.', 
    price: 3500, 
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 
    category: 'Electronics', 
    stock: 8 
  },
  { 
    name: 'Smartphone Case', 
    description: 'Protective smartphone case with shock absorption and precise cutouts.', 
    price: 800, 
    image: 'https://images.unsplash.com/photo-1511707171631-9f3d89d4c4f0?w=500', 
    category: 'Electronics', 
    stock: 20 
  },
  { 
    name: 'Coffee Mug Set', 
    description: 'Set of 4 ceramic coffee mugs perfect for your morning brew.', 
    price: 600, 
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500', 
    category: 'Home & Kitchen', 
    stock: 30 
  },
  { 
    name: 'Yoga Mat', 
    description: 'Non-slip yoga mat with excellent grip and cushioning for all types of exercises.', 
    price: 1800, 
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500', 
    category: 'Sports', 
    stock: 18 
  },
  { 
    name: 'Backpack', 
    description: 'Durable backpack with laptop compartment and multiple pockets for daily use.', 
    price: 2200, 
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 
    category: 'Accessories', 
    stock: 14 
  }
];

(async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Seeded products');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
