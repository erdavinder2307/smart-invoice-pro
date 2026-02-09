import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  CheckCircle,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { createApiUrl } from '../config/api';
import API_CONFIG from '../config/api';
import myImage from '../assets/laptop.jpg';

const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.CUSTOMER_LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save JWT token and customer data in localStorage
        localStorage.setItem('customerToken', data.token);
        localStorage.setItem('customerEmail', email);
        
        // Store customer data for dashboard use
        const customerData = {
          id: data.customer?.id || 'N/A',
          name: data.customer?.name || email.split('@')[0],
          email: email
        };
        localStorage.setItem('customerData', JSON.stringify(customerData));
        
        // Redirect to customer dashboard
        navigate('/customer/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2
    }}>
      <Container maxWidth="lg">
        <Paper 
          elevation={24} 
          sx={{ 
            borderRadius: 4, 
            overflow: 'hidden',
            background: '#ffffff',
            minHeight: { xs: 'auto', md: '600px' }
          }}
        >
          <Grid container sx={{ minHeight: { xs: 'auto', md: '600px' } }}>
            {/* Left Panel - Customer Portal Branding */}
            <Grid 
              item 
              xs={12} 
              md={6} 
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                padding: 4,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Background Pattern */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  opacity: 0.5
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -100,
                  left: -100,
                  width: 300,
                  height: 300,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                  opacity: 0.7
                }}
              />
              
              {/* Content */}
              <Box sx={{ textAlign: 'center', zIndex: 2, mb: 4 }}>
                <Person sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h3" fontWeight={700} gutterBottom>
                  Customer Portal
                </Typography>
                <Typography variant="h6" fontWeight={400} sx={{ opacity: 0.9, mb: 4 }}>
                  Access Your Invoices & Account Information
                </Typography>
                
                {/* Feature highlights */}
                <Box sx={{ textAlign: 'left', maxWidth: 300 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircle sx={{ mr: 2, fontSize: 20 }} />
                    <Typography variant="body1">View Your Invoices</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircle sx={{ mr: 2, fontSize: 20 }} />
                    <Typography variant="body1">Download Invoice PDFs</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircle sx={{ mr: 2, fontSize: 20 }} />
                    <Typography variant="body1">Track Payment Status</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircle sx={{ mr: 2, fontSize: 20 }} />
                    <Typography variant="body1">Update Account Details</Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Decorative Image */}
              <Box
                component="img"
                src={myImage}
                alt="Customer portal access"
                sx={{
                  width: { xs: 200, md: 250 },
                  height: { xs: 200, md: 250 },
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  zIndex: 2
                }}
              />
            </Grid>

            {/* Right Panel - Login Form */}
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: { xs: 3, md: 4 }
                }}
              >
                <Box sx={{ width: '100%', maxWidth: 400 }}>
                  {/* Header */}
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
                      Welcome Back
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Sign in to access your customer portal
                    </Typography>
                  </Box>

                  {/* Back to Main Login Link */}
                  <Box sx={{ mb: 3 }}>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={() => navigate('/login')}
                      sx={{ 
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'primary.main',
                        '&:hover': {
                          color: 'primary.dark'
                        }
                      }}
                    >
                      <ArrowBack sx={{ fontSize: 16, mr: 1 }} />
                      Back to Main Login
                    </Link>
                  </Box>

                  {/* Alert */}
                  {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {/* Form */}
                  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
                        {/* Email Field */}
                        <TextField
                          fullWidth
                          label="Email Address"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          variant="outlined"
                          margin="normal"
                          required
                          disabled={loading}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ mb: 2 }}
                        />

                        {/* Password Field */}
                        <TextField
                          fullWidth
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          variant="outlined"
                          margin="normal"
                          required
                          disabled={loading}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                  disabled={loading}
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{ mb: 3 }}
                        />

                        {/* Submit Button */}
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          size="large"
                          disabled={loading}
                          sx={{ 
                            mb: 2, 
                            py: 1.5,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: 2,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                            }
                          }}
                          startIcon={loading && <CircularProgress size={20} color="inherit" />}
                        >
                          {loading ? 'Signing in...' : 'Sign In to Portal'}
                        </Button>

                        {/* Help Text */}
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            Need help accessing your account?
                          </Typography>
                          <Link
                            component="button"
                            type="button"
                            variant="body2"
                            onClick={() => console.log('Contact support clicked')}
                            sx={{ textDecoration: 'none', mt: 1 }}
                          >
                            Contact Support
                          </Link>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Footer Text */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    align="center" 
                    sx={{ mt: 3 }}
                  >
                    Your login credentials are provided by our team.
                    <br />
                    Contact us if you need assistance.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default CustomerLogin;