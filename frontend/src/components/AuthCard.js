import React from 'react';
import { Box, Container, Paper, Slide } from '@mui/material';
import { createGradientBackground } from '../utils/gradients';

const AuthCard = ({ 
  children, 
  maxWidth = 420, 
  slideDirection = 'up',
  timeout = 800,
  gradientName = 'authBackground' 
}) => {
  return (
    <Box
      sx={{
        ...createGradientBackground(gradientName),
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 58, 237, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(102, 126, 234, 0.3) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 3,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Slide direction={slideDirection} in timeout={timeout}>
            <Paper 
              elevation={24}
              sx={{ 
                padding: { xs: 3, sm: 4 }, 
                width: '100%',
                maxWidth: maxWidth,
                borderRadius: 4,
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              {children}
            </Paper>
          </Slide>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthCard;
