import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  TrendingUp,
  Speed,
  Psychology,
  CheckCircle,
  Star,
  AutoAwesome,
  Analytics,
  CompareArrows,
  Timeline,
  Lightbulb,
  ArrowForward,
  PlayArrow
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [typedText, setTypedText] = useState('');
  
  // Typing animation effect
  const phrases = [
    "Transform weak ads into conversion machines",
    "Boost your ROAS by up to 300%", 
    "Beat your competitors with AI-powered copy",
    "Turn browsers into buyers instantly"
  ];
  
  useEffect(() => {
    let currentPhrase = 0;
    let currentChar = 0;
    let isDeleting = false;
    
    const typeEffect = () => {
      const current = phrases[currentPhrase];
      
      if (isDeleting) {
        setTypedText(current.substring(0, currentChar - 1));
        currentChar--;
      } else {
        setTypedText(current.substring(0, currentChar + 1));
        currentChar++;
      }
      
      if (!isDeleting && currentChar === current.length) {
        setTimeout(() => isDeleting = true, 2000);
      } else if (isDeleting && currentChar === 0) {
        isDeleting = false;
        currentPhrase = (currentPhrase + 1) % phrases.length;
      }
    };
    
    const timer = setInterval(typeEffect, isDeleting ? 50 : 100);
    return () => clearInterval(timer);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const features = [
    {
      icon: <Psychology color="primary" sx={{ fontSize: 40 }} />,
      title: "AI-Powered Analysis",
      description: "Advanced NLP algorithms analyze your ad copy against 50+ conversion factors"
    },
    {
      icon: <CompareArrows color="primary" sx={{ fontSize: 40 }} />,
      title: "Competitor Intelligence", 
      description: "See how your ads stack up against top-performing competitors in your industry"
    },
    {
      icon: <AutoAwesome color="primary" sx={{ fontSize: 40 }} />,
      title: "Instant Optimization",
      description: "Get AI-generated alternatives that are proven to convert better"
    },
    {
      icon: <Analytics color="primary" sx={{ fontSize: 40 }} />,
      title: "Performance Scoring",
      description: "Get detailed scores for clarity, persuasion, emotion, and CTA strength"
    },
    {
      icon: <Timeline color="primary" sx={{ fontSize: 40 }} />,
      title: "Success Tracking",
      description: "Track improvements and ROI across all your campaigns"
    },
    {
      icon: <Lightbulb color="primary" sx={{ fontSize: 40 }} />,
      title: "Industry Insights",
      description: "Platform-specific recommendations for Facebook, Google, LinkedIn & more"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director",
      company: "TechStart Inc",
      avatar: "/avatars/sarah.jpg",
      rating: 5,
      text: "AdCopySurge increased our Facebook ad CTR by 240% in just 2 weeks. The AI suggestions are incredible!"
    },
    {
      name: "Mike Rodriguez", 
      role: "Founder",
      company: "E-commerce Pro",
      avatar: "/avatars/mike.jpg", 
      rating: 5,
      text: "I was spending $50k/month on ads with poor results. AdCopySurge helped me cut costs by 40% while doubling conversions."
    },
    {
      name: "Jennifer Liu",
      role: "Agency Owner",
      company: "Digital Growth Co",
      avatar: "/avatars/jennifer.jpg",
      rating: 5, 
      text: "This tool pays for itself in the first campaign. My team now creates winning ads 10x faster."
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 0,
      period: 'forever',
      description: 'Perfect for testing the waters',
      features: [
        '5 ad analyses per month',
        'Basic scoring & feedback', 
        '3 AI-generated alternatives',
        'Email support'
      ],
      buttonText: 'Start Free',
      popular: false,
      gradient: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)'
    },
    {
      name: 'Professional',
      price: 49,
      period: 'month',
      description: 'For serious marketers',
      features: [
        '100 ad analyses per month',
        'Advanced AI scoring',
        'Unlimited alternatives',
        'Competitor benchmarking',
        'PDF reports',
        'Priority support'
      ],
      buttonText: 'Start 14-Day Free Trial',
      popular: true,
      gradient: 'linear-gradient(45deg, #2196F3, #21CBF3)'
    },
    {
      name: 'Agency',
      price: 99,
      period: 'month', 
      description: 'For agencies & teams',
      features: [
        '500 ad analyses per month',
        'Premium AI models',
        'White-label reports',
        'API access',
        'Team collaboration',
        'Custom integrations',
        'Dedicated support'
      ],
      buttonText: 'Start 14-Day Free Trial',
      popular: false,
      gradient: 'linear-gradient(45deg, #FF6B6B, #FF8E53)'
    }
  ];

  const stats = [
    { number: "300%", label: "Average ROAS Increase" },
    { number: "10,000+", label: "Ads Analyzed" },
    { number: "500+", label: "Happy Customers" },
    { number: "2.5M+", label: "Ad Spend Optimized" }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 800,
                  mb: 2,
                  lineHeight: 1.2
                }}
              >
                Turn Your Ads Into 
                <Box component="span" sx={{ color: '#FFD700', display: 'block' }}>
                  Conversion Machines
                </Box>
              </Typography>
              
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.9)'
                }}
              >
                {typedText}
                <Box
                  component="span"
                  sx={{
                    width: '3px',
                    height: '24px',
                    backgroundColor: '#FFD700',
                    ml: 1,
                    animation: 'blink 1s infinite'
                  }}
                />
              </Typography>

              <Typography variant="h6" sx={{ mb: 4, color: 'rgba(255,255,255,0.8)' }}>
                AI-powered ad copy analysis that reveals exactly why your ads aren't converting
                and gives you proven alternatives that do.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  startIcon={<PlayArrow />}
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#000',
                    fontSize: '1.1rem',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#FFC700',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Analyze Your First Ad Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                  onClick={() => document.getElementById('demo-section').scrollIntoView({ behavior: 'smooth' })}
                >
                  Watch Demo
                </Button>
              </Stack>

              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                ✅ No credit card required • ✅ 5 free analyses • ✅ Setup in 30 seconds
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  textAlign: 'center',
                  '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                  }
                }}
              >
                {/* Demo Screenshot Placeholder */}
                <Paper
                  elevation={20}
                  sx={{
                    p: 3,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3
                  }}
                >
                  <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
                    🎯 Live Analysis Preview
                  </Typography>
                  <Box sx={{ textAlign: 'left', color: 'text.secondary' }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      📊 <strong>Overall Score:</strong> 78/100
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      💡 <strong>Key Issues:</strong> Weak CTA, Low urgency
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      🚀 <strong>Improvement:</strong> +45% predicted CTR
                    </Typography>
                    <Typography variant="body2">
                      ⚡ <strong>Time to Fix:</strong> 2 minutes
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Floating Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            opacity: 0.1,
            fontSize: '200px',
            transform: 'rotate(15deg)'
          }}
        >
          📈
        </Box>
      </Box>

      {/* Social Proof Stats */}
      <Box sx={{ py: 6, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box textAlign="center">
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: 'primary.main',
                      mb: 1
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Problem/Solution Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
                Stop Wasting Money on 
                <Box component="span" sx={{ color: 'error.main' }}>
                  {' '}Underperforming Ads
                </Box>
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                {[
                  "Your ads get plenty of impressions but terrible click-through rates",
                  "You're spending thousands but not seeing the ROI you expected", 
                  "You don't know why competitor ads outperform yours",
                  "Creating new ad variations takes forever and rarely improves results"
                ].map((problem, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'error.main',
                        mr: 2,
                        flexShrink: 0
                      }}
                    />
                    <Typography variant="body1" color="text.secondary">
                      {problem}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                AdCopySurge solves this in minutes, not months.
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  borderRadius: 4,
                  p: 4,
                  position: 'relative'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                  ⚡ Before vs After
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, backgroundColor: '#ffebee' }}>
                      <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 600 }}>
                        BEFORE
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        CTR: 0.8%<br/>
                        CPC: $2.50<br/>
                        Conversions: 12<br/>
                        ROAS: 2.1x
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, backgroundColor: '#e8f5e8' }}>
                      <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 600 }}>
                        AFTER
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        CTR: 2.4% (+200%)<br/>
                        CPC: $1.80 (-28%)<br/>
                        Conversions: 45 (+275%)<br/>
                        ROAS: 6.8x (+224%)
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
              Everything You Need to Create 
              <Box component="span" sx={{ color: 'primary.main' }}>
                {' '}Winning Ads
              </Box>
            </Typography>
            <Typography variant="h6" color="text.secondary">
              AI-powered analysis that gives you the insights top agencies charge $10k+ for
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
              Trusted by 500+ Marketers
            </Typography>
            <Typography variant="h6" color="text.secondary">
              See what our customers are saying
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    p: 3,
                    position: 'relative'
                  }}
                >
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} sx={{ color: '#FFD700', fontSize: 20 }} />
                    ))}
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                    "{testimonial.text}"
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={testimonial.avatar}
                      sx={{ width: 48, height: 48, mr: 2 }}
                    >
                      {testimonial.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}, {testimonial.company}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box id="pricing" sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
              Choose Your Plan
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Start free and scale as you grow
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  elevation={plan.popular ? 8 : 2}
                  sx={{
                    position: 'relative',
                    height: '100%',
                    background: plan.popular ? plan.gradient : 'background.paper',
                    color: plan.popular ? 'white' : 'inherit',
                    border: plan.popular ? '3px solid' : '1px solid',
                    borderColor: plan.popular ? 'primary.main' : 'divider'
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="MOST POPULAR"
                      color="secondary"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontWeight: 600
                      }}
                    />
                  )}

                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {plan.name}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mb: 3, 
                        color: plan.popular ? 'rgba(255,255,255,0.8)' : 'text.secondary' 
                      }}
                    >
                      {plan.description}
                    </Typography>
                    
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h2" sx={{ fontWeight: 800 }}>
                        ${plan.price}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: plan.popular ? 'rgba(255,255,255,0.8)' : 'text.secondary' 
                        }}
                      >
                        /{plan.period}
                      </Typography>
                    </Box>

                    <List sx={{ mb: 4 }}>
                      {plan.features.map((feature, featureIndex) => (
                        <ListItem key={featureIndex} sx={{ py: 0.5, px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle 
                              sx={{ 
                                color: plan.popular ? 'rgba(255,255,255,0.9)' : 'primary.main',
                                fontSize: 20 
                              }} 
                            />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature}
                            primaryTypographyProps={{
                              variant: 'body2',
                              color: plan.popular ? 'rgba(255,255,255,0.9)' : 'inherit'
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>

                    <Button
                      fullWidth
                      variant={plan.popular ? 'contained' : 'outlined'}
                      size="large"
                      onClick={handleGetStarted}
                      sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        backgroundColor: plan.popular ? 'rgba(255,255,255,0.15)' : undefined,
                        borderColor: plan.popular ? 'rgba(255,255,255,0.5)' : undefined,
                        color: plan.popular ? 'white' : undefined,
                        '&:hover': {
                          backgroundColor: plan.popular ? 'rgba(255,255,255,0.25)' : undefined
                        }
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center" sx={{ mt: 6 }}>
            <Typography variant="body1" color="text.secondary">
              🔒 Secure payment • 💳 Cancel anytime • 🔄 30-day money-back guarantee
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Ready to 3x Your Ad Performance?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)' }}>
            Join 500+ marketers who've already transformed their campaigns with AI
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            startIcon={<ArrowForward />}
            sx={{
              backgroundColor: '#FFD700',
              color: '#000',
              fontSize: '1.2rem',
              px: 6,
              py: 2,
              borderRadius: 2,
              fontWeight: 700,
              '&:hover': {
                backgroundColor: '#FFC700',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Start Your Free Analysis Now
          </Button>
          
          <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255,255,255,0.8)' }}>
            No credit card required • Get results in 60 seconds
          </Typography>
        </Container>
      </Box>

      {/* CSS for blinking cursor */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </Box>
  );
};

export default LandingPage;
