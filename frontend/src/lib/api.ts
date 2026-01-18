import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we're not already on an auth page
      // This prevents redirect loops during login attempts
      const currentPath = window.location.pathname;
      const isOnAuthPage = currentPath.includes('/login') ||
                          currentPath.includes('/register') ||
                          currentPath.includes('/forgot-password') ||
                          currentPath.includes('/reset-password');

      if (!isOnAuthPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API response types
export interface APIResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

// Authentication API
export const authAPI = {
  register: (data: { email: string; first_name: string; last_name: string; password: string }) =>
    api.post<APIResponse>('/api/v1/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<APIResponse>('/api/v1/auth/login', data),

  forgotPassword: (data: { email: string }) =>
    api.post<APIResponse>('/api/v1/auth/forgot-password', data),

  resetPassword: (data: { token: string; new_password: string }) =>
    api.post<APIResponse>('/api/v1/auth/reset-password', data),

  verifyResetToken: (data: { token: string }) =>
    api.post<APIResponse>('/api/v1/auth/verify-reset-token', data),

  getCurrentUser: () =>
    api.get<APIResponse>('/api/v1/auth/me'),
};

// User types
export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}