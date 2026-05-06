import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { ArrowOutward } from '@mui/icons-material';
import CapabilityStatusBadge from './CapabilityStatusBadge';

const WorkflowFeatureCard = ({
  icon,
  title,
  description,
  metricValue,
  metricLabel,
  capabilityStatus = 'stable',
  accent = '#2563eb'
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: { xs: 210, md: 230 },
        p: { xs: 2.25, md: 2.7 },
        borderRadius: 3,
        border: '1px solid rgba(15, 23, 42, 0.08)',
        background: 'linear-gradient(165deg, rgba(255,255,255,0.98) 0%, rgba(245,249,255,0.96) 100%)',
        boxShadow: '0 14px 30px rgba(15, 23, 42, 0.09)',
        overflow: 'hidden',
        transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease, background 220ms ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '0 auto auto 0',
          width: '100%',
          height: 4,
          background: `linear-gradient(90deg, ${accent} 0%, ${accent}99 58%, rgba(255,255,255,0) 100%)`,
          opacity: 0.9
        },
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 24px 42px rgba(15, 23, 42, 0.14)',
          borderColor: 'rgba(37, 99, 235, 0.25)',
          background: 'linear-gradient(165deg, rgba(255,255,255,1) 0%, rgba(239,246,255,1) 100%)'
        }
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.7 }}>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
            background: 'linear-gradient(145deg, rgba(219,234,254,0.95) 0%, rgba(191,219,254,0.75) 100%)',
            border: '1px solid rgba(37,99,235,0.2)'
          }}
        >
          {icon}
        </Box>

        <ArrowOutward sx={{ fontSize: 18, color: 'rgba(71,85,105,0.7)' }} />
      </Stack>

      <Typography sx={{ fontSize: '1.06rem', fontWeight: 750, color: '#0f172a', mb: 1 }}>
        {title}
      </Typography>

      <Typography sx={{ color: '#334155', lineHeight: 1.64, fontSize: '0.94rem', mb: 2 }}>
        {description}
      </Typography>

      <Box
        sx={{
          borderRadius: 2,
          border: `1px solid ${accent}30`,
          background: `linear-gradient(155deg, ${accent}14 0%, ${accent}08 100%)`,
          px: 1.2,
          py: 1,
          mt: 'auto'
        }}
      >
        <Typography sx={{ color: accent, fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>
          {metricValue}
        </Typography>
        <Typography sx={{ color: '#64748b', fontSize: '0.78rem', mt: 0.3, lineHeight: 1.4 }}>
          {metricLabel}
        </Typography>
        <CapabilityStatusBadge status={capabilityStatus} sx={{ mt: 0.9 }} />
      </Box>
    </Paper>
  );
};

export default WorkflowFeatureCard;
