import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with optimized settings
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 15000, // Increased from 10s to 15s for Vercel cold starts
  headers: {
    'Content-Type': 'application/json',
  }
});

// For production (relative URLs), use window.location.origin
if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_API_URL) {
  api.defaults.baseURL = '/api';
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add token from localStorage to Authorization header
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Redirect to login if not already on login page
      if (!window.location.pathname.includes('/admin')) {
        window.location.href = '/admin/login';
      }
    }

    if (error.response?.status === 429) {
      toast.error('Too many requests. Please try again later.');
    }

    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  checkAuth: () => api.get('/auth/check'),
  getCurrentAdmin: () => api.get('/auth/me'),
};

// Products API
export const productsAPI = {
  // Public endpoints
  getProducts: (params = {}) => api.get('/products', { params }),
  getFeaturedProducts: (limit = 8) => api.get('/products/featured', { params: { limit } }),
  getLatestProducts: (limit = 12) => api.get('/products/latest', { params: { limit } }),
  getProduct: (identifier) => api.get(`/products/${identifier}`),
  getCategories: () => api.get('/products/meta/categories'),
  getTags: () => api.get('/products/meta/tags'),
  getNetworks: () => api.get('/products/meta/networks'),
  searchProducts: (params) => api.post('/products/search', params),
  
  // Admin endpoints
  getAllProductsAdmin: (params = {}) => api.get('/products/admin/all', { params }),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// Tracking API
export const trackingAPI = {
  trackClick: (data) => api.post('/track/click', data),
  trackConversion: (data) => api.post('/track/conversion', data),
};

// Admin API
export const adminAPI = {
  // Metrics and Analytics
  getMetrics: (params = {}) => api.get('/admin/metrics', { params }),
  getProductPerformance: (id) => api.get(`/admin/products/${id}/performance`),
  getProfile: () => api.get('/admin/profile'),
  getStats: () => api.get('/admin/stats'),
  
  // Product Management
  getProducts: (params = {}) => api.get('/admin/products', { params }),
  createProduct: (productData) => api.post('/admin/products', productData),
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  bulkDeleteProducts: (ids) => api.post('/admin/products/bulk-delete', { ids }),
  
  // Filter Options
  getProductCategories: () => api.get('/admin/categories'),
  getProductNetworks: () => api.get('/admin/networks'),
  
  // Export/Import
  exportProducts: () => api.get('/admin/products/export', { responseType: 'blob' }),
  importProducts: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response?.data?.error) {
    const { code, message, details } = error.response.data.error;
    return { code, message, details };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'An unexpected error occurred',
    details: null
  };
};

export const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (Array.isArray(data[key])) {
      data[key].forEach(item => formData.append(key, item));
    } else if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  
  return formData;
};

export default api;