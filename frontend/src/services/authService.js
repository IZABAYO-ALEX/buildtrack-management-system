import api from './api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
    this.refreshTimeout = null;
  }

  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        this.setSession(user, token);
        return { success: true, user };
      }
      
      return { success: false, error: response.data.message || 'Login failed' };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      const code = error.response?.data?.code;
      return { success: false, error: message, code };
    }
  }

  setSession(user, token) {
    this.user = user;
    this.token = token;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    this.setupTokenRefresh();
  }

  clearSession() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
  }

  setupTokenRefresh() {
    // Refresh token 5 minutes before expiry (7 days)
    const refreshTime = 7 * 24 * 60 * 60 * 1000 - 5 * 60 * 1000;
    this.refreshTimeout = setTimeout(async () => {
      await this.refreshToken();
    }, refreshTime);
  }

  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh-token', {
        refreshToken: this.token
      });
      
      if (response.data.success) {
        this.token = response.data.data.token;
        localStorage.setItem('token', this.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        this.setupTokenRefresh();
      }
    } catch (error) {
      console.warn('Token refresh failed:', error.message);
      this.clearSession();
    }
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  getCurrentUser() {
    return this.user;
  }

  getUserRole() {
    return this.user?.role || null;
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    }
    this.clearSession();
  }
}

export default new AuthService();
