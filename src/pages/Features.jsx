import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Chip,
  Button,
  Stack,
  Divider
} from '@mui/material';
import {
  ArrowForward,
  Autorenew,
  CheckCircle,
  CloudSync,
  ExpandMore,
  GppGood,
  Hub,
  Insights,
  Paid,
  QueryStats,
  ReceiptLong,
  RequestQuote,
  Rule,
  Timeline,
  TrackChanges,
  AccountTree,
  Api,
  Lan,
  Shield,
  AssignmentTurnedIn,
  NotificationsActive,
  FactCheck,
  AutoGraph,
  Psychology,
  StackedLineChart,
  Balance,
  Source,
  ManageAccounts,
  Speed
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import PublicHeroSection from '../components/Layout/PublicHeroSection';
import CapabilityStatusBadge from '../components/common/CapabilityStatusBadge';
import SeoHead from '../seo/SeoHead';
import {
  getBreadcrumbSchema,
  getFAQPageSchema,
  getSoftwareApplicationSchema,
  getWebPageSchema
} from '../seo/schema';

// ─── Motion ─────────────────────────────────────────────────────────────────
const motionIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } }
};

// ─── Eyebrow chip (section label above heading) ───────────────────────────────
const eyebrowChipSx = {
  borderRadius: 2,
  borderColor: 'rgba(37, 99, 235, 0.26)',
  color: '#1e40af',
  backgroundColor: 'rgba(219, 234, 254, 0.62)',
  fontWeight: 600,
  '& .MuiChip-label': { px: 1.5 }
};

// ─── Tag chips (small pills below descriptions) ───────────────────────────────
const tagChipSx = {
  borderRadius: '999px',
  borderColor: 'rgba(15, 23, 42, 0.15)',
  color: '#334155',
  fontSize: '0.75rem',
  fontWeight: 500
};

// ─── Icon container — 40×40, used on every feature card ───────────────────────
const iconContainerSx = {
  width: 40,
  height: 40,
  borderRadius: '10px',
  display: 'grid',
  placeItems: 'center',
  backgroundColor: 'rgba(37, 99, 235, 0.09)',
  mb: 2,
  flexShrink: 0
};

// ─── Unified feature card — shared across all sections ────────────────────────
const featureCardSx = {
  borderRadius: 3,
  p: 3,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid rgba(15, 23, 42, 0.08)',
  background: '#ffffff',
  boxShadow: '0 1px 4px rgba(15,23,42,0.05), 0 8px 24px rgba(15,23,42,0.05)'
};

// ─── Card typography ──────────────────────────────────────────────────────────
const cardTitleSx = {
  fontWeight: 700,
  fontSize: '0.95rem',
  color: '#0f172a',
  mb: 1,
  lineHeight: 1.35
};

const cardBodySx = {
  fontSize: '0.875rem',
  color: '#475569',
  lineHeight: 1.62
};

// ─── Metric chip (outcome badge inside Q2C cards) ─────────────────────────────
const metricChipSx = {
  borderRadius: '8px',
  color: '#1d4ed8',
  backgroundColor: 'rgba(219, 234, 254, 0.7)',
  fontWeight: 700,
  fontSize: '0.76rem',
  height: 24,
  '& .MuiChip-label': { px: 1.2 }
};

const Features = () => {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(false);
  const pageDescription = 'Explore workflow-driven features for quote-to-cash automation, reconciliation, approvals, operational dashboards, and multi-entity finance execution.';

  const quoteToCashSteps = [
    {
      icon: <RequestQuote sx={{ color: '#2563eb' }} />,
      title: 'Quote creation',
      detail: 'Generate scoped proposals with structured approvals and version control.',
      metric: 'Structured proposal controls',
      status: 'stable'
    },
    {
      icon: <ReceiptLong sx={{ color: '#1d4ed8' }} />,
      title: 'Invoice orchestration',
      detail: 'Move approved quotes into invoices with tax controls and policy validation.',
      metric: 'Linked quote to invoice flow',
      status: 'stable'
    },
    {
      icon: <Paid sx={{ color: '#0f766e' }} />,
      title: 'Payment collection',
      detail: 'Trigger reminders, capture incoming payments, and monitor overdue risk.',
      metric: 'Reminder and overdue tracking',
      status: 'stable'
    },
    {
      icon: <Balance sx={{ color: '#0f766e' }} />,
      title: 'Auto reconciliation',
      detail: 'Match transactions against invoices with review-friendly reconciliation queues.',
      metric: 'Rule-based matching support',
      status: 'expanding'
    }
  ];

  const automationPillars = [
    {
      icon: <Autorenew sx={{ color: '#2563eb' }} />,
      title: 'Recurring operational cycles',
      text: 'Recurring invoices, schedules, and collection loops run on deterministic workflow rules.'
    },
    {
      icon: <Rule sx={{ color: '#2563eb' }} />,
      title: 'Role based approval flows',
      text: 'Enforce threshold based approvals with assignable decision owners and route controls.'
    },
    {
      icon: <NotificationsActive sx={{ color: '#0891b2' }} />,
      title: 'Event driven reminders',
      text: 'Automatically notify teams and customers at milestone, due date, and exception events.'
    },
    {
      icon: <TrackChanges sx={{ color: '#0891b2' }} />,
      title: 'Operational trigger engine',
      text: 'Attach downstream actions to lifecycle states such as approved, paid, or reconciled.'
    }
  ];

  const visibilityLayers = [
    {
      icon: <QueryStats sx={{ color: '#1e40af' }} />,
      title: 'Operational dashboards',
      value: 'Stable',
      valueLabel: 'workflow visibility layer',
      status: 'stable',
      text: 'Monitor pipeline status, overdue exposure, and payment velocity from one control plane.'
    },
    {
      icon: <AutoGraph sx={{ color: '#1e40af' }} />,
      title: 'Cash flow planning views',
      value: 'Expanding',
      valueLabel: 'scenario and trend analysis',
      status: 'expanding',
      text: 'Use trend analytics and scenario views to improve planning and runway clarity.'
    },
    {
      icon: <Psychology sx={{ color: '#0f766e' }} />,
      title: 'Exception triage views',
      value: 'Preview',
      valueLabel: 'insight-led operational prioritization',
      status: 'preview',
      text: 'Prioritize bottlenecks and exceptions with workflow-level context for finance teams.'
    },
    {
      icon: <StackedLineChart sx={{ color: '#0f766e' }} />,
      title: 'Financial reporting layer',
      value: 'Stable',
      valueLabel: 'connected data foundation',
      status: 'stable',
      text: 'Generate operational and finance reports from synchronized transactional data.'
    }
  ];

  const infrastructureItems = [
    {
      icon: <CloudSync sx={{ color: '#2563eb' }} />,
      title: 'Cloud synchronized operations',
      text: 'Consistent state across devices and teams with resilient backup and restore controls.'
    },
    {
      icon: <Api sx={{ color: '#2563eb' }} />,
      title: 'API first connectivity',
      text: 'Integrate external systems through secure APIs and webhook style event interfaces.'
    },
    {
      icon: <Lan sx={{ color: '#2563eb' }} />,
      title: 'Multi entity architecture',
      text: 'Run tenant isolated workflows while managing centralized platform governance.'
    },
    {
      icon: <Shield sx={{ color: '#2563eb' }} />,
      title: 'Enterprise security posture',
      text: 'Identity controls, encrypted data paths, and hardened infrastructure practices.'
    },
    {
      icon: <Source sx={{ color: '#2563eb' }} />,
      title: 'Audit and observability',
      text: 'Track operational actions with searchable audit logs and lifecycle event visibility.'
    },
    {
      icon: <ManageAccounts sx={{ color: '#2563eb' }} />,
      title: 'Role aware access governance',
      text: 'Apply least privilege permissions and policy boundaries by user responsibility.'
    }
  ];

  const outcomes = [
    {
      icon: <Speed sx={{ color: '#e0f2fe' }} />,
      metric: 'Workflow efficiency',
      title: 'collections coordination',
      status: 'stable',
      description: 'Teams run collections with reminder logic, ownership, and clear follow-through states.'
    },
    {
      icon: <FactCheck sx={{ color: '#e0f2fe' }} />,
      metric: 'Process consistency',
      title: 'reconciliation quality',
      status: 'stable',
      description: 'Validation, reconciliation, and approvals reduce spreadsheet-heavy operating patterns.'
    },
    {
      icon: <Timeline sx={{ color: '#e0f2fe' }} />,
      metric: 'Operational capacity',
      title: 'team bandwidth',
      status: 'expanding',
      description: 'Automation pipelines absorb repetitive tasks so teams can focus on exception handling.'
    },
    {
      icon: <Insights sx={{ color: '#e0f2fe' }} />,
      metric: 'Decision visibility',
      title: 'operational context',
      status: 'stable',
      description: 'Leadership gets shared visibility across receivables, cash flow context, and workflow execution.'
    }
  ];

  const faqs = [
    {
      question: 'How does Solidev Books differ from traditional invoicing tools?',
      answer: 'Solidev Books is designed as a connected financial operating system, not a standalone invoice utility. Quote, billing, collections, reconciliation, approvals, and reporting all run as one coordinated workflow layer.'
    },
    {
      question: 'Can we automate reminders, approvals, and recurring billing logic?',
      answer: 'Yes. You can define recurring cycles, event-driven reminders, and role-based approvals that trigger automatically from workflow states such as approved, overdue, paid, or reconciled.'
    },
    {
      question: 'Is the platform suitable for multi-entity or multi-team operations?',
      answer: 'Yes. The architecture supports tenant-aware data boundaries, role-scoped access control, and centralized operational governance so multiple entities can operate in one secure platform.'
    },
    {
      question: 'What level of visibility do finance and operations leaders get?',
      answer: 'Leaders get dashboard visibility, exception alerts, and reporting views that combine transactional and workflow performance in one place.'
    },
    {
      question: 'How secure is the financial infrastructure?',
      answer: 'The platform uses encrypted transport and storage, enterprise-grade security controls, role-based permissions, and audit logging to protect data and maintain accountability.'
    }
  ];

  const handleFaqChange = (panel) => (event, isExpanded) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  const featureSchemas = [
    getSoftwareApplicationSchema(),
    getWebPageSchema({
      path: '/features',
      title: 'Features',
      description: pageDescription
    }),
    getFAQPageSchema(faqs),
    getBreadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Features', path: '/features' }
    ])
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <SeoHead
        title="Features"
        description={pageDescription}
        canonicalPath="/features"
        keywords="quote to cash workflow, reconciliation automation, finance dashboard software, enterprise invoicing features"
        jsonLd={featureSchemas}
      />
      <Header />

      <PublicHeroSection
        badgeIcon={<Hub sx={{ color: '#bfdbfe !important' }} />}
        badgeLabel="Workflow Driven Financial Infrastructure"
        title="Manage Financial Operations From One Unified Workflow System"
        description="Solidev Books connects quote-to-cash operations, automation logic, reconciliation, and reporting into one execution layer — control, speed, and full visibility from one platform."
        primaryAction={{ label: 'Start Operating in One System', onClick: () => navigate('/login') }}
        secondaryAction={{ label: 'Talk to Platform Team', onClick: () => navigate('/contact') }}
        tags={['Quote to Cash', 'Auto-reconciliation', 'Multi-entity workflows']}
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
                  Example Workflow Status Panel
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

              <Stack spacing={1.4} sx={{ mb: 2.2 }}>
                {[
                  { label: 'Quote to Invoice', status: 'Active', color: '#3b82f6', pct: 100 },
                  { label: 'Payment Collection', status: 'Processing', color: '#0891b2', pct: 74 },
                  { label: 'Auto Reconciliation', status: 'Running', color: '#14b8a6', pct: 92 },
                  { label: 'Insights Sync', status: 'Complete', color: '#22c55e', pct: 100 }
                ].map((step) => (
                  <Box key={step.label}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography sx={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600 }}>
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
                    Collections coordination
                  </Typography>
                  <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '0.96rem' }}>Workflow-driven follow-up</Typography>
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
                    Reconciliation progress
                  </Typography>
                  <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '0.96rem' }}>Queue and match status</Typography>
                </Paper>
              </Stack>
              <Typography sx={{ mt: 1.1, color: 'rgba(191,219,254,0.82)', fontSize: '0.72rem' }}>
                Conceptual workflow visualization
              </Typography>
            </Paper>

            <Paper
              component={motion.div}
              animate={{
                y: [0, -8, 0],
                transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
              }}
              elevation={0}
              sx={{
                position: 'absolute',
                top: { xs: -14, md: -20 },
                right: { xs: -6, md: -26 },
                zIndex: 3,
                p: 1.5,
                borderRadius: 2.5,
                width: { xs: 158, md: 192 },
                backgroundColor: 'rgba(10, 24, 61, 0.88)',
                border: '1px solid rgba(146,188,255,0.32)',
                boxShadow: '0 14px 28px rgba(0, 0, 0, 0.32)'
              }}
            >
              <Typography sx={{ fontSize: '0.72rem', color: 'rgba(216,230,255,0.86)', mb: 0.3 }}>
                Approval Queue
              </Typography>
              <Typography sx={{ fontWeight: 800, color: '#f0f6ff', fontSize: '0.95rem', mb: 0.7 }}>
                Pending review items
              </Typography>
              <Box sx={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.16)', overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: '68%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #34d399 0%, #3b82f6 100%)'
                  }}
                />
              </Box>
            </Paper>
          </Box>
        )}
      />

      {/* ── Section A: Quote to Cash ────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 5, md: 7 }} alignItems="center">
            <Grid item xs={12} md={5}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={motionIn}>
                <Chip
                  icon={<AccountTree sx={{ color: '#2563eb !important' }} />}
                  label="Quote to Cash Workflow"
                  variant="outlined"
                  sx={eyebrowChipSx}
                />
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.7rem', md: '2.1rem' }, lineHeight: 1.18, mt: 2, mb: 1.8, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  From Quote to Payment in One Connected Operational Stream
                </Typography>
                <Typography sx={{ color: '#475569', lineHeight: 1.65, fontSize: '1rem', mb: 3 }}>
                  Every commercial step moves through a coordinated workflow with traceable ownership, payment progression, and reconciliation closure.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {['Auto-reconciliation', 'Lifecycle tracking', 'Event-driven reminders', 'Collections coordination'].map((tag) => (
                    <Chip key={tag} size="small" variant="outlined" label={tag} sx={tagChipSx} />
                  ))}
                </Stack>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={7}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={motionIn}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                  {quoteToCashSteps.map((step) => (
                    <Paper
                      key={step.title}
                      component={motion.div}
                      whileHover={{ y: -4 }}
                      elevation={0}
                      sx={featureCardSx}
                    >
                      <Box sx={iconContainerSx}>{step.icon}</Box>
                      <Typography sx={cardTitleSx}>{step.title}</Typography>
                      <Typography sx={{ ...cardBodySx, flexGrow: 1 }}>{step.detail}</Typography>
                      <Chip size="small" label={step.metric} sx={{ mt: 2, alignSelf: 'flex-start', ...metricChipSx }} />
                      <CapabilityStatusBadge status={step.status} sx={{ mt: 1 }} />
                    </Paper>
                  ))}
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Section B: Automation ────────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 10 }, backgroundColor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 5, md: 7 }} alignItems="center">
            <Grid item xs={12} md={7}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={motionIn}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                  {automationPillars.map((pillar) => (
                    <Paper
                      key={pillar.title}
                      component={motion.div}
                      whileHover={{ y: -4 }}
                      elevation={0}
                      sx={featureCardSx}
                    >
                      <Box sx={iconContainerSx}>{pillar.icon}</Box>
                      <Typography sx={cardTitleSx}>{pillar.title}</Typography>
                      <Typography sx={{ ...cardBodySx, flexGrow: 1 }}>{pillar.text}</Typography>
                    </Paper>
                  ))}
                </Box>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={5}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={motionIn}>
                <Chip icon={<Hub sx={{ color: '#2563eb !important' }} />} label="Automation Layer" variant="outlined" sx={eyebrowChipSx} />
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.7rem', md: '2.1rem' }, lineHeight: 1.18, mt: 2, mb: 1.8, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Event Driven Automation That Scales With Operations
                </Typography>
                <Typography sx={{ color: '#475569', lineHeight: 1.65, fontSize: '1rem', mb: 3 }}>
                  Replace manual follow-up work with policy-aware triggers, recurrence controls, and approval automation that keep financial workflows moving.
                </Typography>
                <Paper elevation={0} sx={{ borderRadius: 3, p: 2.8, border: '1px solid rgba(15,23,42,0.08)', backgroundColor: '#ffffff' }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>Live activity feed</Typography>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22c55e', flexShrink: 0 }} />
                  </Stack>
                  <Stack spacing={1.4}>
                    {[
                      'Invoice INV-204 moved to Due in 24h',
                      'Reminder event triggered for 3 accounts',
                      'Approval requested for payout threshold policy',
                      'Reconciliation auto-matched 12 transactions'
                    ].map((event) => (
                      <Stack key={event} direction="row" spacing={1.2} alignItems="flex-start">
                        <CheckCircle sx={{ fontSize: 15, color: '#2563eb', mt: 0.25, flexShrink: 0 }} />
                        <Typography sx={{ color: '#334155', fontSize: '0.875rem', lineHeight: 1.5 }}>{event}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Section C: Financial Visibility ─────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 5, md: 7 }} alignItems="center">
            <Grid item xs={12} md={5}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={motionIn}>
                <Chip icon={<Insights sx={{ color: '#2563eb !important' }} />} label="Financial Visibility" variant="outlined" sx={eyebrowChipSx} />
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.7rem', md: '2.1rem' }, lineHeight: 1.18, mt: 2, mb: 1.8, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Operational Visibility Across Every Financial Signal
                </Typography>
                <Typography sx={{ color: '#475569', lineHeight: 1.65, fontSize: '1rem', mb: 3 }}>
                  Dashboards, trend views, and reporting context combine into one decision layer for finance and operations leaders.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {['Operational dashboards', 'Cash flow planning', 'Exception triage', 'Connected reporting'].map((tag) => (
                    <Chip key={tag} size="small" variant="outlined" label={tag} sx={tagChipSx} />
                  ))}
                </Stack>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={7}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={motionIn}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                  {visibilityLayers.map((layer, idx) => (
                    <Paper
                      key={layer.title}
                      component={motion.div}
                      whileHover={{ y: -4 }}
                      elevation={0}
                      sx={{
                        ...featureCardSx,
                        ...(idx === 0 && {
                          background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 100%)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          boxShadow: '0 8px 32px rgba(15,23,42,0.22)'
                        })
                      }}
                    >
                      <Box sx={{ ...iconContainerSx, backgroundColor: idx === 0 ? 'rgba(255,255,255,0.14)' : 'rgba(37,99,235,0.09)' }}>
                        {layer.icon}
                      </Box>
                      <Typography sx={{ ...cardTitleSx, color: idx === 0 ? '#f8fafc' : '#0f172a' }}>
                        {layer.title}
                      </Typography>
                      <Typography sx={{ ...cardBodySx, color: idx === 0 ? 'rgba(219,234,254,0.85)' : '#475569', flexGrow: 1 }}>
                        {layer.text}
                      </Typography>
                      <Divider sx={{ borderColor: idx === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)', mt: 2, mb: 1.5 }} />
                      <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: idx === 0 ? '#ffffff' : '#0f172a', lineHeight: 1 }}>
                        {layer.value}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: idx === 0 ? '#bfdbfe' : '#64748b', mt: 0.5 }}>
                        {layer.valueLabel}
                      </Typography>
                      <CapabilityStatusBadge status={layer.status} sx={{ mt: 1.1, alignSelf: 'flex-start' }} />
                    </Paper>
                  ))}
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Section D: Infrastructure ────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 10 }, backgroundColor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 5, md: 7 }} alignItems="flex-start">
            <Grid item xs={12} md={5}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={motionIn}>
                <Chip icon={<GppGood sx={{ color: '#2563eb !important' }} />} label="Infrastructure and Security" variant="outlined" sx={eyebrowChipSx} />
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.7rem', md: '2.1rem' }, lineHeight: 1.18, mt: 2, mb: 1.8, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Built as Enterprise Grade Financial Infrastructure
                </Typography>
                <Typography sx={{ color: '#475569', lineHeight: 1.65, fontSize: '1rem', mb: 3 }}>
                  Solidev Books provides the secure technical foundation required to run connected financial workflows with confidence.
                </Typography>
                <Paper elevation={0} sx={{ borderRadius: 3, p: 2.8, border: '1px solid rgba(15,23,42,0.08)', backgroundColor: '#ffffff' }}>
                  <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', mb: 1.8 }}>Platform controls</Typography>
                  <Stack spacing={1.4}>
                    {[
                      'Role-scoped access and policy boundaries',
                      'Audit logs for operational traceability',
                      'API security and tenant-aware isolation',
                      'Cloud resilience with synchronized state'
                    ].map((line) => (
                      <Stack key={line} direction="row" spacing={1.2} alignItems="center">
                        <AssignmentTurnedIn sx={{ fontSize: 16, color: '#2563eb', flexShrink: 0 }} />
                        <Typography sx={{ color: '#334155', fontSize: '0.875rem', lineHeight: 1.5 }}>{line}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={7}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={motionIn}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                  {infrastructureItems.map((item) => (
                    <Paper
                      key={item.title}
                      component={motion.div}
                      whileHover={{ y: -4 }}
                      elevation={0}
                      sx={featureCardSx}
                    >
                      <Box sx={iconContainerSx}>{item.icon}</Box>
                      <Typography sx={cardTitleSx}>{item.title}</Typography>
                      <Typography sx={{ ...cardBodySx, flexGrow: 1 }}>{item.text}</Typography>
                    </Paper>
                  ))}
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Outcomes Panel ───────────────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={motionIn}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                p: { xs: 3, md: 4.5 },
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #0891b2 100%)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
                {outcomes.map((item) => (
                  <Paper
                    key={item.title}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      p: 2.8,
                      backgroundColor: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box sx={{ mb: 1.5 }}>{item.icon}</Box>
                    <Typography sx={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{item.metric}</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#bfdbfe', fontSize: '0.82rem', mt: 0.6, mb: 1 }}>{item.title}</Typography>
                    <Typography sx={{ color: 'rgba(191,219,254,0.78)', fontSize: '0.82rem', lineHeight: 1.58, flexGrow: 1 }}>{item.description}</Typography>
                    <CapabilityStatusBadge status={item.status} sx={{ mt: 1.1, alignSelf: 'flex-start' }} />
                  </Paper>
                ))}
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <Box sx={{ pb: { xs: 8, md: 10 } }}>
        <Container maxWidth="md">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={motionIn}>
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.6rem', md: '1.9rem' }, color: '#0f172a', mb: 1.2, letterSpacing: '-0.02em' }}>
                Frequently Asked Questions
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '1rem' }}>
                Answers for teams evaluating a workflow-first financial operations platform.
              </Typography>
            </Box>

            {faqs.map((faq, index) => (
              <Accordion
                key={faq.question}
                expanded={expandedFaq === `panel${index}`}
                onChange={handleFaqChange(`panel${index}`)}
                disableGutters
                sx={{
                  mb: 1.5,
                  borderRadius: '12px !important',
                  border: '1px solid rgba(15,23,42,0.10)',
                  boxShadow: expandedFaq === `panel${index}` ? '0 8px 24px rgba(15,23,42,0.08)' : '0 1px 4px rgba(15,23,42,0.04)',
                  '&:before': { display: 'none' },
                  overflow: 'hidden'
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: '#1e3a8a' }} />}
                  sx={{
                    minHeight: 64,
                    background: expandedFaq === `panel${index}` ? 'rgba(219,234,254,0.38)' : '#ffffff',
                    '& .MuiAccordionSummary-content': { my: 1.2 }
                  }}
                >
                  <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ backgroundColor: '#ffffff', px: 2.8, py: 2.4 }}>
                  <Typography sx={{ color: '#475569', lineHeight: 1.68, fontSize: '0.925rem' }}>{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </motion.div>
        </Container>
      </Box>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 10 } }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={motionIn}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: { xs: 3.5, md: 5 },
              textAlign: 'center',
              border: '1px solid rgba(37,99,235,0.16)',
              background: 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)',
              boxShadow: '0 16px 40px rgba(37,99,235,0.10)'
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.6rem', md: '2rem' }, color: '#0f172a', mb: 1.5, letterSpacing: '-0.02em', maxWidth: 680, mx: 'auto', lineHeight: 1.18 }}>
              Replace Fragmented Finance Tools With One Connected Operational Platform
            </Typography>
            <Typography sx={{ color: '#334155', lineHeight: 1.65, fontSize: '1rem', maxWidth: 680, mx: 'auto', mb: 4 }}>
              Start running quote, billing, collections, reconciliation, and insight workflows in a single financial operating system designed for modern business execution.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                component={motion.button}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/login')}
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.4,
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'none',
                  backgroundColor: '#1d4ed8',
                  boxShadow: '0 4px 18px rgba(29,78,216,0.30)',
                  '&:hover': { backgroundColor: '#1e40af', boxShadow: '0 6px 24px rgba(29,78,216,0.40)' }
                }}
              >
                Start Unified Workflow Setup
              </Button>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                variant="outlined"
                onClick={() => navigate('/contact')}
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.4,
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderColor: '#1d4ed8',
                  color: '#1d4ed8',
                  '&:hover': { backgroundColor: 'rgba(29,78,216,0.06)', borderColor: '#1e40af' }
                }}
              >
                Book an Operations Demo
              </Button>
            </Stack>
          </Paper>
        </motion.div>
      </Container>

      <Footer />
    </Box>
  );
};

export default Features;
