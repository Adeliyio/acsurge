import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
} from '@mui/material';
import { ContentPaste, AutoFixHigh, CheckCircle } from '@mui/icons-material';
import toast from 'react-hot-toast';
import apiService from '../../services/apiService';

const PasteInput = ({ onAdCopiesParsed, onClear, defaultPlatform = 'facebook' }) => {
  const [pastedText, setPastedText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [platform, setPlatform] = useState(defaultPlatform);
  const [parseResults, setParseResults] = useState(null);

  const handleParse = async () => {
    if (!pastedText.trim()) {
      toast.error('Please paste some ad copy text to parse');
      return;
    }

    setParsing(true);
    try {
      // Call the parsing API
      const results = await apiService.parsePastedCopy(pastedText, platform);
      
      if (results.ads && results.ads.length > 0) {
        setParseResults(results);
        onAdCopiesParsed(results.ads);
        toast.success(`🎉 Parsed ${results.ads.length} ad${results.ads.length > 1 ? 's' : ''} successfully!`);
      } else {
        toast.error('No ad copy could be parsed from the provided text');
      }
    } catch (error) {
      console.error('Parsing failed:', error);
      toast.error(error.message || 'Failed to parse ad copy');
    } finally {
      setParsing(false);
    }
  };

  const handleClear = () => {
    setPastedText('');
    setParseResults(null);
    if (onClear) onClear();
  };

  const exampleTexts = [
    "Headline: Get 50% Off Today\nBody: Limited time offer on all products. Free shipping included!\nCTA: Shop Now",
    "Transform Your Business Today\nDiscover the tools that successful entrepreneurs use to scale their companies from startup to success. Join thousands of satisfied customers.\nStart Free Trial",
    "🎯 Headline: Boost Your Sales\n📝 Description: Our AI-powered platform increases conversion rates by 40% on average\n🔗 Call to action: Get Started Free"
  ];

  return (
    <Box>
      {!parseResults ? (
        <Box>
          {/* Instructions */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>How to use:</strong> Paste ad copy from any source (Facebook, Google, CSV, email, etc.). 
              Our AI will automatically detect and extract headlines, body text, and call-to-actions.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            {/* Platform Selection */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Target Platform</InputLabel>
                <Select
                  value={platform}
                  label="Target Platform"
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  <MenuItem value="facebook">Facebook Ads</MenuItem>
                  <MenuItem value="google">Google Ads</MenuItem>
                  <MenuItem value="linkedin">LinkedIn Ads</MenuItem>
                  <MenuItem value="tiktok">TikTok Ads</MenuItem>
                  <MenuItem value="instagram">Instagram Ads</MenuItem>
                  <MenuItem value="twitter">Twitter Ads</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Main paste area */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={12}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your ad copy here...&#10;&#10;Examples:&#10;• Multiple ads separated by blank lines&#10;• Facebook ad exports&#10;• CSV data&#10;• Any text containing headlines, descriptions, and CTAs&#10;&#10;The AI will automatically detect and parse the structure."
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  }
                }}
              />
            </Grid>

            {/* Examples */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Quick Examples (click to use):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {exampleTexts.map((example, index) => (
                  <Chip
                    key={index}
                    label={`Example ${index + 1}`}
                    variant="outlined"
                    clickable
                    size="small"
                    onClick={() => setPastedText(example)}
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleClear}
                  disabled={!pastedText && !parseResults}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  startIcon={parsing ? <CircularProgress size={20} /> : <AutoFixHigh />}
                  onClick={handleParse}
                  disabled={parsing || !pastedText.trim()}
                  sx={{ minWidth: 140 }}
                >
                  {parsing ? 'Parsing...' : 'Parse Ad Copy'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box>
          {/* Parse Success */}
          <Alert severity="success" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle fontSize="small" />
              <Typography variant="body2">
                Successfully parsed <strong>{parseResults.ads.length}</strong> ad copy{parseResults.ads.length > 1 ? ' entries' : ''}.
                {parseResults.warning && ` ${parseResults.warning}`}
              </Typography>
            </Box>
          </Alert>

          {/* Parse Summary */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              📋 Parse Results
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {parseResults.ads.map((ad, index) => (
                <Chip
                  key={index}
                  label={`Ad ${index + 1}: ${ad.headline?.substring(0, 30) || 'Untitled'}${ad.headline?.length > 30 ? '...' : ''}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Paper>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              startIcon={<ContentPaste />}
              onClick={handleClear}
            >
              Parse More Copy
            </Button>
            <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle fontSize="small" />
              Ready to review and analyze
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PasteInput;
