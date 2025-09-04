import React, { useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  LinearProgress,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import apiService from '../services/apiService';
import useFetch from '../hooks/useFetch';
import { SkeletonLoader, ErrorMessage, EmptyState } from '../components/ui';

const AnalysisResults = () => {
  const { analysisId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch analysis data with our standardized hook
  const fetchAnalysisData = useCallback(async () => {
    if (!user || !analysisId) {
      throw new Error('Missing required data');
    }
    return await apiService.getAnalysisDetail(analysisId);
  }, [user, analysisId]);

  const {
    data: analysis,
    isLoading,
    error,
    refetch,
    shouldShowEmpty,
    shouldShowError,
    shouldShowLoading
  } = useFetch(
    fetchAnalysisData,
    null,
    { 
      dependencies: [user, analysisId],
      retryCount: 1,
      retryDelay: 2000
    }
  );

  // Loading state
  if (shouldShowLoading) {
    return <SkeletonLoader variant="analysis" maxWidth="lg" />;
  }

  // Error state
  if (shouldShowError) {
    return (
      <ErrorMessage
        variant="page"
        title="Failed to load analysis"
        message={error?.message || 'We couldn\'t load the analysis results. This might be because the analysis doesn\'t exist or you don\'t have permission to view it.'}
        error={error}
        onRetry={refetch}
        onHome={() => navigate('/dashboard')}
        maxWidth="lg"
      />
    );
  }

  // Empty state - this shouldn't normally happen, but just in case
  if (shouldShowEmpty) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <EmptyState
          variant="analysis"
          title="No analysis data found"
          description="The analysis you're looking for doesn't exist or has no data available."
          actionText="Run New Analysis"
          onAction={() => navigate('/analyze')}
        />
      </Container>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const formatScore = (score) => Math.round(score);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Analysis Results
      </Typography>

      <Grid container spacing={3}>
        {/* Original Ad */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Original Ad
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip label={analysis.platform.toUpperCase()} color="primary" size="small" />
            </Box>
            <Typography variant="h6" gutterBottom>
              {analysis.headline}
            </Typography>
            <Typography variant="body1" paragraph>
              {analysis.body_text}
            </Typography>
            <Typography variant="h6" color="primary">
              {analysis.cta}
            </Typography>
          </Paper>
        </Grid>

        {/* Scores */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Scores
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Overall Score</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatScore(analysis.overall_score ?? 0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.overall_score ?? 0}
                    color={getScoreColor(analysis.overall_score ?? 0)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Clarity</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatScore(analysis.clarity_score ?? 0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.clarity_score ?? 0}
                    color={getScoreColor(analysis.clarity_score ?? 0)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Persuasion</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatScore(analysis.persuasion_score ?? 0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.persuasion_score ?? 0}
                    color={getScoreColor(analysis.persuasion_score ?? 0)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Emotion</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatScore(analysis.emotion_score ?? 0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.emotion_score ?? 0}
                    color={getScoreColor(analysis.emotion_score ?? 0)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">CTA Strength</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatScore(analysis.cta_strength_score ?? 0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.cta_strength_score ?? 0}
                    color={getScoreColor(analysis.cta_strength_score ?? 0)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Platform Fit</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatScore(analysis.platform_fit_score ?? 0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.platform_fit_score ?? 0}
                    color={getScoreColor(analysis.platform_fit_score ?? 0)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* AI Feedback */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              AI Feedback
            </Typography>
              <Typography variant="body1">
                {analysis.analysis_data?.feedback || analysis.feedback || 'AI analysis completed successfully.'}
              </Typography>
          </Paper>
        </Grid>

        {/* Alternatives */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            AI-Generated Alternatives
          </Typography>
          <Grid container spacing={2}>
            {analysis.ad_generations && analysis.ad_generations.length > 0 ? (
              analysis.ad_generations.map((alternative, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card>
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        <Chip 
                          label={alternative.variant_type?.replace('_', ' ')?.toUpperCase() || 'ALTERNATIVE'} 
                          color="secondary" 
                          size="small" 
                        />
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {alternative.generated_headline || 'No headline provided'}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {alternative.generated_body_text || 'No body text provided'}
                      </Typography>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        {alternative.generated_cta || 'No CTA provided'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        {alternative.improvement_reason || 'No improvement reason provided'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <EmptyState
                  variant="templates"
                  size="small"
                  title="No alternatives generated"
                  description="AI alternatives weren't generated for this analysis. You can run a new analysis to get fresh alternatives."
                  actionText="Run Another Analysis"
                  onAction={() => navigate('/analyze')}
                />
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AnalysisResults;
