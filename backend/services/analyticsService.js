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
  setUserProperties
};
