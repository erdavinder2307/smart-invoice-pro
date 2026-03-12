import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Receipt,
  Dashboard,
  Inventory,
  Security,
  CloudUpload,
  TrendingUp,
  CheckCircle,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

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

  const scaleUp = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const features = [
    {
      icon: <Receipt sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Smart Invoicing',
      description: 'Create professional invoices in seconds with our intuitive interface'
    },
    {
      icon: <Dashboard sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'Real-time Analytics',
      description: 'Track your business performance with comprehensive dashboards'
    },
    {
      icon: <Inventory sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Inventory Management',
      description: 'Keep track of your products and stock levels effortlessly'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'error.main' }} />,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security'
    }
  ];

  const benefits = [
    'Easy invoice creation and PDF export',
    'Secure customer login and payment tracking',
    'Smart stock management and transaction mapping',
    'Real-time dashboards and financial insights',
    'Mobile-responsive design for on-the-go access',
    'Cloud-based storage with automatic backups'
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0a0e27 0%, #1e3a8a 50%, #0f172a 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp}>
                  <Typography
                    variant={isMobile ? 'h3' : 'h2'}
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      lineHeight: 1.2,
                      color: 'white'
                    }}
                  >
                    Smart Invoice Pro – Simplifying Invoicing and Bookkeeping
                  </Typography>
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 4,
                      opacity: 0.95,
                      lineHeight: 1.6,
                      color: 'white'
                    }}
                  >
                    A modern, AI-powered invoicing platform designed for freelancers,
                    startups, and businesses to manage invoices, payments, and inventory with ease.
                  </Typography>
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Button
                      component={motion.button}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/login')}
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        '&:hover': {
                          bgcolor: 'grey.50',
                        }
                      }}
                    >
                      Get Started
                    </Button>
                    <Button
                      component={motion.button}
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                      whileTap={{ scale: 0.95 }}
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/features')}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.1)',
                        }
                      }}
                    >
                      Learn More
                    </Button>
                  </Box>
                </motion.div>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <Grid container spacing={2} sx={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  {[
                    { icon: <TrendingUp sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />, title: 'Save 10+ Hours Weekly', desc: 'Automated invoicing and smart workflows eliminate repetitive tasks' },
                    { icon: <Dashboard sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />, title: 'Real-time Insights', desc: 'Get instant business analytics and performance metrics' },
                    { icon: <Security sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />, title: '99.9% Secure', desc: 'Enterprise-grade security with automatic data backups' },
                    { icon: <CloudUpload sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />, title: 'Cloud-Based', desc: 'Access your data anywhere, anytime with cloud synchronization' }
                  ].map((item, index) => (
                    <Grid item xs={6} key={index} sx={{ display: 'flex' }}>
                      <motion.div variants={fadeInUp} style={{ width: '100%', display: 'flex' }}>
                        <Paper
                          component={motion.div}
                          whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                          elevation={4}
                          sx={{
                            p: { xs: 2, md: 3 },
                            borderRadius: 3,
                            bgcolor: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)',
                            textAlign: 'center',
                            height: { xs: 'auto', md: 200 },
                            minHeight: { xs: 130, md: 200 },
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 60 }}>
                            {item.icon}
                          </Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: 'text.primary',
                              fontSize: '1rem',
                              lineHeight: 1.3,
                              mb: 1
                            }}
                          >
                            {item.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              lineHeight: 1.5,
                              fontSize: '0.875rem'
                            }}
                          >
                            {item.desc}
                          </Typography>
                        </Paper>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Why Choose Smart Invoice Pro?
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto' }}>
              Everything you need to manage your business finances in one place, designed for simplicity and power.
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex' }}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { delay: index * 0.1, duration: 0.5 } }
                }}
                style={{ width: '100%', display: 'flex' }}
              >
                <Card
                  component={motion.div}
                  whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  sx={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'center',
                    borderRadius: 4,
                    overflow: 'visible'
                  }}
                >
                  <CardContent
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      p: 4,
                      '&:last-child': { pb: 4 }
                    }}
                  >
                    <Box sx={{ mb: 3 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        lineHeight: 1.6
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 12 }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                    Built for Modern Businesses
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.7, fontSize: '1.1rem' }}>
                    Smart Invoice Pro combines the power of modern technology with intuitive design
                    to deliver a seamless business management experience.
                  </Typography>
                </motion.div>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CheckCircle sx={{ color: 'secondary.main', fontSize: 24 }} />
                        <Typography variant="body1" sx={{ color: 'text.primary', fontSize: '1.05rem' }}>{benefit}</Typography>
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
                variants={scaleUp}
              >
                <Paper
                  elevation={6}
                  sx={{
                    height: { xs: 280, md: 400 },
                    bgcolor: 'white',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`
                  }}
                >
                  {/* Decorative Elements */}
                  <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(30,58,138,0.05) 0%, rgba(15,23,42,0.1) 100%)' }} />
                  <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(30,58,138,0.05) 0%, rgba(15,23,42,0.08) 100%)' }} />

                  <Box sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 1 }}>
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <CloudUpload sx={{ fontSize: 120, color: 'grey.300', mb: 2 }} />
                    </motion.div>
                    <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Dashboard Preview
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                      Coming Soon
                    </Typography>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'grey.900',
          color: 'white',
          py: 10,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, color: 'white' }}>
              Ready to Transform Your Business?
            </Typography>
            <Typography variant="h6" sx={{ mb: 5, color: 'grey.400', maxWidth: 600, mx: 'auto' }}>
              Join thousands of businesses already using Smart Invoice Pro to streamline their operations
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
                py: 2,
                fontSize: '1.2rem',
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
