import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

const StatsCard = ({ title, value, subtitle, icon, color, iconColor }) => {
  return (
    <Card
      sx={{
        height: 140,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.15)',
        }
      }}
    >
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              backgroundColor: color,
              color: iconColor
            }}
          >
            {icon}
          </Avatar>
          <TrendingUp sx={{ color: 'success.main', fontSize: '1.2rem' }} />
        </Box>

        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ mb: 0.5, fontSize: '1.5rem', color: 'text.primary' }}
        >
          {value}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '0.9rem', fontWeight: 500 }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: '0.75rem', mt: 0.5, display: 'block' }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
