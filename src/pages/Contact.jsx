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
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Send,
  WhatsApp
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { contactService } from '../services/contactService';

const Contact = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
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
        phone: '',
        subject: '',
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

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
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
        staggerChildren: 0.1
      }
    }
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#fcfdfe' }}>
      <Header />

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0a0e27 0%, #1e3a8a 50%, #0f172a 100%)',
          color: 'white',
          py: { xs: 8, md: 12 }
        }}
      >
        <Container maxWidth="lg">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <Box sx={{ textAlign: 'center' }}>
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
                  We'd Love to Hear from You
                </Typography>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    color: 'grey.100',
                    maxWidth: 800,
                    mx: 'auto',
                    lineHeight: 1.6,
                    opacity: 0.95
                  }}
                >
                  Have questions, feedback, or need support? Reach out to us and we'll get back to you as soon as possible.
                </Typography>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: -6, mb: 8, position: 'relative', zIndex: 10 }}>
        <Grid container spacing={4} justifyContent="center">
          {/* Form Side */}
          <Grid item xs={12} lg={8}>
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 4, md: 6 },
                  borderRadius: 6,
                  border: '1px solid #eef2f6',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.03)',
                  bgcolor: 'white'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Send sx={{ color: '#3b82f6', mr: 1.5, fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Send us a Message
                  </Typography>
                </Box>

                {status.success && (
                  <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
                    Your message has been sent successfully! We'll reach out shortly.
                  </Alert>
                )}

                {status.error && (
                  <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                    {status.error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#334155' }}>
                        Your Name <span style={{ color: '#ef4444' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={status.submitting}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#f8fafc',
                            borderRadius: 3,
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#f1f5f9' },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)'
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#334155' }}>
                        Email Address <span style={{ color: '#ef4444' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        name="email"
                        placeholder="john@company.com"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={status.submitting}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#f8fafc',
                            borderRadius: 3,
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#f1f5f9' },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)'
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#334155' }}>
                        Phone Number
                      </Typography>
                      <TextField
                        fullWidth
                        name="phone"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={status.submitting}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#f8fafc',
                            borderRadius: 3,
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#f1f5f9' },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)'
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#334155' }}>
                        Subject <span style={{ color: '#ef4444' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        name="subject"
                        placeholder="How can we help?"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        disabled={status.submitting}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#f8fafc',
                            borderRadius: 3,
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#f1f5f9' },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)'
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#334155' }}>
                        Message <span style={{ color: '#ef4444' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        name="message"
                        placeholder="Write your message here..."
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        disabled={status.submitting}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#f8fafc',
                            borderRadius: 3,
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#f1f5f9' },
                            '&.Mui-focused': {
                              bgcolor: 'white',
                              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)'
                            }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={status.submitting}
                      endIcon={status.submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                      sx={{
                        width: { xs: '100%', sm: 280 },
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)',
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 15px 30px rgba(37, 99, 235, 0.4)'
                        },
                        '&:active': {
                          transform: 'translateY(1px)'
                        }
                      }}
                    >
                      {status.submitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                    Or reach out directly via
                  </Typography>
                  <Button
                    startIcon={<WhatsApp />}
                    href="https://wa.me/919115866828"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: '#10b981',
                      bgcolor: 'rgba(16, 185, 129, 0.1)',
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(16, 185, 129, 0.2)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    WhatsApp Us (+91 91158 66828)
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Contact Info */}
      <Container maxWidth="lg" sx={{ pb: 12 }}>
        <Grid container spacing={4}>
          {contactInfo.map((info, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid #f1f5f9',
                    bgcolor: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                      borderColor: '#e2e8f0'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{
                        p: 1.5,
                        bgcolor: 'rgba(241, 245, 249, 0.5)',
                        borderRadius: 3,
                        color: info.icon.props.sx.color
                      }}>
                        {info.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: '#1e293b' }}>
                          {info.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 500, mb: 0.5 }}>
                          {info.primary}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {info.secondary}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
};

export default Contact;
