import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, useMediaQuery, CircularProgress, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import SinglePageDashboard from './pages/SinglePageDashboard';
import AdAnalysis from './pages/AdAnalysis';
import AnalysisResults from './pages/AnalysisResults';
import AnalysisHistory from './pages/AnalysisHistory';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import ResourcesLanding from './pages/ResourcesLanding';
import ContactUs from './pages/ContactUs';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// New AI-Powered Tools
import ComplianceChecker from './pages/ComplianceChecker';
import ROICopyGenerator from './pages/ROICopyGenerator';
import ABTestGenerator from './pages/ABTestGenerator';
import IndustryOptimizer from './pages/IndustryOptimizer';
import PerformanceForensics from './pages/PerformanceForensics';
import PsychologyScorer from './pages/PsychologyScorer';
import BrandVoiceEngine from './pages/BrandVoiceEngine';
import LegalRiskScanner from './pages/LegalRiskScanner';

// New Shared Workflow Pages
import ProjectsList from './pages/ProjectsList';
import ProjectWorkspace from './pages/ProjectWorkspace';
import UnifiedResultsDashboard from './pages/UnifiedResultsDashboard';

// Resources Pages
import GettingStarted from './pages/resources/GettingStarted';
import TutorialsGuides from './pages/resources/TutorialsGuides';
import CaseStudies from './pages/resources/CaseStudies';

// Coming Soon Pages
import PartnerProgram from './pages/PartnerProgram';
import AffiliateProgram from './pages/AffiliateProgram';

// Demo Routes
import DemoRoutes from './components/demo/DemoRoute';

// Services
import { AuthProvider, useAuth } from './services/authContext';

// Blog
import { BlogProvider } from './contexts/BlogContext';

// Settings
import { SettingsProvider } from './contexts/SettingsContext';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import BlogCategory from './pages/BlogCategory';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1e40af',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed',
      light: '#8b5cf6',
      dark: '#6d28d9',
      contrastText: '#ffffff',
    },
    // New accent color for highlights and CTAs
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    divider: '#e5e7eb',
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "-apple-system", "BlinkMacSystemFont", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    caption: {
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
  },
  spacing: 8, // Base spacing unit (8px)
  shadows: [
    'none',
    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid',
          borderColor: 'rgba(229, 231, 235, 0.8)',
          boxShadow: '0 3px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease-in-out',
          padding: '16px', // Consistent padding
          background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(37, 99, 235, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 3px 12px rgba(0,0,0,0.08)',
        },
        elevation2: {
          boxShadow: '0 8px 25px rgba(37, 99, 235, 0.15)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '10px 20px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
          },
        },
        large: {
          padding: '14px 28px',
          fontSize: '1rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2563eb',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
              borderColor: '#2563eb',
            },
          },
          '& .MuiInputLabel-root': {
            fontWeight: 500,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading while checking authentication
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
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppLayout({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const theme = createTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isLandingPage = location.pathname === '/';
  const showSidebar = isAuthenticated && !isAuthPage && !isLandingPage;
  const showNavbar = true; // Show navbar on all pages

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          variant={isMobile ? 'temporary' : 'permanent'}
        />
      )}
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {/* Top Navbar */}
        {showNavbar && (
          <Navbar onSidebarToggle={handleSidebarToggle} showSidebarToggle={showSidebar && isMobile} />
        )}
        
        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            pt: isAuthPage || isLandingPage ? 0 : 2,
            pb: 0, // Remove bottom padding since footer will handle spacing
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {children}
          </Box>
          {/* Footer - show on all pages except auth pages */}
          {!isAuthPage && !isAuthenticated && <Footer />}
        </Box>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SettingsProvider>
          <AuthProvider>
            <BlogProvider>
              <Router>
              <AppLayout>
                <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/pricing" element={<Pricing />} />
                
                {/* Resources Routes - accessible to all users */}
                <Route path="/resources" element={<ResourcesLanding />} />
                <Route path="/resources/api" element={<div>API Documentation - Coming Soon</div>} />
                <Route path="/resources/getting-started" element={<GettingStarted />} />
                <Route path="/resources/tutorials" element={<TutorialsGuides />} />
                <Route path="/resources/case-studies" element={<CaseStudies />} />
                <Route path="/resources/videos" element={<div>Videos - Coming Soon</div>} />
                <Route path="/resources/blog" element={<Navigate to="/blog" replace />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/blog/category/:category" element={<BlogCategory />} />
                <Route path="/blog/tag/:tag" element={<BlogCategory />} />
                
                {/* Legal and Company Pages */}
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/about" element={<About />} />
                
                {/* Coming Soon Pages */}
                <Route path="/partners" element={<PartnerProgram />} />
                <Route path="/partner-program" element={<PartnerProgram />} />
                <Route path="/affiliates" element={<AffiliateProgram />} />
                <Route path="/affiliate-program" element={<AffiliateProgram />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <SinglePageDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/analyze" element={<Navigate to="/dashboard" replace />} />
                
                <Route path="/results/:analysisId" element={
                  <ProtectedRoute>
                    <AnalysisResults />
                  </ProtectedRoute>
                } />
                
                <Route path="/history" element={
                  <ProtectedRoute>
                    <AnalysisHistory />
                  </ProtectedRoute>
                } />
                
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                {/* New AI-Powered Tools */}
                <Route path="/compliance-checker" element={
                  <ProtectedRoute>
                    <ComplianceChecker />
                  </ProtectedRoute>
                } />
                
                <Route path="/roi-generator" element={
                  <ProtectedRoute>
                    <ROICopyGenerator />
                  </ProtectedRoute>
                } />
                
                <Route path="/ab-test-generator" element={
                  <ProtectedRoute>
                    <ABTestGenerator />
                  </ProtectedRoute>
                } />
                
                <Route path="/industry-optimizer" element={
                  <ProtectedRoute>
                    <IndustryOptimizer />
                  </ProtectedRoute>
                } />
                
                <Route path="/performance-forensics" element={
                  <ProtectedRoute>
                    <PerformanceForensics />
                  </ProtectedRoute>
                } />
                
                <Route path="/psychology-scorer" element={
                  <ProtectedRoute>
                    <PsychologyScorer />
                  </ProtectedRoute>
                } />
                
                <Route path="/brand-voice-engine" element={
                  <ProtectedRoute>
                    <BrandVoiceEngine />
                  </ProtectedRoute>
                } />
                
                <Route path="/legal-risk-scanner" element={
                  <ProtectedRoute>
                    <LegalRiskScanner />
                  </ProtectedRoute>
                } />
                
                {/* New Shared Workflow Routes */}
                <Route path="/projects" element={
                  <ProtectedRoute>
                    <ProjectsList />
                  </ProtectedRoute>
                } />
                
                <Route path="/project/new/workspace" element={
                  <ProtectedRoute>
                    <ProjectWorkspace />
                  </ProtectedRoute>
                } />
                
                <Route path="/project/:projectId/workspace" element={
                  <ProtectedRoute>
                    <ProjectWorkspace />
                  </ProtectedRoute>
                } />
                
                <Route path="/project/:projectId/results" element={
                  <ProtectedRoute>
                    <UnifiedResultsDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Demo routes */}
                <Route path="/demo/*" element={<DemoRoutes />} />
                
                <Route path="/app" element={<Navigate to="/dashboard" replace />} />
                </Routes>
                <Toaster position="top-right" />
              </AppLayout>
              </Router>
            </BlogProvider>
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
