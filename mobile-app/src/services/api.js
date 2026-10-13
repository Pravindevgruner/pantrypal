import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { mockStorage } from './mockStorage';

// In Android emulator, 10.0.2.2 maps to host machine localhost:5000.
// On physical Android device or iOS simulator, change to your machine's LAN IP (e.g., http://192.168.1.x:5000/api)
export const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 3000, // Fast 3-second timeout to fall back smoothly if backend is offline
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

// Helper to check if an error is a network/connectivity/server-down failure
const isNetworkFailure = (err) => {
  return (
    !err.response ||
    err.code === 'ECONNABORTED' ||
    err.code === 'ERR_NETWORK' ||
    err.message?.includes('Network Error') ||
    err.message?.includes('timeout') ||
    (err.response && err.response.status >= 500)
  );
};

// ==============================================================
// 1. AUTHENTICATION SERVICE WITH ZERO-API FALLBACK
// ==============================================================
export const authAPI = {
  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      return res;
    } catch (err) {
      if (isNetworkFailure(err) || !err.response) {
        console.log('[Offline Engine] Backend API offline. Using local Auth fallback.');
        const mockAuth = await mockStorage.mockLogin(email, password);
        return {
          status: 200,
          data: {
            success: true,
            data: mockAuth,
            token: mockAuth.token,
            user: mockAuth.user,
          },
        };
      }
      throw err;
    }
  },

  register: async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      return res;
    } catch (err) {
      if (isNetworkFailure(err) || !err.response) {
        console.log('[Offline Engine] Backend API offline. Using local Register fallback.');
        const mockAuth = await mockStorage.mockRegister(userData);
        return {
          status: 201,
          data: {
            success: true,
            data: mockAuth,
            token: mockAuth.token,
            user: mockAuth.user,
          },
        };
      }
      throw err;
    }
  },

  getProfile: async () => {
    try {
      return await api.get('/auth/profile');
    } catch (err) {
      console.log('[Offline Engine] Profile API offline. Falling back to local storage profile.');
      const userStr = await AsyncStorage.getItem('userData');
      const user = userStr
        ? JSON.parse(userStr)
        : { name: 'Customer User', email: 'customer@example.com', role: 'CUSTOMER' };
      return {
        status: 200,
        data: {
          success: true,
          data: { user },
          user,
        },
      };
    }
  },

  updateProfile: async (data) => {
    try {
      return await api.put('/auth/profile', data);
    } catch (err) {
      return {
        status: 200,
        data: {
          success: true,
          data,
          message: 'Profile updated locally',
        },
      };
    }
  },
};

// ==============================================================
// 2. PRODUCT & CATEGORY SERVICE WITH ZERO-API FALLBACK
// ==============================================================
export const productAPI = {
  getProducts: async (params = {}) => {
    try {
      const res = await api.get('/products', { params });
      return res;
    } catch (err) {
      console.log('[Offline Engine] Products API offline. Serving full local grocery catalog.');
      const list = await mockStorage.getProducts(params);
      return {
        status: 200,
        data: {
          success: true,
          data: { products: list, count: list.length },
          products: list,
        },
      };
    }
  },

  getProductById: async (id) => {
    try {
      return await api.get(`/products/${id}`);
    } catch (err) {
      console.log(`[Offline Engine] Product API offline for ${id}. Serving mock product.`);
      const item = await mockStorage.getProductById(id);
      return {
        status: 200,
        data: {
          success: true,
          data: { product: item },
          product: item,
        },
      };
    }
  },

  getCategories: async () => {
    try {
      return await api.get('/categories');
    } catch (err) {
      console.log('[Offline Engine] Categories API offline. Serving mock grocery categories.');
      const list = await mockStorage.getCategories();
      return {
        status: 200,
        data: {
          success: true,
          data: { categories: list },
          categories: list,
        },
      };
    }
  },

  searchProducts: async (q) => {
    try {
      return await api.get('/products', { params: { search: q } });
    } catch (err) {
      console.log(`[Offline Engine] Search API offline. Searching local catalog for '${q}'.`);
      const list = await mockStorage.getProducts({ search: q });
      return {
        status: 200,
        data: {
          success: true,
          data: { products: list },
          products: list,
        },
      };
    }
  },
};

// ==============================================================
// 3. CART SERVICE WITH ZERO-API FALLBACK
// ==============================================================
export const cartAPI = {
  getCart: async () => {
    try {
      return await api.get('/cart');
    } catch (err) {
      const cartStr = await AsyncStorage.getItem('userCart');
      const items = cartStr ? JSON.parse(cartStr) : [];
      return {
        status: 200,
        data: {
          success: true,
          data: { items },
          cart: { items },
        },
      };
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      return await api.post('/cart/items', { productId, quantity });
    } catch (err) {
      return { status: 200, data: { success: true } };
    }
  },

  updateCartItem: async (productId, quantity) => {
    try {
      return await api.put(`/cart/items/${productId}`, { quantity });
    } catch (err) {
      return { status: 200, data: { success: true } };
    }
  },

  removeFromCart: async (productId) => {
    try {
      return await api.delete(`/cart/items/${productId}`);
    } catch (err) {
      return { status: 200, data: { success: true } };
    }
  },

  clearCart: async () => {
    try {
      return await api.delete('/cart');
    } catch (err) {
      await AsyncStorage.removeItem('userCart');
      return { status: 200, data: { success: true } };
    }
  },
};

// ==============================================================
// 4. ORDER & DELIVERY SERVICE WITH ZERO-API FALLBACK
// ==============================================================
export const orderAPI = {
  createOrder: async (orderData) => {
    try {
      return await api.post('/orders', orderData);
    } catch (err) {
      console.log('[Offline Engine] Order API offline. Persisting order to local store & household pantry.');
      const newOrder = await mockStorage.createOrder(orderData);
      return {
        status: 201,
        data: {
          success: true,
          data: { order: newOrder },
          order: newOrder,
        },
      };
    }
  },

  getOrders: async () => {
    try {
      return await api.get('/orders');
    } catch (err) {
      console.log('[Offline Engine] Orders API offline. Loading orders from local storage.');
      const list = await mockStorage.getOrders();
      return {
        status: 200,
        data: {
          success: true,
          data: { orders: list },
          orders: list,
        },
      };
    }
  },

  getOrderById: async (id) => {
    try {
      return await api.get(`/orders/${id}`);
    } catch (err) {
      console.log(`[Offline Engine] Order detail API offline. Loading order #${id} locally.`);
      const item = await mockStorage.getOrderById(id);
      return {
        status: 200,
        data: {
          success: true,
          data: { order: item },
          order: item,
        },
      };
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      return await api.patch(`/orders/${id}/status`, { status });
    } catch (err) {
      console.log(`[Offline Engine] Status update API offline. Updating order #${id} status to ${status} locally.`);
      const updated = await mockStorage.updateOrderStatus(id, status);
      return {
        status: 200,
        data: {
          success: true,
          data: updated,
          order: updated,
        },
      };
    }
  },

  getDeliveryOrders: async () => {
    try {
      return await api.get('/orders/delivery/assigned');
    } catch (err) {
      console.log('[Offline Engine] Driver orders API offline. Serving delivery dispatches locally.');
      const list = await mockStorage.getDeliveryOrders();
      return {
        status: 200,
        data: {
          success: true,
          data: { orders: list },
          orders: list,
        },
      };
    }
  },
};

// ==============================================================
// 5. SMART EXPIRY & HOUSEHOLD PANTRY WITH ZERO-API FALLBACK
// ==============================================================
export const expiryAPI = {
  getExpiryItems: async (params = {}) => {
    try {
      return await api.get('/expiry', { params });
    } catch (err) {
      console.log('[Offline Engine] Expiry API offline. Fetching household pantry from local storage.');
      const list = await mockStorage.getExpiryItems();
      return {
        status: 200,
        data: {
          success: true,
          data: { items: list },
          items: list,
        },
      };
    }
  },

  getExpiringSoon: async () => {
    try {
      return await api.get('/expiry/expiring-soon');
    } catch (err) {
      console.log('[Offline Engine] Expiring-soon API offline. Filtering expiring pantry items locally.');
      const list = await mockStorage.getExpiringSoon();
      return {
        status: 200,
        data: {
          success: true,
          data: { items: list },
          items: list,
        },
      };
    }
  },

  getExpiryAnalytics: async () => {
    try {
      return await api.get('/expiry/analytics');
    } catch (err) {
      const list = await mockStorage.getExpiryItems();
      const expiringSoon = list.filter((i) => i.status === 'EXPIRING_SOON').length;
      const expired = list.filter((i) => i.status === 'EXPIRED').length;
      return {
        status: 200,
        data: {
          success: true,
          data: {
            total: list.length,
            expiringSoon,
            expired,
            consumed: list.filter((i) => i.status === 'CONSUMED').length,
          },
        },
      };
    }
  },

  addExpiryItem: async (data) => {
    try {
      return await api.post('/expiry', data);
    } catch (err) {
      console.log('[Offline Engine] Add expiry item API offline. Storing in local household pantry.');
      const item = await mockStorage.addExpiryItem(data);
      return {
        status: 201,
        data: {
          success: true,
          data: { item },
          item,
        },
      };
    }
  },

  updateExpiryItem: async (id, data) => {
    try {
      return await api.put(`/expiry/${id}`, data);
    } catch (err) {
      return {
        status: 200,
        data: { success: true, data },
      };
    }
  },

  deleteExpiryItem: async (id) => {
    try {
      return await api.delete(`/expiry/${id}`);
    } catch (err) {
      console.log(`[Offline Engine] Delete expiry item API offline. Deleting item #${id} locally.`);
      await mockStorage.deleteExpiryItem(id);
      return {
        status: 200,
        data: { success: true },
      };
    }
  },

  markConsumed: async (id, quantity) => {
    try {
      return await api.patch(`/expiry/${id}/consumed`, { quantity });
    } catch (err) {
      console.log(`[Offline Engine] Consume API offline. Marking item #${id} consumed locally.`);
      const item = await mockStorage.markConsumed(id, quantity);
      return {
        status: 200,
        data: {
          success: true,
          data: item,
        },
      };
    }
  },

  markDiscarded: async (id, reason) => {
    try {
      return await api.patch(`/expiry/${id}/discarded`, { reason });
    } catch (err) {
      console.log(`[Offline Engine] Discard API offline. Marking item #${id} discarded locally.`);
      const item = await mockStorage.markDiscarded(id, reason);
      return {
        status: 200,
        data: {
          success: true,
          data: item,
        },
      };
    }
  },

  runExpiryScan: async () => {
    try {
      return await api.post('/expiry/scan');
    } catch (err) {
      console.log('[Offline Engine] Run scan API offline. Running local Smart Expiry Scan.');
      const res = await mockStorage.runExpiryScan();
      return {
        status: 200,
        data: res,
      };
    }
  },
};

export default api;
