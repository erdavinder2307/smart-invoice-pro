import React from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Stack, Typography,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useNavigate } from 'react-router-dom';

/**
 * Modal shown when a user hits a plan limit or feature gate.
 * Props:
 *   open: bool
 *   onClose: fn
 *   title: string (optional)
 *   message: string
 *   feature: string (optional, e.g. "API access")
 *   requiredPlan: string (optional, e.g. "Growth")
 */
export default function UpgradePrompt({ open, onClose, title, message, feature, requiredPlan }) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate('/settings/billing/upgrade');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <RocketLaunchIcon color="primary" />
          <span>{title || 'Upgrade your plan'}</span>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" gutterBottom>{message}</Typography>
        {feature && requiredPlan && (
          <Typography variant="body2" mt={1}>
            <strong>{feature}</strong> is available on the <strong>{requiredPlan}</strong> plan.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="text">Not now</Button>
        <Button onClick={handleUpgrade} variant="contained">
          View upgrade options
        </Button>
      </DialogActions>
    </Dialog>
  );
}
