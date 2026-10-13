import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// In Android emulator, 10.0.2.2 maps to host machine localhost:5000.
// On physical Android device or iOS simulator, change to your machine's LAN IP (e.g., http://192.168.1.x:5000/api)
export const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to read token from AsyncStorage', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const productAPI = {
  getProducts: (params = {}) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/categories'),
  searchProducts: (q) => api.get('/products', { params: { search: q } }),
};

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1) => api.post('/cart/items', { productId, quantity }),
  updateCartItem: (productId, quantity) => api.put(`/cart/items/${productId}`, { quantity }),
  removeFromCart: (productId) => api.delete(`/cart/items/${productId}`),
  clearCart: () => api.delete('/cart'),
};

export const orderAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getDeliveryOrders: () => api.get('/orders/delivery/assigned'),
};

export const expiryAPI = {
  getExpiryItems: (params = {}) => api.get('/expiry', { params }),
  getExpiringSoon: () => api.get('/expiry/expiring-soon'),
  getExpiryAnalytics: () => api.get('/expiry/analytics'),
  addExpiryItem: (data) => api.post('/expiry', data),
  updateExpiryItem: (id, data) => api.put(`/expiry/${id}`, data),
  deleteExpiryItem: (id) => api.delete(`/expiry/${id}`),
  markConsumed: (id, quantity) => api.patch(`/expiry/${id}/consumed`, { quantity }),
  markDiscarded: (id, reason) => api.patch(`/expiry/${id}/discarded`, { reason }),
  runExpiryScan: () => api.post('/expiry/scan'),
};

export default api;
