import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  LinearProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  PictureAsPdf,
  InsertDriveFile,
  Delete,
  CheckCircle,
  ErrorOutline
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import apiService from '../../services/apiService';
import { useAuth } from '../../services/authContext';
import { supabase } from '../../lib/supabaseClient';

const FileUploadInput = ({ onAdCopiesParsed, onClear, defaultPlatform = 'facebook' }) => {
  const { user, isAuthenticated } = useAuth();
  const [platform, setPlatform] = useState(defaultPlatform);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [parseResults, setParseResults] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const invalidFiles = rejectedFiles.map(f => f.file.name).join(', ');
      toast.error(`Unsupported files: ${invalidFiles}`);
    }

    if (acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map(file => ({
        file,
        id: Math.random().toString(36).substring(7),
        status: 'pending', // pending, uploading, success, error
        progress: 0,
        result: null,
        error: null
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const removeFile = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  const processFiles = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }
    
    // Debug authentication state before processing
    console.log('🔍 Pre-upload auth check:', {
      isAuthenticated,
      hasUser: !!user,
      userEmail: user?.email
    });
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('🔑 Current session status:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        tokenExpiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
        tokenIsValid: session?.expires_at ? new Date(session.expires_at * 1000) > new Date() : false,
        sessionError: error?.message
      });
      
      if (!session?.access_token) {
        toast.error('Authentication required. Please sign in again.');
        console.error('🚫 No valid session found - aborting upload');
        return;
      }
    } catch (authError) {
      console.error('🔥 Failed to check authentication:', authError);
      toast.error('Authentication check failed. Please try signing in again.');
      return;
    }

    setUploading(true);
    const allResults = [];

    try {
      for (const fileItem of files) {
        if (fileItem.status === 'success') continue;

        // Update file status
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'uploading', progress: 0 } : f
        ));

        try {
          const formData = new FormData();
          formData.append('file', fileItem.file);
          formData.append('platform', platform);

          // Simulate progress for better UX
          const progressInterval = setInterval(() => {
            setFiles(prev => prev.map(f => 
              f.id === fileItem.id && f.progress < 90 
                ? { ...f, progress: f.progress + 10 } 
                : f
            ));
          }, 200);

          console.log('📤 Starting file upload for:', fileItem.file.name);
          
          const result = await apiService.parseFile(formData, {
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log(`📊 Upload progress for ${fileItem.file.name}: ${percentCompleted}%`);
              setFiles(prev => prev.map(f => 
                f.id === fileItem.id 
                  ? { ...f, progress: percentCompleted } 
                  : f
              ));
            },
            timeout: 30000 // 30 second timeout
          });
          
          console.log('✅ File upload completed for:', fileItem.file.name, result);
          
          clearInterval(progressInterval);
          
          if (result.ads && result.ads.length > 0) {
            // Update file status to success
            setFiles(prev => prev.map(f => 
              f.id === fileItem.id 
                ? { ...f, status: 'success', progress: 100, result } 
                : f
            ));
            
            allResults.push(...result.ads);
          } else {
            throw new Error('No ad copy found in file');
          }
        } catch (error) {
          console.error(`❌ Error processing file ${fileItem.file.name}:`, error);
          
          // Log more detailed error information
          if (error.response) {
            console.error('📊 API Error Response:', {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
              headers: error.response.headers
            });
          }
          
          // More detailed error messages based on error type
          let errorMessage = error.message;
          if (error.response?.status === 401) {
            errorMessage = 'Authentication failed. Please log in again.';
            console.warn('🔐 Authentication error - user may need to re-login');
          } else if (error.response?.status === 403) {
            errorMessage = 'Access denied. Check your subscription or permissions.';
          } else if (error.response?.status === 413) {
            errorMessage = 'File too large. Please try with a smaller file.';
          } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Upload timed out. Please check your connection and try again.';
          } else if (error.message.includes('Network Error')) {
            errorMessage = 'Network error. Please check your internet connection.';
          }
          
          // Update file status to error
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'error', progress: 0, error: errorMessage } 
              : f
          ));
          
          // Show user-friendly toast message
          toast.error(`Failed to process ${fileItem.file.name}: ${errorMessage}`);
        }
      }

      if (allResults.length > 0) {
        // Create data passports for each extracted ad copy
        const adsWithPassports = allResults.map((ad, index) => ({
          ...ad,
          id: Date.now().toString() + '_' + index,
          // Add orchestration metadata
          meta: {
            source: 'file_upload',
            uploadedAt: new Date().toISOString(),
            originalFile: files.find(f => f.result?.ads?.includes(ad))?.file?.name,
            needsOrchestration: true
          }
        }));
        
        setParseResults({ ads: adsWithPassports });
        onAdCopiesParsed(adsWithPassports);
        toast.success(`🎉 Extracted ${adsWithPassports.length} ad${adsWithPassports.length > 1 ? 's' : ''} from files!`);
        
        // Show orchestration hint
        setTimeout(() => {
          toast('💡 Tip: Use the Analysis Tools Selector to choose which tools to run on your extracted ads', {
            duration: 4000,
            icon: '🔧'
          });
        }, 2000);
      } else {
        toast.error('No ad copy could be extracted from the uploaded files');
      }
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <PictureAsPdf color="error" />;
      case 'csv': return <Description color="success" />;
      case 'docx':
      case 'doc': return <Description color="primary" />;
      case 'txt': return <InsertDriveFile color="action" />;
      default: return <InsertDriveFile color="action" />;
    }
  };

  const handleClear = () => {
    setFiles([]);
    setParseResults(null);
    if (onClear) onClear();
  };

  return (
    <Box>
      {!parseResults ? (
        <Box>
          {/* Instructions */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Supported formats:</strong> CSV, PDF, Word (.docx), and Text files. 
              Upload multiple files at once - we'll extract ad copy from all of them.
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

            {/* File Drop Zone */}
            <Grid item xs={12}>
              <Paper
                {...getRootProps()}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '2px dashed',
                  borderColor: isDragActive 
                    ? isDragAccept ? 'success.main' : 'error.main'
                    : 'grey.300',
                  backgroundColor: isDragActive 
                    ? isDragAccept ? 'success.light' : 'error.light'
                    : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'primary.light',
                    opacity: 0.8
                  }
                }}
              >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {isDragActive ? 'Drop files here' : 'Drop files here or click to browse'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports: .csv, .pdf, .docx, .doc, .txt (max 10MB each)
                </Typography>
              </Paper>
            </Grid>

            {/* File List */}
            {files.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Selected Files ({files.length})
                </Typography>
                <List dense>
                  {files.map((fileItem) => (
                    <ListItem
                      key={fileItem.id}
                      divider
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => removeFile(fileItem.id)}
                          disabled={uploading}
                        >
                          <Delete />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        {fileItem.status === 'success' && <CheckCircle color="success" />}
                        {fileItem.status === 'error' && <ErrorOutline color="error" />}
                        {(fileItem.status === 'pending' || fileItem.status === 'uploading') && 
                          getFileIcon(fileItem.file.name)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {fileItem.file.name}
                            </Typography>
                            <Chip
                              label={fileItem.status}
                              size="small"
                              color={
                                fileItem.status === 'success' ? 'success' :
                                fileItem.status === 'error' ? 'error' :
                                fileItem.status === 'uploading' ? 'primary' : 'default'
                              }
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                            {fileItem.status === 'uploading' && (
                              <LinearProgress 
                                variant="determinate" 
                                value={fileItem.progress} 
                                sx={{ mt: 1 }} 
                              />
                            )}
                            {fileItem.error && (
                              <Typography variant="caption" color="error">
                                Error: {fileItem.error}
                              </Typography>
                            )}
                            {fileItem.result && (
                              <Typography variant="caption" color="success.main">
                                Extracted {fileItem.result.ads.length} ad{fileItem.result.ads.length > 1 ? 's' : ''}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleClear}
                  disabled={uploading || files.length === 0}
                >
                  Clear Files
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CloudUpload />}
                  onClick={processFiles}
                  disabled={uploading || files.length === 0}
                  sx={{ minWidth: 160 }}
                >
                  {uploading ? 'Processing Files...' : `Process ${files.length} File${files.length !== 1 ? 's' : ''}`}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box>
          {/* Process Success */}
          <Alert severity="success" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle fontSize="small" />
              <Typography variant="body2">
                Successfully extracted <strong>{parseResults.ads.length}</strong> ad copy{parseResults.ads.length > 1 ? ' entries' : ''} from your files.
              </Typography>
            </Box>
          </Alert>

          {/* Results Summary */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              📁 Extraction Results
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
              startIcon={<CloudUpload />}
              onClick={handleClear}
            >
              Upload More Files
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

export default FileUploadInput;
