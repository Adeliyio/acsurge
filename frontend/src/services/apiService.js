import axios from 'axios';

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          this.clearAuthToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  // Auth endpoints
  async login(email, password) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    return this.client.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async register(userData) {
    return this.client.post('/auth/register', userData);
  }

  async getCurrentUser() {
    return this.client.get('/auth/me');
  }

  // Ad analysis endpoints
  async analyzeAd(adData) {
    return this.client.post('/ads/analyze', adData);
  }

  async getAnalysisHistory(limit = 10, offset = 0) {
    return this.client.get(`/ads/history?limit=${limit}&offset=${offset}`);
  }

  async getAnalysisDetail(analysisId) {
    return this.client.get(`/ads/analysis/${analysisId}`);
  }

  async generateAlternatives(adData) {
    return this.client.post('/ads/generate-alternatives', adData);
  }

  // Analytics endpoints
  async getDashboardAnalytics() {
    return this.client.get('/analytics/dashboard');
  }

  async exportAnalyticsPDF(analysisIds) {
    return this.client.get('/analytics/export/pdf', {
      params: { analysis_ids: analysisIds }
    });
  }

  // Subscription endpoints
  async getSubscriptionPlans() {
    return this.client.get('/subscriptions/plans');
  }

  async getCurrentSubscription() {
    return this.client.get('/subscriptions/current');
  }

  async upgradeSubscription(subscriptionData) {
    return this.client.post('/subscriptions/upgrade', subscriptionData);
  }

  async cancelSubscription() {
    return this.client.post('/subscriptions/cancel');
  }
}

const apiService = new ApiService();
export default apiService;
