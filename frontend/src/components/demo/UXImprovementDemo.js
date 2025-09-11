import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  Alert,
  Chip
} from '@mui/material';
import {
  PlayArrow,
  AutoAwesome,
  Speed,
  TrendingUp
} from '@mui/icons-material';

const UXImprovementDemo = () => {
  const [showResults, setShowResults] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }}>
          🚀 UX Improvement Demo
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
          Test all the new user experience improvements that make AdCopySurge 
          easier, smarter, and more delightful to use.
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <PlayArrow sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  🎯 Smart Onboarding
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Interactive 5-step tutorial that gets new users to their first analysis in under 2 minutes.
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Chip label="2-minute setup" size="small" color="success" sx={{ mr: 1 }} />
                <Chip label="Industry examples" size="small" color="info" sx={{ mr: 1 }} />
                <Chip label="Sample data" size="small" color="warning" />
              </Box>
              
              <Button
                variant="contained"
                fullWidth
                startIcon={<PlayArrow />}
              >
                Try Onboarding
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <AutoAwesome sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  🤖 AI Writing Assistant
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Real-time content analysis with quality scoring, suggestions, and auto-completion.
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Chip label="Live scoring" size="small" color="success" sx={{ mr: 1 }} />
                <Chip label="Auto-complete" size="small" color="info" sx={{ mr: 1 }} />
                <Chip label="Templates" size="small" color="warning" />
              </Box>
              
              <Button
                variant="outlined"
                fullWidth
              >
                Try AI Assistant
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <TrendingUp sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  📊 Smart Results
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Transform complex analysis into clear action steps with priority rankings and one-click fixes.
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Chip label="Priority actions" size="small" color="success" sx={{ mr: 1 }} />
                <Chip label="Quick fixes" size="small" color="info" sx={{ mr: 1 }} />
                <Chip label="Clear guidance" size="small" color="warning" />
              </Box>
              
              <Button
                variant="contained"
                fullWidth
                onClick={() => setShowResults(!showResults)}
                startIcon={<Speed />}
              >
                {showResults ? 'Hide' : 'Show'} Results Demo
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 3 }}>
          🎯 Before vs After Comparison
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, bgcolor: 'error.50', borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'error.main' }}>
                ❌ Before (Current UX Issues)
              </Typography>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li><Typography variant="body2" sx={{ mb: 1 }}>New users are overwhelmed and confused</Typography></li>
                <li><Typography variant="body2" sx={{ mb: 1 }}>Users struggle to write effective ad copy</Typography></li>
                <li><Typography variant="body2" sx={{ mb: 1 }}>Analysis results are hard to understand</Typography></li>
                <li><Typography variant="body2" sx={{ mb: 1 }}>Users don't know what to do with results</Typography></li>
                <li><Typography variant="body2" sx={{ mb: 1 }}>Too many clicks for common actions</Typography></li>
                <li><Typography variant="body2" sx={{ mb: 1 }}>No guidance or suggestions provided</Typography></li>
              </ul>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, bgcolor: 'success.50', borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'success.main' }}>
                ✅ After (With UX Improvements)
              </Typography>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                <li><Typography variant="body2" sx={{ mb: 1 }}>2-minute guided onboarding with instant value</Typography></li>
                <li><Typography variant="body2" sx={{ mb: 1 }}>Real-time AI assistance and quality scoring</Typography></li>
                <li><Typography variant="body2" sx={{ mb: 1 }}>Visual results with clear explanations</Typography></li>
                <li><Typography variant="body2" sx={{ mb: 1 }}>Priority action plans with one-click fixes</Typography></li>
                <li><Typography variant="body2" sx={{ mb: 1 }}>Universal quick actions and shortcuts</Typography></li>
                <li><Typography variant="body2" sx={{ mb: 1 }}>Smart suggestions and auto-completion</Typography></li>
              </ul>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Alert severity="success" sx={{ mt: 4 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
          🎉 Ready to Deploy!
        </Typography>
        <Typography variant="body2">
          All three major UX improvements are implemented and ready for production. 
          Start by enabling the Smart Onboarding for new users, then gradually roll out 
          the Content Assistant and Results Interpreter to existing users.
        </Typography>
      </Alert>
    </Container>
  );
};

export default UXImprovementDemo;
