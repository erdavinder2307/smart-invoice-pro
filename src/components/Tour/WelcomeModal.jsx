import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { CheckCircleOutline, TimerOutlined } from '@mui/icons-material';
import { useTour } from '../../context/TourContext';

const WelcomeModal = () => {
  const { showWelcomeModal, setShowWelcomeModal, startTour, stopTour } = useTour();

  const handleStart = () => {
    startTour();
  };

  const handleSkip = () => {
    setShowWelcomeModal(false);
    stopTour(false, true); // Mark as skipped
  };

  const features = [
    'Customers & Contact management',
    'Sales Quotes & Pipelines',
    'Invoices & Payments',
    'Inventory & Stock Adjustment',
    'Purchase Orders & Settlements',
    'Banking Accounts & Reconciliation',
    'Financial Reporting & Analytics'
  ];

  return (
    <Dialog
      open={showWelcomeModal}
      onClose={handleSkip}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1.5,
          boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.18)',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(15, 23, 42, 0.05)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }} component="div">
        <Typography variant="h5" component="h2" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.02em' }}>
          Welcome to Solidev Books
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
          Explore how a modern workflow-driven financial operating platform manages your business end-to-end:
        </Typography>
        
        <Box sx={{ bgcolor: 'rgba(37, 99, 235, 0.03)', borderRadius: 3, p: 1, border: '1px solid rgba(37, 99, 235, 0.08)', mb: 2 }}>
          <List dense disablePadding>
            {features.map((feature, i) => (
              <ListItem key={i} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 28, color: 'primary.main' }}>
                  <CheckCircleOutline sx={{ fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={feature} 
                  primaryTypographyProps={{ variant: 'body2', color: 'text.primary', fontWeight: 500 }} 
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', px: 0.5 }}>
          <TimerOutlined sx={{ fontSize: 18 }} />
          <Typography variant="caption" fontWeight={600}>
            Estimated time: 2–3 minutes
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1.5 }}>
        <Button 
          variant="text" 
          onClick={handleSkip}
          sx={{ 
            textTransform: 'none', 
            fontWeight: 600, 
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          Explore Yourself
        </Button>
        <Button 
          variant="contained" 
          onClick={handleStart}
          sx={{ 
            textTransform: 'none', 
            fontWeight: 700, 
            borderRadius: 2.5,
            px: 3.5,
            py: 1,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
            background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
            '&:hover': {
              background: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)',
            }
          }}
        >
          Start Tour
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WelcomeModal;
