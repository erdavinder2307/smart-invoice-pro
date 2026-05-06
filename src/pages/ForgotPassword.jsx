import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  Card
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack,
  CheckCircle
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import SeoHead from '../seo/SeoHead';
import { createApiUrl } from '../config/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email) {
        setError('Please enter your email address');
        setLoading(false);
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      const response = await fetch(createApiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  if (success) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <SeoHead
          title="Reset Email Sent | Solidev Books"
          description="Password reset instructions have been sent to your email."
          canonicalPath="/forgot-password"
          robots="noindex,follow"
        />
        <Header />

        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          sx={{
            flex: 1,
            background: 'linear-gradient(135deg, #0a0e27 0%, #1e3a8a 50%, #0f172a 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            py: { xs: 4, md: 8 },
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Container maxWidth="sm">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              style={{ textAlign: 'center' }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 3,
                  borderRadius: '50%',
                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                  backdropFilter: 'blur(10px)',
                  mb: 4
                }}
              >
                <CheckCircle sx={{ fontSize: 80, color: '#10B981' }} />
              </Box>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '1.75rem', md: '2.5rem' }
                }}
              >
                Check Your Email
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  lineHeight: 1.6,
                  maxWidth: '500px',
                  mx: 'auto'
                }}
              >
                We've sent password reset instructions to <strong>{email}</strong>. Please check your email and follow the link to reset your password.
              </Typography>

              <Typography
                sx={{
                  mb: 4,
                  opacity: 0.8,
                  fontSize: '0.95rem'
                }}
              >
                Didn't receive an email? Check your spam folder or try again.
              </Typography>

              <Typography
                sx={{
                  opacity: 0.7,
                  fontSize: '0.9rem'
                }}
              >
                Redirecting to sign in page in 3 seconds...
              </Typography>
            </motion.div>
          </Container>
        </Box>

        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SeoHead
        title="Forgot Password | Reset Your Account | Solidev Books"
        description="Reset your Solidev Books password. Enter your email address to receive password reset instructions."
        canonicalPath="/forgot-password"
        robots="noindex,follow"
      />
      <Header />

      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        sx={{
          flex: 1,
          background: 'linear-gradient(135deg, #0a0e27 0%, #1e3a8a 50%, #0f172a 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          py: { xs: 4, md: 8 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decorations */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '-5%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(30,58,138,0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '-5%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none'
          }}
        />

        <Container maxWidth="sm">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Card
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                bgcolor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  textAlign: 'center'
                }}
              >
                Reset Password
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mb: 4,
                  textAlign: 'center',
                  opacity: 0.8
                }}
              >
                Enter your email address to receive password reset instructions
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email Address"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  margin="normal"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#64748B' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                    },
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={loading}
                  sx={{
                    mb: 2,
                    bgcolor: '#2563EB',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 600,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: '#1d4ed8'
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate('/login')}
                  disabled={loading}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }
                  }}
                >
                  Back to Sign In
                </Button>
              </form>
            </Card>
          </motion.div>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default ForgotPassword;
