import React from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { Hub, PlayCircleOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicHeroSection from './PublicHeroSection';

const floatLoop = {
  y: [0, -8, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

const bars = [56, 74, 49, 88, 63, 96, 78];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <PublicHeroSection
      badgeIcon={<Hub sx={{ color: '#bfdbfe !important' }} />}
      badgeLabel="Workflow Driven Financial Operating System"
      title="The Financial Operating System for Growing Businesses"
      description="Manage invoices, payments, inventory, workflows, and financial operations from one connected platform."
      primaryAction={{
        label: 'Start Free',
        onClick: () => navigate('/login'),
      }}
      secondaryAction={{
        label: 'Explore Interactive Workspace',
        startIcon: <PlayCircleOutline />,
        onClick: () => {
          navigate('/demo');
        },
      }}
      tags={['No credit card', 'Setup in 2 min', 'Cancel anytime']}
      titleSx={{ fontSize: { xs: '2.25rem', sm: '2.9rem', md: '3.8rem' }, letterSpacing: '-0.03em', lineHeight: 1.04 }}
      descriptionSx={{ fontSize: { xs: '1rem', md: '1.25rem' }, color: 'rgba(232,239,255,0.92)', maxWidth: 680 }}
      rightContent={(
        <Box
          sx={{
            position: 'relative',
            minHeight: { xs: 340, sm: 430, md: 520 },
            maxWidth: 620,
            mx: { xs: 'auto', md: 0 }
          }}
        >
          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              zIndex: 2,
              p: { xs: 2.3, md: 3.1 },
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'linear-gradient(160deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 100%)',
              backdropFilter: 'blur(14px)',
              boxShadow: '0 30px 70px rgba(2, 8, 32, 0.48)'
            }}
          >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.2 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', md: '1rem' }, color: '#f4f7ff' }}>
                    Example Financial Workflow Snapshot
                  </Typography>
                  <Chip
                    label="Concept"
                    size="small"
                    sx={{
                      color: '#dbeafe',
                      backgroundColor: 'rgba(59, 130, 246, 0.22)',
                      border: '1px solid rgba(147, 197, 253, 0.44)',
                      fontWeight: 700
                    }}
                  />
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    alignItems: 'end',
                    gap: 1,
                    p: 1.4,
                    borderRadius: 2.5,
                    backgroundColor: 'rgba(5,12,36,0.5)',
                    border: '1px solid rgba(189,210,255,0.16)',
                    mb: 2.2,
                    minHeight: 140
                  }}
                >
                  {bars.map((height, index) => (
                    <Box
                      key={`bar-${index}`}
                      sx={{
                        borderRadius: 2,
                        height: `${height}%`,
                        background: index > 4
                          ? 'linear-gradient(180deg, #79a8ff 0%, #4f7fff 100%)'
                          : 'linear-gradient(180deg, rgba(161,190,255,0.84) 0%, rgba(92,125,214,0.82) 100%)'
                      }}
                    />
                  ))}
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Paper
                    elevation={0}
                    sx={{
                      flex: 1,
                      p: 1.6,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(198,219,255,0.15)'
                    }}
                  >
                    <Typography sx={{ color: 'rgba(219,230,255,0.82)', fontSize: '0.75rem', mb: 0.6 }}>
                      Revenue Pipeline View
                    </Typography>
                    <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>Quote to cash visibility</Typography>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      flex: 1,
                      p: 1.6,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(198,219,255,0.15)'
                    }}
                  >
                    <Typography sx={{ color: 'rgba(219,230,255,0.82)', fontSize: '0.75rem', mb: 0.6 }}>
                      Reconciliation State
                    </Typography>
                    <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>Rule-based matching</Typography>
                  </Paper>
                </Stack>
                <Typography sx={{ mt: 1.1, color: 'rgba(191,219,254,0.8)', fontSize: '0.72rem' }}>
                  Conceptual operational view
                </Typography>
              </Paper>

              <Paper
                component={motion.div}
                animate={floatLoop}
                elevation={0}
                sx={{
                  position: 'absolute',
                  top: { xs: -12, md: -22 },
                  right: { xs: -4, md: -28 },
                  zIndex: 3,
                  p: 1.6,
                  borderRadius: 2.5,
                  width: { xs: 170, md: 210 },
                  backgroundColor: 'rgba(10, 24, 61, 0.86)',
                  border: '1px solid rgba(146,188,255,0.32)',
                  boxShadow: '0 16px 30px rgba(0, 0, 0, 0.3)'
                }}
              >
                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(216,230,255,0.86)', mb: 0.4 }}>
                  Invoice Workflow
                </Typography>
                <Typography sx={{ fontWeight: 800, color: '#f0f6ff', fontSize: '1rem', mb: 0.8 }}>
                  Approvals awaiting review
                </Typography>
                <Box
                  sx={{
                    height: 7,
                    borderRadius: 99,
                    background: 'rgba(255,255,255,0.16)',
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      width: '78%',
                      height: '100%',
                      background: 'linear-gradient(90deg, #34d399 0%, #3b82f6 100%)'
                    }}
                  />
                </Box>
              </Paper>

              <Paper
                component={motion.div}
                animate={{
                  y: [0, 6, 0],
                  transition: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }
                }}
                elevation={0}
                sx={{
                  position: 'absolute',
                  left: { xs: -6, md: -28 },
                  bottom: { xs: -18, md: -22 },
                  zIndex: 3,
                  p: 1.6,
                  borderRadius: 2.5,
                  width: { xs: 160, md: 220 },
                  backgroundColor: 'rgba(9, 20, 50, 0.88)',
                  border: '1px solid rgba(146,188,255,0.3)',
                  boxShadow: '0 16px 28px rgba(0, 0, 0, 0.28)'
                }}
              >
                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(216,230,255,0.86)', mb: 0.5 }}>
                  Cash Position
                </Typography>
                <Typography sx={{ fontWeight: 800, color: '#f0f6ff', fontSize: '1.05rem' }}>
                  Trend snapshot
                </Typography>
              </Paper>
            </Box>
      )}
    />
  );
};

export default HeroSection;
