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

const AdAnalysis = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
      toast.error(error.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Analyze Your Ad Copy
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center" mb={4}>
          Get AI-powered insights to optimize your ad performance
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Platform Selection */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Platform</InputLabel>
                <Controller
                  name="platform"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Platform">
                      <MenuItem value="facebook">Facebook</MenuItem>
                      <MenuItem value="google">Google Ads</MenuItem>
                      <MenuItem value="linkedin">LinkedIn</MenuItem>
                      <MenuItem value="tiktok">TikTok</MenuItem>
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
                  />
                )}
              />
            </Grid>

            {/* Ad Content */}
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
                    helperText={errors.headline?.message}
                    placeholder="Enter your ad headline..."
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
                    helperText={errors.body_text?.message}
                    placeholder="Enter your ad body text..."
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
                    helperText={errors.cta?.message}
                    placeholder="e.g., Get Started Free"
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
                  />
                )}
              />
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
              <Box display="flex" justifyContent="center" mt={3}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ minWidth: 200 }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Ad'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AdAnalysis;
