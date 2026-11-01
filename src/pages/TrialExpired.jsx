import React from 'react';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';

export default function TrialExpired() {
  const navigate = useNavigate();
  const { subscription } = useSubscription();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: 'grey.50' }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'warning.light', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
            <LockOutlinedIcon sx={{ fontSize: 32, color: 'warning.dark' }} />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Your trial has ended
          </Typography>
          <Typography color="text.secondary" mb={1}>
            Your 30-day trial has expired. Your data is safe — we keep it for 90 days.
          </Typography>
          <Typography color="text.secondary" mb={4}>
            Upgrade to Starter at ₹599/month to restore full access instantly.
          </Typography>
          <Stack spacing={2}>
            <Button variant="contained" size="large" onClick={() => navigate('/settings/billing/upgrade')}>
              Upgrade to Starter — ₹599/mo
            </Button>
            <Button variant="outlined" onClick={() => navigate('/settings/billing')}>
              Request a 30-day extension
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block" mt={3}>
            Questions? Email us at support@solidevbooks.com
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
