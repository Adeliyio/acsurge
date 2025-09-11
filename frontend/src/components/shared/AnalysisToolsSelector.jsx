import React from 'react';
import { Card, CardContent, Chip, Typography, Grid, Box, Switch, FormControlLabel, Tooltip } from '@mui/material';
import { AVAILABLE_TOOLS } from '../../constants/analysisTools';

/**
 * AnalysisToolsSelector
 * Reusable selector for choosing which analysis tools to run.
 * Expects react-hook-form props: control, watch, setValue
 */
const AnalysisToolsSelector = ({ watch, setValue, showAdvancedSettings, setShowAdvancedSettings, title = 'Analysis Tools', subtitle }) => {
  const selectedTools = watch('enabledTools') || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          🔧 {title}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={showAdvancedSettings}
              onChange={(e) => setShowAdvancedSettings?.(e.target.checked)}
            />
          }
          label="Advanced Settings"
        />
      </Box>

      {subtitle && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          {subtitle}
        </Typography>
      )}

      <Grid container spacing={2}>
        {AVAILABLE_TOOLS.map((tool) => {
          const isSelected = selectedTools.includes(tool.id);
          return (
            <Grid item xs={12} sm={6} md={4} key={tool.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  height: 140, // Fixed height for consistency
                  display: 'flex',
                  flexDirection: 'column',
                  border: isSelected ? '2px solid' : '1px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  bgcolor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'background.paper',
                  boxShadow: isSelected ? 2 : 1,
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: isSelected ? 4 : 3
                  },
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative'
                }}
                onClick={() => {
                  const currentTools = watch('enabledTools') || [];
                  if (isSelected) {
                    setValue('enabledTools', currentTools.filter(t => t !== tool.id));
                  } else {
                    setValue('enabledTools', [...currentTools, tool.id]);
                  }
                }}
              >
                <CardContent sx={{ 
                  p: 2, 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                    <Typography variant="h5" component="span" sx={{ fontSize: '1.5rem' }}>
                      {tool.icon}
                    </Typography>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          color: isSelected ? 'primary.main' : 'text.primary',
                          lineHeight: 1.2,
                          mb: 0.5
                        }}
                      >
                        {tool.name}
                      </Typography>
                      {tool.description && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontSize: '0.75rem',
                            lineHeight: 1.3
                          }}
                        >
                          {tool.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  {/* Selected indicator */}
                  {isSelected && (
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8,
                      zIndex: 1
                    }}>
                      <Chip 
                        label="✓" 
                        size="small" 
                        color="primary" 
                        sx={{ 
                          minWidth: 24,
                          height: 24,
                          '& .MuiChip-label': {
                            px: 0.5,
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {showAdvancedSettings && (
        <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Tooltip title="Automatically run analysis after saving">
            <FormControlLabel
              control={
                <Switch
                  checked={!!watch('autoAnalyze')}
                  onChange={(e) => setValue('autoAnalyze', e.target.checked)}
                />
              }
              label="Auto-run analysis when saving"
            />
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default AnalysisToolsSelector;

