import React from 'react';
import { Box, Container, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import {
  RequestQuote,
  ReceiptLong,
  Payments,
  CompareArrows,
  Insights,
  KeyboardArrowRight
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { homeTokens } from './homepageTokens';

const workflowSteps = [
  {
    icon: RequestQuote,
    title: 'Quote',
    description: 'Create client-ready quotes with pricing rules and approval controls.'
  },
  {
    icon: ReceiptLong,
    title: 'Invoice',
    description: 'Convert approved quotes into GST-ready invoices in one click.'
  },
  {
    icon: Payments,
    title: 'Payment',
    description: 'Track collections with automated payment updates and clear status transitions.'
  },
  {
    icon: CompareArrows,
    title: 'Reconciliation',
    description: 'Match bank and ledger entries to keep books clean and accurate.'
  },
  {
    icon: Insights,
    title: 'Insights',
    description: 'Turn transaction flow into decision-ready financial visibility.'
  }
];

const sectionFade = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: 'easeOut' }
  }
};

const WorkflowSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        py: homeTokens.sectionPy,
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%)',
        borderTop: '1px solid rgba(15, 23, 42, 0.06)',
        borderBottom: '1px solid rgba(15, 23, 42, 0.06)'
      }}
    >
      <Container maxWidth={homeTokens.containerMax}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={sectionFade}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 4.5, md: 6 } }}>
            <Typography
              sx={{
                ...homeTokens.heading.section,
                color: '#0f172a',
                mb: 1.6
              }}
            >
              How Solidev Books Works
            </Typography>
            <Typography
              sx={{
                maxWidth: 760,
                mx: 'auto',
                color: '#334155',
                lineHeight: 1.7,
                fontSize: { xs: '0.98rem', md: '1.08rem' }
              }}
            >
              One connected workflow from first quote to financial insight, built for teams that run
              operations at scale.
            </Typography>
          </Box>
        </motion.div>

        {!isMobile && (
          <Box
            sx={{
              position: 'relative',
              px: { md: 1, lg: 2 },
              py: 2.2,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: '8%',
                right: '8%',
                top: 66,
                height: 2,
                background: 'linear-gradient(90deg, rgba(37,99,235,0.16) 0%, rgba(59,130,246,0.45) 52%, rgba(37,99,235,0.16) 100%)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2 }}>
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={step.title}>
                    <Paper
                      component={motion.div}
                      whileHover={{ y: -6, boxShadow: '0 18px 34px rgba(15,23,42,0.12)' }}
                      transition={{ duration: 0.22 }}
                      elevation={0}
                      sx={{
                        width: '100%',
                        maxWidth: 224,
                        minHeight: 220,
                        p: 2.2,
                        borderRadius: homeTokens.card.radius,
                        border: homeTokens.card.border,
                        background: 'linear-gradient(170deg, rgba(255,255,255,0.92) 0%, rgba(241,247,255,0.92) 100%)',
                        backdropFilter: 'blur(6px)',
                        position: 'relative',
                        zIndex: 1,
                        boxShadow: homeTokens.card.shadow
                      }}
                    >
                      <Box
                        sx={{
                          width: 54,
                          height: 54,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#1d4ed8',
                          background: 'linear-gradient(145deg, rgba(219,234,254,1) 0%, rgba(191,219,254,1) 100%)',
                          border: '1px solid rgba(37,99,235,0.26)',
                          mb: 1.4
                        }}
                      >
                        <Icon sx={{ fontSize: homeTokens.icon.large - 8 }} />
                      </Box>

                      <Typography sx={{ fontWeight: 750, fontSize: '1.06rem', color: '#0f172a', mb: 1 }}>
                        {step.title}
                      </Typography>
                      <Typography sx={{ color: '#334155', lineHeight: 1.65, fontSize: '0.92rem' }}>
                        {step.description}
                      </Typography>
                    </Paper>

                    {index < workflowSteps.length - 1 && (
                      <Box
                        component={motion.div}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.08 * index, duration: 0.35 }}
                        sx={{
                          alignSelf: 'center',
                          color: 'rgba(30, 64, 175, 0.7)',
                          mt: 1,
                          mx: { md: 0.15, lg: 0.3 }
                        }}
                      >
                        <KeyboardArrowRight sx={{ fontSize: 30 }} />
                      </Box>
                    )}
                  </React.Fragment>
                );
              })}
            </Box>
          </Box>
        )}

        {isMobile && (
          <Box sx={{ position: 'relative', maxWidth: 560, mx: 'auto', pl: 2.6 }}>
            <Box
              sx={{
                position: 'absolute',
                left: 15,
                top: 10,
                bottom: 8,
                width: 2,
                background: 'linear-gradient(180deg, rgba(59,130,246,0.2) 0%, rgba(37,99,235,0.55) 50%, rgba(59,130,246,0.2) 100%)'
              }}
            />

            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Box
                  key={step.title}
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  sx={{
                    position: 'relative',
                    pb: index === workflowSteps.length - 1 ? 0 : 2.2,
                    pl: 2.5
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: -2,
                      top: 8,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: '2px solid #2563eb',
                      backgroundColor: '#f8fafc',
                      boxShadow: '0 0 0 4px rgba(59,130,246,0.14)'
                    }}
                  />

                  <Paper
                    component={motion.div}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.18 }}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: homeTokens.card.radius,
                      border: homeTokens.card.border,
                      background: 'linear-gradient(170deg, rgba(255,255,255,0.92) 0%, rgba(241,247,255,0.92) 100%)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.7 }}>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#1d4ed8',
                          background: 'rgba(219,234,254,0.9)',
                          border: '1px solid rgba(37,99,235,0.2)'
                        }}
                      >
                        <Icon sx={{ fontSize: homeTokens.icon.medium - 4 }} />
                      </Box>
                      <Typography sx={{ fontWeight: 750, fontSize: '1rem', color: '#0f172a' }}>
                        {step.title}
                      </Typography>
                    </Box>
                    <Typography sx={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.65 }}>
                      {step.description}
                    </Typography>
                  </Paper>
                </Box>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default WorkflowSection;
