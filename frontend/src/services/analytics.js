import posthog from 'posthog-js';

// Initialize PostHog
export const initAnalytics = () => {
  if (typeof window !== 'undefined' && process.env.VITE_POSTHOG_KEY) {
    posthog.init(process.env.VITE_POSTHOG_KEY, {
      api_host: process.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // We'll handle this manually
      capture_pageleave: true,
    });
  }
};

// Track page views
export const trackPageView = (pageName, properties = {}) => {
  if (typeof window !== 'undefined') {
    posthog.capture('$pageview', {
      page: pageName,
      ...properties
    });
  }
};

// Track user events
export const trackEvent = (eventName, properties = {}) => {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString()
    });
  }
};

// Identify user
export const identifyUser = (userId, userProperties = {}) => {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, userProperties);
  }
};

// Set user properties
export const setUserProperties = (properties) => {
  if (typeof window !== 'undefined') {
    posthog.setPersonProperties(properties);
  }
};

// Track user signup
export const trackUserSignup = (userData) => {
  trackEvent('user_signed_up', {
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    signupMethod: 'clerk'
  });
};

// Track user login
export const trackUserLogin = (userData) => {
  trackEvent('user_logged_in', {
    email: userData.email,
    loginMethod: 'clerk'
  });
};

// Track product view
export const trackProductView = (productId, productData) => {
  trackEvent('product_viewed', {
    productId: productId,
    productName: productData.name,
    productCategory: productData.category,
    productPrice: productData.price
  });
};

// Track add to cart
export const trackAddToCart = (productId, productData, quantity = 1) => {
  trackEvent('product_added_to_cart', {
    productId: productId,
    productName: productData.name,
    productCategory: productData.category,
    productPrice: productData.price,
    quantity: quantity,
    totalValue: productData.price * quantity
  });
};

// Track remove from cart
export const trackRemoveFromCart = (productId, productData) => {
  trackEvent('product_removed_from_cart', {
    productId: productId,
    productName: productData.name,
    productCategory: productData.category,
    productPrice: productData.price
  });
};

// Track checkout started
export const trackCheckoutStarted = (cartData) => {
  const totalValue = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cartData.reduce((sum, item) => sum + item.quantity, 0);
  
  trackEvent('checkout_started', {
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
export const trackPaymentInitiated = (orderId, amount, paymentMethod = 'mpesa') => {
  trackEvent('payment_initiated', {
    orderId: orderId,
    amount: amount,
    paymentMethod: paymentMethod,
    currency: 'KES'
  });
};

// Track payment completed
export const trackPaymentCompleted = (orderId, amount, paymentMethod = 'mpesa') => {
  trackEvent('payment_completed', {
    orderId: orderId,
    amount: amount,
    paymentMethod: paymentMethod,
    currency: 'KES'
  });
};

// Track order completed
export const trackOrderCompleted = (orderId, orderData) => {
  trackEvent('order_completed', {
    orderId: orderId,
    totalAmount: orderData.totalAmount,
    itemCount: orderData.items.length,
    paymentMethod: orderData.paymentMethod || 'mpesa',
    currency: 'KES'
  });
};

// Track search
export const trackSearch = (searchQuery, resultsCount) => {
  trackEvent('search_performed', {
    searchQuery: searchQuery,
    resultsCount: resultsCount
  });
};

// Track wishlist add
export const trackWishlistAdd = (productId, productData) => {
  trackEvent('product_added_to_wishlist', {
    productId: productId,
    productName: productData.name,
    productCategory: productData.category,
    productPrice: productData.price
  });
};

// Track wishlist remove
export const trackWishlistRemove = (productId, productData) => {
  trackEvent('product_removed_from_wishlist', {
    productId: productId,
    productName: productData.name,
    productCategory: productData.category,
    productPrice: productData.price
  });
};

// Track button clicks
export const trackButtonClick = (buttonName, properties = {}) => {
  trackEvent('button_clicked', {
    buttonName: buttonName,
    ...properties
  });
};

// Track form submissions
export const trackFormSubmission = (formName, properties = {}) => {
  trackEvent('form_submitted', {
    formName: formName,
    ...properties
  });
};

// Track errors
export const trackError = (errorMessage, properties = {}) => {
  trackEvent('error_occurred', {
    errorMessage: errorMessage,
    ...properties
  });
};

export default {
  initAnalytics,
  trackPageView,
  trackEvent,
  identifyUser,
  setUserProperties,
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
  trackButtonClick,
  trackFormSubmission,
  trackError
};
