import api from './axios';

// Auth services
export const authService = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  logout: (userId) => api.post('/api/auth/logout', { userId }),
  refreshToken: (token) => api.post('/api/auth/refresh/refresh', { token }),
};

// Product services
export const productService = {
  getProducts: () => api.get('/api/products'),
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

// Upload services
export const uploadService = {
  uploadImage: (imageData) => api.post('/api/upload/image', { image: imageData }),
  getSignedUploadUrl: () => api.get('/api/upload/signed'),
};
