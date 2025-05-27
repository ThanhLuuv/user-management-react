import axios from 'axios';
import { API_URL, TOKEN_KEY, API_ENDPOINTS } from '../config/api.config';

class UserService {
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
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async getProfile() {
    try {
      const response = await this.api.get(API_ENDPOINTS.PROFILE);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(userData) {
    try {
      const response = await this.api.put(`${API_ENDPOINTS.UPDATE_PROFILE}`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUser(id, data) {
    try {
      console.log(`${API_ENDPOINTS.UPDATE_USER_BY_ID}/${id}`);
      console.log(data);
      const response = await this.api.put(`${API_ENDPOINTS.UPDATE_USER_BY_ID(id)}`, data);
      console.log(response);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAllUsers() {
    try {
      const response = await this.api.get(API_ENDPOINTS.ADMIN_USERS);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteUser(userId) {
    try {
      const response = await this.api.delete(`${API_ENDPOINTS.USERS}/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      if (error.response.status >= 500) {
        throw {
          type: 'server',
          message: 'Server error. Please try again later.'
        };
      }

      if (error.response.status === 422) {
        const errors = error.response.data.errors || {};
        const firstError = Object.values(errors)[0];
        throw {
          type: 'validation',
          message: Array.isArray(firstError) ? firstError[0] : firstError
        };
      }

      throw {
        type: 'client',
        message: error.response.data.message || 'An error occurred. Please try again.'
      };
    }

    throw {
      type: 'network',
      message: 'Unable to connect to the server. Please check your internet connection.'
    };
  }
}

export default new UserService();