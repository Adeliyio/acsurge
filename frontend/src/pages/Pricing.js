import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../services/authContext';
import { useNavigate } from 'react-router-dom';
import paddleService from '../services/paddleService';
import toast from 'react-hot-toast';

const Pricing = () => {
  const { isAuthenticated, subscription, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState({});
  
  // Safe initialization of paddleProducts with fallback
  const [paddleProducts] = useState(() => {
    try {
      return paddleService.getPaddleProductMapping();
    } catch (error) {
      console.error('Failed to load Paddle products:', error);
      return {
        basic: { productId: 'basic_monthly', name: 'Basic Plan', price: 49 },
        pro: { productId: 'pro_monthly', name: 'Pro Plan', price: 99 }
      };
    }
  });

  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '5 ad analyses per month',
        'Basic scoring',
        'Limited alternatives',
        'Community support'
      ],
      buttonText: 'Get Started',
      popular: false
    },
    {
      name: 'Basic',
      price: 49,
      period: 'month',
      description: 'Great for small businesses',
      features: [
        '100 ad analyses per month',
        'Full AI analysis',
        'Unlimited alternatives',
        'Competitor benchmarking',
        'PDF reports',
        'Email support'
      ],
      buttonText: 'Upgrade to Basic',
      popular: true
    },
    {
      name: 'Pro',
      price: 99,
      period: 'month',
      description: 'Best for agencies and teams',
      features: [
        '500 ad analyses per month',
        'Premium AI models',
        'Advanced competitor analysis',
        'White-label reports',
        'API access',
        'Priority support',
        'Custom integrations'
      ],
      buttonText: 'Upgrade to Pro',
      popular: false
    }
  ];

  const handlePlanSelect = async (plan) => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }

    if (plan.name === 'Free') {
      navigate('/dashboard');
      return;
    }

    // Handle paid plan upgrade with Paddle
    const planKey = plan.name.toLowerCase();
    setLoading(prev => ({ ...prev, [planKey]: true }));
    
    try {
      const paddleProduct = paddleProducts[planKey];
      
      if (!paddleProduct) {
        throw new Error('Invalid plan selected');
      }

      // Check if Paddle is configured
      const paddleVendorId = process.env.REACT_APP_PADDLE_VENDOR_ID;
      
      if (!paddleVendorId) {
        // Development mode - show info message
        toast.error(
          `Paddle billing not configured. Would upgrade to ${plan.name} plan ($${plan.price}/month)`,
          { duration: 4000 }
        );
        console.log('🛍️ Development mode: Would upgrade to:', {
          plan: plan.name,
          price: plan.price,
          productId: paddleProduct.productId
        });
        return;
      }

      // Open Paddle checkout overlay
      await paddleService.openCheckout({
        productId: paddleProduct.productId,
        email: user?.email || '',
        userId: user?.id || '',
        planName: plan.name,
        successCallback: (data) => {
          toast.success(`Successfully upgraded to ${plan.name} plan!`);
          setTimeout(() => {
            navigate('/dashboard?success=true');
          }, 2000);
        },
        closeCallback: () => {
          console.log('Paddle checkout closed');
        }
      });
      
    } catch (error) {
      console.error('Upgrade failed:', error);
      toast.error(`Failed to upgrade: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [planKey]: false }));
    }
  };

  const isCurrentPlan = (planName) => {
    if (!subscription) return planName === 'Free';
    // Check if subscription has the expected property
    const currentTier = subscription.subscription_tier || subscription.tier;
    return currentTier === planName.toLowerCase();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Choose Your Plan
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Unlock the power of AI-driven ad analysis and optimization. 
          Start free and upgrade as your business grows.
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan, index) => (
          <Grid item key={plan.name} xs={12} md={4}>
            <Card
              elevation={plan.popular ? 8 : 2}
              sx={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: plan.popular ? '2px solid' : 'none',
                borderColor: plan.popular ? 'primary.main' : 'none'
              }}
            >
              {plan.popular && (
                <Chip
                  label="Most Popular"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: -10,
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                />
              )}

              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h4" component="h2" gutterBottom>
                  {plan.name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {plan.description}
                </Typography>
                
                <Box sx={{ my: 3 }}>
                  <Typography variant="h3" component="span">
                    ${plan.price}
                  </Typography>
                  <Typography variant="h6" component="span" color="text.secondary">
                    /{plan.period}
                  </Typography>
                </Box>

                <List>
                  {plan.features.map((feature, featureIndex) => (
                    <ListItem key={featureIndex} disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>

              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button
                  fullWidth
                  variant={plan.popular ? 'contained' : 'outlined'}
                  size="large"
                  onClick={() => handlePlanSelect(plan)}
                  disabled={isCurrentPlan(plan.name) || loading[plan.name.toLowerCase()]}
                  startIcon={loading[plan.name.toLowerCase()] ? <CircularProgress size={20} /> : null}
                >
                  {isCurrentPlan(plan.name) 
                    ? 'Current Plan' 
                    : loading[plan.name.toLowerCase()] 
                    ? 'Processing...' 
                    : plan.buttonText
                  }
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box textAlign="center" sx={{ mt: 6 }}>
        <Typography variant="body2" color="text.secondary">
          All plans include a 14-day free trial. No credit card required for Free plan.
        </Typography>
      </Box>
    </Container>
  );
};

export default Pricing;
