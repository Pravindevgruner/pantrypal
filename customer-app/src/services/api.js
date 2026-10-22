import axios from 'axios';

const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pantrypal_customer_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
};

export const categoryAPI = {
  getCategories: () => api.get('/categories'),
};

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateQuantity: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart/clear'),
};

export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId) => api.post('/wishlist', { productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
};

export const addressAPI = {
  getAddresses: () => api.get('/addresses'),
  createAddress: (data) => api.post('/addresses', data),
  updateAddress: (id, data) => api.put(`/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
};

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  getInvoice: (id) => api.get(`/orders/${id}/invoice`),
};

export const paymentAPI = {
  createPaymentOrder: (data) => api.post('/payments/create', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
};

export const expiryAPI = {
  getExpiryItems: (params) => api.get('/expiry', { params }),
  addExpiryItem: (data) => api.post('/expiry', data),
  updateExpiryItem: (id, data) => api.put(`/expiry/${id}`, data),
  deleteExpiryItem: (id) => api.delete(`/expiry/${id}`),
  getFresh: () => api.get('/expiry/fresh'),
  getExpiringSoon: () => api.get('/expiry/expiring-soon'),
  getExpired: () => api.get('/expiry/expired'),
  getInsights: () => api.get('/expiry/insights'),
  consumeItem: (id, quantity) => api.put(`/expiry/${id}/consume`, { quantity }),
  discardItem: (id, quantity) => api.put(`/expiry/${id}/discard`, { quantity }),
  runCheck: () => api.post('/expiry/run-check'),
};
