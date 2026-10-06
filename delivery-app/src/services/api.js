import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pantrypal_delivery_token');
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

export const deliveryAPI = {
  getAssignedOrders: () => api.get('/delivery/orders'),
  acceptOrder: (id) => api.post(`/delivery/orders/${id}/accept`),
  rejectOrder: (id) => api.post(`/delivery/orders/${id}/reject`),
  updateStatus: (id, status) => api.put(`/delivery/orders/${id}/status`, { status }),
  getEarnings: () => api.get('/delivery/earnings'),
};
