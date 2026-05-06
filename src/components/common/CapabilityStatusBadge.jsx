import React from 'react';
import { Chip } from '@mui/material';

const STATUS_STYLES = {
  stable: {
    label: 'Stable',
    color: '#065f46',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.32)'
  },
  expanding: {
    label: 'Expanding',
    color: '#1d4ed8',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.3)'
  },
  roadmap: {
    label: 'Roadmap',
    color: '#92400e',
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    borderColor: 'rgba(245, 158, 11, 0.34)'
  },
  beta: {
    label: 'Beta',
    color: '#7c2d12',
    backgroundColor: 'rgba(249, 115, 22, 0.13)',
    borderColor: 'rgba(249, 115, 22, 0.34)'
  },
  preview: {
    label: 'Preview',
    color: '#312e81',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderColor: 'rgba(99, 102, 241, 0.32)'
  }
};

const CapabilityStatusBadge = ({ status = 'stable', size = 'small', sx = {} }) => {
  const normalizedStatus = String(status || 'stable').toLowerCase();
  const config = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.stable;

  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        height: size === 'small' ? 23 : 28,
        borderRadius: '999px',
        color: config.color,
        backgroundColor: config.backgroundColor,
        border: `1px solid ${config.borderColor}`,
        fontWeight: 700,
        letterSpacing: '0.01em',
        '& .MuiChip-label': {
          px: size === 'small' ? 1.05 : 1.4,
          fontSize: size === 'small' ? '0.71rem' : '0.79rem'
        },
        ...sx
      }}
    />
  );
};

export default CapabilityStatusBadge;
