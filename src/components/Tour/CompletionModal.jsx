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
  ListItemText,
  Stack
} from '@mui/material';
import { CheckCircle, EmojiEventsOutlined } from '@mui/icons-material';
import { useTour } from '../../context/TourContext';

const CompletionModal = () => {
  const { showCompletionModal, setShowCompletionModal } = useTour();

  const handleClose = () => {
    setShowCompletionModal(false);
  };

  const handleStartFree = () => {
    setShowCompletionModal(false);
    window.location.href = 'https://www.solidevbooks.com/signup';
  };

  const handleBookConsultation = () => {
    setShowCompletionModal(false);
    window.location.href = 'https://www.solidevbooks.com/support';
  };

  const workflows = [
    'Quote → Invoice → Payment (Sales Flow)',
    'Purchase Order → Bill → Payment (Procurement)',
    'Inventory Management & Valuation',
    'Banking Sync & Reconciliation'
  ];

  return (
    <Dialog
      open={showCompletionModal}
      onClose={handleClose}
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
      <DialogTitle sx={{ pb: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }} component="div">
        <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: 'success.main', borderRadius: '50%', p: 1.5, display: 'inline-flex' }}>
          <EmojiEventsOutlined sx={{ fontSize: 36 }} />
        </Box>
        <Typography variant="h5" component="h2" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.02em', textAlign: 'center' }}>
          You’re Ready to Explore!
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
          You have seen the core pages of the workspace. We suggest exploring these realistic workflows next:
        </Typography>
        
        <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.03)', borderRadius: 3, p: 1, border: '1px solid rgba(16, 185, 129, 0.08)', mb: 2, textAlign: 'left' }}>
          <List dense disablePadding>
            {workflows.map((wf, i) => (
              <ListItem key={i} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 28, color: 'success.main' }}>
                  <CheckCircle sx={{ fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={wf} 
                  primaryTypographyProps={{ variant: 'body2', color: 'text.primary', fontWeight: 500 }} 
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Stack spacing={1.5} width="100%">
          <Button 
            variant="contained" 
            fullWidth
            onClick={handleStartFree}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 700, 
              borderRadius: 2.5,
              py: 1.25,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
              background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
              '&:hover': {
                background: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)',
              }
            }}
          >
            Start Free
          </Button>
          <Stack direction="row" spacing={1.5}>
            <Button 
              variant="outlined" 
              fullWidth
              onClick={handleClose}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600, 
                borderRadius: 2.5,
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'grey.400' }
              }}
            >
              Continue Exploring
            </Button>
            <Button 
              variant="outlined" 
              fullWidth
              onClick={handleBookConsultation}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600, 
                borderRadius: 2.5,
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'grey.400' }
              }}
            >
              Book Consultation
            </Button>
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default CompletionModal;
