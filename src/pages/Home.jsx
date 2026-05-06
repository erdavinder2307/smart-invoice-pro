import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper
} from '@mui/material';
import {
  CheckCircle,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import HeroSection from '../components/Layout/HeroSection';
import WorkflowSection from '../components/Layout/WorkflowSection';
import { homeTokens } from '../components/Layout/homepageTokens';
import WhyChooseSection from '../components/Layout/WhyChooseSection';
import SeoHead from '../seo/SeoHead';
import {
  getOrganizationSchema,
  getSoftwareApplicationSchema,
  getWebPageSchema,
  getWebSiteSchema
} from '../seo/schema';

const Home = () => {
  const navigate = useNavigate();
  const pageDescription = 'Solidev Books is a workflow-driven financial operating system for quote-to-cash execution, automation, collections, and reconciliation.';

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const benefits = [
    'Easy invoice creation and PDF export',
    'Secure customer login and payment tracking',
    'Smart stock management and transaction mapping',
    'Connected dashboards and financial insights',
    'Mobile-responsive design for on-the-go access',
    'Cloud-based storage with automatic backups'
  ];

  const homeSchemas = [
    getOrganizationSchema(),
    getWebSiteSchema(),
    getSoftwareApplicationSchema(),
    getWebPageSchema({
      path: '/',
      title: 'Workflow-Driven Financial Operating System',
      description: pageDescription
    })
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SeoHead
        title="Workflow-Driven Financial Operating System"
        description={pageDescription}
        canonicalPath="/"
        keywords="workflow finance software, quote to cash platform, invoice automation, accounts receivable software, reconciliation automation"
        jsonLd={homeSchemas}
      />
      <Header />

      <HeroSection />

      <WhyChooseSection />

      {/* Benefits Section */}
      <Box sx={{ bgcolor: 'grey.50', py: homeTokens.sectionPy, borderTop: '1px solid rgba(15, 23, 42, 0.06)' }}>
        <Container maxWidth={homeTokens.containerMax}>
          <Grid container spacing={{ xs: 5, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp}>
                  <Typography sx={{ ...homeTokens.heading.section, color: 'text.primary', mb: 2 }}>
                    Built for Modern Businesses
                  </Typography>
                  <Typography sx={{ ...homeTokens.heading.bodyLead, mb: 3.2 }}>
                    Solidev Books combines the power of modern technology with intuitive design
                    to deliver a seamless business management experience.
                  </Typography>
                </motion.div>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6 }}>
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
                        <CheckCircle sx={{ color: 'secondary.main', fontSize: homeTokens.icon.medium }} />
                        <Typography sx={{ color: 'text.primary', fontSize: { xs: '0.98rem', md: '1rem' }, lineHeight: 1.55 }}>{benefit}</Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { scale: 0.8, opacity: 0 },
                  visible: {
                    scale: 1,
                    opacity: 1,
                    transition: { duration: 0.5 }
                  }
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    minHeight: { xs: 300, md: 380 },
                    bgcolor: 'white',
                    borderRadius: homeTokens.card.radius,
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f3f8ff 100%)',
                    border: homeTokens.card.border,
                    boxShadow: homeTokens.card.shadow,
                    p: { xs: 2.2, md: 2.8 }
                  }}
                >
                  <Box sx={{ position: 'absolute', top: -70, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0) 70%)' }} />
                  <Box sx={{ position: 'absolute', bottom: -80, left: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.14) 0%, rgba(16,185,129,0) 72%)' }} />

                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: '1.02rem', mb: 1.6 }}>
                      Example Operations Snapshot
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.76rem', mb: 1.3 }}>
                      Conceptual workflow visualization
                    </Typography>

                    <Box sx={{ display: 'grid', gap: 1.2, mb: 1.4 }}>
                      {[
                        { label: 'Quote to invoice handoff', value: 'Workflow linked', tone: '#2563eb' },
                        { label: 'Payment allocation', value: 'Tracked in one place', tone: '#0ea5e9' },
                        { label: 'Reconciliation queue', value: 'Prioritized for review', tone: '#10b981' }
                      ].map((metric) => (
                        <Paper
                          key={metric.label}
                          elevation={0}
                          sx={{
                            p: 1.4,
                            borderRadius: 2,
                            border: '1px solid rgba(15, 23, 42, 0.07)',
                            backgroundColor: 'rgba(255,255,255,0.85)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <Typography sx={{ color: '#334155', fontSize: '0.87rem' }}>{metric.label}</Typography>
                          <Typography sx={{ color: metric.tone, fontWeight: 800, fontSize: '0.95rem' }}>{metric.value}</Typography>
                        </Paper>
                      ))}
                    </Box>

                    <Box
                      sx={{
                        p: 1.4,
                        borderRadius: 2,
                        border: '1px solid rgba(15, 23, 42, 0.08)',
                        backgroundColor: 'rgba(248,250,252,0.9)'
                      }}
                    >
                      <Typography sx={{ color: '#475569', fontSize: '0.84rem', mb: 0.9 }}>
                        Workflow health
                      </Typography>
                      <Box sx={{ height: 8, borderRadius: 99, bgcolor: '#e2e8f0', overflow: 'hidden' }}>
                        <Box sx={{ width: '87%', height: '100%', bgcolor: '#2563eb' }} />
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <WorkflowSection />

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'grey.900',
          color: 'white',
          py: { xs: 8, md: 9 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderTop: '1px solid rgba(148, 163, 184, 0.16)'
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Typography sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 800, mb: 2, color: 'white', lineHeight: 1.15 }}>
              Ready to Transform Your Business?
            </Typography>
            <Typography sx={{ mb: 4, color: 'grey.400', maxWidth: 620, mx: 'auto', fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>
              Adopt one connected workflow model for billing, collections, and financial operations
            </Typography>
            <Button
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/login')}
              sx={{
                px: 6,
                py: 1.75,
                fontSize: '1.05rem',
                borderRadius: homeTokens.button.radius,
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }}
            >
              Get Started Today
            </Button>
          </motion.div>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Home;
