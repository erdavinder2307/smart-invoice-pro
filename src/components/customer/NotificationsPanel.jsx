import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Chip,
  IconButton,
  Collapse,
  Divider,
  Button
} from '@mui/material';
import {
  Notifications,
  Warning,
  Info,
  CheckCircle,
  Error,
  ExpandMore,
  ExpandLess,
  NotificationsNone,
  Clear
} from '@mui/icons-material';

const NotificationsPanel = ({ notifications }) => {
  const [expanded, setExpanded] = useState(true);
  const [visibleNotifications, setVisibleNotifications] = useState(notifications);

  const getNotificationIcon = (type, priority) => {
    const iconProps = {
      fontSize: 'small',
      sx: { 
        color: priority === 'high' ? '#f44336' : 
               priority === 'medium' ? '#ff9800' : '#4caf50' 
      }
    };

    switch (type) {
      case 'overdue':
        return <Error {...iconProps} />;
      case 'due':
        return <Warning {...iconProps} />;
      case 'payment':
        return <CheckCircle {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return { backgroundColor: '#ffebee', color: '#f44336', border: '1px solid #f44336' };
      case 'medium':
        return { backgroundColor: '#fff3e0', color: '#ff9800', border: '1px solid #ff9800' };
      case 'low':
        return { backgroundColor: '#e8f5e8', color: '#4caf50', border: '1px solid #4caf50' };
      default:
        return { backgroundColor: '#f5f5f5', color: '#666', border: '1px solid #ccc' };
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'rgba(244, 67, 54, 0.05)';
    if (priority === 'medium') return 'rgba(255, 152, 0, 0.05)';
    return 'rgba(76, 175, 80, 0.05)';
  };

  const handleDismissNotification = (notificationId) => {
    setVisibleNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setVisibleNotifications([]);
  };

  const unreadCount = visibleNotifications.filter(n => n.priority === 'high' || n.priority === 'medium').length;

  if (visibleNotifications.length === 0) {
    return (
      <Card
        sx={{
          mb: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ py: 3 }}>
            <NotificationsNone sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You're all caught up! No new notifications.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        mb: 3,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between"
          sx={{ cursor: 'pointer' }}
          onClick={() => setExpanded(!expanded)}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Badge badgeContent={unreadCount} color="error">
              <Notifications sx={{ color: '#667eea' }} />
            </Badge>
            <Typography 
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: '#2c3e50'
              }}
            >
              Notifications
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {visibleNotifications.length > 0 && (
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAllNotifications();
                }}
                sx={{ fontSize: '0.75rem', color: '#666' }}
              >
                Clear All
              </Button>
            )}
            <IconButton size="small">
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <List sx={{ pt: 1 }}>
            {visibleNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    backgroundColor: getNotificationColor(notification.type, notification.priority),
                    borderRadius: '8px',
                    mb: 1,
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getNotificationIcon(notification.type, notification.priority)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2" sx={{ flex: 1, mr: 1 }}>
                          {notification.message}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleDismissNotification(notification.id)}
                          sx={{ 
                            color: '#666',
                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' }
                          }}
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                    secondary={
                      <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.date).toLocaleDateString()}
                        </Typography>
                        <Chip
                          label={notification.priority}
                          size="small"
                          sx={{
                            ...getPriorityColor(notification.priority),
                            fontSize: '0.6rem',
                            height: '20px'
                          }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
                {index < visibleNotifications.length - 1 && (
                  <Divider sx={{ my: 1 }} />
                )}
              </React.Fragment>
            ))}
          </List>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {visibleNotifications.length} notification(s)
            </Typography>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel;
