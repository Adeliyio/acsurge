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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
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
  PlayArrow as PlayIcon,
  ExpandMore,
  HelpOutline,
  Security,
  Verified,
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
  const { isAuthenticated, loading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [typedText, setTypedText] = useState('');
  
  // Redirect authenticated users to dashboard automatically
  useEffect(() => {
    if (!loading && isAuthenticated) {
      console.log('🔄 Authenticated user on landing page, redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);
  
  // Typing animation effect - moved before early returns to fix hooks order
  const phrases = [
    "9 Powerful tools to transform your marketing",
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
  
  // Show loading or redirect immediately if authenticated
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ bgcolor: 'background.default' }}
      >
        <Box textAlign="center">
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Checking authentication...
          </Typography>
        </Box>
      </Box>
    );
  }
  
  // If authenticated, don't render the landing page (redirect is happening)
  if (isAuthenticated) {
    return null;
  }

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  // Complete suite of 9 premium intelligence marketing tools
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
      title: "9 Specialized Tools",
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
      avatar: null, // Using initials fallback
      initials: "SC",
      rating: 5,
      text: "Having 9 tools in one platform is game-changing. The compliance checker alone saved us from costly policy violations!"
    },
    {
      name: "Mike Rodriguez", 
      role: "Founder",
      company: "E-commerce Pro",
      avatar: null, // Using initials fallback
      initials: "MR",
      rating: 5,
      text: "The ROI generator and psychology scorer combo increased our profit margins by 67%. Best marketing investment ever."
    },
    {
      name: "Jennifer Liu",
      role: "Agency Owner",
      company: "Digital Growth Co",
      avatar: null, // Using initials fallback
      initials: "JL",
      rating: 5, 
      text: "My agency now offers 9 different services to clients. AdCopySurge 10x'd our service capabilities."
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 0,
      period: 'forever',
      description: 'Perfect for testing the waters',
      features: [
        'Access to all 9 tools',
        '5 analyses per month per tool',
        'Basic scoring & feedback', 
        '3 algorithm-generated alternatives',
        'Email support',
        '30-day trial of Pro features'
      ],
      buttonText: 'Start Free',
      popular: false,
      gradient: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
      guarantee: false
    },
    {
      name: 'Professional',
      price: 49,
      annualPrice: 39,
      period: 'month',
      annualPeriod: 'month (billed annually)',
      description: 'For serious marketers',
      features: [
        'Full access to all 9 tools',
        '100 analyses per month per tool',
        'Advanced scoring & insights',
        'Unlimited alternatives & variations',
        'Brand voice profiles',
        'Competitor benchmarking',
        'PDF reports & exports',
        'Priority support'
      ],
      buttonText: 'Start 14-Day Free Trial',
      popular: true,
      gradient: 'linear-gradient(45deg, #2196F3, #21CBF3)',
      guarantee: true,
      savings: '20% off annual'
    },
    {
      name: 'Agency',
      price: 99,
      annualPrice: 79,
      period: 'month',
      annualPeriod: 'month (billed annually)',
      description: 'For agencies & teams',
      features: [
        'Unlimited access to all 9 tools',
        '500+ analyses per tool per month',
        'Premium analytics models',
        'White-label reports & branding',
        'API access & integrations',
        'Team collaboration tools',
        'Custom brand voice training',
        'Priority implementation support',
        'Dedicated account manager'
      ],
      buttonText: 'Start 14-Day Free Trial',
      popular: false,
      gradient: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
      guarantee: true,
      savings: '20% off annual'
    }
  ];

  const faqData = [
    {
      question: "How do all 9 tools work together?",
      answer: "Each tool is designed to complement the others in a complete workflow. Start with the Ad Copy Analyzer for baseline scoring, use Compliance Checker to avoid policy violations, generate variations with A/B Test Generator, optimize for your industry, and track performance with our unified dashboard. All tools share data to provide comprehensive insights."
    },
    {
      question: "What makes AdCopySurge different from other ad tools?",
              answer: "We're the only platform offering 9 specialized intelligence tools in one premium suite. While others focus on just content generation or basic analysis, we provide end-to-end optimization covering compliance, psychology, ROI optimization, legal risk scanning, and performance forensics - all with industry-specific customization."
    },
    {
      question: "How accurate are the ROAS increase predictions?",
      answer: "Our 300% average ROAS increase is based on 90-day performance studies of 200+ customers who used our platform consistently. Results vary by industry, ad spend, and implementation, but 87% of our users see measurable improvement within 30 days. We provide detailed methodology and case studies in our resources section."
    },
    {
      question: "Can I use this for Facebook, Google, TikTok, and other platforms?",
      answer: "Yes! Our Compliance Checker supports all major ad platforms including Facebook/Meta, Google Ads, TikTok, LinkedIn, Twitter, and Snapchat. Our psychology scoring and optimization tools work universally across platforms, and we regularly update our platform-specific guidelines."
    },
    {
      question: "Do I need technical knowledge to use the tools?",
      answer: "Not at all! Our tools are designed for marketers, not developers. Simply paste your ad copy, select your platform and industry, and get actionable insights in seconds. For advanced users, we offer API access and custom integrations, but the core platform requires no technical expertise."
    },
    {
      question: "What's included in the free plan?",
      answer: "The free plan includes access to all 9 tools with 5 analyses per month per tool (45 total analyses). You'll get basic scoring, feedback, and 3 AI-generated alternatives. It's perfect for testing our platform and seeing results before upgrading to unlimited usage."
    },
    {
      question: "How does the Brand Voice Engine learn my brand?",
      answer: "The Brand Voice Engine analyzes your existing successful ads, website copy, and brand guidelines to create a custom voice profile. It learns your tone, style, key messaging, and preferred terminology. The more examples you provide, the better it becomes at maintaining consistency across all generated content."
    },
    {
      question: "Can agencies use this for multiple clients?",
      answer: "Absolutely! Our Agency plan is specifically designed for managing multiple client accounts. You get white-label reports, team collaboration features, unlimited access to all tools, custom brand voice profiles for each client, and dedicated support. Many agencies use us to offer specialized services to their clients."
    },
    {
      question: "What kind of support do you provide?",
      answer: "Free users get email support, Pro users get priority support with faster response times, and Agency users get dedicated support with direct access to our team. All users have access to our comprehensive knowledge base, video tutorials, and community forum. We also offer onboarding calls for new Agency customers."
    },
    {
      question: "Is there a money-back guarantee?",
      answer: "Yes! We offer a 30-day money-back guarantee on all paid plans. If you're not completely satisfied with the results, contact our support team within 30 days for a full refund. We're confident in our platform's ability to improve your ad performance."
    }
  ];

  const stats = [
    { number: "9", label: "Specialized Intelligence Tools", sublabel: "Complete marketing suite" },
    { number: "300%", label: "Average ROAS Increase", sublabel: "Based on 90-day customer studies" },
    { number: "10,000+", label: "Ads Analyzed Daily", sublabel: "Real-time processing" },
    { number: "500+", label: "Active Customers", sublabel: "Agencies & enterprises" }
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
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                  fontWeight: 800,
                  mb: 2,
                  lineHeight: { xs: 1.3, md: 1.2 }
                }}
              >
9 Premium Intelligence Tools That 
                <Box component="span" sx={{ color: '#FFD700', display: 'block' }}>
                  Optimize Every Ad Dollar
                </Box>
              </Typography>
              
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  height: { xs: '80px', md: '60px' },
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' }
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
                9 specialized intelligence tools to analyze, optimize, and supercharge your ad campaigns.
                From compliance checking to ROI optimization – everything you need in one premium platform.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  startIcon={<PlayIcon />}
                  sx={{
                    background: 'linear-gradient(45deg, #FFD700 0%, #FFA000 100%)',
                    color: '#000',
                    fontSize: { xs: '1.1rem', md: '1.2rem' },
                    px: { xs: 4, md: 6 },
                    py: { xs: 2, md: 2.5 },
                    minHeight: { xs: 48, md: 'auto' }, // Minimum touch target
                    borderRadius: 3,
                    fontWeight: 800,
                    textTransform: 'none',
                    boxShadow: '0 8px 25px rgba(255, 193, 7, 0.4)',
                    border: '3px solid rgba(255,255,255,0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                      animation: 'pulse 2s ease-in-out infinite',
                      borderRadius: '50%'
                    },
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FFC700 0%, #FF8F00 100%)',
                      transform: 'translateY(-4px) scale(1.03)',
                      boxShadow: '0 12px 35px rgba(255, 193, 7, 0.7)',
                      '&::before': {
                        animation: 'pulse 1s ease-in-out infinite'
                      }
                    },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  🚀 Access Intelligence Suite - Start Free
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

              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                ✅ No credit card required • ✅ 5 free analyses • ✅ Setup in 30 seconds
              </Typography>

              {/* Trust Indicators */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 1, sm: 3 }}
                justifyContent="center"
                alignItems="center"
                sx={{ opacity: 0.9 }}
              >
                <Chip 
                  icon={<Security sx={{ fontSize: '1rem !important' }} />} 
                  label="SOC 2 Compliant" 
                  variant="outlined" 
                  size="small"
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    borderColor: 'rgba(255,255,255,0.3)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiChip-icon': { color: '#FFD700' }
                  }}
                />
                <Chip 
                  icon={<Verified sx={{ fontSize: '1rem !important' }} />} 
                  label="GDPR Ready" 
                  variant="outlined" 
                  size="small"
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    borderColor: 'rgba(255,255,255,0.3)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiChip-icon': { color: '#FFD700' }
                  }}
                />
                <Chip 
                  icon={<Star sx={{ fontSize: '1rem !important' }} />} 
                  label="500+ Happy Customers" 
                  variant="outlined" 
                  size="small"
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    borderColor: 'rgba(255,255,255,0.3)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiChip-icon': { color: '#FFD700' }
                  }}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  textAlign: 'center'
                }}
              >
                {/* Demo Video Component */}
                <Paper
                  elevation={20}
                  sx={{
                    position: 'relative',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
                    }
                  }}
                  onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {/* Video Placeholder */}
                  <Box
                    sx={{
                      width: '100%',
                      height: 300,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'white',
                      position: 'relative'
                    }}
                  >
                    {/* Play Button */}
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mb: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          backgroundColor: 'white'
                        }
                      }}
                    >
                      <PlayIcon 
                        sx={{ 
                          fontSize: 40, 
                          color: 'primary.main',
                          ml: 0.5 // Slight offset to center visually
                        }} 
                      />
                    </Box>
                    
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      🎯 See AdCopySurge in Action
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      90-second demo of all 9 tools
                    </Typography>
                    
                    {/* Demo Stats Overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 20,
                        left: 20,
                        right: 20,
                        display: 'flex',
                        justifyContent: 'space-between',
                        opacity: 0.8
                      }}
                    >
                      <Chip 
                        label="92/100 Score" 
                        size="small" 
                        sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                      <Chip 
                        label="+67% ROI" 
                        size="small" 
                        sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                      <Chip 
                        label="5 Tools" 
                        size="small" 
                        sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    </Box>
                  </Box>
                </Paper>
                
                {/* Video Upload Instructions for Dev Team */}
                {process.env.NODE_ENV === 'development' && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      mt: 2, 
                      color: 'rgba(255,255,255,0.7)',
                      fontStyle: 'italic' 
                    }}
                  >
                    🎥 Dev Note: Replace with actual demo video (demo-video.mp4)
                  </Typography>
                )}
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
          <Grid container spacing={{ xs: 2, md: 4 }}>
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
                  {stat.sublabel && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem', mt: 0.5 }}>
                      {stat.sublabel}
                    </Typography>
                  )}
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
              9 Specialized Tools,
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
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    borderRadius: 4,
                    background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
                    border: '1px solid',
                    borderColor: 'rgba(0,0,0,0.05)',
                    overflow: 'visible',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow: '0 20px 40px rgba(37, 99, 235, 0.15), 0 8px 16px rgba(0,0,0,0.1)',
                      borderColor: 'primary.main',
                      '& .tool-icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                        color: 'primary.main'
                      },
                      '& .try-button': {
                        transform: 'translateX(4px)',
                        boxShadow: 2
                      }
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
                    <Box 
                      sx={{ 
                        mb: 2, 
                        '& > svg': { 
                          transition: 'all 0.3s ease',
                          filter: 'drop-shadow(0 4px 8px rgba(37, 99, 235, 0.1))'
                        }
                      }}
                      className="tool-icon"
                    >
                      {React.cloneElement(tool.icon, { 
                        sx: { 
                          fontSize: 48, 
                          color: 'primary.main',
                          transition: 'all 0.3s ease'
                        } 
                      })}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {tool.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {tool.description}
                    </Typography>
                    <Button
                      variant="contained"
                      size="medium"
                      className="try-button"
                      sx={{ 
                        mt: 2,
                        px: 3,
                        py: 1,
                        borderRadius: 3,
                        fontWeight: 600,
                        textTransform: 'none',
                        background: 'linear-gradient(45deg, #2563eb 30%, #3b82f6 90%)',
                        boxShadow: '0 3px 12px rgba(37, 99, 235, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1e40af 30%, #2563eb 90%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)'
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAuthenticated) {
                          navigate(tool.link);
                        } else {
                          navigate('/register');
                        }
                      }}
                    >
                      Try {tool.title}
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
              The most comprehensive marketing platform available
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
                      alt={`${testimonial.name}, ${testimonial.role} at ${testimonial.company}`}
                      sx={{ 
                        width: 48, 
                        height: 48, 
                        mr: 2,
                        bgcolor: 'primary.main',
                        fontWeight: 600,
                        fontSize: '1.1rem'
                      }}
                    >
                      {testimonial.initials}
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
                      {plan.annualPrice ? (
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', mb: 1 }}>
                            <Typography variant="h2" sx={{ fontWeight: 800 }}>
                              ${plan.annualPrice}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                ml: 1,
                                textDecoration: 'line-through',
                                opacity: 0.6
                              }}
                            >
                              ${plan.price}
                            </Typography>
                          </Box>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: plan.popular ? 'rgba(255,255,255,0.8)' : 'text.secondary' 
                            }}
                          >
                            /{plan.annualPeriod}
                          </Typography>
                          {plan.savings && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'block',
                                color: plan.popular ? '#FFD700' : 'success.main',
                                fontWeight: 600,
                                mt: 0.5
                              }}
                            >
                              💰 Save {plan.savings}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Box>
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
                      )}
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
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              🔒 Secure payment • 💳 Cancel anytime • 🔄 30-day money-back guarantee
            </Typography>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
              🛡️ 100% Risk-Free Guarantee
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
              If you're not completely satisfied with AdCopySurge within 30 days, 
              we'll refund every penny. No questions asked.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="md">
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
              Frequently Asked Questions
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Everything you need to know about our 9-tool marketing suite
            </Typography>
          </Box>

          <Stack spacing={2}>
            {faqData.map((faq, index) => (
              <Accordion
                key={index}
                elevation={1}
                sx={{
                  borderRadius: 2,
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    boxShadow: 3
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    },
                    '& .MuiAccordionSummary-content': {
                      my: 1.5
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <HelpOutline color="primary" sx={{ fontSize: '1.2rem' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {faq.question}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 3, px: 3 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>

          <Box textAlign="center" sx={{ mt: 6 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Still have questions? We're here to help!
            </Typography>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/contact')}
            >
              Contact Our Team
            </Button>
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
            Ready to Access All 9 Tools?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)' }}>
            Join 500+ marketers using our complete marketing intelligence suite
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            startIcon={<ArrowForward />}
            sx={{
              background: 'linear-gradient(45deg, #FFD700 0%, #FFA000 100%)',
              color: '#000',
              fontSize: '1.3rem',
              px: 8,
              py: 2.5,
              borderRadius: 4,
              fontWeight: 800,
              textTransform: 'none',
              boxShadow: '0 8px 32px rgba(255, 193, 7, 0.5)',
              border: '3px solid rgba(255,255,255,0.3)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                transition: 'left 0.7s ease'
              },
              '&:hover': {
                background: 'linear-gradient(45deg, #FFC700 0%, #FF8F00 100%)',
                transform: 'translateY(-4px) scale(1.05)',
                boxShadow: '0 12px 40px rgba(255, 193, 7, 0.7)',
                '&::before': {
                  left: '100%'
                }
              },
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            💪 Access All 9 Intelligence Tools FREE - No Credit Card
          </Button>
          
          <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255,255,255,0.8)' }}>
            No credit card required • Get results in 60 seconds
          </Typography>
        </Container>
      </Box>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.5; }
          100% { transform: scale(0.8); opacity: 1; }
        }
      `}</style>
    </Box>
  );
};

export default LandingPage;
