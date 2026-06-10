import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
        px: 3,
        textAlign: 'center',
      }}
    >
      <LockOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
      <Typography variant="h4" fontWeight={700} color="text.primary">
        Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary" maxWidth={420}>
        You don't have permission to view this page. Contact your administrator
        if you believe this is a mistake.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 1 }}>
        Back to Dashboard
      </Button>
    </Box>
  );
};

export default Forbidden;
