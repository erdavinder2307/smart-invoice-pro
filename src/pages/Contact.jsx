import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Paper,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Send,
  ContactSupport,
  Business,
  Schedule
} from '@mui/icons-material';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const Contact = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // For now, just log to console as requested
    console.log('Contact form submission:', formData);
    
    // Show success message
    setShowSuccess(true);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });

    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const contactInfo = [
    {
      icon: <Email sx={{ fontSize: 32, color: '#3b82f6' }} />,
      title: 'Email Support',
      primary: 'admin@solidevelectrosoft.com',
      secondary: 'We typically respond within 24 hours'
    },
    {
      icon: <Phone sx={{ fontSize: 32, color: '#10b981' }} />,
      title: 'Phone Support',
      primary: '+91 9115866828',
      secondary: 'Monday - Friday, 9 AM - 6 PM PST'
    },
    {
      icon: <LocationOn sx={{ fontSize: 32, color: '#f59e0b' }} />,
      title: 'Office Address',
      primary: 'Next57 Coworking, Cabin No - 11,  C205 Sm Heights',
      secondary: 'Industrial Area Phase 8b Mohali, 140308'
    }
  ];

  const supportTypes = [
    {
      icon: <ContactSupport sx={{ fontSize: 40, color: '#3b82f6' }} />,
      title: 'Technical Support',
      description: 'Get help with technical issues, bugs, or platform questions'
    },
    {
      icon: <Business sx={{ fontSize: 40, color: '#10b981' }} />,
      title: 'Sales Inquiries',
      description: 'Learn about pricing, features, and custom enterprise solutions'
    },
    {
      icon: <Schedule sx={{ fontSize: 40, color: '#f59e0b' }} />,
      title: 'General Questions',
      description: 'Ask about our services, partnerships, or general information'
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
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
                lineHeight: 1.2
              }}
            >
              We'd Love to Hear from You
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.9,
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Have questions, feedback, or need support? Reach out to us and 
              we'll get back to you as soon as possible.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Contact Form and Info Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6}>
          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                Send us a Message
              </Typography>
              
              {showSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Thank you for your message! We'll get back to you soon.
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      multiline
                      rows={6}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<Send />}
                      sx={{
                        bgcolor: '#059669',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: '#047857',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(5, 150, 105, 0.4)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {contactInfo.map((info, index) => (
                <Card
                  key={index}
                  sx={{
                    p: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ mt: 0.5 }}>
                        {info.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {info.title}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                          {info.primary}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {info.secondary}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Support Types Section */}
      <Box sx={{ bgcolor: '#f8fafc', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              How Can We Help?
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Choose the type of support you need
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {supportTypes.map((type, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      {type.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {type.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {type.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Business Hours & Additional Info */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 4,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Business Hours
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Monday - Friday</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>9:00 AM - 6:00 PM PST</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Saturday</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>10:00 AM - 4:00 PM PST</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Sunday</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>Closed</Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ mt: 3, opacity: 0.9 }}>
                For urgent technical issues outside business hours, please email us 
                and we'll respond as soon as possible.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 4,
                borderRadius: 4,
                border: '2px solid #e5e7eb'
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Alternative Ways to Reach Us
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Live Chat
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Available on our platform during business hours for logged-in users
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Help Center
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Browse our comprehensive documentation and tutorials
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Community Forum
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Connect with other users and share tips and best practices
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
};

export default Contact;
