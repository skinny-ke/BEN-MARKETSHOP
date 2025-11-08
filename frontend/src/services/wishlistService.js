import api from '../api/axios';

// Wishlist services
export const wishlistService = {
  // Get user's wishlist
  getWishlist: (userId) => api.get(`/api/wishlist/${userId}`),

  // Add product to wishlist
  addToWishlist: (userId, product) => api.post(`/api/wishlist/${userId}`, { product }),

  // Remove product from wishlist
  removeFromWishlist: (userId, productId) => api.delete(`/api/wishlist/${userId}/${productId}`),
};