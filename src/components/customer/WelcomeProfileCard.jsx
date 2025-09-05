import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Avatar,
  Grid
} from '@mui/material';
import {
  Logout,
  Email,
  AccountCircle
} from '@mui/icons-material';

const WelcomeProfileCard = ({ customerData, onLogout, isMobile }) => {
  return (
    <Card
      sx={{
        mb: 4,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        overflow: 'visible',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px 20px 0 0'
        }
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center" flexDirection={isMobile ? 'column' : 'row'}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mr: isMobile ? 0 : 3,
                  mb: isMobile ? 2 : 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '2rem'
                }}
              >
                <AccountCircle sx={{ fontSize: '3rem' }} />
              </Avatar>
              <Box textAlign={isMobile ? 'center' : 'left'}>
                <Typography 
                  variant="h4" 
                  fontWeight="bold"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  Welcome back, {customerData?.name || 'Customer'}!
                </Typography>
                <Box display="flex" alignItems="center" justifyContent={isMobile ? 'center' : 'flex-start'}>
                  <Email sx={{ mr: 1, color: '#666', fontSize: '1.2rem' }} />
                  <Typography variant="body1" color="text.secondary" fontSize="1.1rem">
                    {customerData?.email}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Account ID: {customerData?.id || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box 
              display="flex" 
              justifyContent={isMobile ? 'center' : 'flex-end'}
              flexDirection={isMobile ? 'column' : 'row'}
              gap={2}
            >
              <Button
                variant="outlined"
                onClick={onLogout}
                startIcon={<Logout />}
                sx={{
                  borderColor: '#667eea',
                  color: '#667eea',
                  borderWidth: 2,
                  px: 3,
                  py: 1,
                  borderRadius: '12px',
                  '&:hover': {
                    borderColor: '#764ba2',
                    color: '#764ba2',
                    backgroundColor: 'rgba(102, 126, 234, 0.05)'
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default WelcomeProfileCard;
