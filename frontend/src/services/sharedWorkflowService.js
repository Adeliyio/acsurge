/**
 * Shared Workflow API Service
 * Manages ad copy projects, tool coordination, and pipeline execution
 */

import apiService from './apiService';

const SHARED_WORKFLOW_BASE = '/api/v1/projects';

class SharedWorkflowService {
  /**
   * Project Management
   */

  // Create a new ad copy project
  async createProject(projectData) {
    const {
      projectName,
      description,
      headline,
      bodyText,
      cta,
      platform,
      industry,
      targetAudience,
      enabledTools = ['compliance', 'legal', 'brand_voice', 'psychology'],
      autoAnalyze = true,
      tags = []
    } = projectData;

    const response = await apiService.post(`${SHARED_WORKFLOW_BASE}`, {
      project_name: projectName,
      description,
      headline,
      body_text: bodyText,
      cta,
      platform,
      industry,
      target_audience: targetAudience,
      enabled_tools: enabledTools,
      auto_chain_analysis: autoAnalyze,
      tags
    });

    return response;
  }

  // Get user's projects with optional filtering
  async getProjects(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.platform) params.append('platform', filters.platform);
    if (filters.industry) params.append('industry', filters.industry);
    if (filters.tags) filters.tags.forEach(tag => params.append('tags', tag));
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    const url = queryString ? `${SHARED_WORKFLOW_BASE}?${queryString}` : SHARED_WORKFLOW_BASE;
    
    return await apiService.get(url);
  }

  // Get a specific project with all analysis results
  async getProject(projectId, includeResults = true) {
    const params = includeResults ? '?include_results=true' : '';
    return await apiService.get(`${SHARED_WORKFLOW_BASE}/${projectId}${params}`);
  }

  // Update project details
  async updateProject(projectId, updates) {
    return await apiService.put(`${SHARED_WORKFLOW_BASE}/${projectId}`, updates);
  }

  // Delete project
  async deleteProject(projectId) {
    return await apiService.delete(`${SHARED_WORKFLOW_BASE}/${projectId}`);
  }

  // Duplicate/clone a project
  async duplicateProject(projectId, newName = null) {
    return await apiService.post(`${SHARED_WORKFLOW_BASE}/${projectId}/duplicate`, {
      project_name: newName
    });
  }

  /**
   * Analysis Pipeline Management
   */

  // Start analysis pipeline for a project
  async startAnalysis(projectId, tools = null, chainedMode = true) {
    return await apiService.post(`${SHARED_WORKFLOW_BASE}/${projectId}/analyze`, {
      tools: tools || ['compliance', 'legal', 'brand_voice', 'psychology'],
      chained_mode: chainedMode
    });
  }

  // Start ad-hoc analysis (Quick Analysis workflow)
  // Creates a transient project and immediately runs analysis
  async startAdhocAnalysis(adCopyData, enabledTools = null) {
    const {
      headline,
      body_text,
      cta,
      platform,
      industry,
      target_audience,
      competitor_ads = []
    } = adCopyData;

    // Create transient project for quick analysis
    const projectData = {
      projectName: `Quick Analysis - ${new Date().toLocaleString()}`,
      description: 'Ad-hoc analysis from Quick Analysis workflow',
      headline,
      bodyText: body_text,
      cta,
      platform,
      industry: industry || null,
      targetAudience: target_audience || null,
      enabledTools: enabledTools || ['compliance', 'legal', 'brand_voice', 'psychology'],
      autoAnalyze: true,
      tags: ['quick-analysis', 'ad-hoc']
    };

    try {
      // Create the project
      const project = await this.createProject(projectData);
      
      // Add competitor benchmarks if provided
      if (competitor_ads && competitor_ads.length > 0) {
        // Note: This would require a new endpoint to add competitor data to projects
        // For now, we'll store it in project metadata or skip it
        console.log('Competitor ads provided but not yet implemented in project workflow:', competitor_ads.length);
      }

      return {
        project_id: project.project_id,
        analysis_id: project.project_id, // For backward compatibility
        is_adhoc: true,
        enabled_tools: enabledTools || ['compliance', 'legal', 'brand_voice', 'psychology']
      };
    } catch (error) {
      console.error('Error in startAdhocAnalysis:', error);
      throw error;
    }
  }

  // Get pipeline run status
  async getPipelineStatus(projectId, runId = null) {
    const endpoint = runId 
      ? `${SHARED_WORKFLOW_BASE}/${projectId}/pipeline/${runId}`
      : `${SHARED_WORKFLOW_BASE}/${projectId}/pipeline/latest`;
    
    return await apiService.get(endpoint);
  }

  // Cancel running pipeline
  async cancelPipeline(projectId, runId) {
    return await apiService.post(`${SHARED_WORKFLOW_BASE}/${projectId}/pipeline/${runId}/cancel`);
  }

  // Get all pipeline runs for a project
  async getPipelineHistory(projectId) {
    return await apiService.get(`${SHARED_WORKFLOW_BASE}/${projectId}/pipeline/history`);
  }

  /**
   * Tool Analysis Results
   */

  // Get results for a specific tool and project
  async getToolResult(projectId, toolName) {
    return await apiService.get(`${SHARED_WORKFLOW_BASE}/${projectId}/results/${toolName}`);
  }

  // Get all analysis results for a project
  async getProjectResults(projectId) {
    return await apiService.get(`${SHARED_WORKFLOW_BASE}/${projectId}/results`);
  }

  // Run a single tool analysis (bypassing pipeline)
  async runSingleTool(projectId, toolName, toolConfig = {}) {
    return await apiService.post(`${SHARED_WORKFLOW_BASE}/${projectId}/tools/${toolName}`, {
      config: toolConfig
    });
  }

  // Update tool result (for manual corrections or additional data)
  async updateToolResult(projectId, toolName, resultData) {
    return await apiService.put(`${SHARED_WORKFLOW_BASE}/${projectId}/results/${toolName}`, resultData);
  }

  /**
   * Template and Preset Management
   */

  // Save project as template
  async saveAsTemplate(projectId, templateName, isPublic = false) {
    return await apiService.post(`${SHARED_WORKFLOW_BASE}/${projectId}/save-template`, {
      template_name: templateName,
      is_public: isPublic
    });
  }

  // Get available templates
  async getTemplates(includePublic = true) {
    const params = includePublic ? '?include_public=true' : '';
    return await apiService.get(`/api/v1/templates${params}`);
  }

  // Create project from template
  async createFromTemplate(templateId, projectName) {
    return await apiService.post(`/api/v1/templates/${templateId}/create`, {
      project_name: projectName
    });
  }

  /**
   * Collaboration Features
   */

  // Share project with another user
  async shareProject(projectId, userEmail, role = 'viewer') {
    return await apiService.post(`${SHARED_WORKFLOW_BASE}/${projectId}/share`, {
      user_email: userEmail,
      role
    });
  }

  // Get project collaborators
  async getCollaborators(projectId) {
    return await apiService.get(`${SHARED_WORKFLOW_BASE}/${projectId}/collaborators`);
  }

  // Update collaborator role
  async updateCollaboratorRole(projectId, collaboratorId, role) {
    return await apiService.put(`${SHARED_WORKFLOW_BASE}/${projectId}/collaborators/${collaboratorId}`, {
      role
    });
  }

  // Remove collaborator
  async removeCollaborator(projectId, collaboratorId) {
    return await apiService.delete(`${SHARED_WORKFLOW_BASE}/${projectId}/collaborators/${collaboratorId}`);
  }

  /**
   * Reporting and Export
   */

  // Generate comprehensive report
  async generateReport(projectId, format = 'pdf', options = {}) {
    return await apiService.post(`${SHARED_WORKFLOW_BASE}/${projectId}/report`, {
      format,
      options: {
        include_recommendations: options.includeRecommendations ?? true,
        include_comparisons: options.includeComparisons ?? true,
        include_scores: options.includeScores ?? true,
        theme: options.theme || 'default',
        ...options
      }
    });
  }

  // Export project data
  async exportProject(projectId, format = 'json') {
    return await apiService.get(`${SHARED_WORKFLOW_BASE}/${projectId}/export?format=${format}`, {
      responseType: format === 'json' ? 'json' : 'blob'
    });
  }

  /**
   * Utility Methods
   */

  // Get project statistics/analytics
  async getProjectStats(projectId) {
    return await apiService.get(`${SHARED_WORKFLOW_BASE}/${projectId}/stats`);
  }

  // Get user workflow analytics
  async getUserAnalytics(timeframe = '30d') {
    return await apiService.get(`/api/v1/analytics/workflow?timeframe=${timeframe}`);
  }

  // Search projects
  async searchProjects(query, filters = {}) {
    const params = new URLSearchParams({ q: query });
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });

    return await apiService.get(`${SHARED_WORKFLOW_BASE}/search?${params.toString()}`);
  }

  // Get recommended next actions for a project
  async getRecommendations(projectId) {
    return await apiService.get(`${SHARED_WORKFLOW_BASE}/${projectId}/recommendations`);
  }

  /**
   * Real-time Updates
   */

  // Subscribe to project updates (WebSocket/SSE)
  subscribeToProject(projectId, onUpdate, onError = null) {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll implement polling as a fallback
    const eventSource = new EventSource(`${SHARED_WORKFLOW_BASE}/${projectId}/subscribe`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
      } catch (error) {
        console.error('Error parsing SSE data:', error);
        if (onError) onError(error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      if (onError) onError(error);
    };

    return () => {
      eventSource.close();
    };
  }

  // Polling-based updates as fallback
  async pollProjectUpdates(projectId, lastUpdateTime, callback) {
    try {
      const response = await apiService.get(
        `${SHARED_WORKFLOW_BASE}/${projectId}/updates?since=${lastUpdateTime}`
      );
      
      if (response.updates && response.updates.length > 0) {
        callback(response.updates);
        return Math.max(...response.updates.map(u => new Date(u.timestamp).getTime()));
      }
      
      return lastUpdateTime;
    } catch (error) {
      console.error('Polling error:', error);
      throw error;
    }
  }

  /**
   * Batch Operations
   */

  // Process multiple projects
  async batchAnalyze(projectIds, tools = null) {
    return await apiService.post('/api/v1/batch/analyze', {
      project_ids: projectIds,
      tools: tools || ['compliance', 'legal', 'brand_voice', 'psychology']
    });
  }

  // Bulk update projects
  async batchUpdate(updates) {
    return await apiService.put('/api/v1/batch/projects', {
      updates // Array of { projectId, data }
    });
  }

  // Bulk delete projects
  async batchDelete(projectIds) {
    return await apiService.delete('/api/v1/batch/projects', {
      data: { project_ids: projectIds }
    });
  }
}

// Tool-specific integration methods
export const ToolIntegration = {
  /**
   * Helper methods for individual tools to integrate with shared workflow
   */

  // Submit compliance analysis result
  async submitComplianceResult(projectId, result) {
    return await sharedWorkflowService.updateToolResult(projectId, 'compliance', {
      violations: result.violations,
      overall_score: result.overall_score,
      risk_level: result.risk_level,
      platform_tips: result.platform_tips,
      confidence_score: result.confidence_score
    });
  },

  // Submit legal risk analysis result
  async submitLegalResult(projectId, result) {
    return await sharedWorkflowService.updateToolResult(projectId, 'legal', {
      risk_assessment: result.risk_assessment,
      problematic_claims: result.problematic_claims,
      legal_suggestions: result.legal_suggestions,
      overall_score: result.overall_score,
      risk_level: result.risk_level,
      confidence_score: result.confidence_score
    });
  },

  // Submit brand voice analysis result
  async submitBrandVoiceResult(projectId, result) {
    return await sharedWorkflowService.updateToolResult(projectId, 'brand_voice', {
      alignment_score: result.alignment_score,
      tone_analysis: result.tone_analysis,
      suggested_copy: result.suggested_copy,
      brand_consistency: result.brand_consistency,
      overall_score: result.overall_score,
      confidence_score: result.confidence_score
    });
  },

  // Submit psychology scorer result
  async submitPsychologyResult(projectId, result) {
    return await sharedWorkflowService.updateToolResult(projectId, 'psychology', {
      psychology_scores: result.psychology_scores,
      emotional_triggers: result.emotional_triggers,
      persuasion_techniques: result.persuasion_techniques,
      recommendations: result.recommendations,
      overall_score: result.overall_score,
      confidence_score: result.confidence_score
    });
  },

  // Submit performance forensics result
  async submitPerformanceResult(projectId, result) {
    return await sharedWorkflowService.updateToolResult(projectId, 'performance_forensics', {
      performance_insights: result.performance_insights,
      optimization_opportunities: result.optimization_opportunities,
      competitive_analysis: result.competitive_analysis,
      recommendations: result.recommendations,
      overall_score: result.overall_score,
      confidence_score: result.confidence_score
    });
  },

  // Get project ad copy for tool analysis
  async getProjectAdCopy(projectId) {
    const project = await sharedWorkflowService.getProject(projectId, false);
    return {
      headline: project.headline,
      body_text: project.body_text,
      cta: project.cta,
      platform: project.platform,
      industry: project.industry,
      target_audience: project.target_audience
    };
  }
};

// Create singleton instance
const sharedWorkflowService = new SharedWorkflowService();
export default sharedWorkflowService;

// Export specific utility functions
export {
  SharedWorkflowService,
  SHARED_WORKFLOW_BASE
};
