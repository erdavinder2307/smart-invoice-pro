import React from 'react';
import { Alert, Box, Button, Collapse, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../context/SubscriptionContext';

export default function TrialBanner() {
  const navigate = useNavigate();
  const { showTrialBanner, trialDaysRemaining, isExpired, subscription } = useSubscription();

  if (isExpired && isExpired()) {
    return (
      <Alert
        severity="error"
        sx={{ borderRadius: 0 }}
        action={
          <Button color="inherit" size="small" variant="outlined" onClick={() => navigate('/settings/billing/upgrade')}>
            Upgrade now
          </Button>
        }
      >
        Your trial has ended. Upgrade to keep access to your data.
      </Alert>
    );
  }

  if (!showTrialBanner || !showTrialBanner()) return null;

  const urgent = trialDaysRemaining <= 3;

  return (
    <Collapse in>
      <Alert
        severity={urgent ? 'error' : 'warning'}
        sx={{ borderRadius: 0 }}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button color="inherit" size="small" onClick={() => navigate('/settings/billing')}>
              Extend
            </Button>
            <Button color="inherit" size="small" variant="outlined" onClick={() => navigate('/settings/billing/upgrade')}>
              Upgrade
            </Button>
          </Box>
        }
      >
        <Typography variant="body2">
          {trialDaysRemaining === 0
            ? 'Your trial expires today.'
            : `${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''} left in your trial.`}
          {' '}Upgrade to Starter at ₹599/month to keep all your work.
        </Typography>
      </Alert>
    </Collapse>
  );
}
