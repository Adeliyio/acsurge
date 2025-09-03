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
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../services/authContext';
import apiService from '../services/apiService';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsData, historyData] = await Promise.all([
        apiService.getDashboardAnalytics(),
        apiService.getAnalysisHistory(5, 0)
      ]);
      
      setAnalytics(analyticsData);
      setRecentAnalyses(historyData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionColor = (tier) => {
    switch (tier) {
      case 'pro': return 'success';
      case 'basic': return 'primary';
      default: return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" gutterBottom>
                  Welcome back, {user?.full_name}!
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Analyze your ad copy and boost performance with AI insights
                </Typography>
              </Box>
              <Box>
                <Chip 
                  label={`${user?.subscription_tier?.toUpperCase()} Plan`}
                  color={getSubscriptionColor(user?.subscription_tier)}
                  sx={{ mr: 2 }}
                />
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/analyze"
                  size="large"
                >
                  Analyze New Ad
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Usage Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Usage
              </Typography>
              <Typography variant="h3" color="primary">
                {user?.monthly_analyses || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                analyses this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Score
              </Typography>
              <Typography variant="h3" color="primary">
                {analytics?.avg_score_improvement || 'N/A'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                improvement over time
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Analyses
              </Typography>
              <Typography variant="h3" color="primary">
                {analytics?.total_analyses || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                lifetime analyses
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Analyses */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Recent Analyses
              </Typography>
              <Button component={RouterLink} to="/analyze">
                View All
              </Button>
            </Box>
            
            {recentAnalyses.length > 0 ? (
              <List>
                {recentAnalyses.map((analysis) => (
                  <ListItem 
                    key={analysis.id}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => navigate(`/results/${analysis.id}`)}
                  >
                    <ListItemText
                      primary={analysis.headline}
                      secondary={
                        <Box display="flex" justifyContent="space-between">
                          <span>{analysis.platform} • {new Date(analysis.created_at).toLocaleDateString()}</span>
                          <Chip 
                            label={`Score: ${analysis.overall_score}`}
                            color={getScoreColor(analysis.overall_score)}
                            size="small"
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary" textAlign="center" py={4}>
                No analyses yet. Start by analyzing your first ad!
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="outlined"
                component={RouterLink}
                to="/analyze"
                fullWidth
              >
                New Analysis
              </Button>
              <Button
                variant="outlined"
                component={RouterLink}
                to="/pricing"
                fullWidth
              >
                Upgrade Plan
              </Button>
              <Button
                variant="outlined"
                component={RouterLink}
                to="/profile"
                fullWidth
              >
                Account Settings
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Performance Chart */}
        {analytics?.monthly_usage && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.monthly_usage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="analyses" fill="#2563eb" />
                  <Bar dataKey="avg_score" fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;
