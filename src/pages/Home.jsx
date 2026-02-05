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
  CheckCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

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
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant={isMobile ? 'h3' : 'h2'}
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  lineHeight: 1.2
                }}
              >
                Smart Invoice Pro – Simplifying Invoicing and Bookkeeping
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  lineHeight: 1.6
                }}
              >
                A modern, AI-powered invoicing platform designed for freelancers, 
                startups, and businesses to manage invoices, payments, and inventory with ease.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
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
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  Get Started
                </Button>
                <Button
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
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={3} sx={{ height: '100%' }}>
                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      textAlign: 'center',
                      width: '100%',
                      maxWidth: 200,
                      minWidth: 180,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      minHeight: 160,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary', fontSize: '1rem' }}>
                      Save 10+ Hours Weekly
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.4, fontSize: '0.875rem' }}>
                      Automated invoicing and smart workflows eliminate repetitive tasks
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      textAlign: 'center',
                      width: '100%',
                      maxWidth: 200,
                      minWidth: 180,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      minHeight: 160,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <Dashboard sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary', fontSize: '1rem' }}>
                      Real-time Insights
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.4, fontSize: '0.875rem' }}>
                      Get instant business analytics and performance metrics
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      textAlign: 'center',
                      width: '100%',
                      maxWidth: 200,
                      minWidth: 180,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      minHeight: 160,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <Security sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary', fontSize: '1rem' }}>
                      99.9% Secure
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.4, fontSize: '0.875rem' }}>
                      Enterprise-grade security with automatic data backups
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      textAlign: 'center',
                      width: '100%',
                      maxWidth: 200,
                      minWidth: 180,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      minHeight: 160,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CloudUpload sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary', fontSize: '1rem' }}>
                      Cloud-Based
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.4, fontSize: '0.875rem' }}>
                      Access your data anywhere, anytime with cloud synchronization
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            Why Choose Smart Invoice Pro?
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Everything you need to manage your business finances in one place
          </Typography>
        </Box>
        
        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex' }}>
              <Card
                sx={{
                  height: '100%',
                  width: '100%',
                  maxWidth: 280,
                  minWidth: 240,
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent 
                  sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    p: 3,
                    '&:last-child': { pb: 3 }
                  }}
                >
                  <Box sx={{ mb: 2 }}>
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
                      textAlign: 'center'
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                Built for Modern Businesses
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.7 }}>
                Smart Invoice Pro combines the power of modern technology with intuitive design 
                to deliver a seamless business management experience.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {benefits.map((benefit, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircle sx={{ color: 'secondary.main', fontSize: 24 }} />
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>{benefit}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: 400,
                  bgcolor: 'white',
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ textAlign: 'center', p: 4 }}>
                  <CloudUpload sx={{ fontSize: 120, color: 'grey.300', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                    Dashboard Preview
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Coming Soon
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'grey.800',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'white' }}>
            Ready to Transform Your Business?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: 'grey.300' }}>
            Join thousands of businesses already using Smart Invoice Pro to streamline their operations
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            color="primary"
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.2rem',
            }}
          >
            Get Started Today
          </Button>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Home;
