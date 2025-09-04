import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../services/apiService';
import { ErrorMessage } from '../components/ui';

const AdAnalysis = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [competitorAds, setCompetitorAds] = useState([]);
  
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      headline: '',
      body_text: '',
      cta: '',
      platform: 'facebook',
      target_audience: '',
      industry: ''
    }
  });

  const addCompetitorAd = () => {
    setCompetitorAds([...competitorAds, {
      id: Date.now(),
      headline: '',
      body_text: '',
      cta: '',
      platform: 'facebook',
      source_url: ''
    }]);
  };

  const updateCompetitorAd = (id, field, value) => {
    setCompetitorAds(competitorAds.map(ad => 
      ad.id === id ? { ...ad, [field]: value } : ad
    ));
  };

  const removeCompetitorAd = (id) => {
    setCompetitorAds(competitorAds.filter(ad => ad.id !== id));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const analysisData = {
        ad: {
          headline: data.headline,
          body_text: data.body_text,
          cta: data.cta,
          platform: data.platform,
          target_audience: data.target_audience || null,
          industry: data.industry || null
        },
        competitor_ads: competitorAds.filter(ad => ad.headline && ad.body_text && ad.cta)
      };

      const response = await apiService.analyzeAd(analysisData);
      toast.success('Analysis completed successfully!');
      navigate(`/results/${response.analysis_id}`);
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Analysis failed';
      setError(new Error(errorMessage));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography 
          variant="h3" 
          gutterBottom 
          sx={{ 
            fontWeight: 800,
            mb: 2,
            letterSpacing: '-0.02em'
          }}
        >
          📊 Analyze Your Ad Copy
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            opacity: 0.9,
            fontWeight: 400,
            maxWidth: 500,
            mx: 'auto'
          }}
        >
          Get AI-powered insights to optimize your ad performance and boost conversions across all platforms
        </Typography>
      </Paper>

      {/* Form Section */}
      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            {/* Configuration Section */}
            <Grid item xs={12}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  backgroundColor: 'rgba(37, 99, 235, 0.02)',
                  border: '1px solid rgba(37, 99, 235, 0.1)'
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600,
                    color: 'primary.main',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  ⚙️ Platform & Context
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontWeight: 500 }}>Platform *</InputLabel>
                      <Controller
                        name="platform"
                        control={control}
                        render={({ field }) => (
                          <Select {...field} label="Platform *">
                            <MenuItem value="facebook">Facebook Ads</MenuItem>
                            <MenuItem value="google">Google Ads</MenuItem>
                            <MenuItem value="linkedin">LinkedIn Ads</MenuItem>
                            <MenuItem value="tiktok">TikTok Ads</MenuItem>
                          </Select>
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="industry"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Industry (Optional)"
                          fullWidth
                          placeholder="e.g., SaaS, E-commerce, Fitness"
                          InputLabelProps={{ sx: { fontWeight: 500 } }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Ad Content Section */}
            <Grid item xs={12}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  backgroundColor: 'rgba(124, 58, 237, 0.02)',
                  border: '1px solid rgba(124, 58, 237, 0.1)'
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600,
                    color: 'secondary.main',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  📝 Your Ad Content
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Controller
                      name="headline"
                      control={control}
                      rules={{ required: 'Headline is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Headline"
                          fullWidth
                          required
                          error={!!errors.headline}
                          helperText={errors.headline?.message || "The main attention-grabbing text of your ad"}
                          placeholder="Enter your compelling ad headline..."
                          InputLabelProps={{ sx: { fontWeight: 500 } }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255, 255, 255, 0.7)'
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="body_text"
                      control={control}
                      rules={{ required: 'Body text is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Body Text"
                          fullWidth
                          required
                          multiline
                          rows={4}
                          error={!!errors.body_text}
                          helperText={errors.body_text?.message || "The main content that explains your value proposition"}
                          placeholder="Enter your ad body text..."
                          InputLabelProps={{ sx: { fontWeight: 500 } }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255, 255, 255, 0.7)'
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="cta"
                      control={control}
                      rules={{ required: 'Call-to-action is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Call-to-Action"
                          fullWidth
                          required
                          error={!!errors.cta}
                          helperText={errors.cta?.message || "The action you want users to take"}
                          placeholder="e.g., Get Started Free, Learn More, Shop Now"
                          InputLabelProps={{ sx: { fontWeight: 500 } }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255, 255, 255, 0.7)'
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="target_audience"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Target Audience (Optional)"
                          fullWidth
                          placeholder="e.g., SMB owners, Marketing agencies"
                          helperText="Help us provide more targeted insights"
                          InputLabelProps={{ sx: { fontWeight: 500 } }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255, 255, 255, 0.7)'
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Competitor Ads Section */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">
                    Competitor Ads (Optional) - {competitorAds.length} added
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body2" color="textSecondary" mb={2}>
                      Add competitor ads to benchmark your performance
                    </Typography>
                    
                    {competitorAds.map((ad) => (
                      <Paper key={ad.id} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Competitor Headline"
                              fullWidth
                              size="small"
                              value={ad.headline}
                              onChange={(e) => updateCompetitorAd(ad.id, 'headline', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Platform</InputLabel>
                              <Select
                                value={ad.platform}
                                label="Platform"
                                onChange={(e) => updateCompetitorAd(ad.id, 'platform', e.target.value)}
                              >
                                <MenuItem value="facebook">Facebook</MenuItem>
                                <MenuItem value="google">Google</MenuItem>
                                <MenuItem value="linkedin">LinkedIn</MenuItem>
                                <MenuItem value="tiktok">TikTok</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              label="Body Text"
                              fullWidth
                              multiline
                              rows={2}
                              size="small"
                              value={ad.body_text}
                              onChange={(e) => updateCompetitorAd(ad.id, 'body_text', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="CTA"
                              fullWidth
                              size="small"
                              value={ad.cta}
                              onChange={(e) => updateCompetitorAd(ad.id, 'cta', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box display="flex" justifyContent="flex-end">
                              <Button 
                                color="error" 
                                onClick={() => removeCompetitorAd(ad.id)}
                              >
                                Remove
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                    
                    <Button variant="outlined" onClick={addCompetitorAd}>
                      Add Competitor Ad
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" mt={4}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ 
                    minWidth: 280,
                    py: 2,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(245, 158, 11, 0.4)',
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
                      🧑‍💻 Analyzing Your Ad...
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
      </Paper>
      
      {/* Error Display */}
      {error && (
        <Box sx={{ mt: 2 }}>
          <ErrorMessage
            variant="inline"
            title="Analysis Failed"
            message={error.message}
            error={error}
            onRetry={() => setError(null)}
            showActions={false}
          />
        </Box>
      )}
    </Container>
  );
};

export default AdAnalysis;
