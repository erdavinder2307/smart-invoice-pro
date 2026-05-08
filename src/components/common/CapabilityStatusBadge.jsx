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

const STATUS_STYLES_DARK = {
  stable: {
    label: 'Stable',
    color: '#bbf7d0',
    backgroundColor: 'rgba(16, 185, 129, 0.24)',
    borderColor: 'rgba(16, 185, 129, 0.48)'
  },
  expanding: {
    label: 'Expanding',
    color: '#bfdbfe',
    backgroundColor: 'rgba(59, 130, 246, 0.24)',
    borderColor: 'rgba(96, 165, 250, 0.5)'
  },
  roadmap: {
    label: 'Roadmap',
    color: '#fde68a',
    backgroundColor: 'rgba(245, 158, 11, 0.24)',
    borderColor: 'rgba(251, 191, 36, 0.52)'
  },
  beta: {
    label: 'Beta',
    color: '#fdba74',
    backgroundColor: 'rgba(249, 115, 22, 0.24)',
    borderColor: 'rgba(251, 146, 60, 0.52)'
  },
  preview: {
    label: 'Preview',
    color: '#c7d2fe',
    backgroundColor: 'rgba(99, 102, 241, 0.24)',
    borderColor: 'rgba(129, 140, 248, 0.52)'
  }
};

const CapabilityStatusBadge = ({ status = 'stable', size = 'small', tone = 'light', sx = {} }) => {
  const normalizedStatus = String(status || 'stable').toLowerCase();
  const styleMap = tone === 'dark' ? STATUS_STYLES_DARK : STATUS_STYLES;
  const config = styleMap[normalizedStatus] || styleMap.stable;

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
          fontSize: size === 'small' ? '0.71rem' : '0.79rem',
          color: 'inherit'
        },
        ...sx
      }}
    />
  );
};

export default CapabilityStatusBadge;
