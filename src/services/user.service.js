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
      // Get current user's account ID from profile data
      const profileResponse = await this.getProfile();
      const accountId = profileResponse.data.account.id;
      
      const response = await this.api.put(`${API_ENDPOINTS.UPDATE_PROFILE}`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAllUsers() {
    try {
      const response = await this.api.get(API_ENDPOINTS.USERS);
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
          message: 'Lỗi server. Vui lòng thử lại sau.'
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
        message: error.response.data.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
      };
    }

    throw {
      type: 'network',
      message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
    };
  }
}

export default new UserService(); 