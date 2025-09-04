import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import dataService from './dataService';

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // Increased timeout for AI processing
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add Supabase auth token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
          }
        } catch (error) {
          console.error('Error getting auth session:', error);
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
          // Token expired or invalid - redirect to login
          supabase.auth.signOut();
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

  // Ad analysis endpoints with integrated Supabase + AI processing
  async analyzeAd(adData) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check user quota before proceeding
      const quota = await dataService.checkUserQuota(user.id);
      if (!quota.canAnalyze) {
        throw new Error(`Analysis limit reached. ${quota.remaining || 0} analyses remaining this month.`);
      }

      // Create analysis record in Supabase first
      const analysis = await dataService.createAnalysis(user.id, adData.ad);
      
      // Add competitor benchmarks if provided
      if (adData.competitor_ads && adData.competitor_ads.length > 0) {
        await dataService.addCompetitorBenchmarks(analysis.id, adData.competitor_ads);
      }

      // Send to backend for AI processing
      const aiRequest = {
        analysis_id: analysis.id,
        ad: adData.ad,
        competitor_ads: adData.competitor_ads || [],
        user_id: user.id
      };

      // Call backend AI service
      const aiResponse = await this.client.post('/ads/analyze', aiRequest);
      
      // Update analysis with AI results
      if (aiResponse.scores) {
        await dataService.updateAnalysisScores(analysis.id, aiResponse.scores);
      }
      
      // Add generated alternatives if provided
      if (aiResponse.alternatives) {
        await dataService.addGeneratedAlternatives(analysis.id, aiResponse.alternatives);
      }

      return {
        analysis_id: analysis.id,
        analysis,
        scores: aiResponse.scores,
        alternatives: aiResponse.alternatives,
        feedback: aiResponse.feedback
      };
    } catch (error) {
      console.error('Error in analyzeAd:', error);
      throw error;
    }
  }

  async getAnalysisHistory(limit = 10, offset = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      return await dataService.getAnalysesHistory(user.id, limit, offset);
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      throw error;
    }
  }

  async getAnalysisDetail(analysisId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      return await dataService.getAnalysisDetail(analysisId, user.id);
    } catch (error) {
      console.error('Error fetching analysis detail:', error);
      throw error;
    }
  }

  async generateAlternatives(adData) {
    return this.client.post('/ads/generate-alternatives', adData);
  }

  // Analytics endpoints
  async getDashboardAnalytics() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      return await dataService.getDashboardAnalytics(user.id);
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
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
