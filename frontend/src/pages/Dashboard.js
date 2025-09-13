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
  Skeleton
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Speed,
  Analytics,
  Add,
  CheckCircle,
  PlayArrow,
  Lightbulb,
  Timeline,
  Star,
  AutoAwesome
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { useDashboardAnalytics, useRefreshProjects } from '../hooks/useProjects';
import ErrorBoundary from '../components/ErrorBoundary';
import SmartOnboarding from '../components/onboarding/SmartOnboarding';

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

const QuickActionCard = ({ title, description, icon: Icon, color, buttonText, buttonLink, onClick }) => (
  <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
    <CardContent sx={{ textAlign: 'center', py: 4 }}>
      <Avatar
        sx={{
          width: 56,
          height: 56,
          bgcolor: `${color}.main`,
          mx: 'auto',
          mb: 2
        }}
      >
        <Icon sx={{ fontSize: 28 }} />
      </Avatar>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
        {description}
      </Typography>
      <Button
        variant="contained"
        color={color}
        component={buttonLink ? RouterLink : 'button'}
        to={buttonLink}
        onClick={onClick}
        fullWidth
        sx={{ py: 1.5 }}
      >
        {buttonText}
      </Button>
    </CardContent>
  </Card>
);

const TipCard = ({ title, message, action, actionLink, severity = 'info' }) => (
  <Alert
    severity={severity}
    sx={{ mb: 2 }}
    action={
      action && actionLink && (
        <Button 
          size="small" 
          component={RouterLink}
          to={actionLink}
          sx={{ textTransform: 'none' }}
        >
          {action}
        </Button>
      )
    }
  >
    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
      {title}
    </Typography>
    <Typography variant="body2">
      {message}
    </Typography>
  </Alert>
);

const Dashboard = () => {
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
  
  // Check if user needs onboarding
  useEffect(() => {
    const checkOnboardingNeeded = () => {
      const hasCompletedOnboarding = localStorage.getItem('adcopysurge_onboarding_completed');
      const isNewUser = !dashboardData?.totalAnalyses || dashboardData.totalAnalyses === 0;
      
      // Show onboarding for new users who haven't completed it
      if (isNewUser && !hasCompletedOnboarding && !isDashboardLoading) {
        // Small delay to ensure dashboard is loaded
        setTimeout(() => setShowOnboarding(true), 1000);
      }
    };
    
    checkOnboardingNeeded();
  }, [dashboardData, isDashboardLoading]);

  // Static tips - these could also come from API in the future
  const tips = [
    {
      title: 'Optimize Your Headlines',
      message: 'Headlines with emotional triggers see 23% better engagement. Try our Psychology Scorer to improve yours.',
      action: 'Try Now',
      actionLink: '/psychology-scorer',
      severity: 'success'
    },
    {
      title: 'Weekly Performance Report',
      message: 'Your performance summary for this week is ready to view.',
      action: 'View Report',
      actionLink: '/reports',
      severity: 'info'
    }
  ];

  const handleQuickAnalyze = () => {
    navigate('/analyze');
  };
  
  const handleOnboardingComplete = () => {
    localStorage.setItem('adcopysurge_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Smart Onboarding */}
      <SmartOnboarding 
        open={showOnboarding}
        onClose={handleOnboardingComplete}
        userType={dashboardData?.totalAnalyses > 0 ? 'returning' : 'new'}
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
            {/* Background decoration */}
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
                    Welcome back, {subscription?.full_name || user?.email?.split('@')[0] || 'User'}! 👋
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                    Transform your ad copy with AI-powered insights and boost performance across all platforms
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
                    component={RouterLink}
                    to="/analyze"
                    size="large"
                    startIcon={<Add />}
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
                    ✨ Analyze New Ad
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
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

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
            🚀 Quick Actions
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Analyze Ad Copy"
            description="Get instant feedback on your ad copy performance"
            icon={Analytics}
            color="primary"
            buttonText="Start Analysis"
            buttonLink="/analyze"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Check Compliance"
            description="Ensure your ads meet platform requirements"
            icon={CheckCircle}
            color="success"
            buttonText="Check Now"
            buttonLink="/compliance-checker"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Generate A/B Tests"
            description="Create multiple ad variations to test performance"
            icon={PlayArrow}
            color="warning"
            buttonText="Generate"
            buttonLink="/ab-test-generator"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="View Reports"
            description="Check your performance analytics and insights"
            icon={Assessment}
            color="secondary"
            buttonText="View Reports"
            buttonLink="/reports"
          />
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
                // Loading state for recent projects
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
                    component={RouterLink}
                    to="/projects"
                    startIcon={<Add />}
                    sx={{ mt: 2 }}
                  >
                    Create Your First Project
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Smart Tips - Horizontal Layout */}
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lightbulb color="warning" />
            💡 Smart Tips
          </Typography>
          
          <Grid container spacing={3}>
            {tips.map((tip, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Alert
                      severity={tip.severity}
                      sx={{ 
                        border: 'none',
                        bgcolor: 'transparent',
                        p: 0,
                        '& .MuiAlert-icon': {
                          mt: 0.5
                        }
                      }}
                      action={
                        tip.action && tip.actionLink && (
                          <Button 
                            size="small" 
                            component={RouterLink}
                            to={tip.actionLink}
                            sx={{ textTransform: 'none' }}
                            variant="contained"
                            color={tip.severity}
                          >
                            {tip.action}
                          </Button>
                        )
                      }
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        {tip.title}
                      </Typography>
                      <Typography variant="body2">
                        {tip.message}
                      </Typography>
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            
            {/* Pro Tip Card */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'rgba(37, 99, 235, 0.05)' }}>
                <CardContent>
                  <Alert 
                    severity="info" 
                    sx={{ 
                      border: 'none',
                      bgcolor: 'transparent',
                      p: 0,
                      '& .MuiAlert-icon': {
                        mt: 0.5
                      }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      💡 Pro Tip
                    </Typography>
                    <Typography variant="body2">
                      Use our project workspace to analyze multiple ad variations at once for better insights.
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Getting Started Guide */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, mt: 2 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              🎯 Getting Started with AdCopySurge
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              New to AdCopySurge? Follow these steps to optimize your first ad campaign:
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <CheckCircle color="success" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      1. Analyze Your Ad
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upload your ad copy and get instant AI-powered feedback on performance potential.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <TrendingUp color="primary" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      2. Review Insights
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get detailed scores on compliance, psychology, brand voice, and legal risk factors.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Speed color="warning" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      3. Optimize & Test
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Apply suggestions and generate A/B test variations to maximize campaign performance.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Box display="flex" gap={2} mt={4}>
              <Button
                variant="contained"
                component={RouterLink}
                to="/analyze"
                startIcon={<Add />}
                size="large"
              >
                Start Your First Analysis
              </Button>
              <Button
                variant="outlined"
                component={RouterLink}
                to="/pricing"
                size="large"
              >
                View Pricing Plans
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
