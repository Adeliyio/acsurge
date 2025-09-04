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
  PlayArrow,
  // New icons for 9 tools
  Policy as ComplianceIcon,
  AttachMoney as ROIIcon,
  Science as ABTestIcon,
  Business as IndustryIcon,
  SearchOff as ForensicsIcon,
  RecordVoiceOver as BrandVoiceIcon,
  Gavel as LegalIcon
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
    "9 AI-powered tools to transform your marketing",
    "From compliance checking to ROI optimization", 
    "Psychology scoring to brand voice alignment",
    "Complete ad copy intelligence suite"
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

  // Complete suite of 9 AI-powered marketing tools
  const toolsShowcase = [
    {
      icon: <Analytics color="primary" sx={{ fontSize: 40 }} />,
      title: "Ad Copy Analyzer",
      description: "Comprehensive analysis of your ad copy with detailed scoring and optimization recommendations",
      badge: "Core Tool",
      link: '/analyze'
    },
    {
      icon: <ComplianceIcon color="primary" sx={{ fontSize: 40 }} />,
      title: "Compliance Checker", 
      description: "Scan for policy violations across Facebook, Google, TikTok and get compliant alternatives",
      badge: "New",
      link: '/compliance-checker'
    },
    {
      icon: <ROIIcon color="primary" sx={{ fontSize: 40 }} />,
      title: "ROI Copy Generator",
      description: "Generate profit-optimized copy targeting high-value customers with premium positioning",
      badge: "New",
      link: '/roi-generator'
    },
    {
      icon: <ABTestIcon color="primary" sx={{ fontSize: 40 }} />,
      title: "A/B Test Generator",
      description: "Create 5-10 variations testing different psychological angles, headlines, and CTAs",
      badge: "New",
      link: '/ab-test-generator'
    },
    {
      icon: <IndustryIcon color="primary" sx={{ fontSize: 40 }} />,
      title: "Industry Optimizer",
      description: "Adapt copy to industry-specific language, pain points, and proven frameworks",
      badge: "New",
      link: '/industry-optimizer'
    },
    {
      icon: <ForensicsIcon color="primary" sx={{ fontSize: 40 }} />,
      title: "Performance Forensics",
      description: "Analyze existing ads to understand why they're performing well or poorly",
      badge: "New",
      link: '/performance-forensics'
    },
    {
      icon: <Psychology color="primary" sx={{ fontSize: 40 }} />,
      title: "Psychology Scorer",
      description: "Score copy on 15+ psychological triggers including urgency, social proof, authority",
      badge: "New",
      link: '/psychology-scorer'
    },
    {
      icon: <BrandVoiceIcon color="primary" sx={{ fontSize: 40 }} />,
      title: "Brand Voice Engine",
      description: "Ensure all generated copy matches your brand voice and tone consistency",
      badge: "New",
      link: '/brand-voice-engine'
    },
    {
      icon: <LegalIcon color="primary" sx={{ fontSize: 40 }} />,
      title: "Legal Risk Scanner",
      description: "Identify problematic claims and get safer alternatives while maintaining impact",
      badge: "New",
      link: '/legal-risk-scanner'
    }
  ];
  
  // Updated features for overview section
  const platformFeatures = [
    {
      icon: <AutoAwesome color="primary" sx={{ fontSize: 40 }} />,
      title: "9 Specialized AI Tools",
      description: "Complete marketing intelligence suite covering every aspect of ad copy optimization"
    },
    {
      icon: <CompareArrows color="primary" sx={{ fontSize: 40 }} />,
      title: "Competitor Intelligence", 
      description: "See how your ads stack up against top-performing competitors in your industry"
    },
    {
      icon: <Timeline color="primary" sx={{ fontSize: 40 }} />,
      title: "Unified Dashboard",
      description: "Access all tools from one interface with centralized reporting and analytics"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director",
      company: "TechStart Inc",
      avatar: "/avatars/sarah.jpg",
      rating: 5,
      text: "Having 9 AI tools in one platform is game-changing. The compliance checker alone saved us from costly policy violations!"
    },
    {
      name: "Mike Rodriguez", 
      role: "Founder",
      company: "E-commerce Pro",
      avatar: "/avatars/mike.jpg", 
      rating: 5,
      text: "The ROI generator and psychology scorer combo increased our profit margins by 67%. Best marketing investment ever."
    },
    {
      name: "Jennifer Liu",
      role: "Agency Owner",
      company: "Digital Growth Co",
      avatar: "/avatars/jennifer.jpg",
      rating: 5, 
      text: "My agency now offers 9 different AI-powered services to clients. AdCopySurge 10x'd our service capabilities."
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 0,
      period: 'forever',
      description: 'Perfect for testing the waters',
      features: [
        'Access to all 9 AI tools',
        '5 analyses per month per tool',
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
        'Full access to all 9 AI tools',
        '100 analyses per month per tool',
        'Advanced AI scoring',
        'Unlimited alternatives & variations',
        'Brand voice profiles',
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
        'Unlimited access to all 9 tools',
        '500+ analyses per tool per month',
        'Premium AI models',
        'White-label reports',
        'API access',
        'Team collaboration',
        'Custom brand voice training',
        'Custom integrations',
        'Dedicated support'
      ],
      buttonText: 'Start 14-Day Free Trial',
      popular: false,
      gradient: 'linear-gradient(45deg, #FF6B6B, #FF8E53)'
    }
  ];

  const stats = [
    { number: "9", label: "AI-Powered Tools" },
    { number: "300%", label: "Average ROAS Increase" },
    { number: "10,000+", label: "Ads Analyzed" },
    { number: "500+", label: "Happy Customers" }
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
                Complete AI Marketing 
                <Box component="span" sx={{ color: '#FFD700', display: 'block' }}>
                  Intelligence Suite
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
                9 specialized AI tools to analyze, optimize, and supercharge your ad campaigns.
                From compliance checking to ROI optimization – everything you need in one platform.
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
                    🎯 Multi-Tool Dashboard
                  </Typography>
                  <Box sx={{ textAlign: 'left', color: 'text.secondary' }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      📊 <strong>Ad Analysis:</strong> 92/100 score
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      🛡️ <strong>Compliance:</strong> All platforms clear
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      💰 <strong>ROI Potential:</strong> +67% profit increase
                    </Typography>
                    <Typography variant="body2">
                      🧪 <strong>A/B Tests:</strong> 5 variations ready
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

      {/* Tools Showcase Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
              9 AI-Powered Tools,
              <Box component="span" sx={{ color: 'primary.main' }}>
                {' '}One Platform
              </Box>
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Complete marketing intelligence suite - from compliance checking to ROI optimization
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {toolsShowcase.map((tool, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8
                    }
                  }}
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate(tool.link);
                    } else {
                      navigate('/register');
                    }
                  }}
                >
                  {tool.badge && (
                    <Chip
                      label={tool.badge}
                      color={tool.badge === 'Core Tool' ? 'primary' : 'secondary'}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        fontWeight: 600,
                        fontSize: '0.7rem'
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {tool.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {tool.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {tool.description}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAuthenticated) {
                          navigate(tool.link);
                        } else {
                          navigate('/register');
                        }
                      }}
                    >
                      Try Tool
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Platform Features Overview */}
      <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
              Why Choose 
              <Box component="span" sx={{ color: 'primary.main' }}>
                AdCopySurge?
              </Box>
            </Typography>
            <Typography variant="h6" color="text.secondary">
              The most comprehensive AI marketing platform available
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {platformFeatures.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
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
            Ready to Access All 9 AI Tools?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)' }}>
            Join 500+ marketers using our complete AI marketing intelligence suite
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
            Try All 9 Tools Free Now
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
