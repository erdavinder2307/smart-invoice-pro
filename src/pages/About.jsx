import React from 'react';
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import {
  ArrowForward,
  AutoAwesome,
  CompareArrows,
  DeviceHub,
  Insights,
  Inventory2,
  Lock,
  ReceiptLong,
  RequestQuote,
  SettingsSuggest,
  Speed,
  Storage,
  Timeline,
  AccountTree,
  VerifiedUser,
  Api,
  Hub
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import PublicHeroSection from '../components/Layout/PublicHeroSection';
import CapabilityStatusBadge from '../components/common/CapabilityStatusBadge';
import SeoHead from '../seo/SeoHead';
import {
  getBreadcrumbSchema,
  getOrganizationSchema,
  getWebPageSchema
} from '../seo/schema';

const MAX_W = '1240px';
const SECTION_Y = { xs: 8, md: 10 };

const SectionFrame = ({ children, bg, borderTop = false, py }) => (
  <Box
    sx={{
      py: py || SECTION_Y,
      background: bg || 'transparent',
      borderTop: borderTop ? '1px solid rgba(15,23,42,0.06)' : 'none'
    }}
  >
    <Box sx={{ maxWidth: MAX_W, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>{children}</Box>
  </Box>
);

const SectionTitle = ({
  title,
  subtitle,
  center = true,
  titleColor = '#0f172a',
  subtitleColor = '#475569',
  maxWidth = 780
}) => (
  <Box sx={{ textAlign: center ? 'center' : 'left', mb: { xs: 4, md: 5 } }}>
    <Typography
      sx={{
        fontSize: { xs: '1.95rem', md: '2.6rem' },
        fontWeight: 800,
        letterSpacing: '-0.02em',
        color: titleColor,
        lineHeight: 1.13,
        mb: 1.4
      }}
    >
      {title}
    </Typography>
    <Typography
      sx={{
        maxWidth: center ? maxWidth : '100%',
        mx: center ? 'auto' : 0,
        color: subtitleColor,
        fontSize: { xs: '1rem', md: '1.08rem' },
        lineHeight: 1.7
      }}
    >
      {subtitle}
    </Typography>
  </Box>
);

const FeatureGrid = ({ children, columns = 'three' }) => {
  const templates = {
    two: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
    three: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: templates[columns] || templates.three,
        gap: { xs: 1.8, md: 2.2 }
      }}
    >
      {children}
    </Box>
  );
};

const compactCardSx = {
  height: '100%',
  borderRadius: 3,
  border: '1px solid rgba(15,23,42,0.08)',
  background: 'linear-gradient(165deg, rgba(255,255,255,0.97) 0%, rgba(244,248,255,0.95) 100%)',
  boxShadow: '0 12px 28px rgba(15,23,42,0.08)'
};

const capabilityCards = [
  {
    icon: <Storage sx={{ fontSize: 22 }} />,
    title: 'Multi-Tenant Cloud Platform',
    description: 'Run finance operations for multiple teams and entities with isolated, secure workspaces.',
    tag: 'Tenant-aware architecture',
    status: 'stable'
  },
  {
    icon: <SettingsSuggest sx={{ fontSize: 22 }} />,
    title: 'Workflow Automation Engine',
    description: 'Automate routine handoffs from quote creation to invoice follow-up and reconciliation.',
    tag: 'Rule-driven orchestration',
    status: 'stable'
  },
  {
    icon: <Lock sx={{ fontSize: 22 }} />,
    title: 'Secure Financial Architecture',
    description: 'Protect operational data with robust access controls and secure transaction handling.',
    tag: 'Role-based controls',
    status: 'stable'
  },
  {
    icon: <Timeline sx={{ fontSize: 22 }} />,
    title: 'Operational Visibility',
    description: 'Track receivables, cash movement, and workflow status with shared operational context.',
    tag: 'Connected operations context',
    status: 'stable'
  },
  {
    icon: <Api sx={{ fontSize: 22 }} />,
    title: 'Integration-Ready APIs',
    description: 'Connect accounting, CRM, and banking workflows without rebuilding your finance stack.',
    tag: 'Event-ready endpoints',
    status: 'expanding'
  },
  {
    icon: <Hub sx={{ fontSize: 22 }} />,
    title: 'Scalable Cloud Infrastructure',
    description: 'Scale from early-stage operations to high-volume teams with stable performance.',
    tag: 'Elastic architecture',
    status: 'stable'
  }
];

const principles = [
  {
    icon: <Speed sx={{ fontSize: 20 }} />,
    title: 'Simplicity',
    description: 'Clear workflows over complex setups.'
  },
  {
    icon: <VerifiedUser sx={{ fontSize: 20 }} />,
    title: 'Reliability',
    description: 'Consistent financial operations every day.'
  },
  {
    icon: <AccountTree sx={{ fontSize: 20 }} />,
    title: 'Workflow Efficiency',
    description: 'Connected flows that remove process friction.'
  },
  {
    icon: <AutoAwesome sx={{ fontSize: 20 }} />,
    title: 'Automation',
    description: 'Reduce manual effort with smart defaults.'
  },
  {
    icon: <DeviceHub sx={{ fontSize: 20 }} />,
    title: 'Scalability',
    description: 'Built to grow with your business complexity.'
  },
  {
    icon: <Lock sx={{ fontSize: 20 }} />,
    title: 'Security',
    description: 'Protect data across workflows and teams.'
  }
];

const About = () => {
  const navigate = useNavigate();
  const pageDescription = 'Learn how Solidev Books helps finance and operations teams run connected workflows across billing, approvals, reconciliation, and reporting.';
  const aboutSchemas = [
    getOrganizationSchema(),
    getWebPageSchema({
      path: '/about',
      title: 'About Solidev Books',
      description: pageDescription,
      type: 'AboutPage'
    }),
    getBreadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' }
    ])
  ];

  return (
    <Box sx={{ minHeight: '100vh', overflowX: 'hidden' }}>
      <SeoHead
        title="About Solidev Books"
        description={pageDescription}
        canonicalPath="/about"
        keywords="about solidev books, financial workflow platform, business finance automation"
        jsonLd={aboutSchemas}
      />
      <Header />

      <PublicHeroSection
        badgeIcon={<Hub sx={{ color: '#bfdbfe !important' }} />}
        badgeLabel="Enterprise Workflow Platform"
        title="Building the Future of Financial Operations"
        description="Solidev Books helps businesses manage workflows, invoices, payments, inventory, and financial operations from one connected platform."
        primaryAction={{ label: 'Start Free', onClick: () => navigate('/login') }}
        secondaryAction={{ label: 'Explore Platform', onClick: () => navigate('/features') }}
        tags={['Quote to Cash', 'Automation', 'Operational visibility', 'Connected workflows']}
        titleSx={{ fontSize: { xs: '2.2rem', sm: '2.7rem', md: '3.4rem' }, lineHeight: 1.08 }}
        descriptionSx={{ fontSize: { xs: '1rem', md: '1.15rem' }, maxWidth: 680 }}
        rightContent={(
          <Box sx={{ position: 'relative', maxWidth: 520, mx: { xs: 'auto', md: 0 } }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.3, md: 2.8 },
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.14)',
                background:
                  'linear-gradient(160deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 100%)',
                backdropFilter: 'blur(14px)',
                boxShadow: '0 30px 70px rgba(2, 8, 32, 0.48)'
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#f4f7ff' }}>
                  Example Workflow Lifecycle
                </Typography>
                <Chip
                  label="Conceptual"
                  size="small"
                  sx={{
                    color: '#ecfff4',
                    backgroundColor: 'rgba(52, 211, 153, 0.2)',
                    border: '1px solid rgba(52, 211, 153, 0.45)',
                    fontWeight: 700
                  }}
                />
              </Stack>
              <Typography sx={{ color: 'rgba(191,219,254,0.82)', fontSize: '0.74rem', mb: 1.5 }}>
                Illustrative workflow progression
              </Typography>

              <Stack spacing={1.4} sx={{ mb: 2.2 }}>
                {[
                  { label: 'Quote', status: 'Validated', color: '#3b82f6', pct: 100 },
                  { label: 'Invoice', status: 'Generated', color: '#2563eb', pct: 88 },
                  { label: 'Payment', status: 'Tracked', color: '#0891b2', pct: 76 },
                  { label: 'Insights', status: 'Synced', color: '#22c55e', pct: 100 }
                ].map((step) => (
                  <Box key={step.label}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography sx={{ color: '#e2e8f0', fontSize: '0.84rem', fontWeight: 600 }}>
                        {step.label}
                      </Typography>
                      <Typography sx={{ color: step.color, fontSize: '0.74rem', fontWeight: 700 }}>
                        {step.status}
                      </Typography>
                    </Stack>
                    <Box sx={{ height: 5, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.12)' }}>
                      <Box
                        sx={{
                          width: `${step.pct}%`,
                          height: '100%',
                          borderRadius: 99,
                          background: `linear-gradient(90deg, ${step.color}cc, ${step.color})`
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>

              <Stack direction="row" spacing={1.2}>
                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(198,219,255,0.15)'
                  }}
                >
                  <Typography sx={{ color: 'rgba(219,230,255,0.82)', fontSize: '0.74rem', mb: 0.5 }}>
                    Platform context
                  </Typography>
                  <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '0.95rem' }}>Multi-team workflow operations</Typography>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(198,219,255,0.15)'
                  }}
                >
                  <Typography sx={{ color: 'rgba(219,230,255,0.82)', fontSize: '0.74rem', mb: 0.5 }}>
                    Workflow maturity
                  </Typography>
                  <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '0.95rem' }}>Connected lifecycle model</Typography>
                </Paper>
              </Stack>
              <Typography sx={{ mt: 1.1, color: 'rgba(191,219,254,0.82)', fontSize: '0.72rem' }}>
                Sample lifecycle visualization
              </Typography>
            </Paper>
          </Box>
        )}
      />

      <SectionFrame borderTop py={{ xs: 7, md: 8 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'minmax(0, 0.9fr) minmax(0, 1.1fr)'
            },
            gap: { xs: 2.6, md: 3.6 },
            alignItems: 'stretch'
          }}
        >
          <Box>
            <SectionTitle
              center={false}
              title="Why We Built Solidev Books"
              subtitle="Most financial tools force businesses to manage disconnected modules and repetitive manual tasks. We believe financial operations should feel connected, automated, and intuitive."
            />
            <Stack spacing={0.95}>
              {[
                'Eliminate disconnected workflows.',
                'Reduce billing and collection errors.',
                'Improve operational visibility.',
                'Automate repetitive finance tasks.'
              ].map((line) => (
                <Stack key={line} direction="row" spacing={1} alignItems="flex-start">
                  <AutoAwesome sx={{ fontSize: 18, color: '#2563eb', mt: 0.25 }} />
                  <Typography sx={{ color: '#334155', lineHeight: 1.6 }}>{line}</Typography>
                </Stack>
              ))}
            </Stack>

            <Button
              variant="outlined"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/features')}
              sx={{
                mt: 2.2,
                borderRadius: '10px',
                px: 2.2,
                py: 0.95,
                fontWeight: 650
              }}
            >
              Explore Workflow Platform
            </Button>
          </Box>
          <Box>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                minHeight: { xs: 420, md: 470 },
                p: { xs: 2, md: 2.4 },
                borderRadius: 3,
                border: '1px solid rgba(15,23,42,0.08)',
                background: 'linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(241,248,255,0.95) 100%)',
                boxShadow: '0 18px 34px rgba(15,23,42,0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ position: 'absolute', top: -80, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.16) 0%, rgba(37,99,235,0) 72%)' }} />
              <Box sx={{ position: 'absolute', bottom: -90, left: -70, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.14) 0%, rgba(14,165,233,0) 74%)' }} />

              <Typography sx={{ fontWeight: 750, color: '#0f172a', mb: 1.4, position: 'relative', zIndex: 1 }}>
                Example Workflow Intelligence View
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.74rem', mb: 1.2, position: 'relative', zIndex: 1 }}>
                Conceptual operational model
              </Typography>

              <Grid container spacing={1.4} sx={{ position: 'relative', zIndex: 1 }}>
                <Grid item xs={12} md={7}>
                  <Stack spacing={0.95}>
                    {[
                      {
                        icon: <RequestQuote sx={{ fontSize: 18 }} />,
                        step: 'Quote',
                        detail: 'Approved',
                        badge: 'Live'
                      },
                      {
                        icon: <ReceiptLong sx={{ fontSize: 18 }} />,
                        step: 'Invoice',
                        detail: 'Sent to customer',
                        badge: 'Auto-reminders'
                      },
                      {
                        icon: <CompareArrows sx={{ fontSize: 18 }} />,
                        step: 'Payment',
                        detail: 'Captured + matched',
                        badge: 'Cleared'
                      },
                      {
                        icon: <Inventory2 sx={{ fontSize: 18 }} />,
                        step: 'Reconciliation',
                        detail: 'Ledger synced',
                        badge: 'In progress'
                      },
                      {
                        icon: <Insights sx={{ fontSize: 18 }} />,
                        step: 'Insights',
                        detail: 'Cash position updated',
                        badge: 'Updated'
                      }
                    ].map((row, idx) => (
                      <Stack key={row.step} spacing={0.75}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.1,
                            borderRadius: 2,
                            border: '1px solid rgba(15,23,42,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            bgcolor: 'rgba(255,255,255,0.82)'
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: 1.6,
                                bgcolor: 'rgba(37,99,235,0.12)',
                                color: '#2563eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {row.icon}
                            </Box>
                            <Box>
                              <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.2 }}>{row.step}</Typography>
                              <Typography sx={{ color: '#64748b', fontSize: '0.74rem' }}>{row.detail}</Typography>
                            </Box>
                          </Stack>
                          <Chip
                            label={row.badge}
                            size="small"
                            sx={{
                              height: 22,
                              borderRadius: '999px',
                              bgcolor: 'rgba(37,99,235,0.12)',
                              color: '#1d4ed8',
                              fontWeight: 650,
                              '& .MuiChip-label': { px: 0.9, fontSize: '0.7rem' }
                            }}
                          />
                        </Paper>
                        {idx < 4 && (
                          <ArrowForward sx={{ color: '#94a3b8', fontSize: 15, mx: 'auto', transform: 'rotate(90deg)' }} />
                        )}
                      </Stack>
                    ))}
                  </Stack>
                </Grid>

                <Grid item xs={12} md={5}>
                  <Stack spacing={1.1}>
                    {[
                      { label: 'Payments workflow', value: 'Tracked', tone: '#059669' },
                      { label: 'Cashflow view', value: 'Updated', tone: '#2563eb' },
                      { label: 'Invoice queue', value: 'Prioritized', tone: '#0ea5e9' },
                      { label: 'Automation layer', value: 'Active', tone: '#7c3aed' }
                    ].map((metric) => (
                      <Paper
                        key={metric.label}
                        elevation={0}
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          border: '1px solid rgba(15,23,42,0.08)',
                          bgcolor: 'rgba(255,255,255,0.86)'
                        }}
                      >
                        <Typography sx={{ color: '#64748b', fontSize: '0.72rem', mb: 0.2 }}>{metric.label}</Typography>
                        <Typography sx={{ color: metric.tone, fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>{metric.value}</Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Box>
      </SectionFrame>

      <SectionFrame bg="linear-gradient(180deg, #f8fbff 0%, #f2f7ff 100%)" borderTop>
        <SectionTitle
          title="Connected Financial Workflows"
          subtitle="Solidev Books manages lifecycle operations end-to-end, so teams move from transactions to outcomes without process gaps."
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.08fr 0.92fr' },
            gap: { xs: 2, md: 2.6 },
            alignItems: 'stretch'
          }}
        >
          <Paper
            elevation={0}
            sx={{
              ...compactCardSx,
              p: { xs: 1.6, md: 2 },
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(165deg, rgba(255,255,255,0.98) 0%, rgba(239,247,255,0.96) 100%)'
            }}
          >
            <Typography sx={{ color: '#0f172a', fontWeight: 750, mb: 1.4 }}>Workflow Engine Timeline</Typography>
            <Box
              sx={{
                position: 'absolute',
                left: { xs: 18, md: 22 },
                top: 62,
                bottom: 24,
                width: 2,
                background: 'linear-gradient(180deg, rgba(37,99,235,0.24) 0%, rgba(37,99,235,0.58) 50%, rgba(37,99,235,0.24) 100%)'
              }}
            />
            <Stack spacing={1.05}>
              {[
                {
                  icon: <RequestQuote sx={{ fontSize: 18 }} />,
                  title: 'Quote Approved',
                  status: 'Review queue active',
                  metric: 'Approval policy in effect'
                },
                {
                  icon: <ReceiptLong sx={{ fontSize: 18 }} />,
                  title: 'Invoice Issued',
                  status: 'Outstanding items tracked',
                  metric: 'Auto-reminders enabled'
                },
                {
                  icon: <CompareArrows sx={{ fontSize: 18 }} />,
                  title: 'Payment Cleared',
                  status: 'Collection workflow active',
                  metric: 'Bank sync active'
                },
                {
                  icon: <Inventory2 sx={{ fontSize: 18 }} />,
                  title: 'Reconciliation',
                  status: 'Entries in review queue',
                  metric: 'Ledger sync monitoring'
                },
                {
                  icon: <Insights sx={{ fontSize: 18 }} />,
                  title: 'Insights',
                  status: 'Cashflow refreshed',
                  metric: 'Scenario planning ready'
                }
              ].map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.36, delay: index * 0.05 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.2,
                      pl: { xs: 1.4, md: 1.5 },
                      borderRadius: 2,
                      border: '1px solid rgba(15,23,42,0.07)',
                      bgcolor: 'rgba(255,255,255,0.86)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: 1.5,
                          bgcolor: 'rgba(37,99,235,0.12)',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {step.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>
                          {step.title}
                        </Typography>
                        <Typography sx={{ color: '#1d4ed8', fontWeight: 700, fontSize: '0.77rem', lineHeight: 1.3 }}>
                          {step.status}
                        </Typography>
                        <Typography sx={{ color: '#64748b', fontSize: '0.72rem' }}>{step.metric}</Typography>
                      </Box>
                    </Stack>
                    <Chip
                      label={index < 2 ? 'Queued' : index === 2 ? 'Live' : 'Synced'}
                      size="small"
                      sx={{
                        height: 22,
                        borderRadius: '999px',
                        bgcolor: 'rgba(37,99,235,0.12)',
                        color: '#1d4ed8',
                        fontWeight: 650,
                        '& .MuiChip-label': { px: 0.9, fontSize: '0.7rem' }
                      }}
                    />
                  </Paper>
                </motion.div>
              ))}
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              ...compactCardSx,
              p: { xs: 1.6, md: 2 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Typography sx={{ color: '#0f172a', fontWeight: 750, mb: 1.4 }}>Operational Signals</Typography>
            <FeatureGrid columns="two">
              {[
                { label: 'Payments workflow', value: 'Tracked', tone: '#059669' },
                { label: 'Cashflow view', value: 'Updated', tone: '#2563eb' },
                { label: 'Invoice queue', value: 'Prioritized', tone: '#0ea5e9' },
                { label: 'Automation layer', value: 'Active', tone: '#7c3aed' }
              ].map((metric) => (
                <Paper
                  key={metric.label}
                  elevation={0}
                  sx={{
                    p: 1.15,
                    borderRadius: 2,
                    border: '1px solid rgba(15,23,42,0.08)',
                    bgcolor: 'rgba(255,255,255,0.85)'
                  }}
                >
                  <Typography sx={{ color: '#64748b', fontSize: '0.72rem', mb: 0.2 }}>{metric.label}</Typography>
                  <Typography sx={{ color: metric.tone, fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.2 }}>
                    {metric.value}
                  </Typography>
                </Paper>
              ))}
            </FeatureGrid>

            <Paper
              elevation={0}
              sx={{
                mt: 1.4,
                p: 1.2,
                borderRadius: 2,
                border: '1px solid rgba(15,23,42,0.08)',
                bgcolor: 'rgba(248,250,252,0.9)'
              }}
            >
              <Typography sx={{ color: '#64748b', fontSize: '0.74rem', mb: 0.6 }}>Workflow Throughput</Typography>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem', mb: 0.7 }}>Conceptual process indicator</Typography>
              <Box sx={{ height: 8, borderRadius: 99, bgcolor: '#e2e8f0', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: '0%' }}
                  whileInView={{ width: '74%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #2563eb 0%, #0ea5e9 100%)' }}
                />
              </Box>
            </Paper>
          </Paper>
        </Box>
      </SectionFrame>

      <SectionFrame borderTop>
        <SectionTitle
          title="Enterprise-Ready Infrastructure"
          subtitle="Built to support high-velocity financial operations with dependable controls, visibility, and scale."
        />
        <FeatureGrid columns="three">
          {capabilityCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.42, delay: index * 0.05 }}
              whileHover={{ y: -6 }}
            >
              <Paper
                elevation={0}
                sx={{
                  ...compactCardSx,
                  p: 2.2,
                  minHeight: 176,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'box-shadow 220ms ease, border-color 220ms ease',
                  '&:hover': {
                    boxShadow: '0 18px 34px rgba(15,23,42,0.12)',
                    borderColor: 'rgba(37,99,235,0.22)'
                  }
                }}
              >
                <Box>
                  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 0.9 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: 'rgba(37,99,235,0.12)',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: '1rem', lineHeight: 1.25 }}>
                      {card.title}
                    </Typography>
                  </Stack>
                  <Typography sx={{ color: '#475569', lineHeight: 1.58, fontSize: '0.9rem' }}>{card.description}</Typography>
                </Box>

                <Chip
                  label={card.tag}
                  size="small"
                  sx={{
                    mt: 1.2,
                    alignSelf: 'flex-start',
                    bgcolor: 'rgba(37,99,235,0.1)',
                    color: '#1d4ed8',
                    border: '1px solid rgba(37,99,235,0.2)',
                    fontWeight: 650,
                    '& .MuiChip-label': { px: 1.1, fontSize: '0.72rem' }
                  }}
                />
                <CapabilityStatusBadge status={card.status} sx={{ mt: 1 }} />
              </Paper>
            </motion.div>
          ))}
        </FeatureGrid>
      </SectionFrame>

      <SectionFrame
        bg="linear-gradient(180deg, #fbfdff 0%, #f4f9ff 100%)"
        borderTop
        py={{ xs: 7, md: 8 }}
      >
        <Box
          sx={{
            borderRadius: 3,
            border: '1px solid rgba(15,23,42,0.06)',
            background: 'linear-gradient(160deg, rgba(255,255,255,0.9) 0%, rgba(245,250,255,0.9) 100%)',
            boxShadow: '0 16px 34px rgba(15,23,42,0.07)',
            p: { xs: 2, md: 2.8 },
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.05) 1px, transparent 0)',
              backgroundSize: '26px 26px',
              opacity: 0.22
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <SectionTitle
              title="Core Principles"
              subtitle="Every workflow and feature is shaped by these operating principles."
              maxWidth={920}
            />
            <FeatureGrid columns="three">
              {principles.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  whileHover={{ y: -5 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      ...compactCardSx,
                      p: { xs: 2, md: 2.3 },
                      minHeight: 146,
                      transition: 'box-shadow 220ms ease, border-color 220ms ease',
                      '&:hover': {
                        boxShadow: '0 20px 34px rgba(15,23,42,0.11)',
                        borderColor: 'rgba(37,99,235,0.22)'
                      }
                    }}
                  >
                    <Stack direction="row" spacing={1.1} alignItems="center" sx={{ mb: 1.1 }}>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: 2,
                          color: '#2563eb',
                          bgcolor: 'rgba(37,99,235,0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography sx={{ color: '#0f172a', fontWeight: 750, fontSize: '1.02rem' }}>{item.title}</Typography>
                    </Stack>
                    <Typography sx={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.58 }}>{item.description}</Typography>
                  </Paper>
                </motion.div>
              ))}
            </FeatureGrid>
          </Box>
        </Box>
      </SectionFrame>

      <SectionFrame bg="linear-gradient(145deg, #080f25 0%, #101d49 50%, #09162f 100%)" borderTop py={{ xs: 7, md: 8 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '0.92fr 1.08fr' },
            gap: { xs: 2.3, md: 3.2 },
            alignItems: 'stretch'
          }}
        >
          <Box>
            <SectionTitle
              center={false}
              title="Built for the Next Generation of Financial Operations"
              subtitle="We are building automation-first financial infrastructure with workflow intelligence, scalable systems, and connected business visibility."
              titleColor="#ffffff"
              subtitleColor="rgba(221,231,255,0.88)"
            />
            <Typography sx={{ color: 'rgba(208,221,255,0.82)', lineHeight: 1.68, mb: 2, maxWidth: 520 }}>
              Solidev Books is designed to evolve from transactional tracking to operational guidance,
              where workflows are connected, decisions are context-aware, and execution is continuous.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/features')}
              sx={{
                borderRadius: '10px',
                px: 2.2,
                py: 0.95,
                color: '#e2ebff',
                borderColor: 'rgba(196,219,255,0.42)',
                '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.08)' }
              }}
            >
              Explore Vision
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
              gap: 1.1,
              alignItems: 'stretch'
            }}
          >
            <Paper
              elevation={0}
              sx={{
                gridColumn: { xs: 'span 6', sm: 'span 4' },
                p: 1.6,
                borderRadius: 2.6,
                bgcolor: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(196,219,255,0.22)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Typography sx={{ color: '#ffffff', fontWeight: 700, mb: 0.8 }}>Workflow Intelligence</Typography>
              <Typography sx={{ color: 'rgba(223,233,255,0.84)', fontSize: '0.86rem', mb: 1.1 }}>
                Detect bottlenecks and route next actions across finance operations.
              </Typography>
              <Stack spacing={0.8}>
                {['Approval delay: Billing queue', 'Collection alert: 3 invoices at risk', 'Sync update: Reconciliation matched'].map((line) => (
                  <Paper
                    key={line}
                    elevation={0}
                    sx={{ p: 0.8, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(196,219,255,0.16)' }}
                  >
                    <Typography sx={{ color: 'rgba(223,233,255,0.88)', fontSize: '0.74rem' }}>{line}</Typography>
                  </Paper>
                ))}
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                gridColumn: { xs: 'span 6', sm: 'span 2' },
                p: 1.4,
                borderRadius: 2.6,
                bgcolor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(196,219,255,0.2)'
              }}
            >
              <Typography sx={{ color: 'rgba(223,233,255,0.72)', fontSize: '0.72rem' }}>Automation Active</Typography>
              <Typography sx={{ color: '#ffffff', fontWeight: 800, fontSize: '1rem', mb: 0.8 }}>Policy triggers enabled</Typography>
              <Typography sx={{ color: 'rgba(223,233,255,0.72)', fontSize: '0.72rem' }}>Workflows running with policy triggers</Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                gridColumn: { xs: 'span 6', sm: 'span 3' },
                p: 1.4,
                borderRadius: 2.6,
                bgcolor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(196,219,255,0.2)'
              }}
            >
              <Typography sx={{ color: '#ffffff', fontWeight: 700, mb: 0.6, fontSize: '0.92rem' }}>Insight Workbench (Roadmap)</Typography>
              <Typography sx={{ color: 'rgba(223,233,255,0.8)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                Additional planning and recommendation layers are being expanded with human review controls.
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                gridColumn: { xs: 'span 6', sm: 'span 3' },
                p: 1.4,
                borderRadius: 2.6,
                bgcolor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(196,219,255,0.2)'
              }}
            >
              <Typography sx={{ color: '#ffffff', fontWeight: 700, mb: 0.6, fontSize: '0.92rem' }}>Connected Operations</Typography>
              <Typography sx={{ color: 'rgba(223,233,255,0.8)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                Link billing, collections, reconciliation, and reporting into one financial execution system.
              </Typography>
            </Paper>
          </Box>
        </Box>
      </SectionFrame>

      <Box
        sx={{
          position: 'relative',
          py: { xs: 6, md: 7 },
          background: 'linear-gradient(180deg, #f2f7ff 0%, #eaf2ff 100%)',
          borderTop: '1px solid rgba(148,163,184,0.16)',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 18,
            background: 'linear-gradient(180deg, rgba(10,16,39,0.28) 0%, rgba(10,16,39,0) 100%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Box sx={{ maxWidth: MAX_W, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ textAlign: 'center', maxWidth: 860, mx: 'auto' }}>
            <Typography
              sx={{
                fontSize: { xs: '1.95rem', md: '2.75rem' },
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                lineHeight: 1.12,
                mb: 1.2
              }}
            >
              Start Simplifying Financial Operations
            </Typography>
            <Typography sx={{ color: '#475569', lineHeight: 1.65, mb: 2.5, fontSize: { xs: '0.98rem', md: '1.04rem' } }}>
              Designed for businesses replacing fragmented finance workflows with one connected operational system.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.3} justifyContent="center" sx={{ mb: 1.1 }}>
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/login')}
                sx={{ px: 3.1, py: 1.2, borderRadius: '12px', fontWeight: 700 }}
              >
                Start Free
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/contact')}
                sx={{ px: 3.1, py: 1.15, borderRadius: '12px', fontWeight: 650 }}
              >
                Book Demo
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default About;
