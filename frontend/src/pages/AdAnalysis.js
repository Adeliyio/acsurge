import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Badge,
  Tooltip,
} from '@mui/material';
import { ExpandMore, ContentCopy, Upload, Create, Edit, AutoAwesome } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../services/apiService';
import { ErrorMessage } from '../components/ui';
import PasteInput from '../components/input/PasteInput';
import FileUploadInput from '../components/input/FileUploadInput';
import GenerateAdInput from '../components/input/GenerateAdInput';
import AdCopyReview from '../components/input/AdCopyReview';
import VariationOptionsCard from '../components/shared/VariationOptionsCard';
import VariationPreview from '../components/shared/VariationPreview';
import IntelligentContentAssistant from '../components/shared/IntelligentContentAssistant';
import { useVariationGenerator } from '../hooks/useVariationGenerator';
import { createAdDraft, createDefaultVariationOptions } from '../types/adCopy';
import sharedWorkflowService from '../services/sharedWorkflowService';
import AnalysisToolsSelector from '../components/shared/AnalysisToolsSelector';
import { DEFAULT_ENABLED_TOOLS } from '../constants/analysisTools';

const AdAnalysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [competitorAds, setCompetitorAds] = useState([]);
  const [inputMethod, setInputMethod] = useState('manual');
  const [adCopies, setAdCopies] = useState([]);
  
  // Variation generation state
  const [variationOptions, setVariationOptions] = useState(createDefaultVariationOptions());
  const [showVariationOptions, setShowVariationOptions] = useState(false);
  const [generatedVariations, setGeneratedVariations] = useState([]);
  
  
  const {
    generateSingle,
    results: variationResults,
    loading: generatingVariations,
    error: variationError,
    clearResults: clearVariationResults
  } = useVariationGenerator();
  
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      headline: '',
      body_text: '',
      cta: '',
      platform: 'facebook',
      target_audience: '',
      industry: '',
      enabledTools: DEFAULT_ENABLED_TOOLS,
      autoAnalyze: true
    }
  });
  
  // Handle pre-filled data from onboarding
  useEffect(() => {
    const prefillData = location.state?.prefillData;
    if (prefillData) {
      setValue('headline', prefillData.headline || '');
      setValue('body_text', prefillData.body_text || '');
      setValue('cta', prefillData.cta || '');
      setValue('platform', prefillData.platform || 'facebook');
      setValue('industry', prefillData.industry || '');
      setValue('target_audience', prefillData.target_audience || '');
      
      // Show variation options if coming from onboarding
      if (location.state?.isFromOnboarding) {
        setShowVariationOptions(true);
      }
    }
  }, [location.state, setValue]);

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

  // Ad copies management functions
  const addAdCopy = () => {
    const newAdCopy = {
      id: Date.now().toString(),
      headline: '',
      body_text: '',
      cta: '',
      platform: 'facebook',
      industry: '',
      target_audience: ''
    };
    setAdCopies(prev => [...prev, newAdCopy]);
  };

  const updateAdCopy = (id, updatedData) => {
    setAdCopies(prev => prev.map(ad => 
      (ad.id === id || prev.indexOf(ad) === id) ? { ...ad, ...updatedData, id: ad.id } : ad
    ));
  };

  const removeAdCopy = (id) => {
    if (adCopies.length > 1) {
      setAdCopies(prev => prev.filter((ad, index) => ad.id !== id && index !== id));
    }
  };

  const handleAdCopiesParsed = (newAdCopies) => {
    const adsWithIds = newAdCopies.map(ad => ({
      ...ad,
      id: Date.now().toString() + Math.random().toString(36).substring(2)
    }));
    setAdCopies(adsWithIds);
  };

  const handleClearAdCopies = () => {
    setAdCopies([]);
  };

  const onSubmit = async (data, generateVariations = false) => {
    setLoading(true);
    setError(null);
    
    try {
      if (generateVariations && showVariationOptions) {
        // Generate variations first, then optionally analyze
        const adDraft = createAdDraft({
          headline: data.headline,
          body_text: data.body_text,
          cta: data.cta,
          platform: data.platform,
          target_audience: data.target_audience,
          industry: data.industry
        }, 'manual');
        
        const variationResult = await generateSingle(adDraft, variationOptions);
        setGeneratedVariations(variationResult.variations);
        
        // If auto-analyze is enabled in variation options, proceed to analysis
        if (variationOptions.autoAnalyze) {
          return await handleAnalyzeVariations(variationResult.variations, true);
        }
        
        toast.success(`Generated ${variationResult.variations.length} variations! Select which ones to analyze.`);
      } else {
        // Use new unified analysis workflow
        const analysisData = {
          headline: data.headline,
          body_text: data.body_text,
          cta: data.cta,
          platform: data.platform,
          target_audience: data.target_audience || null,
          industry: data.industry || null,
          competitor_ads: competitorAds.filter(ad => ad.headline && ad.body_text && ad.cta)
        };

        const response = await sharedWorkflowService.startAdhocAnalysis(
          analysisData, 
          data.enabledTools || DEFAULT_ENABLED_TOOLS
        );
        
        toast.success('Analysis started! Running through all selected tools...');
        navigate(`/project/${response.project_id}/results`);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Analysis failed';
      setError(new Error(errorMessage));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAnalyzeVariations = async (selectedVariations, autoAnalyze = true) => {
    try {
      if (!selectedVariations.length) {
        toast.error('Please select at least one variation to analyze');
        return;
      }
      
      // Create a project and run all variations through the 8 tools
      const projectData = {
        projectName: `Variations Analysis - ${new Date().toLocaleString()}`,
        description: 'Auto-generated project from variation analysis',
        headline: selectedVariations[0].headline,
        bodyText: selectedVariations[0].body_text,
        cta: selectedVariations[0].cta,
        platform: selectedVariations[0].platform,
        industry: selectedVariations[0].industry,
        targetAudience: selectedVariations[0].target_audience,
        enabledTools: watch('enabledTools') || DEFAULT_ENABLED_TOOLS,
        autoAnalyze: true,
        tags: ['variations', 'auto-generated']
      };
      
      const project = await sharedWorkflowService.createProject(projectData);
      
      // If multiple variations, create additional entries
      if (selectedVariations.length > 1) {
        // Store additional variations in project metadata
        await sharedWorkflowService.addProjectVariations(project.project_id, selectedVariations.slice(1));
      }
      
      toast.success(`Created project and analyzing ${selectedVariations.length} variations!`);
      navigate(`/project/${project.project_id}/results`);
      
    } catch (error) {
      console.error('Variation analysis failed:', error);
      toast.error('Failed to create analysis project');
    }
  };

  const handleAnalyzeAll = async () => {
    setLoading(true);
    setError(null);

    try {
      const validAds = adCopies.filter(ad => ad.headline && ad.body_text && ad.cta);
      
      if (validAds.length === 0) {
        toast.error('Please ensure all ads have headline, body text, and CTA filled');
        return;
      }

      if (validAds.length === 1) {
        // Single ad - use new unified analysis workflow
        const analysisData = {
          headline: validAds[0].headline,
          body_text: validAds[0].body_text,
          cta: validAds[0].cta,
          platform: validAds[0].platform,
          industry: validAds[0].industry,
          target_audience: validAds[0].target_audience,
          competitor_ads: competitorAds.filter(ad => ad.headline && ad.body_text && ad.cta)
        };
        
        const response = await sharedWorkflowService.startAdhocAnalysis(
          analysisData, 
          watch('enabledTools') || DEFAULT_ENABLED_TOOLS
        );
        
        toast.success('Analysis started! Running through all selected tools...');
        navigate(`/project/${response.project_id}/results`);
      } else {
        // Multiple ads - create separate projects for each (for now)
        // TODO: Implement proper batch project creation
        const results = [];
        
        for (const ad of validAds) {
          const analysisData = {
            headline: ad.headline,
            body_text: ad.body_text,
            cta: ad.cta,
            platform: ad.platform,
            industry: ad.industry,
            target_audience: ad.target_audience,
            competitor_ads: competitorAds.filter(comp => comp.headline && comp.body_text && comp.cta)
          };
          
          const response = await sharedWorkflowService.startAdhocAnalysis(
            analysisData, 
            watch('enabledTools') || DEFAULT_ENABLED_TOOLS
          );
          
          results.push(response);
        }
        
        toast.success(`Analysis started for ${validAds.length} ads!`);
        
        // Navigate to the first project's results
        if (results.length > 0) {
          navigate(`/project/${results[0].project_id}/results`);
        }
      }
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

      {/* Input Method Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={inputMethod}
          onChange={(_, newValue) => setInputMethod(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTabs-scrollButtons': {
              color: 'primary.main'
            }
          }}
        >
          <Tab 
            value="manual" 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Edit fontSize="small" />
                Manual Input
              </Box>
            }
          />
          <Tab 
            value="paste" 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ContentCopy fontSize="small" />
                <Badge badgeContent={adCopies.length > 0 ? adCopies.length : null} color="primary">
                  Paste Ad Copy
                </Badge>
              </Box>
            }
          />
          <Tab 
            value="file" 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Upload fontSize="small" />
                <Badge badgeContent={adCopies.length > 0 ? adCopies.length : null} color="primary">
                  File Upload
                </Badge>
              </Box>
            }
          />
          <Tab 
            value="generate" 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Create fontSize="small" />
                <Badge badgeContent={adCopies.length > 0 ? adCopies.length : null} color="primary">
                  Generate Copy
                </Badge>
              </Box>
            }
          />
        </Tabs>
        
        {/* Tab Tooltips/Help Text */}
        <Box sx={{ px: 3, py: 2, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            {inputMethod === 'manual' && '📝 Enter your ad copy manually using the form below'}
            {inputMethod === 'paste' && '📋 Paste multiple ad copies from any source - our AI will parse them automatically'}
            {inputMethod === 'file' && '📁 Upload CSV, PDF, Word, or text files containing ad copy'}
            {inputMethod === 'generate' && '🤖 Use AI to generate compelling ad variations based on your brief'}
          </Typography>
        </Box>
      </Paper>

      {/* Form Section */}
      <Paper sx={{ p: 4 }}>
        {inputMethod === 'manual' && (
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
                    <Box sx={{ position: 'relative' }}>
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
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                pr: 6 // Make room for assistant
                              }
                            }}
                          />
                        )}
                      />
                      <IntelligentContentAssistant
                        text={watch('headline')}
                        field="headline"
                        platform={watch('platform')}
                        industry={watch('industry')}
                        onSuggestionApply={(suggestion) => {
                          setValue('headline', suggestion);
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ position: 'relative' }}>
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
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                pr: 6 // Make room for assistant
                              }
                            }}
                          />
                        )}
                      />
                      <IntelligentContentAssistant
                        text={watch('body_text')}
                        field="body_text"
                        platform={watch('platform')}
                        industry={watch('industry')}
                        onSuggestionApply={(suggestion) => {
                          setValue('body_text', suggestion);
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ position: 'relative' }}>
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
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                pr: 6 // Make room for assistant
                              }
                            }}
                          />
                        )}
                      />
                      <IntelligentContentAssistant
                        text={watch('cta')}
                        field="cta"
                        platform={watch('platform')}
                        industry={watch('industry')}
                        onSuggestionApply={(suggestion) => {
                          setValue('cta', suggestion);
                        }}
                      />
                    </Box>
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

            {/* Analysis Tools Configuration */}
            <Grid item xs={12}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  backgroundColor: 'rgba(37, 99, 235, 0.02)',
                  border: '1px solid rgba(37, 99, 235, 0.1)'
                }}
              >
                <AnalysisToolsSelector
                  watch={watch}
                  setValue={setValue}
                  title="Analysis Tools"
                  subtitle="Select which analysis tools to run on your ad copy. All selected tools will process your content automatically."
                />
              </Paper>
            </Grid>

            {/* Variation Options Toggle */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(245, 158, 11, 0.02)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: showVariationOptions ? 2 : 0 }}>
                  <AutoAwesome sx={{ color: 'warning.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                    ✨ Generate Variations First?
                  </Typography>
                  <Button
                    variant={showVariationOptions ? 'contained' : 'outlined'}
                    color="warning"
                    onClick={() => setShowVariationOptions(!showVariationOptions)}
                    startIcon={<AutoAwesome />}
                  >
                    {showVariationOptions ? 'Hide Options' : 'Show Options'}
                  </Button>
                </Box>
                
                {showVariationOptions && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Generate multiple ad copy variations before analysis to test different approaches and maximize performance.
                    </Typography>
                    <VariationOptionsCard
                      options={variationOptions}
                      onChange={setVariationOptions}
                      title="Variation Settings"
                      variant="elevation"
                      compact={false}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" gap={2} mt={4}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || generatingVariations || !watch('enabledTools') || watch('enabledTools').length === 0}
                  onClick={() => onSubmit(watch(), false)}
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
                
                {showVariationOptions && (
                  <Button
                    variant="contained"
                    color="warning"
                    size="large"
                    disabled={loading || generatingVariations || !watch('enabledTools') || watch('enabledTools').length === 0}
                    onClick={() => onSubmit(watch(), true)}
                    startIcon={generatingVariations ? <CircularProgress size={20} /> : <AutoAwesome />}
                    sx={{ 
                      minWidth: 280,
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': {
                        background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                        transform: 'none'
                      }
                    }}
                  >
                    {generatingVariations ? (
                      <>
                        ⚡ Generating Variations...
                      </>
                    ) : (
                      <>
                        ✨ Generate & Analyze Variations
                      </>
                    )}
                  </Button>
                )}
              </Box>
              
              {/* Warning when no tools selected */}
              {(!watch('enabledTools') || watch('enabledTools').length === 0) && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Please select at least one analysis tool to proceed.
                </Alert>
              )}
            </Grid>
          </Grid>
        </form>
        )}
        
        {/* Variation Results for Manual Input */}
        {inputMethod === 'manual' && (variationResults?.variations?.length > 0 || generatedVariations.length > 0) && (
          <Paper sx={{ p: 4, mt: 3 }}>
            <VariationPreview
              variations={variationResults?.variations || generatedVariations}
              originalDraft={variationResults?.generation_info?.original_draft}
              onAnalyzeSelected={handleAnalyzeVariations}
              showAnalysisOptions={true}
            />
          </Paper>
        )}
        
        {/* Paste Input Method */}
        {inputMethod === 'paste' && (
          <PasteInput
            onAdCopiesParsed={handleAdCopiesParsed}
            onClear={handleClearAdCopies}
            defaultPlatform="facebook"
          />
        )}
        
        {/* File Upload Input Method */}
        {inputMethod === 'file' && (
          <FileUploadInput
            onAdCopiesParsed={handleAdCopiesParsed}
            onClear={handleClearAdCopies}
            defaultPlatform="facebook"
          />
        )}
        
        {/* AI Generation Input Method */}
        {inputMethod === 'generate' && (
          <GenerateAdInput
            onAdCopiesGenerated={handleAdCopiesParsed}
            onClear={handleClearAdCopies}
            defaultPlatform="facebook"
          />
        )}
      </Paper>
      
      {/* Review and Edit Parsed/Generated Ads */}
      {inputMethod !== 'manual' && adCopies.length > 0 && (
        <Paper sx={{ p: 4, mt: 3 }}>
          <AdCopyReview
            adCopies={adCopies}
            onUpdateAdCopy={updateAdCopy}
            onRemoveAdCopy={removeAdCopy}
            onAddAdCopy={addAdCopy}
            onAnalyzeAll={handleAnalyzeAll}
            competitorAds={competitorAds}
            onUpdateCompetitorAd={updateCompetitorAd}
            onAddCompetitorAd={addCompetitorAd}
            onRemoveCompetitorAd={removeCompetitorAd}
            loading={loading}
          />
        </Paper>
      )}
      
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
      
      {/* Variation Error Display */}
      {variationError && (
        <Box sx={{ mt: 2 }}>
          <ErrorMessage
            variant="inline"
            title="Variation Generation Failed"
            message={variationError.message}
            error={variationError}
            onRetry={() => clearVariationResults()}
            showActions={false}
          />
        </Box>
      )}
    </Container>
  );
};

export default AdAnalysis;
