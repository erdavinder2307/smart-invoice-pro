import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { InboxOutlined as DefaultIcon } from '@mui/icons-material';

/**
 * EmptyState — Consistent empty/no-data placeholder.
 *
 * Usage:
 *   <EmptyState icon={<PersonIcon />} title="No customers yet"
 *     subtitle="Add your first customer to get started"
 *     action={{ label: 'Add Customer', onClick: () => nav('/customers/add') }} />
 */
const EmptyState = ({ icon, title, subtitle, action }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      px: 3,
    }}
  >
    <Box sx={{ color: 'text.disabled', mb: 2 }}>
      {icon
        ? React.cloneElement(icon, { sx: { fontSize: 48, ...icon.props?.sx } })
        : <DefaultIcon sx={{ fontSize: 48 }} />}
    </Box>
    {title && (
      <Typography variant="h6" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
        {title}
      </Typography>
    )}
    {subtitle && (
      <Typography variant="body2" color="text.disabled" sx={{ mb: action ? 2.5 : 0, maxWidth: 360, textAlign: 'center' }}>
        {subtitle}
      </Typography>
    )}
    {action && (
      <Button
        variant="contained"
        size="small"
        onClick={action.onClick}
        sx={{
          textTransform: 'none',
          borderRadius: '4px',
          fontWeight: 500,
          fontSize: '0.875rem',
          px: 3,
          bgcolor: '#1a73e8',
          boxShadow: 'none',
          '&:hover': { bgcolor: '#1558b0', boxShadow: 'none' },
        }}
      >
        {action.label}
      </Button>
    )}
  </Box>
);

export default EmptyState;
