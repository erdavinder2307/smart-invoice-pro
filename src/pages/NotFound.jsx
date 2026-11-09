import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        gap: 2,
        px: 3,
        textAlign: 'center',
      }}
    >
      <SearchOffOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
      <Typography variant="h4" component="h1" fontWeight={700} color="text.primary">
        Page not found
      </Typography>
      <Typography variant="body1" color="text.secondary" maxWidth={420}>
        The link may be old or mistyped. The page you are looking for does not exist.
      </Typography>
      <Button
        variant="contained"
        component={RouterLink}
        to={isAuthenticated ? '/dashboard' : '/'}
        sx={{ mt: 1 }}
      >
        {isAuthenticated ? 'Go to dashboard' : 'Go to home'}
      </Button>
    </Box>
  );
};

export default NotFound;
