export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export const TOKEN_KEY = 'token';
export const USER_ROLE_KEY = 'userRole';

export const API_ENDPOINTS = {
  // Public
  HEALTH_CHECK: '/api/health-check',
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',

  // Authenticated user
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',
  CHANGE_PASSWORD: '/api/auth/change-password',

  // Profile
  PROFILE: '/api/users/profile',
  UPDATE_PROFILE: '/api/users/profile',

  // Admin (manage users)
  ADMIN_USERS: '/api/admin/users', 
  ADMIN_USER_DETAIL: (id) => `/api/admin/users/${id}`, 

  // User self-update
  UPDATE_USER_BY_ID: (id) => `/api/users/${id}` 
};
