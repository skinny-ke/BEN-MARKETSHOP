# 🌱 Seed Data Guide

## Overview

This guide explains how to seed your BenMarket database with test data for comprehensive testing.

## Available Seed Scripts

### 1. Basic Seed (`npm run seed`)
Creates minimal test data:
- Admin user (if needed)
- 8 sample products
- Loyalty program setup
- Basic inventory data

**Usage:**
```bash
cd backend
npm run seed
```

### 2. Enhanced Seed (`npm run seed:enhanced`) ⭐ **RECOMMENDED**
Creates comprehensive test data for full testing:
- **100+ products** across 12 categories:
  - Electronics
  - Clothing
  - Footwear
  - Accessories
  - Home & Kitchen
  - Sports
  - Books
  - Toys
  - Beauty
  - Health
  - Automotive
  - Garden
- **50-100 sample orders** (if users exist)
- **Loyalty points** awarded for existing orders
- **Loyalty program** setup with tiers

**Usage:**
```bash
cd backend
npm run seed:enhanced
```

## What Gets Created

### Products (Enhanced Seed)
- **100+ products** with:
  - Realistic names and descriptions
  - Prices ranging from KSh 500 to KSh 10,500
  - Stock levels (5-105 units)
  - Categories and brands
  - SKU codes
  - Weight and dimensions
  - Featured products (every 10th)
  - Sale products (every 15th)

### Orders (Enhanced Seed)
- **50-100 orders** with:
  - Random users (from existing users)
  - 1-5 items per order
  - Various statuses (pending, processing, shipped, delivered, cancelled)
  - Payment statuses (pending, paid, failed)
  - Payment methods (M-Pesa, COD, Card)
  - Random dates within last 90 days
  - Shipping addresses

### Loyalty Points
- Points automatically awarded for:
  - Completed orders (paid orders)
  - Registration (100 points welcome bonus)
  - Reviews (50 points per review)
  - Referrals (200 points per referral)

## Important Notes

1. **Users**: The seed script does NOT create users. Users are created automatically when they sign up through Clerk authentication.

2. **Orders**: Orders are only created if users exist in the database. If you have no users, the seed will skip order creation.

3. **Loyalty Points**: Points are automatically awarded for existing paid orders when you run the enhanced seed.

4. **Data Clearing**: The enhanced seed script clears existing products and orders. It does NOT delete users (to preserve real Clerk-authenticated users).

## Testing Checklist

After running the enhanced seed, you can test:

- ✅ **Product Management**
  - View 100+ products in admin dashboard
  - Filter by category
  - Search products
  - Update products
  - Delete products

- ✅ **Order Management**
  - View 50-100 orders in admin dashboard
  - Filter by status
  - View order details
  - Update order status

- ✅ **Loyalty Dashboard**
  - View loyalty points
  - See current tier
  - View tier benefits
  - Redeem points
  - View transaction history

- ✅ **Analytics**
  - View sales charts
  - See revenue statistics
  - Check user analytics
  - View product analytics

- ✅ **User Management**
  - View all users
  - Update user roles
  - Activate/deactivate users

## Troubleshooting

### No Orders Created
**Issue**: Enhanced seed shows 0 orders
**Solution**: Make sure you have users in the database. Users are created when they sign up through Clerk.

### No Loyalty Points
**Issue**: Loyalty dashboard shows 0 points
**Solution**: 
1. Make sure you've run the enhanced seed
2. Check if you have paid orders
3. Points are only awarded for orders with `paymentStatus: 'paid'`

### Products Not Showing
**Issue**: Products don't appear after seeding
**Solution**:
1. Check MongoDB connection
2. Verify seed script completed successfully
3. Check browser console for API errors
4. Refresh the page

## Running Seeds Multiple Times

- **Basic seed**: Can be run multiple times safely
- **Enhanced seed**: Clears existing products and orders each time, so you can re-run it to refresh test data

## Next Steps

After seeding:
1. Start your backend: `cd backend && npm run dev`
2. Start your frontend: `cd frontend && npm run dev`
3. Sign up/login through Clerk
4. Browse products, create orders, and test all features!

---

**Happy Testing! 🚀**

