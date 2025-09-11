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

  // HTTP method shortcuts
  async get(url) {
    return this.client.get(url);
  }

  async post(url, data) {
    return this.client.post(url, data);
  }

  async put(url, data) {
    return this.client.put(url, data);
  }

  async delete(url) {
    return this.client.delete(url);
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
  /**
   * @deprecated Use sharedWorkflowService.startAdhocAnalysis() instead.
   * This method is maintained for backward compatibility only.
   * 
   * Legacy single-analysis method. Defaults to compliance-only analysis
   * if no enabledTools are specified.
   */
  async analyzeAd(adData, enabledTools = null) {
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

  // === NEW AI-POWERED TOOLS ===
  
  // 1. Platform Compliance Checker
  async checkCompliance(data) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Check user quota
      const quota = await dataService.checkUserQuota(user.id);
      if (!quota.canAnalyze) {
        throw new Error(`Analysis limit reached. ${quota.remaining || 0} analyses remaining.`);
      }
      
      return this.client.post('/tools/compliance-checker', {
        ...data,
        user_id: user.id
      });
    } catch (error) {
      console.error('Error in checkCompliance:', error);
      throw error;
    }
  }
  
  // 2. ROI-Driven Copy Generator
  async generateROICopy(data) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const quota = await dataService.checkUserQuota(user.id);
      if (!quota.canAnalyze) {
        throw new Error(`Generation limit reached. ${quota.remaining || 0} generations remaining.`);
      }
      
      return this.client.post('/tools/roi-generator', {
        ...data,
        user_id: user.id
      });
    } catch (error) {
      console.error('Error in generateROICopy:', error);
      throw error;
    }
  }
  
  // 3. A/B Test Generator
  async generateABTests(data) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const quota = await dataService.checkUserQuota(user.id);
      if (!quota.canAnalyze) {
        throw new Error(`Generation limit reached. ${quota.remaining || 0} generations remaining.`);
      }
      
      return this.client.post('/tools/ab-test-generator', {
        ...data,
        user_id: user.id
      });
    } catch (error) {
      console.error('Error in generateABTests:', error);
      throw error;
    }
  }
  
  // 4. Industry-Specific Optimizer
  async optimizeForIndustry(data) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const quota = await dataService.checkUserQuota(user.id);
      if (!quota.canAnalyze) {
        throw new Error(`Optimization limit reached. ${quota.remaining || 0} optimizations remaining.`);
      }
      
      return this.client.post('/tools/industry-optimizer', {
        ...data,
        user_id: user.id
      });
    } catch (error) {
      console.error('Error in optimizeForIndustry:', error);
      throw error;
    }
  }
  
  // 5. Performance Forensics Tool
  async analyzePerformance(data) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const quota = await dataService.checkUserQuota(user.id);
      if (!quota.canAnalyze) {
        throw new Error(`Analysis limit reached. ${quota.remaining || 0} analyses remaining.`);
      }
      
      return this.client.post('/tools/performance-forensics', {
        ...data,
        user_id: user.id
      });
    } catch (error) {
      console.error('Error in analyzePerformance:', error);
      throw error;
    }
  }
  
  // 6. Psychology Scorer
  async scorePsychology(data) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const quota = await dataService.checkUserQuota(user.id);
      if (!quota.canAnalyze) {
        throw new Error(`Analysis limit reached. ${quota.remaining || 0} analyses remaining.`);
      }
      
      return this.client.post('/tools/psychology-scorer', {
        ...data,
        user_id: user.id
      });
    } catch (error) {
      console.error('Error in scorePsychology:', error);
      throw error;
    }
  }
  
  // 7. Brand Voice Engine
  async alignBrandVoice(data) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const quota = await dataService.checkUserQuota(user.id);
      if (!quota.canAnalyze) {
        throw new Error(`Analysis limit reached. ${quota.remaining || 0} analyses remaining.`);
      }
      
      return this.client.post('/tools/brand-voice-engine', {
        ...data,
        user_id: user.id
      });
    } catch (error) {
      console.error('Error in alignBrandVoice:', error);
      throw error;
    }
  }
  
  // 8. Legal Risk Scanner
  async scanLegalRisks(data) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const quota = await dataService.checkUserQuota(user.id);
      if (!quota.canAnalyze) {
        throw new Error(`Analysis limit reached. ${quota.remaining || 0} analyses remaining.`);
      }
      
      return this.client.post('/tools/legal-risk-scanner', {
        ...data,
        user_id: user.id
      });
    } catch (error) {
      console.error('Error in scanLegalRisks:', error);
      throw error;
    }
  }

  // === MULTI-INPUT SYSTEM METHODS ===
  
  // Parse pasted ad copy text
  async parsePastedCopy(text, platform = 'facebook') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      return this.client.post('/ads/parse', {
        text,
        platform,
        user_id: user.id
      });
    } catch (error) {
      console.error('Error in parsePastedCopy:', error);
      throw error;
    }
  }
  
  // Parse uploaded files
  async parseFile(formData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Add user_id to formData
      formData.append('user_id', user.id);
      
      return this.client.post('/ads/parse-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Error in parseFile:', error);
      throw error;
    }
  }
  
  // Generate ad copy with AI
  async generateAdCopy(data) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const quota = await dataService.checkUserQuota(user.id);
      if (!quota.canAnalyze) {
        throw new Error(`Generation limit reached. ${quota.remaining || 0} generations remaining.`);
      }
      
      return this.client.post('/ads/generate', {
        ...data,
        user_id: user.id
      });
    } catch (error) {
      console.error('Error in generateAdCopy:', error);
      throw error;
    }
  }
  
  // Analyze multiple ads in batch
  async analyzeAds(data) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Check quota for batch analysis
      const quota = await dataService.checkUserQuota(user.id);
      const adsCount = data.ads?.length || 1;
      
      if (!quota.canAnalyze || (quota.remaining && quota.remaining < adsCount)) {
        throw new Error(`Insufficient analysis quota. Need ${adsCount} analyses, ${quota.remaining || 0} remaining.`);
      }
      
      // Use batch endpoint if multiple ads, otherwise single endpoint
      if (adsCount > 1) {
        return this.client.post('/ads/analyze/batch', {
          ...data,
          user_id: user.id
        });
      } else {
        // Single ad - use existing analyzeAd method
        return this.analyzeAd({
          ad: data.ads[0],
          competitor_ads: data.competitor_ads || []
        });
      }
    } catch (error) {
      console.error('Error in analyzeAds:', error);
      throw error;
    }
  }
  
  // === VARIATION GENERATION METHODS ===
  
  // Generate variations for a single ad
  async generateAdVariations(data) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const quota = await dataService.checkUserQuota(user.id);
      if (!quota.canAnalyze) {
        throw new Error(`Generation limit reached. ${quota.remaining || 0} generations remaining.`);
      }
      
      return this.client.post('/ads/generate-variations', {
        ...data,
        user_id: user.id
      });
    } catch (error) {
      console.error('Error in generateAdVariations:', error);
      throw error;
    }
  }
  
  // Generate variations for multiple ads
  async generateBatchVariations(data) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const quota = await dataService.checkUserQuota(user.id);
      const adsCount = data.ads?.length || 1;
      
      if (!quota.canAnalyze || (quota.remaining && quota.remaining < adsCount)) {
        throw new Error(`Insufficient generation quota. Need ${adsCount} generations, ${quota.remaining || 0} remaining.`);
      }
      
      return this.client.post('/ads/generate-variations/batch', {
        ...data,
        user_id: user.id
      });
    } catch (error) {
      console.error('Error in generateBatchVariations:', error);
      throw error;
    }
  }
  
  // Generate variations and auto-analyze with all tools
  async generateAndAnalyzeVariations(data) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const quota = await dataService.checkUserQuota(user.id);
      if (!quota.canAnalyze) {
        throw new Error(`Generation limit reached. ${quota.remaining || 0} generations remaining.`);
      }
      
      return this.client.post('/ads/generate-and-analyze', {
        ...data,
        user_id: user.id
      });
    } catch (error) {
      console.error('Error in generateAndAnalyzeVariations:', error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;
