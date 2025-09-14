import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Badge
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Stop as StopIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import StartIcon from '../components/icons/StartIcon';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import sharedWorkflowService from '../services/sharedWorkflowService';
import { ErrorMessage } from '../components/ui';

// Tool result components
const ComplianceResults = ({ result }) => {
  if (!result || !result.result_data) return <Typography>No compliance data available</Typography>;

  const { violations, platform_tips, overall_score } = result.result_data;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Alert 
          severity={violations?.length > 0 ? 'warning' : 'success'}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">
            {violations?.length > 0 
              ? `Found ${violations.length} compliance issues` 
              : 'Your ad copy is compliant! ✅'
            }
          </Typography>
        </Alert>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Overall Score: {overall_score}/100
        </Typography>
      </Box>

      {violations && violations.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>🚨 Violations</Typography>
          {violations.map((violation, index) => (
            <Card key={index} sx={{ mb: 2, bgcolor: 'error.50' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip 
                    label={violation.risk_level} 
                    color={violation.risk_level === 'high' ? 'error' : 'warning'}
                    size="small"
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="h6">{violation.issue_type}</Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Problem:</strong> {violation.description}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  <strong>Flagged Text:</strong> "{violation.flagged_text}"
                </Typography>
                <Typography variant="body1" sx={{ color: 'success.main' }}>
                  <strong>Suggested Fix:</strong> {violation.suggestion}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {platform_tips && platform_tips.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>💡 Platform Tips</Typography>
          <List>
            {platform_tips.map((tip, index) => (
              <ListItem key={index}>
                <ListItemText primary={tip} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

const LegalRiskResults = ({ result }) => {
  if (!result || !result.result_data) return <Typography>No legal risk data available</Typography>;

  const { risk_assessment, problematic_claims, legal_suggestions, risk_level } = result.result_data;

  return (
    <Box>
      <Alert 
        severity={risk_level === 'high' ? 'error' : risk_level === 'medium' ? 'warning' : 'success'}
        sx={{ mb: 3 }}
      >
        <Typography variant="h6">
          Legal Risk Level: {risk_level?.toUpperCase()}
        </Typography>
      </Alert>

      {risk_assessment && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>⚖️ Risk Assessment</Typography>
          <Typography variant="body1">{risk_assessment}</Typography>
        </Box>
      )}

      {problematic_claims && problematic_claims.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>⚠️ Problematic Claims</Typography>
          {problematic_claims.map((claim, index) => (
            <Card key={index} sx={{ mb: 2, bgcolor: 'warning.50' }}>
              <CardContent>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Claim:</strong> "{claim.text}"
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Legal Risk:</strong> {claim.risk_explanation}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {legal_suggestions && legal_suggestions.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>✅ Legal Suggestions</Typography>
          <List>
            {legal_suggestions.map((suggestion, index) => (
              <ListItem key={index}>
                <ListItemText primary={suggestion} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

const BrandVoiceResults = ({ result }) => {
  if (!result || !result.result_data) return <Typography>No brand voice data available</Typography>;

  const { alignment_score, tone_analysis, suggested_copy, brand_consistency } = result.result_data;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Brand Alignment Score: {alignment_score}/100
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={alignment_score || 0} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {tone_analysis && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>🎭 Tone Analysis</Typography>
          <Typography variant="body1">{tone_analysis}</Typography>
        </Box>
      )}

      {brand_consistency && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>🎯 Brand Consistency</Typography>
          {Object.entries(brand_consistency).map(([aspect, score]) => (
            <Box key={aspect} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{aspect.replace('_', ' ').toUpperCase()}</Typography>
                <Typography variant="body2">{score}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={score} 
                sx={{ height: 4, borderRadius: 2 }}
              />
            </Box>
          ))}
        </Box>
      )}

      {suggested_copy && (
        <Box>
          <Typography variant="h6" gutterBottom>✨ Brand-Aligned Copy Suggestion</Typography>
          <Card sx={{ bgcolor: 'primary.50' }}>
            <CardContent>
              <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                "{suggested_copy}"
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

const PsychologyResults = ({ result }) => {
  if (!result || !result.result_data) return <Typography>No psychology data available</Typography>;

  const { psychology_scores, emotional_triggers, persuasion_techniques, recommendations } = result.result_data;

  return (
    <Box>
      {psychology_scores && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>🧠 Psychology Scores</Typography>
          <Grid container spacing={2}>
            {Object.entries(psychology_scores).map(([category, score]) => (
              <Grid item xs={12} sm={6} key={category}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                      {score}%
                    </Typography>
                    <Typography variant="subtitle2">
                      {category.replace('_', ' ').toUpperCase()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {emotional_triggers && emotional_triggers.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>🎭 Emotional Triggers</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {emotional_triggers.map((trigger, index) => (
              <Chip 
                key={index} 
                label={trigger} 
                color="secondary" 
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      {persuasion_techniques && persuasion_techniques.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>🎯 Persuasion Techniques</Typography>
          <List>
            {persuasion_techniques.map((technique, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={technique.name} 
                  secondary={technique.description}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {recommendations && recommendations.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>💡 Recommendations</Typography>
          <List>
            {recommendations.map((recommendation, index) => (
              <ListItem key={index}>
                <ListItemText primary={recommendation} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

const UnifiedResultsDashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [pollingEnabled, setPollingEnabled] = useState(true);

  // Fetch project data
  const { data: project, isLoading: projectLoading, error: projectError } = useQuery(
    ['project', projectId],
    () => sharedWorkflowService.getProject(projectId, true),
    { 
      enabled: !!projectId,
      refetchInterval: pollingEnabled ? 3000 : false, // Poll every 3 seconds if enabled
    }
  );

  // Fetch pipeline status
  const { data: pipelineStatus, isLoading: pipelineLoading } = useQuery(
    ['pipeline', projectId],
    () => sharedWorkflowService.getPipelineStatus(projectId),
    { 
      enabled: !!projectId,
      refetchInterval: pollingEnabled ? 2000 : false,
      onSuccess: (data) => {
        // Stop polling when pipeline is complete
        if (data && ['completed', 'failed', 'cancelled'].includes(data.status)) {
          setPollingEnabled(false);
        }
      }
    }
  );

  const toolComponents = {
    compliance: ComplianceResults,
    legal: LegalRiskResults,
    brand_voice: BrandVoiceResults,
    psychology: PsychologyResults
  };

  const getToolIcon = (toolName, status) => {
    const baseIcons = {
      compliance: '🛡️',
      legal: '⚖️',
      brand_voice: '🎯',
      psychology: '🧠'
    };

    return baseIcons[toolName] || '🔧';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'primary';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'running': return <CircularProgress size={20} />;
      case 'failed': return <ErrorIcon />;
      case 'pending': return <ScheduleIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const handleRerunAnalysis = async () => {
    try {
      setPollingEnabled(true);
      await sharedWorkflowService.startAnalysis(
        projectId, 
        project?.enabled_tools || ['compliance', 'legal', 'brand_voice', 'psychology'],
        true
      );
      toast.success('Analysis restarted!');
      queryClient.invalidateQueries(['project', projectId]);
      queryClient.invalidateQueries(['pipeline', projectId]);
    } catch (error) {
      toast.error('Failed to restart analysis');
      console.error('Analysis restart failed:', error);
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await sharedWorkflowService.generateReport(projectId, 'pdf');
      // Handle download
      toast.success('Report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate report');
      console.error('Report generation failed:', error);
    }
  };

  if (projectLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Loading project results...
        </Typography>
      </Container>
    );
  }

  if (projectError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <ErrorMessage
          variant="page"
          title="Failed to Load Project"
          message={projectError.message}
          onRetry={() => queryClient.invalidateQueries(['project', projectId])}
        />
      </Container>
    );
  }

  const toolResults = project?.tool_results || [];
  const enabledTools = project?.enabled_tools || [];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              📊 {project?.project_name || 'Analysis Results'}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {project?.description || 'View comprehensive analysis results from all tools'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={() => navigate(`/project/${projectId}/workspace`)}
              variant="outlined"
              startIcon={<EditIcon />}
            >
              Edit Project
            </Button>
            <Button
              onClick={handleRerunAnalysis}
              variant="outlined"
              startIcon={<RefreshIcon />}
              disabled={pipelineLoading || pipelineStatus?.status === 'running'}
            >
              Rerun Analysis
            </Button>
            <Button
              onClick={handleExportReport}
              variant="contained"
              startIcon={<DownloadIcon />}
            >
              Export Report
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Pipeline Status */}
      {pipelineStatus && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Analysis Pipeline Status
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip 
              label={pipelineStatus.status?.toUpperCase()} 
              color={getStatusColor(pipelineStatus.status)}
              icon={getStatusIcon(pipelineStatus.status)}
            />
            <Typography variant="body2" color="textSecondary">
              {pipelineStatus.tools_completed?.length || 0} of {pipelineStatus.tools_requested?.length || 0} tools completed
            </Typography>
          </Box>

          {pipelineStatus.status === 'running' && (
            <LinearProgress 
              variant="determinate" 
              value={(pipelineStatus.tools_completed?.length || 0) / (pipelineStatus.tools_requested?.length || 1) * 100}
              sx={{ mb: 2 }}
            />
          )}
        </Paper>
      )}

      {/* Ad Copy Display */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>📝 Analyzed Ad Copy</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Headline
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {project?.headline}
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Body Text
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {project?.body_text}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Call to Action
            </Typography>
            <Typography variant="body1">
              {project?.cta}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Platform
            </Typography>
            <Chip label={project?.platform} size="small" />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Industry
            </Typography>
            <Typography variant="body2">{project?.industry || 'Not specified'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {enabledTools.map((toolName, index) => {
            const result = toolResults.find(r => r.tool_name === toolName);
            const status = result?.status || 'pending';
            
            return (
              <Tab
                key={toolName}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{getToolIcon(toolName, status)}</span>
                    <span>{toolName.replace('_', ' ').toUpperCase()}</span>
                    <Badge
                      color={getStatusColor(status)}
                      variant="dot"
                      sx={{ 
                        '& .MuiBadge-badge': { 
                          right: -3, 
                          top: 3,
                          minWidth: 8,
                          height: 8
                        } 
                      }}
                    />
                  </Box>
                }
              />
            );
          })}
        </Tabs>

        {/* Tab Panels */}
        {enabledTools.map((toolName, index) => {
          const result = toolResults.find(r => r.tool_name === toolName);
          const ResultComponent = toolComponents[toolName];
          
          return (
            <Box
              key={toolName}
              hidden={activeTab !== index}
              sx={{ p: 4 }}
            >
              {activeTab === index && (
                <Box>
                  {result?.status === 'running' && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={20} />
                        <Typography>Analysis in progress...</Typography>
                      </Box>
                    </Alert>
                  )}
                  
                  {result?.status === 'failed' && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      Analysis failed: {result.error_message || 'Unknown error'}
                    </Alert>
                  )}
                  
                  {result?.status === 'pending' && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      Analysis pending - waiting to start...
                    </Alert>
                  )}
                  
                  {result?.status === 'completed' && ResultComponent && (
                    <ResultComponent result={result} />
                  )}
                  
                  {!result && (
                    <Typography color="textSecondary">
                      No analysis results available for this tool yet.
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </Paper>
    </Container>
  );
};

export default UnifiedResultsDashboard;
