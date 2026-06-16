import React from 'react';
import { Box, Typography } from '@mui/material';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import { isDemoHost, isDemoUser } from '../utils/demoMode';
import { useAuth } from '../context/AuthContext';

/**
 * Global banner for Interactive Workspace sessions.
 */
const DemoBanner = () => {
  const { user } = useAuth();
  const active = isDemoHost() || isDemoUser(user);

  if (!active) {
    return null;
  }

  return (
    <Box
      sx={{
        bgcolor: '#1e3a8a',
        color: '#f8fafc',
        py: 1,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        fontSize: '0.875rem',
      }}
    >
      <ScienceOutlinedIcon sx={{ fontSize: 18 }} />
      <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 500 }}>
        Interactive Workspace — explore Solidev Books with sample data. Changes may be reset
        periodically.
      </Typography>
    </Box>
  );
};

export default DemoBanner;
