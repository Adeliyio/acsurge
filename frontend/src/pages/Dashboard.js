import React, { useState } from 'react';
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
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Speed,
  Analytics,
  Add,
  CheckCircle
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../services/authContext';

const Dashboard = () => {
  const { user, subscription } = useAuth();
  const [isLoading] = useState(false);

  // Simple static data for now - we'll make it dynamic later
  const dashboardData = {
    total_analyses: 0,
    monthly_analyses: 0,
    avg_score: 0,
    avg_score_improvement: '0%'
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'primary', chipLabel }) => (
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
            <Icon sx={{ fontSize: 32, color: `${color}.main`, mb: 1 }} />
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
        
        {isLoading && <LinearProgress sx={{ mt: 2 }} />}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
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
              borderRadius: 3
            }}
          >
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
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {dashboardData.monthly_analyses} analyses this month
                    </Typography>
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
            </Paper>
        </Grid>

        {/* Monthly Usage Metric */}
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Monthly Usage"
            value={dashboardData.monthly_analyses}
            subtitle="analyses this month"
            icon={Analytics}
            color="primary"
            chipLabel="This Month"
          />
        </Grid>

        {/* Performance Score Metric */}
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Performance Score"
            value={dashboardData.avg_score_improvement}
            subtitle="average score improvement"
            icon={Speed}
            color="warning"
            chipLabel="Avg Score"
          />
        </Grid>

        {/* Total Analyses Metric */}
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Total Analyses"
            value={dashboardData.total_analyses}
            subtitle="lifetime analyses completed"
            icon={Assessment}
            color="success"
            chipLabel="All Time"
          />
        </Grid>

        {/* Getting Started Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, mt: 2 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              🚀 Getting Started with AdCopySurge
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Ready to optimize your ad copy? Here's how to get the most out of AdCopySurge:
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <CheckCircle color="success" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      1. Analyze Your First Ad
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start by analyzing your existing ad copy to get performance insights and improvement suggestions.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <TrendingUp color="primary" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      2. Review Performance Scores
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get detailed scores on clarity, persuasion, emotion, CTA strength, and platform optimization.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Speed color="warning" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      3. Implement Improvements
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Use our AI-generated alternatives and suggestions to create high-converting ad copy.
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

        {/* Quick Stats */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              📊 Account Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" color="primary.main" fontWeight={700}>
                  {subscription?.subscription_tier?.toUpperCase() || 'FREE'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Plan
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" color="success.main" fontWeight={700}>
                  {dashboardData.total_analyses}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Analyses
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" color="warning.main" fontWeight={700}>
                  {dashboardData.monthly_analyses}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This Month
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" color="info.main" fontWeight={700}>
                  {user ? 'Active' : 'Inactive'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Account Status
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
