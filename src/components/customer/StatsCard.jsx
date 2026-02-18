import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import '../../styles/components/stats-card.css';

const StatsCard = ({ title, value, subtitle, icon, color, iconColor }) => {
  return (
    <Card className="stats-card">
      <CardContent className="stats-card-content">
        <Box className="stats-card-header">
          <Avatar
            className="stats-card-avatar"
            sx={{
              backgroundColor: color,
              color: iconColor
            }}
          >
            {icon}
          </Avatar>
          <TrendingUp className="stats-card-trending" sx={{ color: '#4caf50' }} />
        </Box>

        <Typography
          variant="h5"
          fontWeight="bold"
          className="stats-card-value"
        >
          {value}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          className="stats-card-title"
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            className="stats-card-subtitle"
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
