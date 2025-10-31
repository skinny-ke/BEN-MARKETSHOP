const express = require('express');
const router = express.Router();
const { clerkAuth, requireAdmin } = require('../middleware/clerkAuth');
const User = require('../Models/User');
const Product = require('../Models/Product');
const Order = require('../Models/Order');

// Get analytics overview
router.get('/', clerkAuth, requireAdmin, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date(now);
    
    switch (period) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
    }

    const [totalUsers, totalProducts, totalOrders, totalsAgg, itemsAgg, topProducts, topCategories, repeatCustomers] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Product.countDocuments({ createdAt: { $gte: startDate } }),
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      // Revenue
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } }
      ]),
      // Items sold + COGS via lookup to product cost
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'p' } },
        { $unwind: '$p' },
        { $group: { _id: null, itemsSold: { $sum: '$items.quantity' }, cogs: { $sum: { $multiply: ['$items.quantity', { $ifNull: ['$p.cost', 0] }] } } } }
      ]),
      // Top products
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
        { $unwind: '$items' },
        { $group: { _id: '$items.product', qty: { $sum: '$items.quantity' } } },
        { $sort: { qty: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $project: { _id: 0, id: '$product._id', name: '$product.name', qty: 1 } }
      ]),
      // Top categories
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'p' } },
        { $unwind: '$p' },
        { $group: { _id: '$p.category', qty: { $sum: '$items.quantity' } } },
        { $sort: { qty: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, name: '$_id', qty: 1 } }
      ]),
      // Repeat customers: users with >1 paid orders
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
        { $group: { _id: '$user', orders: { $sum: 1 } } },
        { $match: { orders: { $gt: 1 } } },
        { $count: 'repeat' }
      ]),
    ]);

    const revenue = totalsAgg[0]?.revenue || 0;
    const paidOrders = totalsAgg[0]?.orders || 0;
    const itemsSold = itemsAgg[0]?.itemsSold || 0;
    const cogs = itemsAgg[0]?.cogs || 0;
    const grossProfit = Math.max(0, revenue - cogs);
    const profitMargin = revenue > 0 ? Number(((grossProfit / revenue) * 100).toFixed(2)) : 0;
    const averageOrderValue = paidOrders > 0 ? Number((revenue / paidOrders).toFixed(2)) : 0;

    res.json({
      success: true,
      data: {
        period,
        users: totalUsers,
        products: totalProducts,
        orders: totalOrders,
        revenue,
        cogs,
        grossProfit,
        profitMargin,
        itemsSold,
        averageOrderValue,
        topProducts,
        topCategories,
        repeatCustomers: repeatCustomers[0]?.repeat || 0,
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// Get sales chart data
router.get('/sales', clerkAuth, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const salesData = [];

    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const daySales = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            paymentStatus: 'paid'
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]);

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      salesData.push({
        name: dayNames[date.getDay()],
        sales: daySales[0]?.total || 0,
        orders: daySales[0]?.count || 0
      });
    }

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales data'
    });
  }
});

// Get category breakdown
router.get('/categories', clerkAuth, requireAdmin, async (req, res) => {
  try {
    const categoryData = await Order.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productDetails' } },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.category',
          count: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$productDetails.price'] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: categoryData.map(cat => ({
        name: cat._id || 'Uncategorized',
        count: cat.count,
        revenue: cat.revenue
      }))
    });
  } catch (error) {
    console.error('Error fetching category data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category data'
    });
  }
});

module.exports = router;

