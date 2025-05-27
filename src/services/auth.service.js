import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL, TOKEN_KEY, USER_ROLE_KEY, API_ENDPOINTS } from '../config/api.config';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        const isPublic =
          config.url.includes(API_ENDPOINTS.LOGIN) ||
          config.url.includes(API_ENDPOINTS.REGISTER) ||
          config.url.includes(API_ENDPOINTS.FORGOT_PASSWORD) ||
          config.url.includes(API_ENDPOINTS.RESET_PASSWORD);

        if (token && !isPublic) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async login(email, password) {
    try {
      const response = await this.api.post(API_ENDPOINTS.LOGIN, {
        email,
        password
      });


      if (response.data.status === 'success' && response.data.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.data.token);
        localStorage.setItem(USER_ROLE_KEY, response.data.data.account.role.name);
        return response.data;
      }

      throw new Error('Login failed');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData) {
    try {
      const response = await this.api.post(API_ENDPOINTS.REGISTER, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await this.api.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_ROLE_KEY);
    }
  }

  async refreshToken() {
    try {
      const response = await this.api.post(API_ENDPOINTS.REFRESH);
      if (response.data.status === 'success') {
        const { token } = response.data.data;
        localStorage.setItem(TOKEN_KEY, token);
        return token;
      }
      throw new Error('Failed to refresh token');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  getCurrentUser() {
    return {
      token: localStorage.getItem(TOKEN_KEY),
      role: localStorage.getItem(USER_ROLE_KEY)
    };
  }

  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  isAdmin() {
    return localStorage.getItem(USER_ROLE_KEY) === 'admin';
  }

  handleError(error) {
    if (error.response) {
      // Server error (4xx, 5xx)
      if (error.response.status >= 500) {
        throw {
          type: 'server',
          message: 'Server error. Please try again later.'
        };
      }

      // Validation error (422) or other client errors
      if (error.response.status === 422) {
        const errors = error.response.data.errors || {};
        const firstError = Object.values(errors)[0];
        throw {
          type: 'validation',
          message: Array.isArray(firstError) ? firstError[0] : firstError
        };
      }

      // Other client errors (400, 401, 403, 404, etc.)
      throw {
        type: 'client',
        message: error.response.data.message || 'An error occurred. Please try again.'
      };
    }

    // Network error
    throw {
      type: 'network',
      message: 'Unable to connect to the server. Please check your internet connection.'
    };
  }
}

export default new AuthService();