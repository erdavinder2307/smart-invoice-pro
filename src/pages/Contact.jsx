import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Send,
  WhatsApp,
  AccountTree,
  Autorenew,
  Insights,
  SettingsEthernet,
  SupportAgent,
  CheckCircle,
  Hub,
  ArrowForward,
  Domain,
  BusinessCenter,
  Groups
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { contactService } from '../services/contactService';
import PublicHeroSection from '../components/Layout/PublicHeroSection';
import CapabilityStatusBadge from '../components/common/CapabilityStatusBadge';
import SeoHead from '../seo/SeoHead';
import {
  getBreadcrumbSchema,
  getOrganizationSchema,
  getWebPageSchema
} from '../seo/schema';

const motionIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' }
  }
};

const eyebrowChipSx = {
  borderRadius: 2,
  borderColor: 'rgba(37, 99, 235, 0.26)',
  color: '#1e40af',
  backgroundColor: 'rgba(219, 234, 254, 0.62)',
  fontWeight: 600,
  '& .MuiChip-label': { px: 1.5 }
};

const tagChipSx = {
  borderRadius: '999px',
  borderColor: 'rgba(15, 23, 42, 0.15)',
  color: '#334155',
  fontSize: '0.75rem',
  fontWeight: 500
};

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

const featureCardSx = {
  borderRadius: 3,
  p: 3,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid rgba(15, 23, 42, 0.08)',
  backgroundColor: '#ffffff',
  boxShadow: '0 1px 4px rgba(15,23,42,0.05), 0 8px 24px rgba(15,23,42,0.05)',
  transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: 'rgba(37,99,235,0.24)',
    boxShadow: '0 4px 10px rgba(15,23,42,0.08), 0 14px 34px rgba(15,23,42,0.10)'
  }
};

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

const formFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#f8fafc',
    borderRadius: '12px',
    minHeight: 54,
    '& fieldset': {
      borderColor: 'rgba(15, 23, 42, 0.12)'
    },
    '&:hover': {
      bgcolor: '#f1f5f9'
    },
    '&.Mui-focused': {
      bgcolor: '#ffffff',
      boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.10)',
      '& fieldset': {
        borderColor: '#3b82f6'
      }
    }
  },
  '& .MuiInputLabel-root': {
    color: '#334155',
    fontWeight: 500
  }
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    operationsType: '',
    message: ''
  });

  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: null
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ submitting: true, success: false, error: null });

    try {
      await contactService.sendMessage(formData);
      setStatus({ submitting: false, success: true, error: null });
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        subject: '',
        operationsType: '',
        message: ''
      });
      // Clear success message after 5 seconds
      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
    } catch (error) {
      console.error('Submission error:', error);
      setStatus({
        submitting: false,
        success: false,
        error: error.response?.data?.message || 'Failed to send message. Please try again.'
      });
    }
  };

  const onboardingHighlights = [
    {
      icon: <AccountTree sx={{ color: '#2563eb' }} />,
      title: 'Workflow consultation',
      text: 'Review your current quote, billing, collections, and reconciliation process architecture.',
      status: 'stable'
    },
    {
      icon: <Autorenew sx={{ color: '#2563eb' }} />,
      title: 'Implementation planning',
      text: 'Define onboarding scope, workflow focus areas, and rollout sequence for your team.',
      status: 'stable'
    },
    {
      icon: <Insights sx={{ color: '#2563eb' }} />,
      title: 'Operational visibility setup',
      text: 'Align reporting expectations and financial visibility requirements before configuration starts.',
      status: 'expanding'
    }
  ];

  const implementationSupport = [
    {
      icon: <Hub sx={{ color: '#2563eb' }} />,
      title: 'Workflow architecture review',
      text: 'Align teams on how approvals, billing, collections, and reconciliation should operate together.',
      status: 'stable'
    },
    {
      icon: <SettingsEthernet sx={{ color: '#2563eb' }} />,
      title: 'Platform onboarding',
      text: 'Create a practical setup sequence across configuration, governance, and internal adoption.',
      status: 'stable'
    },
    {
      icon: <Autorenew sx={{ color: '#2563eb' }} />,
      title: 'Automation setup',
      text: 'Configure recurring cycles, trigger policies, and exception handling for operational continuity.',
      status: 'expanding'
    },
    {
      icon: <BusinessCenter sx={{ color: '#2563eb' }} />,
      title: 'Finance operations migration',
      text: 'Migrate fragmented workflows into one connected financial operating model.',
      status: 'expanding'
    },
    {
      icon: <Groups sx={{ color: '#2563eb' }} />,
      title: 'Cross-team rollout coordination',
      text: 'Coordinate finance and operations stakeholders through a clear onboarding sequence.',
      status: 'stable'
    }
  ];

  const communicationChannels = [
    {
      icon: <WhatsApp sx={{ color: '#16a34a' }} />,
      title: 'WhatsApp',
      text: 'Use WhatsApp for quick follow-ups and direct communication with our team.',
      cta: 'Message on WhatsApp',
      href: 'https://wa.me/919115866828'
    },
    {
      icon: <Email sx={{ color: '#2563eb' }} />,
      title: 'Email',
      text: 'Share your workflow goals and business context over email.',
      cta: 'Send email',
      href: 'mailto:admin@solidevelectrosoft.com'
    },
    {
      icon: <Phone sx={{ color: '#2563eb' }} />,
      title: 'Phone',
      text: 'Call for direct discussion around onboarding and workflow consultation.',
      cta: 'Call now',
      href: 'tel:+919115866828'
    },
    {
      icon: <Domain sx={{ color: '#2563eb' }} />,
      title: 'Office Address',
      text: 'Next57 Coworking, Cabin No - 11, C205 SM Heights, Industrial Area Phase 8B, Mohali, 140308',
      cta: 'Get directions',
      href: 'https://maps.google.com/?q=Next57+Coworking+Cabin+No+11+C205+SM+Heights+Industrial+Area+Phase+8B+Mohali+140308'
    }
  ];

  const contactInfo = [
    {
      icon: <Email sx={{ color: '#2563eb' }} />,
      title: 'Email',
      primary: 'admin@solidevelectrosoft.com',
      secondary: 'Primary channel for consultation details and onboarding context.'
    },
    {
      icon: <Phone sx={{ color: '#2563eb' }} />,
      title: 'Phone',
      primary: '+91 9115866828',
      secondary: 'Direct line for workflow consultation discussions.'
    },
    {
      icon: <LocationOn sx={{ color: '#2563eb' }} />,
      title: 'Office',
      primary: 'Next57 Coworking, Cabin No - 11,  C205 Sm Heights',
      secondary: 'Industrial Area Phase 8b Mohali, 140308'
    }
  ];

  const pageDescription = 'Contact Solidev Books for workflow consultation, onboarding planning, and implementation support.';
  const contactSchemas = [
    getOrganizationSchema(),
    getWebPageSchema({
      path: '/contact',
      title: 'Contact Solidev Books',
      description: pageDescription,
      type: 'ContactPage'
    }),
    getBreadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' }
    ])
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#fcfdfe' }}>
      <SeoHead
        title="Contact Solidev Books"
        description={pageDescription}
        canonicalPath="/contact"
        keywords="contact finance automation team, workflow consultation, invoicing software onboarding"
        jsonLd={contactSchemas}
      />
      <Header />

      {/* Hero Section */}
      <PublicHeroSection
        badgeIcon={<Hub sx={{ color: '#bfdbfe !important' }} />}
        badgeLabel="Workflow Onboarding"
        title="Talk to the Financial Operations Team"
        description="Connect your financial workflows into one system. Discuss onboarding priorities and implementation planning with our team."
        tags={['Consultation', 'Workflow planning', 'Automation scope', 'Rollout alignment']}
        rightContent={(
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
                      Example Consultation Lifecycle
                    </Typography>
                    <Chip
                      label="4 steps"
                      size="small"
                      sx={{
                        color: '#dbeafe',
                        backgroundColor: 'rgba(59, 130, 246, 0.20)',
                        border: '1px solid rgba(147, 197, 253, 0.42)',
                        fontWeight: 700
                      }}
                    />
                  </Stack>

                  <Stack spacing={1.35}>
                    {[
                      { label: 'Consultation', color: '#3b82f6', pct: 25 },
                      { label: 'Planning', color: '#2563eb', pct: 50 },
                      { label: 'Automation Scope', color: '#0891b2', pct: 75 },
                      { label: 'Rollout Alignment', color: '#14b8a6', pct: 100 }
                    ].map((step) => (
                      <Box key={step.label}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography sx={{ color: '#e2e8f0', fontSize: '0.83rem', fontWeight: 600 }}>
                            {step.label}
                          </Typography>
                          <Typography sx={{ color: '#bfdbfe', fontSize: '0.72rem', fontWeight: 700 }}>
                            Stage
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
                  <Typography sx={{ mt: 1.1, color: 'rgba(191,219,254,0.82)', fontSize: '0.72rem' }}>
                    Conceptual onboarding path
                  </Typography>
                </Paper>
        )}
      />

      {/* Consultation + Form */}
      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 5, md: 7 }} alignItems="stretch">
            <Grid item xs={12} md={5}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={motionIn}>
                <Chip
                  icon={<AccountTree sx={{ color: '#2563eb !important' }} />}
                  label="Onboarding Consultation"
                  variant="outlined"
                  sx={eyebrowChipSx}
                />
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.65rem', md: '2.05rem' },
                    lineHeight: 1.18,
                    mt: 2,
                    mb: 1.8,
                    color: '#0f172a',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Plan Your Operational Finance Setup
                </Typography>
                <Typography sx={{ color: '#475569', lineHeight: 1.65, fontSize: '1rem', mb: 3 }}>
                  Share your current workflow and goals. We use this conversation to understand your process and recommend the right onboarding path.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                  {[
                    'Workflow mapping',
                    'Automation readiness',
                    'Operational visibility',
                    'Implementation planning'
                  ].map((item) => (
                    <Chip key={item} size="small" variant="outlined" label={item} sx={tagChipSx} />
                  ))}
                </Stack>

                <Stack spacing={2}>
                  {onboardingHighlights.map((item) => (
                    <Paper key={item.title} elevation={0} sx={featureCardSx}>
                      <Box sx={iconContainerSx}>{item.icon}</Box>
                      <Typography sx={cardTitleSx}>{item.title}</Typography>
                      <Typography sx={cardBodySx}>{item.text}</Typography>
                      <CapabilityStatusBadge status={item.status} sx={{ mt: 1 }} />
                    </Paper>
                  ))}

                  <Paper elevation={0} sx={featureCardSx}>
                    <Box sx={iconContainerSx}>
                      <CheckCircle sx={{ color: '#2563eb' }} />
                    </Box>
                    <Typography sx={cardTitleSx}>What happens next</Typography>
                    <Stack spacing={1.05} sx={{ mt: 0.5 }}>
                      {[
                        'We review your submission details.',
                        'We contact you through your selected channel.',
                        'We align on workflow focus and next discussion.'
                      ].map((line) => (
                        <Stack key={line} direction="row" spacing={1} alignItems="flex-start">
                          <CheckCircle sx={{ color: '#2563eb', fontSize: 15, mt: 0.2 }} />
                          <Typography sx={{ ...cardBodySx, fontSize: '0.84rem' }}>{line}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
                </Stack>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={7}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={motionIn}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    boxShadow: '0 1px 4px rgba(15,23,42,0.05), 0 8px 24px rgba(15,23,42,0.05)',
                    bgcolor: '#ffffff',
                    height: '100%'
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 2.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        display: 'grid',
                        placeItems: 'center',
                        backgroundColor: 'rgba(37, 99, 235, 0.09)'
                      }}
                    >
                      <Send sx={{ color: '#2563eb', fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a', lineHeight: 1.2 }}>
                        Request Workflow Consultation
                      </Typography>
                      <Typography sx={{ color: '#64748b', fontSize: '0.88rem' }}>
                        Provide your workflow details and preferred contact channel.
                      </Typography>
                    </Box>
                  </Stack>

                  {status.success && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                      Consultation request submitted successfully.
                    </Alert>
                  )}

                  {status.error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                      {status.error}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2.2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="name"
                          label="Full Name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          disabled={status.submitting}
                          variant="outlined"
                          sx={formFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="email"
                          label="Work Email"
                          placeholder="john@company.com"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          disabled={status.submitting}
                          variant="outlined"
                          sx={formFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="company"
                          label="Company / Team"
                          placeholder="Company or team name"
                          value={formData.company}
                          onChange={handleInputChange}
                          required
                          disabled={status.submitting}
                          variant="outlined"
                          sx={formFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="phone"
                          label="Phone Number"
                          placeholder="+91 00000 00000"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={status.submitting}
                          variant="outlined"
                          sx={formFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="subject"
                          label="Workflow Goal"
                          placeholder="Implementation, automation, or migration"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          disabled={status.submitting}
                          variant="outlined"
                          sx={formFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="operationsType"
                          label="Company Size / Operations Type"
                          placeholder="e.g. SME, Mid-market, Multi-entity"
                          value={formData.operationsType}
                          onChange={handleInputChange}
                          required
                          disabled={status.submitting}
                          variant="outlined"
                          sx={formFieldSx}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="message"
                          label="Operational Context"
                          placeholder="Tell us about your current workflow, team structure, and outcomes you want to improve."
                          multiline
                          rows={7}
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          disabled={status.submitting}
                          variant="outlined"
                          sx={formFieldSx}
                        />
                      </Grid>
                    </Grid>

                    <Stack spacing={1.6} sx={{ mt: 3 }}>
                      <Typography sx={{ color: '#64748b', fontSize: '0.83rem' }}>
                        Fields marked in this form help us route your consultation request accurately.
                      </Typography>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={status.submitting}
                        endIcon={status.submitting ? <CircularProgress size={18} color="inherit" /> : <ArrowForward />}
                        sx={{
                          width: '100%',
                          px: 3.5,
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 700,
                          borderRadius: '12px',
                          textTransform: 'none',
                          backgroundColor: '#1d4ed8',
                          boxShadow: '0 4px 18px rgba(29,78,216,0.30)',
                          '&:hover': { backgroundColor: '#1e40af', boxShadow: '0 6px 24px rgba(29,78,216,0.40)' }
                        }}
                      >
                        {status.submitting ? 'Submitting...' : 'Talk to Operations Team'}
                      </Button>
                    </Stack>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How We Help Teams */}
      <Box sx={{ py: { xs: 8, md: 10 }, backgroundColor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={motionIn}>
            <Box sx={{ textAlign: 'center', mb: 4.5 }}>
              <Chip
                icon={<SettingsEthernet sx={{ color: '#2563eb !important' }} />}
                label="How We Help Teams"
                variant="outlined"
                sx={eyebrowChipSx}
              />
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.6rem', md: '2rem' },
                  lineHeight: 1.2,
                  mt: 2,
                  color: '#0f172a',
                  letterSpacing: '-0.02em'
                }}
              >
                Structured Support for Operational Finance Modernization
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '1rem', mt: 1.4, maxWidth: 760, mx: 'auto', lineHeight: 1.6 }}>
                From onboarding to workflow automation and migration planning, we help teams implement a connected financial operating model.
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2.2 }}>
              {implementationSupport.map((item) => (
                <Paper
                  key={item.title}
                  component={motion.div}
                  elevation={0}
                  sx={featureCardSx}
                >
                  <Box sx={iconContainerSx}>{item.icon}</Box>
                  <Typography sx={cardTitleSx}>{item.title}</Typography>
                  <Typography sx={{ ...cardBodySx, flexGrow: 1 }}>{item.text}</Typography>
                  <CapabilityStatusBadge status={item.status} sx={{ mt: 1.1, alignSelf: 'flex-start' }} />
                </Paper>
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Preferred Communication Channels */}
      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={motionIn}>
            <Box sx={{ textAlign: 'center', mb: 4.5 }}>
              <Chip
                icon={<SupportAgent sx={{ color: '#2563eb !important' }} />}
                label="Preferred Communication Channels"
                variant="outlined"
                sx={eyebrowChipSx}
              />
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.6rem', md: '2rem' },
                  lineHeight: 1.2,
                  mt: 2,
                  color: '#0f172a',
                  letterSpacing: '-0.02em'
                }}
              >
                Choose the Right Channel for Your Consultation
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '1rem', mt: 1.4, maxWidth: 760, mx: 'auto', lineHeight: 1.6 }}>
                Reach us through the channels currently available for consultation and onboarding discussions.
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.2 }}>
              {communicationChannels.map((channel) => (
                <Paper key={channel.title} elevation={0} sx={featureCardSx}>
                  <Box sx={iconContainerSx}>{channel.icon}</Box>
                  <Typography sx={cardTitleSx}>{channel.title}</Typography>
                  <Typography sx={{ ...cardBodySx, flexGrow: 1 }}>{channel.text}</Typography>
                  <Button
                    variant="outlined"
                    href={channel.href}
                    target={channel.href.startsWith('http') ? '_blank' : undefined}
                    rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    sx={{
                      mt: 2,
                      alignSelf: 'flex-start',
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: 'rgba(37,99,235,0.35)',
                      color: '#1d4ed8',
                      '&:hover': { borderColor: '#1e40af', backgroundColor: 'rgba(29,78,216,0.04)' }
                    }}
                  >
                    {channel.cta}
                  </Button>
                </Paper>
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Direct Platform Contacts */}
      <Box sx={{ pb: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={2.2}>
            {contactInfo.map((info) => (
              <Grid item xs={12} md={4} key={info.title}>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={motionIn}>
                  <Paper
                    elevation={0}
                    sx={featureCardSx}
                  >
                    <Box sx={iconContainerSx}>{info.icon}</Box>
                    <Typography sx={cardTitleSx}>{info.title}</Typography>
                    <Typography sx={{ ...cardBodySx, fontWeight: 600, color: '#334155' }}>{info.primary}</Typography>
                    <Typography sx={{ ...cardBodySx, mt: 1 }}>{info.secondary}</Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Contact;
