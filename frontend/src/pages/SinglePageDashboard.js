import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Stack,
  Divider,
  CircularProgress,
  Skeleton,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Collapse
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Speed,
  Analytics,
  Add,
  CheckCircle,
  Lightbulb,
  Timeline,
  Star,
  AutoAwesome,
  ContentCopy,
  Edit,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import StartIcon from '../components/icons/StartIcon';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { supabase } from '../lib/supabaseClient';
import { useDashboardAnalytics, useRefreshProjects } from '../hooks/useProjects';
import ErrorBoundary from '../components/ErrorBoundary';
import SmartOnboarding from '../components/onboarding/SmartOnboarding';
import IntelligentContentAssistant from '../components/shared/IntelligentContentAssistant';
import { useForm, Controller } from 'react-hook-form';
import sharedWorkflowService from '../services/sharedWorkflowService';
import toast from 'react-hot-toast';
import PasteInput from '../components/input/PasteInput';
import AdCopyReview from '../components/input/AdCopyReview';

const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'primary', chipLabel, trend }) => (
  <Card sx={{ height: '100%', position: 'relative' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography variant="h4" fontWeight={700} color={`${color}.main`}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {subtitle}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" alignItems="flex-end">
          <Avatar sx={{ bgcolor: `${color}.main`, color: `${color}.contrastText`, mb: 1 }}>
            <Icon />
          </Avatar>
          {chipLabel && (
            <Chip 
              label={chipLabel} 
              size="small" 
              color={color}
              variant="outlined"
            />
          )}
        </Box>
      </Box>
      
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <TrendingUp sx={{ color: 'success.main', fontSize: '1rem' }} />
          <Typography variant="caption" color="success.main" fontWeight={600}>
            {trend}
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const SinglePageDashboard = () => {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  
  // Fetch real dashboard data
  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard 
  } = useDashboardAnalytics();
  
  const refreshProjects = useRefreshProjects();
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Analysis state
  const [analysisExpanded, setAnalysisExpanded] = useState(false);
  const [inputMethod, setInputMethod] = useState('manual');
  const [adCopies, setAdCopies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      headline: '',
      body_text: '',
      cta: '',
      platform: 'facebook',
      target_audience: '',
      industry: ''
    }
  });
  
  // Check if user needs onboarding
  useEffect(() => {
    const checkOnboardingNeeded = () => {
      const hasCompletedOnboardingLocal = localStorage.getItem('adcopysurge_onboarding_completed');
      const hasCompletedOnboardingDB = subscription?.has_completed_onboarding;
      const isNewUser = !dashboardData?.totalAnalyses || dashboardData.totalAnalyses === 0;
      
      const shouldShowOnboarding = isNewUser && 
                                   !hasCompletedOnboardingLocal && 
                                   !hasCompletedOnboardingDB && 
                                   !isDashboardLoading;
      
      if (shouldShowOnboarding) {
        setTimeout(() => setShowOnboarding(true), 1000);
      }
    };
    
    checkOnboardingNeeded();
  }, [dashboardData, isDashboardLoading, subscription]);

  // Analysis form submission
  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const analysisData = {
        headline: data.headline,
        body_text: data.body_text,
        cta: data.cta,
        platform: data.platform,
        target_audience: data.target_audience || null,
        industry: data.industry || null
      };

      const response = await sharedWorkflowService.startAdhocAnalysis(analysisData);
      
      toast.success(`Analysis started! Project: "${response.project_name}"`);
      navigate(`/project/${response.project_id}/results`);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Analysis failed';
      setError(new Error(errorMessage));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Ad copies management functions
  const addAdCopy = () => {
    const newAdCopy = {
      id: Date.now().toString(),
      headline: '',
      body_text: '',
      cta: '',
      platform: 'facebook',
      industry: '',
      target_audience: ''
    };
    setAdCopies(prev => [...prev, newAdCopy]);
  };

  const updateAdCopy = (id, updatedData) => {
    setAdCopies(prev => prev.map(ad => 
      (ad.id === id || prev.indexOf(ad) === id) ? { ...ad, ...updatedData, id: ad.id } : ad
    ));
  };

  const removeAdCopy = (id) => {
    if (adCopies.length > 1) {
      setAdCopies(prev => prev.filter((ad, index) => ad.id !== id && index !== id));
    }
  };

  const handleAdCopiesParsed = (newAdCopies) => {
    const adsWithIds = newAdCopies.map(ad => ({
      ...ad,
      id: Date.now().toString() + Math.random().toString(36).substring(2)
    }));
    setAdCopies(adsWithIds);
  };

  const handleClearAdCopies = () => {
    setAdCopies([]);
  };

  const handleAnalyzeAll = async () => {
    setLoading(true);
    setError(null);

    try {
      const validAds = adCopies.filter(ad => ad.headline && ad.body_text && ad.cta);
      
      if (validAds.length === 0) {
        toast.error('Please ensure all ads have headline, body text, and CTA filled');
        return;
      }

      if (validAds.length === 1) {
        const analysisData = {
          headline: validAds[0].headline,
          body_text: validAds[0].body_text,
          cta: validAds[0].cta,
          platform: validAds[0].platform,
          industry: validAds[0].industry,
          target_audience: validAds[0].target_audience
        };
        
        const response = await sharedWorkflowService.startAdhocAnalysis(analysisData);
        
        toast.success(`Analysis started! Project: "${response.project_name}"`);
        navigate(`/project/${response.project_id}/results`);
      } else {
        const results = [];
        
        for (const ad of validAds) {
          const analysisData = {
            headline: ad.headline,
            body_text: ad.body_text,
            cta: ad.cta,
            platform: ad.platform,
            industry: ad.industry,
            target_audience: ad.target_audience
          };
          
          const response = await sharedWorkflowService.startAdhocAnalysis(analysisData);
          results.push(response);
        }
        
        toast.success(`Analysis started for ${validAds.length} ads with auto-generated project names!`);
        
        if (results.length > 0) {
          navigate(`/project/${results[0].project_id}/results`);
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Analysis failed';
      setError(new Error(errorMessage));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOnboardingComplete = async () => {
    localStorage.setItem('adcopysurge_onboarding_completed', 'true');
    
    if (user && !subscription?.has_completed_onboarding) {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            has_completed_onboarding: true,
            onboarding_completed_at: new Date().toISOString(),
            subscription_tier: subscription?.subscription_tier || 'free',
            subscription_active: subscription?.subscription_active !== false
          }, {
            onConflict: 'id'
          });
        
        if (error) {
          console.error('Error marking onboarding as completed:', error);
        }
      } catch (error) {
        console.error('Error updating onboarding status:', error);
      }
    }
    
    setShowOnboarding(false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Smart Onboarding */}
      <SmartOnboarding 
        open={showOnboarding}
        onClose={handleOnboardingComplete}
        userType={(dashboardData?.totalAnalyses > 0 || subscription?.has_completed_onboarding) ? 'returning' : 'new'}
      />
      
      <Grid container spacing={3}>
        {/* Welcome Header */}
        <Grid item xs={12}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 3, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                opacity: 0.6
              }}
            />
            
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h3" fontWeight={800} gutterBottom>
                    Welcome to AdCopy Surge! 🚀
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                    The simplest way to analyze and optimize your ad copy with AI-powered insights
                  </Typography>
                  <Box display="flex" gap={2} alignItems="center">
                    <Chip 
                      label={`${(subscription?.subscription_tier || 'free')?.toUpperCase()} Plan`}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AutoAwesome sx={{ fontSize: '1.2rem' }} />
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {isDashboardLoading ? (
                          <Skeleton width={150} />
                        ) : (
                          `${dashboardData?.monthlyAnalyses || 0} analyses this month`
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Add />}
                    onClick={() => setAnalysisExpanded(!analysisExpanded)}
                    sx={{ 
                      bgcolor: 'rgba(245, 158, 11, 0.95)',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      '&:hover': {
                        bgcolor: 'rgba(245, 158, 11, 1)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    ✨ Analyze Ad Copy
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Analysis Section - Expandable */}
        <Grid item xs={12}>
          <Collapse in={analysisExpanded}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" fontWeight={700}>
                  🎯 Analyze Your Ad Copy
                </Typography>
                <IconButton 
                  onClick={() => setAnalysisExpanded(false)}
                  sx={{ ml: 2 }}
                >
                  <ExpandLess />
                </IconButton>
              </Box>
              
              {/* Input Method Tabs */}
              <Paper sx={{ mb: 3 }}>
                <Tabs
                  value={inputMethod}
                  onChange={(_, newValue) => setInputMethod(newValue)}
                  variant="fullWidth"
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Tab 
                    value="manual" 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Edit fontSize="small" />
                        Manual Input
                      </Box>
                    }
                  />
                  <Tab 
                    value="paste" 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ContentCopy fontSize="small" />
                        <Badge badgeContent={adCopies.length > 0 ? adCopies.length : null} color="primary">
                          Paste Ad Copy
                        </Badge>
                      </Box>
                    }
                  />
                </Tabs>
                
                <Box sx={{ px: 3, py: 2, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    {inputMethod === 'manual' && '📝 Enter your ad copy manually using the clean form below'}
                    {inputMethod === 'paste' && '📋 Paste ad copy from any source - our AI will parse it automatically'}
                  </Typography>
                </Box>
              </Paper>

              {/* Analysis Form */}
              {inputMethod === 'manual' && (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={3}>
                    {/* Platform & Industry */}
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="platform"
                        control={control}
                        render={({ field }) => (
                          <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>Platform *</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {['facebook', 'google', 'linkedin', 'tiktok'].map((platform) => (
                                <Chip
                                  key={platform}
                                  label={platform === 'facebook' ? 'Facebook' : platform === 'google' ? 'Google' : platform === 'linkedin' ? 'LinkedIn' : 'TikTok'}
                                  onClick={() => field.onChange(platform)}
                                  color={field.value === platform ? 'primary' : 'default'}
                                  variant={field.value === platform ? 'filled' : 'outlined'}
                                />
                              ))}
                            </Box>
                          </Paper>
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="industry"
                        control={control}
                        render={({ field }) => (
                          <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>Industry (Optional)</Typography>
                            <input 
                              {...field}
                              placeholder="e.g., SaaS, E-commerce, Fitness"
                              style={{ 
                                border: 'none', 
                                outline: 'none', 
                                width: '100%', 
                                background: 'transparent',
                                fontSize: '14px'
                              }}
                            />
                          </Paper>
                        )}
                      />
                    </Grid>

                    {/* Ad Content */}
                    <Grid item xs={12}>
                      <Controller
                        name="headline"
                        control={control}
                        rules={{ required: 'Headline is required' }}
                        render={({ field }) => (
                          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom color={errors.headline ? 'error' : 'textPrimary'}>
                              Headline *
                            </Typography>
                            <input 
                              {...field}
                              placeholder="Enter your compelling ad headline..."
                              style={{ 
                                border: 'none', 
                                outline: 'none', 
                                width: '100%', 
                                background: 'transparent',
                                fontSize: '16px',
                                fontWeight: '500'
                              }}
                            />
                            {errors.headline && (
                              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                {errors.headline.message}
                              </Typography>
                            )}
                          </Paper>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name="body_text"
                        control={control}
                        rules={{ required: 'Body text is required' }}
                        render={({ field }) => (
                          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom color={errors.body_text ? 'error' : 'textPrimary'}>
                              Body Text *
                            </Typography>
                            <textarea 
                              {...field}
                              placeholder="Enter your ad body text..."
                              rows={4}
                              style={{ 
                                border: 'none', 
                                outline: 'none', 
                                width: '100%', 
                                background: 'transparent',
                                fontSize: '14px',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                              }}
                            />
                            {errors.body_text && (
                              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                {errors.body_text.message}
                              </Typography>
                            )}
                          </Paper>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="cta"
                        control={control}
                        rules={{ required: 'Call-to-action is required' }}
                        render={({ field }) => (
                          <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom color={errors.cta ? 'error' : 'textPrimary'}>
                              Call-to-Action *
                            </Typography>
                            <input 
                              {...field}
                              placeholder="e.g., Get Started Free, Learn More, Shop Now"
                              style={{ 
                                border: 'none', 
                                outline: 'none', 
                                width: '100%', 
                                background: 'transparent',
                                fontSize: '14px'
                              }}
                            />
                            {errors.cta && (
                              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                {errors.cta.message}
                              </Typography>
                            )}
                          </Paper>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="target_audience"
                        control={control}
                        render={({ field }) => (
                          <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>Target Audience (Optional)</Typography>
                            <input 
                              {...field}
                              placeholder="e.g., SMB owners, Marketing agencies"
                              style={{ 
                                border: 'none', 
                                outline: 'none', 
                                width: '100%', 
                                background: 'transparent',
                                fontSize: '14px'
                              }}
                            />
                          </Paper>
                        )}
                      />
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="center" mt={3}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          disabled={loading}
                          sx={{ 
                            minWidth: 300,
                            py: 2,
                            px: 4,
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                            boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 12px 40px rgba(37, 99, 235, 0.4)',
                            },
                            '&:disabled': {
                              background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                              transform: 'none',
                              boxShadow: 'none'
                            }
                          }}
                        >
                          {loading ? (
                            <>
                              <CircularProgress size={24} sx={{ mr: 2, color: 'white' }} />
                              🎯 Analyzing Your Ad...
                            </>
                          ) : (
                            <>
                              🚀 Analyze My Ad Copy
                            </>
                          )}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              )}

              {/* Paste Input Method */}
              {inputMethod === 'paste' && (
                <PasteInput
                  onAdCopiesParsed={handleAdCopiesParsed}
                  onClear={handleClearAdCopies}
                  defaultPlatform="facebook"
                />
              )}
              
              {/* Review and Edit Parsed Ads */}
              {inputMethod !== 'manual' && adCopies.length > 0 && (
                <Paper sx={{ p: 3, mt: 3 }}>
                  <AdCopyReview
                    adCopies={adCopies}
                    onUpdateAdCopy={updateAdCopy}
                    onRemoveAdCopy={removeAdCopy}
                    onAddAdCopy={addAdCopy}
                    onAnalyzeAll={handleAnalyzeAll}
                    loading={loading}
                  />
                </Paper>
              )}
              
              {/* Error Display */}
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error.message}
                </Alert>
              )}
            </Paper>
          </Collapse>
        </Grid>

        {/* Metrics Cards */}
        {dashboardError && (
          <Grid item xs={12}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Unable to load dashboard metrics. Some data may not be current.
            </Alert>
          </Grid>
        )}
        
        <Grid item xs={12} md={4}>
          {isDashboardLoading ? (
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Skeleton variant="circular" width={56} height={56} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="80%" height={40} />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="50%" />
              </CardContent>
            </Card>
          ) : (
            <MetricCard
              title="Monthly Analyses"
              value={dashboardData?.monthlyAnalyses || 0}
              subtitle="analyses this month"
              icon={Analytics}
              color="primary"
              chipLabel="This Month"
              trend="+23% vs last month"
            />
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          {isDashboardLoading ? (
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Skeleton variant="circular" width={56} height={56} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="80%" height={40} />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="50%" />
              </CardContent>
            </Card>
          ) : (
            <MetricCard
              title="Average Score"
              value={dashboardData?.avgScore || 0}
              subtitle="performance score"
              icon={Speed}
              color="warning"
              chipLabel="Avg Score"
              trend={dashboardData?.avgScoreImprovement || '+0%'}
            />
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          {isDashboardLoading ? (
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Skeleton variant="circular" width={56} height={56} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="80%" height={40} />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="50%" />
              </CardContent>
            </Card>
          ) : (
            <MetricCard
              title="Total Analyses"
              value={dashboardData?.totalAnalyses || 0}
              subtitle="lifetime completed"
              icon={Assessment}
              color="success"
              chipLabel="All Time"
            />
          )}
        </Grid>

        {/* Recent Projects */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={600}>
                  📊 Recent Projects
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  component={RouterLink}
                  to="/history"
                >
                  View All
                </Button>
              </Box>
              
              {isDashboardLoading ? (
                [...Array(3)].map((_, index) => (
                  <Box key={index}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" py={2}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box>
                          <Skeleton variant="text" width={200} height={24} />
                          <Box display="flex" gap={1} mt={1}>
                            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                          </Box>
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        <Skeleton variant="text" width={60} height={28} />
                        <Skeleton variant="rectangular" width={80} height={6} sx={{ mt: 0.5, borderRadius: 1 }} />
                      </Box>
                    </Box>
                    {index < 2 && <Divider />}
                  </Box>
                ))
              ) : dashboardData?.recentProjects?.length > 0 ? (
                dashboardData.recentProjects.map((project, index) => (
                  <Box key={project.id}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" py={2}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {index + 1}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {project.name}
                          </Typography>
                          <Box display="flex" gap={1} alignItems="center">
                            <Chip 
                              label={project.platform} 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip
                              label={project.status}
                              size="small"
                              color={project.status === 'completed' ? 'success' : 'primary'}
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        {project.score ? (
                          <>
                            <Typography variant="h6" fontWeight={700} color="success.main">
                              {project.score}/100
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={project.score}
                              sx={{ width: 80, mt: 0.5 }}
                            />
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {project.status === 'analyzing' ? 'Analyzing...' : 'No score yet'}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {index < dashboardData.recentProjects.length - 1 && <Divider />}
                  </Box>
                ))
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No recent projects found
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setAnalysisExpanded(true)}
                    startIcon={<Add />}
                    sx={{ mt: 2 }}
                  >
                    Create Your First Analysis
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SinglePageDashboard;