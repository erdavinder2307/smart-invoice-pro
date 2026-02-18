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
import '../../styles/components/welcome-profile-card.css';

const WelcomeProfileCard = ({ customerData, onLogout, isMobile }) => {
  return (
    <Card className="welcome-card">
      <CardContent className="welcome-card-content">
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box className={`welcome-profile-section ${isMobile ? 'welcome-profile-section--mobile' : 'welcome-profile-section--desktop'}`}>
              <Avatar
                className={`welcome-avatar ${isMobile ? 'welcome-avatar--mobile' : 'welcome-avatar--desktop'}`}
              >
                <AccountCircle className="welcome-avatar-icon" />
              </Avatar>
              <Box className={isMobile ? 'welcome-profile-info--mobile' : 'welcome-profile-info--desktop'}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  className="welcome-title"
                >
                  Welcome back, {customerData?.name || 'Customer'}!
                </Typography>
                <Box className={`welcome-email ${isMobile ? 'welcome-email--mobile' : 'welcome-email--desktop'}`}>
                  <Email className="welcome-email-icon" />
                  <Typography variant="body1" color="text.secondary" className="welcome-email-text">
                    {customerData?.email}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" className="welcome-account-id">
                  Account ID: {customerData?.id || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className={`welcome-actions ${isMobile ? 'welcome-actions--mobile' : 'welcome-actions--desktop'}`}>
              <Button
                variant="outlined"
                onClick={onLogout}
                startIcon={<Logout />}
                className="welcome-logout-button"
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
