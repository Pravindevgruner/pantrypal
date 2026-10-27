import axios from 'axios';

const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pantrypal_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createDeliveryPartner: (data) => api.post('/admin/users/delivery-partner', data),
  updateUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllExpiry: (params) => api.get('/admin/expiry/all', { params }),
  triggerExpiryScan: () => api.post('/admin/expiry/scan'),
  bulkRestock: (data) => api.post('/admin/inventory/bulk-restock', data),
  simulateOrder: () => api.post('/admin/simulate-order'),
  getReports: () => api.get('/admin/reports'),
};

export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

export const inventoryAPI = {
  getInventoryList: () => api.get('/inventory'),
  getLowStock: () => api.get('/inventory/low-stock'),
  updateStock: (id, data) => api.put(`/inventory/${id}`, data),
};

export const orderAPI = {
  getAllOrders: (params) => api.get('/orders/admin/all', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  getOrderInvoice: (id) => api.get(`/orders/${id}/invoice`),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
};
