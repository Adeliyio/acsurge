import React from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box
} from '@mui/material';

const SmartOnboarding = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h4" gutterBottom>
            🚀 Welcome to AdCopySurge!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Smart onboarding component is coming soon.
          </Typography>
          <Button variant="contained" onClick={onClose}>
            Get Started
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SmartOnboarding;
