import api from './axios';

// Auth services - Clerk handles authentication, these are for profile management
export const authService = {
  getProfile: () => api.get('/api/users/profile'),
  logout: () => api.post('/api/auth/logout'),
};

// Product services
export const productService = {
  getProducts: async () => {
    const res = await api.get('/api/products');
    // Backend returns { success, count, data: [...] }
    return Array.isArray(res.data) ? res.data : (res.data?.data || []);
  },
  getProduct: (id) => api.get(`/api/products/${id}`),
  createProduct: (productData) => api.post('/api/products', productData),
  updateProduct: (id, productData) => api.put(`/api/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/api/products/${id}`),
};

// Order services
export const orderService = {
  createOrder: (orderData) => api.post('/api/orders', orderData),
  getOrder: (id) => api.get(`/api/orders/${id}`),
  updateOrderStatus: (orderId, status) => api.post('/api/payment/order/status', { orderId, status }),
};

// M-Pesa services
export const mpesaService = {
  stkPush: (paymentData) => api.post('/api/mpesa/stkpush', paymentData),
};

// Wishlist services - now uses Clerk userId
export const wishlistService = {
  getWishlist: () => api.get('/api/wishlist'),
  addToWishlist: (productId) => api.post('/api/wishlist', { productId }),
  removeFromWishlist: (productId) => api.delete(`/api/wishlist/${productId}`),
};

// Upload services
export const uploadService = {
  uploadImage: (imageData) => api.post('/api/upload/image', { image: imageData }),
  getSignedUploadUrl: () => api.get('/api/upload/signed'),
};
