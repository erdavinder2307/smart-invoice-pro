import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  Person,
  Lock,
  Email,
  CheckCircle,
  Cancel,
  Visibility,
  VisibilityOff,
  AppRegistration
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import SeoHead from '../seo/SeoHead';
import { useAuth } from '../context/AuthContext';
import analyticsService from '../services/analyticsService';

const SignupPage = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      validatePassword(value);
    }
  };

  const validatePassword = (password) => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(valid => valid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isPasswordValid()) {
      setError('Password does not meet the required criteria');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        password: formData.password
      });
      // Track signup event
      analyticsService.trackSignup(formData.username);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('Registration failed. Username or email might already exist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  if (success) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <SeoHead
          title="Account Created | Solidev Books"
          description="Your account has been created successfully. Welcome to Solidev Books!"
          canonicalPath="/signup"
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
                Account Created!
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
                Welcome to Solidev Books! Your account has been created successfully. You can now sign in with your credentials.
              </Typography>

              <Typography
                sx={{
                  opacity: 0.7,
                  fontSize: '0.9rem',
                  mb: 3
                }}
              >
                Redirecting to sign in page in 2 seconds...
              </Typography>

              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'grey.50'
                  }
                }}
              >
                Sign In Now
              </Button>
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
        title="Create Account | Sign Up for Invoice Management | Solidev Books"
        description="Create a free Solidev Books account to start managing your invoices, payments, and financial operations. Secure workflow-driven financial management."
        canonicalPath="/signup"
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
            variants={staggerContainer}
          >
            <Card
              elevation={24}
              sx={{
                backdropFilter: 'blur(20px)',
                background: 'rgba(255, 255, 255, 0.98)',
                borderRadius: 4,
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                {/* Header */}
                <motion.div variants={fadeInUp}>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        mb: 2
                      }}
                    >
                      <AppRegistration sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
                      Create Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Start managing your invoices and financial operations today
                    </Typography>
                  </Box>
                </motion.div>

                {error && (
                  <motion.div variants={fadeInUp}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Username */}
                  <motion.div variants={fadeInUp}>
                    <TextField
                      fullWidth
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      variant="outlined"
                      margin="normal"
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.4)',
                          },
                        },
                      }}
                    />
                  </motion.div>

                  {/* Email */}
                  <motion.div variants={fadeInUp}>
                    <TextField
                      fullWidth
                      type="email"
                      label="Email Address"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      variant="outlined"
                      margin="normal"
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.4)',
                          },
                        },
                      }}
                    />
                  </motion.div>

                  {/* Password */}
                  <motion.div variants={fadeInUp}>
                    <TextField
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      variant="outlined"
                      margin="normal"
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: 'text.secondary' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.4)',
                          },
                        },
                      }}
                    />
                  </motion.div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <motion.div variants={fadeInUp}>
                      <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                        <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#0f172a' }}>
                          Password Requirements:
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
                            <ListItemText primary="One uppercase letter (A-Z)" sx={{ '& .MuiListItemText-primary': { fontSize: '0.85rem' } }} />
                          </ListItem>
                          <ListItem sx={{ py: 0.5, px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              {passwordValidation.hasLowercase ? (
                                <CheckCircle sx={{ fontSize: 18, color: '#10B981' }} />
                              ) : (
                                <Cancel sx={{ fontSize: 18, color: '#DC2626', opacity: 0.5 }} />
                              )}
                            </ListItemIcon>
                            <ListItemText primary="One lowercase letter (a-z)" sx={{ '& .MuiListItemText-primary': { fontSize: '0.85rem' } }} />
                          </ListItem>
                          <ListItem sx={{ py: 0.5, px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              {passwordValidation.hasNumber ? (
                                <CheckCircle sx={{ fontSize: 18, color: '#10B981' }} />
                              ) : (
                                <Cancel sx={{ fontSize: 18, color: '#DC2626', opacity: 0.5 }} />
                              )}
                            </ListItemIcon>
                            <ListItemText primary="One number (0-9)" sx={{ '& .MuiListItemText-primary': { fontSize: '0.85rem' } }} />
                          </ListItem>
                          <ListItem sx={{ py: 0.5, px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              {passwordValidation.hasSpecialChar ? (
                                <CheckCircle sx={{ fontSize: 18, color: '#10B981' }} />
                              ) : (
                                <Cancel sx={{ fontSize: 18, color: '#DC2626', opacity: 0.5 }} />
                              )}
                            </ListItemIcon>
                            <ListItemText primary="One special character (!@#$%^&*)" sx={{ '& .MuiListItemText-primary': { fontSize: '0.85rem' } }} />
                          </ListItem>
                        </List>
                      </Box>
                    </motion.div>
                  )}

                  {/* Confirm Password */}
                  <motion.div variants={fadeInUp}>
                    <TextField
                      fullWidth
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm Password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      variant="outlined"
                      margin="normal"
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              sx={{ color: 'text.secondary' }}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.4)',
                          },
                        },
                      }}
                    />
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div variants={fadeInUp}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      type="submit"
                      disabled={loading || !isPasswordValid()}
                      sx={{
                        mb: 2,
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 600,
                        py: 1.5,
                        '&:hover': {
                          bgcolor: 'primary.dark'
                        }
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </motion.div>

                  {/* Sign In Link */}
                  <motion.div variants={fadeInUp}>
                    <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                      Already have an account?{' '}
                      <RouterLink to="/login" style={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
                        <span style={{ color: '#2563EB', fontWeight: 600 }}>Sign In</span>
                      </RouterLink>
                    </Typography>
                  </motion.div>
                </form>
              </CardContent>
            </Card>

            {/* Trust Signals */}
            <motion.div variants={fadeInUp}>
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
                  ✓ Enterprise-grade security  ✓ No credit card required  ✓ 14-day free trial
                </Typography>
              </Box>
            </motion.div>
          </motion.div>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default SignupPage;
