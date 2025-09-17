import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Fade
} from '@mui/material';
import {
  Business,
  TrendingUp,
  Psychology,
  Rocket,
  CheckCircle,
  ArrowForward,
  Close
} from '@mui/icons-material';
import StartIcon from '../icons/StartIcon';
import { useAuth } from '../../services/authContext';
import toast from 'react-hot-toast';

const ONBOARDING_STEPS = [
  {
    label: 'Welcome',
    title: '🚀 Welcome to AdCopySurge!',
    subtitle: 'Your AI-powered ad optimization platform'
  },
  {
    label: 'Company Info',
    title: '🏢 Tell us about your business',
    subtitle: 'Help us personalize your experience'
  },
  {
    label: 'Goals',
    title: '🎯 What are your main goals?',
    subtitle: 'Choose what matters most to you'
  },
  {
    label: 'Sample Analysis',
    title: '⚡ Let\'s try a quick analysis',
    subtitle: 'See AdCopySurge in action with a sample ad'
  },
  {
    label: 'Ready!',
    title: '🎉 You\'re all set!',
    subtitle: 'Welcome to your new advertising advantage'
  }
];

const INDUSTRY_OPTIONS = [
  'E-commerce',
  'SaaS/Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Real Estate',
  'Food & Beverage',
  'Fashion & Beauty',
  'Travel & Hospitality',
  'Fitness & Wellness',
  'Automotive',
  'Professional Services',
  'Other'
];

const GOAL_OPTIONS = [
  {
    id: 'improve_performance',
    title: 'Improve Ad Performance',
    description: 'Optimize existing ads for better results',
    icon: TrendingUp,
    color: 'primary'
  },
  {
    id: 'create_better_ads',
    title: 'Create Better Ads',
    description: 'Generate high-converting ad copy',
    icon: Rocket,
    color: 'secondary'
  },
  {
    id: 'understand_audience',
    title: 'Understand Audience',
    description: 'Learn what resonates with customers',
    icon: Psychology,
    color: 'warning'
  },
  {
    id: 'ensure_compliance',
    title: 'Ensure Compliance',
    description: 'Meet platform requirements and avoid issues',
    icon: CheckCircle,
    color: 'success'
  }
];

const SAMPLE_AD = {
  headline: '50% Off Everything - Limited Time Only!',
  body: 'Don\'t miss out on our biggest sale of the year. Premium quality products at unbeatable prices. Shop now and save big on all your favorites.',
  cta: 'Shop Now',
  platform: 'facebook'
};

const SmartOnboarding = ({ open, onClose, userType = 'new' }) => {
  const { user, supabase } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    industry: '',
    goals: [],
    role: '',
    teamSize: ''
  });
  const [sampleAnalysisResult, setSampleAnalysisResult] = useState(null);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleGoalToggle = (goalId) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const runSampleAnalysis = async () => {
    setLoading(true);
    try {
      // Simulate analysis with realistic delay and results
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setSampleAnalysisResult({
        overall_score: 78,
        clarity_score: 82,
        persuasion_score: 75,
        emotion_score: 85,
        cta_strength: 72,
        suggestions: [
          'Consider personalizing the headline for your target audience',
          'The urgency is good, but could be more specific',
          'Add social proof to increase trust'
        ]
      });
      
      toast.success('Sample analysis completed!');
    } catch (error) {
      toast.error('Sample analysis failed, but don\'t worry - the real thing works great!');
      // Set fallback result
      setSampleAnalysisResult({
        overall_score: 78,
        suggestions: ['Analysis completed with sample data']
      });
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      // Save onboarding data to user profile
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          company: formData.company,
          industry: formData.industry,
          role: formData.role,
          team_size: formData.teamSize,
          goals: formData.goals,
          has_completed_onboarding: true,
          onboarding_completed_at: new Date().toISOString(),
          subscription_tier: 'free',
          monthly_analyses: 0,
          subscription_active: true
        }, {
          onConflict: 'id'
        });
      
      if (error) {
        console.error('Error saving onboarding data:', error);
        // Don't block completion for profile save errors
      }
      
      // Mark onboarding as completed in localStorage
      localStorage.setItem('adcopysurge_onboarding_completed', 'true');
      
      toast.success('Welcome to AdCopySurge! 🎉');
      
      // Close the onboarding modal first
      onClose();
      
      // Add a small delay to ensure the modal closes before navigation
      setTimeout(() => {
        // Use window.location for a hard redirect to ensure dashboard loads properly
        window.location.href = '/dashboard';
      }, 500);
      
    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast.error('There was an issue saving your preferences, but you can continue using the app.');
      onClose();
      // Still redirect to dashboard even if profile save fails
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Welcome
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, mb: 2 }}>
              🚀 Welcome to AdCopySurge!
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              Your AI-powered platform for creating, analyzing, and optimizing ad copy that converts.
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                  <CardContent>
                    <TrendingUp sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>Analyze Performance</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get detailed insights into what makes your ads work
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                  <CardContent>
                    <Rocket sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>Generate Variations</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create A/B test variations powered by AI
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                  <CardContent>
                    <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>Ensure Compliance</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Meet platform requirements and avoid policy violations
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Button 
              variant="contained" 
              size="large" 
              onClick={handleNext} 
              endIcon={<ArrowForward />}
              sx={{ mt: 4, px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Let's Get Started
            </Button>
          </Box>
        );

      case 1: // Company Info
        return (
          <Box sx={{ py: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  variant="outlined"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="e.g. Acme Corp"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Industry</InputLabel>
                  <Select
                    value={formData.industry}
                    label="Industry"
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  >
                    {INDUSTRY_OPTIONS.map((industry) => (
                      <MenuItem key={industry} value={industry}>{industry}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Your Role"
                  variant="outlined"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g. Marketing Manager"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Team Size</InputLabel>
                  <Select
                    value={formData.teamSize}
                    label="Team Size"
                    onChange={(e) => setFormData(prev => ({ ...prev, teamSize: e.target.value }))}
                  >
                    <MenuItem value="1">Just me</MenuItem>
                    <MenuItem value="2-5">2-5 people</MenuItem>
                    <MenuItem value="6-10">6-10 people</MenuItem>
                    <MenuItem value="11-25">11-25 people</MenuItem>
                    <MenuItem value="25+">25+ people</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 2: // Goals
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
              Select all that apply (you can always change these later):
            </Typography>
            
            <Grid container spacing={2}>
              {GOAL_OPTIONS.map((goal) => {
                const Icon = goal.icon;
                const isSelected = formData.goals.includes(goal.id);
                
                return (
                  <Grid item xs={12} md={6} key={goal.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        border: isSelected ? 2 : 1,
                        borderColor: isSelected ? `${goal.color}.main` : 'divider',
                        bgcolor: isSelected ? `${goal.color}.50` : 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <CardActionArea onClick={() => handleGoalToggle(goal.id)} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Icon sx={{ color: `${goal.color}.main`, mr: 2, fontSize: 28 }} />
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {goal.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {goal.description}
                        </Typography>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            
            {formData.goals.length > 0 && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Selected goals:
                </Typography>
                <Box>
                  {formData.goals.map(goalId => {
                    const goal = GOAL_OPTIONS.find(g => g.id === goalId);
                    return (
                      <Chip 
                        key={goalId}
                        label={goal.title}
                        color={goal.color}
                        sx={{ m: 0.5 }}
                        onDelete={() => handleGoalToggle(goalId)}
                      />
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        );

      case 3: // Sample Analysis
        return (
          <Box sx={{ py: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Let's analyze a sample ad to show you how AdCopySurge works!
            </Alert>
            
            <Card sx={{ mb: 3, p: 3 }}>
              <Typography variant="h6" gutterBottom>Sample Facebook Ad</Typography>
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {SAMPLE_AD.headline}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {SAMPLE_AD.body}
                </Typography>
                <Button variant="contained" size="small" disabled>
                  {SAMPLE_AD.cta}
                </Button>
              </Box>
            </Card>
            
            {!sampleAnalysisResult && (
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={runSampleAnalysis}
                  disabled={loading}
                  startIcon={loading ? <LinearProgress /> : <StartIcon />}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {loading ? 'Analyzing...' : 'Analyze This Ad'}
                </Button>
                
                {loading && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Running AI analysis...
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
            
            {sampleAnalysisResult && (
              <Fade in={Boolean(sampleAnalysisResult)}>
                <Card sx={{ p: 3, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.main' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'success.dark' }}>
                    ✅ Analysis Complete!
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Overall Score</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {sampleAnalysisResult.overall_score}%
                      </Typography>
                    </Grid>
                    {sampleAnalysisResult.clarity_score && (
                      <>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Clarity</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {sampleAnalysisResult.clarity_score}%
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Persuasion</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {sampleAnalysisResult.persuasion_score}%
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Emotion</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {sampleAnalysisResult.emotion_score}%
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                  
                  {sampleAnalysisResult.suggestions && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Key Suggestions:</Typography>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                        {sampleAnalysisResult.suggestions.map((suggestion, index) => (
                          <li key={index}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>{suggestion}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Box>
                  )}
                </Card>
              </Fade>
            )}
          </Box>
        );

      case 4: // Complete
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 72, color: 'success.main', mb: 2 }} />
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }}>
              🎉 You're All Set!
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              Your AdCopySurge account is ready. You can now create projects, analyze ads, and optimize your campaigns.
            </Typography>
            
            <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 3, mb: 4, maxWidth: 500, mx: 'auto' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                What's next?
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'left' }}>
                • Create your first project and analyze real ads<br/>
                • Explore our 9 specialized AI tools<br/>
                • Set up A/B tests with generated variations<br/>
                • View detailed performance reports
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              size="large"
              onClick={completeOnboarding}
              disabled={loading}
              endIcon={loading ? null : <ArrowForward />}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              {loading ? 'Setting up your dashboard...' : 'Go to Dashboard'}
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 1: // Company info - require at least company name
        return formData.company.trim().length > 0;
      case 2: // Goals - require at least one goal
        return formData.goals.length > 0;
      case 3: // Sample analysis - require completion
        return sampleAnalysisResult !== null;
      default:
        return true;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={userType === 'new' ? undefined : onClose}
      maxWidth="md" 
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          minHeight: '60vh'
        }
      }}
    >
      <DialogContent sx={{ position: 'relative', p: 0 }}>
        {/* Close button for returning users */}
        {userType !== 'new' && (
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 16, top: 16, zIndex: 1 }}
          >
            <Close />
          </IconButton>
        )}
        
        <Box sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {ONBOARDING_STEPS.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.subtitle}
                  </Typography>
                </StepLabel>
                <StepContent>
                  {renderStepContent(index)}
                  
                  {/* Navigation buttons */}
                  {index > 0 && index < ONBOARDING_STEPS.length - 1 && (
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button
                        onClick={handleBack}
                        variant="outlined"
                        disabled={loading}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={!canProceed() || loading}
                        endIcon={<ArrowForward />}
                      >
                        Continue
                      </Button>
                    </Box>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SmartOnboarding;
