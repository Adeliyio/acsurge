import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Tooltip,
  Collapse,
  useTheme,
  useMediaQuery,
  Badge
} from '@mui/material';
import BrandLogo from './BrandLogo';
import NotificationCenter from './NotificationCenter';
import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  History as HistoryIcon,
  LibraryBooks as TemplateIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Payment as BillingIcon,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
  Notifications,
  TrendingUp,
  Compare,
  Folder,
  Star,
  // New icons for expanded tools
  Policy as ComplianceIcon,
  AttachMoney as ROIIcon,
  Science as ABTestIcon,
  Business as IndustryIcon,
  SearchOff as ForensicsIcon,
  Psychology as PsychologyIcon,
  RecordVoiceOver as BrandVoiceIcon,
  Gavel as LegalIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authContext';

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 72;

const navigationSections = [
  {
    id: 'main',
    label: 'Main Navigation',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: DashboardIcon,
        badge: null
      },
      {
        id: 'analyze',
        label: 'Analyze Ad Copy',
        path: '/analyze',
        icon: AnalyticsIcon,
        badge: null
      },
      {
        id: 'history',
        label: 'Analysis History',
        path: '/history',
        icon: HistoryIcon,
        badge: null
      }
    ]
  },
  {
    id: 'ai-tools',
    label: 'AI-Powered Tools',
    items: [
      {
        id: 'compliance-checker',
        label: 'Compliance Checker',
        path: '/compliance-checker',
        icon: ComplianceIcon,
        badge: 'New'
      },
      {
        id: 'roi-generator',
        label: 'ROI Copy Generator',
        path: '/roi-generator',
        icon: ROIIcon,
        badge: 'New'
      },
      {
        id: 'ab-test-generator',
        label: 'A/B Test Generator',
        path: '/ab-test-generator',
        icon: ABTestIcon,
        badge: 'New'
      },
      {
        id: 'industry-optimizer',
        label: 'Industry Optimizer',
        path: '/industry-optimizer',
        icon: IndustryIcon,
        badge: 'New'
      },
      {
        id: 'performance-forensics',
        label: 'Performance Forensics',
        path: '/performance-forensics',
        icon: ForensicsIcon,
        badge: 'New'
      },
      {
        id: 'psychology-scorer',
        label: 'Psychology Scorer',
        path: '/psychology-scorer',
        icon: PsychologyIcon,
        badge: 'New'
      },
      {
        id: 'brand-voice-engine',
        label: 'Brand Voice Engine',
        path: '/brand-voice-engine',
        icon: BrandVoiceIcon,
        badge: 'New'
      },
      {
        id: 'legal-risk-scanner',
        label: 'Legal Risk Scanner',
        path: '/legal-risk-scanner',
        icon: LegalIcon,
        badge: 'New'
      }
    ]
  },
  {
    id: 'insights',
    label: 'Insights & Reports',
    items: [
      {
        id: 'reports',
        label: 'Reports',
        path: '/reports',
        icon: ReportsIcon,
        badge: null
      }
    ]
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        path: '/profile',
        icon: SettingsIcon,
        badge: null
      }
    ]
  }
];

const Sidebar = ({ open, onClose, variant = 'permanent' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, subscription, logout } = useAuth();
  
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleExpandItem = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const isActive = (path) => location.pathname === path;

  const filteredNavSections = navigationSections;

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const sidebarContent = (
    <Box
      sx={{
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        transition: theme.transitions.create(['width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2.5, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'rgba(37, 99, 235, 0.02)'
        }}
      >
        {!collapsed ? (
          <BrandLogo variant="full" size="medium" />
        ) : (
          <BrandLogo variant="icon" size="small" />
        )}
        <IconButton
          onClick={handleToggleCollapse}
          size="small"
          sx={{
            ml: collapsed ? 'auto' : 1,
            transition: 'all 0.2s ease-in-out',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            '&:hover': { 
              transform: 'scale(1.1)',
              backgroundColor: 'rgba(37, 99, 235, 0.12)'
            }
          }}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      <Divider />


      {/* Navigation Items with Sections */}
      <Box sx={{ flex: 1, py: 1, overflow: 'auto' }}>
        {filteredNavSections.map((section, sectionIndex) => (
          <Box key={section.id}>
            {/* Section Label (only if not collapsed) */}
            {!collapsed && (
              <Box sx={{ px: 2, py: 1 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.65rem',
                    lineHeight: 1.2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {section.label}
                </Typography>
              </Box>
            )}
            
            {/* Section Items */}
            <List sx={{ px: 1, pb: 0 }}>
              {section.items.map((item) => (
                <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                  <Tooltip title={collapsed ? item.label : ''} placement="right">
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      sx={{
                        borderRadius: 2,
                        minHeight: 40,
                        py: 0.5,
                        bgcolor: isActive(item.path) ? 'primary.main' : 'transparent',
                        color: isActive(item.path) ? 'primary.contrastText' : 'text.primary',
                        boxShadow: isActive(item.path) ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none',
                        '&:hover': {
                          bgcolor: isActive(item.path) ? 'primary.dark' : 'rgba(37, 99, 235, 0.08)',
                          transform: 'translateX(2px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: collapsed ? 0 : 1,
                          justifyContent: 'center',
                          color: 'inherit',
                        }}
                      >
                        <Badge
                          color="error"
                          variant="dot"
                          invisible={!item.badge}
                          sx={{ '& .MuiBadge-badge': { right: -2, top: -2 } }}
                        >
                          <item.icon />
                        </Badge>
                      </ListItemIcon>
                      {!collapsed && (
                        <>
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              fontWeight: isActive(item.path) ? 600 : 500,
                              fontSize: '0.8125rem', // 13px
                              lineHeight: 1.2,
                            }}
                          />
                          {item.badge && (
                            <Chip
                              label={item.badge}
                              size="small"
                              color="secondary"
                              sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                          )}
                        </>
                      )}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
            
            {/* Section Divider */}
            {sectionIndex < filteredNavSections.length - 1 && (
              <Divider 
                sx={{ 
                  mx: 2, 
                  my: 1,
                  borderColor: 'rgba(37, 99, 235, 0.1)'
                }} 
              />
            )}
          </Box>
        ))}
      </Box>

      <Divider />

      {/* Footer Actions */}
      <Box sx={{ p: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            px: collapsed ? 0 : 2,
            py: 1
          }}
        >
          {!collapsed && (
            <Typography
              variant="body2"
              sx={{ mr: 'auto', fontSize: '0.875rem' }}
            >
              Notifications
            </Typography>
          )}
          <NotificationCenter />
        </Box>

      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          transition: theme.transitions.create(['width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
      open
    >
      {sidebarContent}
    </Drawer>
  );
};

export default Sidebar;
