import React from 'react';
import { Box, Typography } from '@mui/material';
import { isDemoHost, isDemoUser } from '../utils/demoMode';
import { useAuth } from '../context/AuthContext';

/**
 * Footer attribution for Interactive Workspace sessions.
 */
const DemoAttribution = () => {
  const { user } = useAuth();
  const active = isDemoHost() || isDemoUser(user);

  if (!active) {
    return null;
  }

  return (
    <Box
      component="footer"
      sx={{
        py: 1.25,
        px: 2,
        textAlign: 'center',
        bgcolor: 'grey.100',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Powered by Solidev Books • Solidev Electrosoft (OPC) Private Limited
      </Typography>
    </Box>
  );
};

export default DemoAttribution;
