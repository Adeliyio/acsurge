import React, { useState } from 'react';
import { Container, Paper, Typography, Button, Box, CircularProgress, Grid, TextField } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiService from '../services/apiService';
import { ErrorMessage } from '../components/ui';
import CopyInputForm from '../components/shared/CopyInputForm';

const BrandVoiceEngine = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      headline: '',
      body_text: '',
      cta: '',
      platform: 'facebook',
      industry: '',
      brand_samples: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.alignBrandVoice(data);
      setResults(response);
      toast.success('Brand voice analysis complete! 🎯');
    } catch (error) {
      setError(new Error(error.response?.data?.detail || 'Analysis failed'));
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={0} sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', color: 'white', textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, mb: 2 }}>🎯 Brand Voice Engine</Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
          Ensure all generated copy matches your brand voice by analyzing your existing content and style.
        </Typography>
      </Paper>

      <Paper sx={{ p: 4, mb: results ? 3 : 0 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3, backgroundColor: 'rgba(6, 182, 212, 0.05)' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'cyan.600', mb: 2 }}>
                  🎨 Brand Voice Samples
                </Typography>
                <Controller
                  name="brand_samples"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Brand Content Samples"
                      fullWidth
                      multiline
                      rows={6}
                      placeholder="Paste 3-5 examples of your existing content (emails, website copy, social posts, etc.)"
                      helperText="The more samples you provide, the better we can match your brand voice"
                    />
                  )}
                />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <CopyInputForm
                control={control}
                errors={errors}
                title="📝 Copy to Align"
                subtitle="Ad copy that will be adjusted to match your brand voice"
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ 
                    minWidth: 280, py: 2, px: 4, fontSize: '1.1rem', fontWeight: 700, borderRadius: 3,
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', transform: 'translateY(-2px)' }
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 2, color: 'white' }} />
                      🎯 Aligning Brand Voice...
                    </>
                  ) : (
                    '🚀 Align Brand Voice'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {results && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
            🎯 Brand Voice Alignment Results
          </Typography>
        </Paper>
      )}
      
      {error && (
        <Box sx={{ mt: 2 }}>
          <ErrorMessage variant="inline" title="Brand Voice Analysis Failed" message={error.message} error={error} onRetry={() => setError(null)} showActions={false} />
        </Box>
      )}
    </Container>
  );
};

export default BrandVoiceEngine;
