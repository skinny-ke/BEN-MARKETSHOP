const { PostHog } = require('posthog-node');
require('dotenv').config();

const posthog = new PostHog(process.env.POSTHOG_KEY, {
  host: process.env.POSTHOG_HOST || 'https://app.posthog.com'
});

// Track user events
const trackEvent = (userId, event, properties = {}) => {
  try {
    posthog.capture({
      distinctId: userId,
      event: event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString()
      }
    });
    console.log(`Analytics event tracked: ${event} for user ${userId}`);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Track user signup
const trackUserSignup = (userId, userData) => {
  trackEvent(userId, 'user_signed_up', {
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    signupMethod: 'clerk'
  });
};

// Track user login
const trackUserLogin = (userId, userData) => {
  trackEvent(userId, 'user_logged_in', {
    email: userData.email,
    loginMethod: 'clerk'
  });
};

// Track product view
const trackProductView = (userId, productId, productData) => {
  trackEvent(userId, 'product_viewed', {
    productId: productId,
    productName: productData.name,
    productCategory: productData.category,
    productPrice: productData.price
  });
};

// Track add to cart
const trackAddToCart = (userId, productId, productData, quantity = 1) => {
  trackEvent(userId, 'product_added_to_cart', {
    productId: productId,
    productName: productData.name,
    productCategory: productData.category,
    productPrice: productData.price,
    quantity: quantity,
    totalValue: productData.price * quantity
  });
};

// Track remove from cart
const trackRemoveFromCart = (userId, productId, productData) => {
  trackEvent(userId, 'product_removed_from_cart', {
    productId: productId,
    productName: productData.name,
    productCategory: productData.category,
    productPrice: productData.price
  });
};

// Track checkout started
const trackCheckoutStarted = (userId, cartData) => {
  const totalValue = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cartData.reduce((sum, item) => sum + item.quantity, 0);
  
  trackEvent(userId, 'checkout_started', {
    totalValue: totalValue,
    itemCount: itemCount,
    cartItems: cartData.map(item => ({
      productId: item._id,
      productName: item.name,
      quantity: item.quantity,
      price: item.price
    }))
  });
};

// Track payment initiated
const trackPaymentInitiated = (userId, orderId, amount, paymentMethod = 'mpesa') => {
  trackEvent(userId, 'payment_initiated', {
    orderId: orderId,
    amount: amount,
    paymentMethod: paymentMethod,
    currency: 'KES'
  });
};

// Track payment completed
const trackPaymentCompleted = (userId, orderId, amount, paymentMethod = 'mpesa') => {
  trackEvent(userId, 'payment_completed', {
    orderId: orderId,
    amount: amount,
    paymentMethod: paymentMethod,
    currency: 'KES'
  });
};

// Track order completed
const trackOrderCompleted = (userId, orderId, orderData) => {
  trackEvent(userId, 'order_completed', {
    orderId: orderId,
    totalAmount: orderData.totalAmount,
    itemCount: orderData.items.length,
    paymentMethod: orderData.paymentMethod || 'mpesa',
    currency: 'KES'
  });
};

// Track search
const trackSearch = (userId, searchQuery, resultsCount) => {
  trackEvent(userId, 'search_performed', {
    searchQuery: searchQuery,
    resultsCount: resultsCount
  });
};

// Track wishlist add
const trackWishlistAdd = (userId, productId, productData) => {
  trackEvent(userId, 'product_added_to_wishlist', {
    productId: productId,
    productName: productData.name,
    productCategory: productData.category,
    productPrice: productData.price
  });
};

// Track wishlist remove
const trackWishlistRemove = (userId, productId, productData) => {
  trackEvent(userId, 'product_removed_from_wishlist', {
    productId: productId,
    productName: productData.name,
    productCategory: productData.category,
    productPrice: productData.price
  });
};

// Track page view
const trackPageView = (userId, pageName, properties = {}) => {
  trackEvent(userId, 'page_viewed', {
    pageName: pageName,
    ...properties
  });
};

// Identify user (set user properties)
const identifyUser = (userId, userProperties) => {
  try {
    posthog.identify({
      distinctId: userId,
      properties: {
        ...userProperties,
        lastSeen: new Date().toISOString()
      }
    });
    console.log(`User identified: ${userId}`);
  } catch (error) {
    console.error('User identification error:', error);
  }
};

// Set user properties
const setUserProperties = (userId, properties) => {
  try {
    posthog.setPersonProperties({
      distinctId: userId,
      properties: properties
    });
    console.log(`User properties set for: ${userId}`);
  } catch (error) {
    console.error('Set user properties error:', error);
  }
};

// Database analytics functions
const Order = require('../Models/Order');
const Product = require('../Models/Product');
const User = require('../Models/User');

// Get comprehensive analytics data
const getAnalyticsData = async () => {
  try {
    // Basic metrics
    const [totalOrders, totalRevenue, totalProducts, totalUsers] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Product.countDocuments(),
      User.countDocuments({ isActive: true })
    ]);

    // Revenue breakdown
    const revenueData = totalRevenue[0]?.total || 0;

    // Monthly sales trend (last 12 months)
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          totalSold: 1,
          totalRevenue: 1,
          category: '$product.category'
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Low stock products
    const lowStockProducts = await Product.find({
      stock: { $lte: 10, $gt: 0 }
    }).select('name stock category price').sort({ stock: 1 });

    // Out of stock products
    const outOfStockProducts = await Product.find({
      stock: 0
    }).select('name category price');

    // Order status distribution
    const orderStatusStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Payment method distribution
    const paymentMethodStats = await Order.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Profit/Loss calculation (assuming cost is stored in products)
    const profitLossData = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          totalCost: { $sum: { $multiply: ['$items.quantity', { $ifNull: ['$product.cost', 0] }] } }
        }
      }
    ]);

    const profitData = profitLossData[0] || { totalRevenue: 0, totalCost: 0 };
    const netProfit = profitData.totalRevenue - profitData.totalCost;
    const profitMargin = profitData.totalRevenue > 0 ? (netProfit / profitData.totalRevenue) * 100 : 0;

    return {
      overview: {
        totalOrders,
        totalRevenue: revenueData,
        totalProducts,
        totalUsers,
        averageOrderValue: totalOrders > 0 ? revenueData / totalOrders : 0
      },
      sales: {
        monthly: monthlySales,
        topProducts,
        statusDistribution: orderStatusStats,
        paymentMethods: paymentMethodStats
      },
      inventory: {
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts
      },
      financial: {
        totalRevenue: profitData.totalRevenue,
        totalCost: profitData.totalCost,
        netProfit,
        profitMargin
      }
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

// Get product recommendations based on user behavior
const getProductRecommendations = async (userId, limit = 5) => {
  try {
    // Get user's order history
    const userOrders = await Order.find({ user: userId })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(10);

    // Extract categories and products user has bought
    const userCategories = new Set();
    const userProducts = new Set();

    userOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.product) {
          userCategories.add(item.product.category);
          userProducts.add(item.product._id.toString());
        }
      });
    });

    // Find products in same categories that user hasn't bought
    const recommendations = await Product.find({
      category: { $in: Array.from(userCategories) },
      _id: { $nin: Array.from(userProducts) },
      stock: { $gt: 0 }
    })
    .select('name price image category stock')
    .limit(limit);

    return recommendations;
  } catch (error) {
    console.error('Error getting product recommendations:', error);
    return [];
  }
};

module.exports = {
  trackEvent,
  trackUserSignup,
  trackUserLogin,
  trackProductView,
  trackAddToCart,
  trackRemoveFromCart,
  trackCheckoutStarted,
  trackPaymentInitiated,
  trackPaymentCompleted,
  trackOrderCompleted,
  trackSearch,
  trackWishlistAdd,
  trackWishlistRemove,
  trackPageView,
  identifyUser,
  setUserProperties,
  getAnalyticsData,
  getProductRecommendations
};
