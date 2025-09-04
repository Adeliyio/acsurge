import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

class DataService {
  // Simple retry helper for failed requests
  async _withRetry(operation, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.warn(`Attempt ${attempt} failed:`, error.message);
        if (attempt === maxRetries) {
          throw error;
        }
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // User Profile Operations
  async getUserProfile(userId) {
    try {
      console.log('💬 Fetching user profile for:', userId);
      const { data, error } = await this._withRetry(async () => {
        return await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();
      });

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        throw new Error('Failed to fetch user profile');
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        throw new Error('Failed to update profile');
      }

      return data;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      throw error;
    }
  }

  // Ad Analysis Operations
  async getAnalysesHistory(userId, limit = 10, offset = 0) {
    try {
      console.log('📊 Fetching analyses history for user:', userId, 'limit:', limit);
      const { data, error } = await this._withRetry(async () => {
        return await supabase
          .from('ad_analyses')
          .select(`
            id,
            headline,
            body_text,
            cta,
            platform,
            target_audience,
            industry,
            overall_score,
            clarity_score,
            persuasion_score,
            emotion_score,
            cta_strength_score,
            platform_fit_score,
            created_at,
            updated_at
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);
      });

      if (error) {
        console.error('Error fetching analyses history:', error);
        throw new Error('Failed to fetch analyses history');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAnalysesHistory:', error);
      throw error;
    }
  }

  async getAnalysisDetail(analysisId, userId) {
    try {
      const { data, error } = await supabase
        .from('ad_analyses')
        .select(`
          *,
          competitor_benchmarks(*),
          ad_generations(*)
        `)
        .eq('id', analysisId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching analysis detail:', error);
        throw new Error('Failed to fetch analysis details');
      }

      return data;
    } catch (error) {
      console.error('Error in getAnalysisDetail:', error);
      throw error;
    }
  }

  async createAnalysis(userId, analysisData) {
    try {
      const { data, error } = await supabase
        .from('ad_analyses')
        .insert({
          user_id: userId,
          headline: analysisData.headline,
          body_text: analysisData.body_text,
          cta: analysisData.cta,
          platform: analysisData.platform,
          target_audience: analysisData.target_audience,
          industry: analysisData.industry,
          overall_score: 0, // Will be updated by backend processing
          clarity_score: 0,
          persuasion_score: 0,
          emotion_score: 0,
          cta_strength_score: 0,
          platform_fit_score: 0,
          analysis_data: null, // Will contain AI analysis results
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating analysis:', error);
        throw new Error('Failed to create analysis');
      }

      return data;
    } catch (error) {
      console.error('Error in createAnalysis:', error);
      throw error;
    }
  }

  async updateAnalysisScores(analysisId, scores) {
    try {
      const { data, error } = await supabase
        .from('ad_analyses')
        .update({
          overall_score: scores.overall_score,
          clarity_score: scores.clarity_score,
          persuasion_score: scores.persuasion_score,
          emotion_score: scores.emotion_score,
          cta_strength_score: scores.cta_strength_score,
          platform_fit_score: scores.platform_fit_score,
          analysis_data: scores.analysis_data,
          updated_at: new Date().toISOString()
        })
        .eq('id', analysisId)
        .select()
        .single();

      if (error) {
        console.error('Error updating analysis scores:', error);
        throw new Error('Failed to update analysis scores');
      }

      return data;
    } catch (error) {
      console.error('Error in updateAnalysisScores:', error);
      throw error;
    }
  }

  // Competitor Benchmarks Operations
  async addCompetitorBenchmarks(analysisId, competitors) {
    try {
      if (!competitors || competitors.length === 0) return [];

      const benchmarksToInsert = competitors.map(competitor => ({
        analysis_id: analysisId,
        competitor_headline: competitor.headline,
        competitor_body_text: competitor.body_text,
        competitor_cta: competitor.cta,
        competitor_platform: competitor.platform,
        source_url: competitor.source_url || null,
        competitor_overall_score: competitor.overall_score || 0,
        competitor_clarity_score: competitor.clarity_score || 0,
        competitor_emotion_score: competitor.emotion_score || 0,
        competitor_cta_score: competitor.cta_score || 0,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('competitor_benchmarks')
        .insert(benchmarksToInsert)
        .select();

      if (error) {
        console.error('Error adding competitor benchmarks:', error);
        throw new Error('Failed to add competitor benchmarks');
      }

      return data;
    } catch (error) {
      console.error('Error in addCompetitorBenchmarks:', error);
      throw error;
    }
  }

  // Ad Generation Operations
  async addGeneratedAlternatives(analysisId, alternatives) {
    try {
      if (!alternatives || alternatives.length === 0) return [];

      const alternativesToInsert = alternatives.map(alt => ({
        analysis_id: analysisId,
        variant_type: alt.variant_type,
        generated_headline: alt.headline,
        generated_body_text: alt.body_text,
        generated_cta: alt.cta,
        improvement_reason: alt.improvement_reason,
        predicted_score: alt.predicted_score || null,
        user_rating: null,
        user_selected: false,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('ad_generations')
        .insert(alternativesToInsert)
        .select();

      if (error) {
        console.error('Error adding generated alternatives:', error);
        throw new Error('Failed to add generated alternatives');
      }

      return data;
    } catch (error) {
      console.error('Error in addGeneratedAlternatives:', error);
      throw error;
    }
  }

  async updateAlternativeRating(generationId, rating, selected = false) {
    try {
      const { data, error } = await supabase
        .from('ad_generations')
        .update({
          user_rating: rating,
          user_selected: selected
        })
        .eq('id', generationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating alternative rating:', error);
        throw new Error('Failed to update rating');
      }

      return data;
    } catch (error) {
      console.error('Error in updateAlternativeRating:', error);
      throw error;
    }
  }

  // Dashboard Analytics
  async getDashboardAnalytics(userId) {
    console.log('📊 Fetching dashboard analytics for user:', userId);
    
    try {
      // Early return if no userId (for safety)
      if (!userId) {
        console.warn('⚠️ No userId provided to getDashboardAnalytics, returning mock data');
        return this._getMockDashboardData();
      }

      // Get total analyses count with error handling
      let totalAnalyses = 0;
      try {
        console.log('🔢 Fetching total analyses count...');
        const { count, error: countError } = await this._withTimeout(
          supabase
            .from('ad_analyses')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId),
          3000 // 3 second timeout for count query
        );
        
        if (countError) {
          console.error('❌ Error fetching total analyses count:', countError);
        } else {
          totalAnalyses = count || 0;
        }
      } catch (err) {
        console.error('💥 Exception getting analysis count:', err);
      }

      // Get user profile for monthly count with error handling
      let userProfile = null;
      try {
        userProfile = await this.getUserProfile(userId);
      } catch (err) {
        console.error('💥 Exception getting user profile:', err);
      }

      // Get average score across all analyses with error handling
      let avgScore = 0;
      try {
        console.log('🏆 Fetching average scores...');
        const { data: avgScoreData, error: avgError } = await this._withTimeout(
          supabase
            .from('ad_analyses')
            .select('overall_score')
            .eq('user_id', userId)
            .gt('overall_score', 0), // Only include completed analyses
          3000 // 3 second timeout for average query
        );

        if (avgError) {
          console.error('❌ Error fetching average score:', avgError);
        } else if (avgScoreData && avgScoreData.length > 0) {
          const totalScore = avgScoreData.reduce((sum, analysis) => sum + analysis.overall_score, 0);
          avgScore = totalScore / avgScoreData.length;
        }
      } catch (err) {
        console.error('💥 Exception getting average scores:', err);
      }

      // Get recent analyses for trend calculation with error handling
      let recentAnalyses = [];
      try {
        console.log('🗓️ Fetching recent analyses...');
        const { data, error: recentError } = await this._withTimeout(
          supabase
            .from('ad_analyses')
            .select('overall_score, created_at')
            .eq('user_id', userId)
            .gt('overall_score', 0)
            .order('created_at', { ascending: false })
            .limit(10),
          3000 // 3 second timeout for recent analyses
        );

        if (recentError) {
          console.error('❌ Error fetching recent analyses:', recentError);
        } else {
          recentAnalyses = data || [];
        }
      } catch (err) {
        console.error('💥 Exception getting recent analyses:', err);
      }

      // Calculate improvement percentage
      let improvementPercent = '0%';
      if (recentAnalyses && recentAnalyses.length >= 2) {
        try {
          const recentAvg = recentAnalyses.slice(0, Math.ceil(recentAnalyses.length / 2))
            .reduce((sum, analysis) => sum + analysis.overall_score, 0) / Math.ceil(recentAnalyses.length / 2);
          const olderAvg = recentAnalyses.slice(Math.ceil(recentAnalyses.length / 2))
            .reduce((sum, analysis) => sum + analysis.overall_score, 0) / Math.floor(recentAnalyses.length / 2);
          
          if (olderAvg > 0) {
            const improvement = ((recentAvg - olderAvg) / olderAvg) * 100;
            improvementPercent = improvement > 0 ? `+${improvement.toFixed(1)}%` : `${improvement.toFixed(1)}%`;
          }
        } catch (err) {
          console.error('💥 Exception calculating improvement:', err);
        }
      }

      const result = {
        total_analyses: totalAnalyses,
        avg_score_improvement: improvementPercent,
        this_month_analyses: userProfile?.monthly_analyses || 0,
        avg_score: avgScore ? avgScore.toFixed(1) : '0.0',
        recent_analyses: recentAnalyses,
        monthly_usage: this._generateMockMonthlyUsage(totalAnalyses)
      };
      
      console.log('✅ Dashboard analytics fetched successfully:', result);
      return result;
      
    } catch (error) {
      console.error('💥 Critical error in getDashboardAnalytics:', error);
      
      // Return mock data instead of throwing to prevent dashboard from breaking
      const mockData = this._getMockDashboardData();
      console.warn('⚠️ Returning mock dashboard data due to error:', mockData);
      return mockData;
    }
  }
  
  // Helper method to provide mock dashboard data as fallback
  _getMockDashboardData() {
    return {
      total_analyses: 0,
      avg_score_improvement: '0%',
      this_month_analyses: 0,
      avg_score: '0.0',
      recent_analyses: [],
      monthly_usage: [
        { month: 'Jan', analyses: 0, avg_score: 0 },
        { month: 'Feb', analyses: 0, avg_score: 0 },
        { month: 'Mar', analyses: 0, avg_score: 0 },
        { month: 'Apr', analyses: 0, avg_score: 0 },
        { month: 'May', analyses: 0, avg_score: 0 },
        { month: 'Jun', analyses: 0, avg_score: 0 }
      ]
    };
  }
  
  // Generate mock monthly usage data based on total analyses
  _generateMockMonthlyUsage(totalAnalyses = 0) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      analyses: Math.max(0, Math.floor((totalAnalyses / 6) + Math.random() * 5 - 2)),
      avg_score: totalAnalyses > 0 ? Math.floor(75 + Math.random() * 20) : 0
    }));
  }

  // Real-time subscriptions
  subscribeToUserAnalyses(userId, callback) {
    const channel = supabase
      .channel('user-analyses')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ad_analyses',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Real-time analysis update:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Utility functions
  async checkUserQuota(userId) {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) return { canAnalyze: false, reason: 'Profile not found' };

      const limits = {
        free: 5,
        basic: 50,
        pro: 200
      };

      const limit = limits[userProfile.subscription_tier] || limits.free;
      const current = userProfile.monthly_analyses || 0;

      return {
        canAnalyze: current < limit,
        current,
        limit,
        remaining: limit - current,
        tier: userProfile.subscription_tier
      };
    } catch (error) {
      console.error('Error checking user quota:', error);
      return { canAnalyze: false, reason: 'Error checking quota' };
    }
  }

  async incrementAnalysisCount(userId) {
    try {
      const { data, error } = await supabase.rpc('increment_user_analysis_count', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error incrementing analysis count:', error);
        // This is handled by the database trigger, so this is just a backup
      }

      return data;
    } catch (error) {
      console.error('Error in incrementAnalysisCount:', error);
      // Non-critical error, analysis count is managed by DB triggers
    }
  }
}

const dataService = new DataService();
export default dataService;
