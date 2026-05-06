import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  Card,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Lock as LockIcon,
  CheckCircle,
  Cancel,
  ArrowBack,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import SeoHead from '../seo/SeoHead';
import { createApiUrl } from '../config/api';
import IconButton from '@mui/material/IconButton';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const validatePassword = (pwd) => {
    setPasswordValidation({
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    });
  };

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(valid => valid);
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    validatePassword(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isPasswordValid()) {
      setError('Password does not meet the required criteria');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(createApiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password. The link may have expired.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
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
          title="Password Reset Successful | Solidev Books"
          description="Your password has been successfully reset. You can now sign in with your new password."
          canonicalPath="/reset-password/:token"
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
                Password Reset Successful
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
                Your password has been successfully reset. You can now sign in with your new password.
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
        title="Reset Your Password | Solidev Books"
        description="Create a new password for your Solidev Books account."
        canonicalPath="/reset-password/:token"
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
                Create New Password
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mb: 4,
                  textAlign: 'center',
                  opacity: 0.8
                }}
              >
                Enter a strong password to secure your account
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="New Password"
                  name="password"
                  value={password}
                  onChange={handlePasswordChange}
                  variant="outlined"
                  margin="normal"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#64748B' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#64748B' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
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

                {/* Password Validation Checklist */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ display: 'block', mb: 1, opacity: 0.7 }}>
                    Password must have:
                  </Typography>
                  <List sx={{ py: 0 }}>
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {passwordValidation.minLength ? (
                          <CheckCircle sx={{ fontSize: 18, color: '#10B981' }} />
                        ) : (
                          <Cancel sx={{ fontSize: 18, color: '#DC2626', opacity: 0.5 }} />
                        )}
                      </ListItemIcon>
                      <ListItemText primary="At least 8 characters" sx={{ '& .MuiListItemText-primary': { fontSize: '0.85rem' } }} />
                    </ListItem>
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {passwordValidation.hasUppercase ? (
                          <CheckCircle sx={{ fontSize: 18, color: '#10B981' }} />
                        ) : (
                          <Cancel sx={{ fontSize: 18, color: '#DC2626', opacity: 0.5 }} />
                        )}
                      </ListItemIcon>
                      <ListItemText primary="One uppercase letter" sx={{ '& .MuiListItemText-primary': { fontSize: '0.85rem' } }} />
                    </ListItem>
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {passwordValidation.hasLowercase ? (
                          <CheckCircle sx={{ fontSize: 18, color: '#10B981' }} />
                        ) : (
                          <Cancel sx={{ fontSize: 18, color: '#DC2626', opacity: 0.5 }} />
                        )}
                      </ListItemIcon>
                      <ListItemText primary="One lowercase letter" sx={{ '& .MuiListItemText-primary': { fontSize: '0.85rem' } }} />
                    </ListItem>
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {passwordValidation.hasNumber ? (
                          <CheckCircle sx={{ fontSize: 18, color: '#10B981' }} />
                        ) : (
                          <Cancel sx={{ fontSize: 18, color: '#DC2626', opacity: 0.5 }} />
                        )}
                      </ListItemIcon>
                      <ListItemText primary="One number" sx={{ '& .MuiListItemText-primary': { fontSize: '0.85rem' } }} />
                    </ListItem>
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {passwordValidation.hasSpecialChar ? (
                          <CheckCircle sx={{ fontSize: 18, color: '#10B981' }} />
                        ) : (
                          <Cancel sx={{ fontSize: 18, color: '#DC2626', opacity: 0.5 }} />
                        )}
                      </ListItemIcon>
                      <ListItemText primary="One special character" sx={{ '& .MuiListItemText-primary': { fontSize: '0.85rem' } }} />
                    </ListItem>
                  </List>
                </Box>

                <TextField
                  fullWidth
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  variant="outlined"
                  margin="normal"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#64748B' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: '#64748B' }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
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
                  disabled={loading || !isPasswordValid()}
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
                    'Reset Password'
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

export default ResetPassword;
