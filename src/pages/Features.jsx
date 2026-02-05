import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Chip,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Receipt,
  Dashboard,
  Inventory,
  Security,
  PictureAsPdf,
  Analytics,
  CloudSync,
  MobileFriendly,
  Speed,
  AutoAwesome,
  ExpandMore,
  CheckCircle,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const Features = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(false);

  const handleFaqChange = (panel) => (event, isExpanded) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  const features = [
    {
      icon: <Receipt sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Easy Invoice Creation',
      description: 'Create professional invoices in minutes with our intuitive drag-and-drop interface. Customize templates, add your branding, and send invoices directly to clients.',
      highlights: ['Custom templates', 'Auto-calculations', 'Multi-currency support', 'Recurring invoices']
    },
    {
      icon: <PictureAsPdf sx={{ fontSize: 50, color: 'error.main' }} />,
      title: 'PDF Export & Sharing',
      description: 'Generate high-quality PDF invoices instantly. Share via email, download for offline use, or integrate with your existing workflow systems.',
      highlights: ['One-click PDF generation', 'Email integration', 'Cloud storage sync', 'Print-ready format']
    },
    {
      icon: <Security sx={{ fontSize: 50, color: 'secondary.main' }} />,
      title: 'Secure Customer Portal',
      description: 'Provide your customers with secure login access to view invoices, make payments, and track their transaction history in real-time.',
      highlights: ['Encrypted login', 'Payment tracking', 'Transaction history', 'Mobile access']
    },
    {
      icon: <Inventory sx={{ fontSize: 50, color: 'warning.main' }} />,
      title: 'Smart Stock Management',
      description: 'Keep track of your inventory with intelligent stock monitoring, automatic reorder alerts, and detailed transaction mapping.',
      highlights: ['Real-time tracking', 'Low stock alerts', 'Batch management', 'Supplier integration']
    },
    {
      icon: <Dashboard sx={{ fontSize: 50, color: 'info.main' }} />,
      title: 'Real-time Dashboards',
      description: 'Get comprehensive insights into your business performance with interactive charts, revenue tracking, and financial analytics.',
      highlights: ['Live analytics', 'Custom reports', 'Revenue forecasting', 'Performance metrics']
    },
    {
      icon: <Analytics sx={{ fontSize: 50, color: 'success.main' }} />,
      title: 'Financial Insights',
      description: 'Make informed decisions with AI-powered financial analysis, trend predictions, and automated business intelligence reports.',
      highlights: ['AI recommendations', 'Trend analysis', 'Profit optimization', 'Cash flow tracking']
    }
  ];

  const additionalFeatures = [
    {
      icon: <CloudSync sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Cloud Synchronization',
      description: 'Access your data anywhere with automatic cloud backup and real-time synchronization across all devices.'
    },
    {
      icon: <MobileFriendly sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'Mobile Responsive',
      description: 'Full functionality on any device - desktop, tablet, or smartphone. Work on-the-go without limitations.'
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Lightning Fast',
      description: 'Built with modern technologies for optimal performance. Pages load instantly, operations complete in seconds.'
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 40, color: 'info.main' }} />,
      title: 'AI-Powered Automation',
      description: 'Smart automation for repetitive tasks, intelligent data entry suggestions, and predictive business insights.'
    }
  ];

  const faqs = [
    {
      question: 'How secure is my business data?',
      answer: 'We use enterprise-grade encryption, secure cloud infrastructure hosted on Microsoft Azure, and follow industry best practices for data protection. Your data is encrypted both in transit and at rest, with regular security audits and backups.'
    },
    {
      question: 'Can I customize invoice templates?',
      answer: 'Yes! Smart Invoice Pro offers fully customizable invoice templates. You can add your company logo, adjust colors, modify layouts, and create templates that match your brand identity. We also provide several professional pre-made templates to get you started quickly.'
    },
    {
      question: 'Does it integrate with accounting software?',
      answer: 'We offer API integration capabilities and are working on direct integrations with popular accounting software like QuickBooks, Xero, and others. Our REST API allows you to connect with any system that supports standard web services.'
    },
    {
      question: 'What payment methods do you support?',
      answer: 'Smart Invoice Pro supports multiple payment gateways including Stripe, PayPal, and bank transfers. Your customers can pay via credit cards, debit cards, digital wallets, and ACH transfers directly through the customer portal.'
    },
    {
      question: 'Is there a mobile app available?',
      answer: 'Currently, Smart Invoice Pro is a responsive web application that works perfectly on all mobile devices. We are developing native iOS and Android apps that will be available in 2025 with additional mobile-specific features.'
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant={isMobile ? 'h3' : 'h2'}
              sx={{
                fontWeight: 700,
                mb: 3,
                lineHeight: 1.2,
                color: 'white'
              }}
            >
              Powerful Features for Smarter Business
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                color: 'grey.100',
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Discover how Smart Invoice Pro can transform your business operations 
              with cutting-edge features designed for modern entrepreneurs
            </Typography>
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
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'grey.50',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Try All Features Now
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  height: '100%',
                  p: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ mr: 3, mt: 1 }}>
                      {feature.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                        {feature.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {feature.highlights.map((highlight, idx) => (
                          <Chip
                            key={idx}
                            label={highlight}
                            size="small"
                            sx={{
                              bgcolor: 'primary.light',
                              color: 'primary.dark',
                              fontWeight: 500
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Additional Features */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              And Much More...
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Built with modern technology stack for optimal performance
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {additionalFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper
          elevation={4}
          sx={{
            p: 6,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: 'white' }}>
            Why Businesses Choose Smart Invoice Pro
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <TrendingUp sx={{ fontSize: 60, mb: 2, color: 'white' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'white' }}>
                Increase Efficiency
              </Typography>
              <Typography variant="body1" sx={{ color: 'grey.100' }}>
                Save 10+ hours per week on administrative tasks
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <CheckCircle sx={{ fontSize: 60, mb: 2, color: 'white' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'white' }}>
                Reduce Errors
              </Typography>
              <Typography variant="body1" sx={{ color: 'grey.100' }}>
                Automated calculations eliminate human errors
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Analytics sx={{ fontSize: 60, mb: 2, color: 'white' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'white' }}>
                Better Insights
              </Typography>
              <Typography variant="body1" sx={{ color: 'grey.100' }}>
                Make data-driven decisions with real-time analytics
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* FAQ Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Frequently Asked Questions
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Got questions? We've got answers
            </Typography>
          </Box>
          
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {faqs.map((faq, index) => (
              <Accordion
                key={index}
                expanded={expandedFaq === `panel${index}`}
                onChange={handleFaqChange(`panel${index}`)}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  '&:before': { display: 'none' },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    '&.Mui-expanded': {
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    bgcolor: 'grey.50',
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8
                  }}
                >
                  <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'text.primary' }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
            Ready to Experience These Features?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary' }}>
            Join thousands of businesses already using Smart Invoice Pro
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${theme.palette.primary.main}40`
                },
                transition: 'all 0.3s ease'
              }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/contact')}
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  borderColor: 'primary.dark',
                  bgcolor: 'primary.light',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Contact Sales
            </Button>
          </Box>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default Features;
