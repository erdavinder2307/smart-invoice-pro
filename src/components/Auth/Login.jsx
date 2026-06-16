import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  Link,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Security,
  CheckCircle,
  Cancel,
  LoginOutlined,
  BugReport
} from "@mui/icons-material";
import { AnimatePresence, motion } from 'framer-motion';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import SeoHead from '../../seo/SeoHead';
import { useAuth } from "../../context/AuthContext";
import analyticsService from "../../services/analyticsService";

// ── Dev-only autofill config (only active in NODE_ENV=development) ───────────
const IS_DEV = process.env.NODE_ENV === 'development';

const DEV_USERS = IS_DEV
  ? [
      {
        role: 'Admin',
        color: '#dc2626',
        bg: 'rgba(220,38,38,0.12)',
        email: process.env.REACT_APP_DEV_ADMIN_EMAIL || 'dev.admin@solidevbooks.local',
        password: process.env.REACT_APP_DEV_ADMIN_PASSWORD || 'DevTest@1234',
        description: 'Full access to all modules',
      },
      {
        role: 'Manager',
        color: '#7c3aed',
        bg: 'rgba(124,58,237,0.12)',
        email: process.env.REACT_APP_DEV_MANAGER_EMAIL || 'dev.manager@solidevbooks.local',
        password: process.env.REACT_APP_DEV_MANAGER_PASSWORD || 'DevTest@1234',
        description: 'All modules except settings',
      },
      {
        role: 'Sales',
        color: '#059669',
        bg: 'rgba(5,150,105,0.12)',
        email: process.env.REACT_APP_DEV_SALES_EMAIL || 'dev.sales@solidevbooks.local',
        password: process.env.REACT_APP_DEV_SALES_PASSWORD || 'DevTest@1234',
        description: 'Invoices, quotes, customers',
      },
      {
        role: 'Accountant',
        color: '#0284c7',
        bg: 'rgba(2,132,199,0.12)',
        email: process.env.REACT_APP_DEV_ACCOUNTANT_EMAIL || 'dev.accountant@solidevbooks.local',
        password: process.env.REACT_APP_DEV_ACCOUNTANT_PASSWORD || 'DevTest@1234',
        description: 'Bills, expenses, reports',
      },
      {
        role: 'Purchaser',
        color: '#d97706',
        bg: 'rgba(217,119,6,0.12)',
        email: process.env.REACT_APP_DEV_PURCHASER_EMAIL || 'dev.purchaser@solidevbooks.local',
        password: process.env.REACT_APP_DEV_PURCHASER_PASSWORD || 'DevTest@1234',
        description: 'Vendors, purchase orders, bills',
      },
    ]
  : [];


const LoginPage = () => {
  const { login, register, sessionExpired, isAuthenticated, loading: authLoading } = useAuth();
  const [credentials, setCredentials] = useState({ username: "", password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({ username: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const navigate = useNavigate();
  const [activeDevRole, setActiveDevRole] = useState(null);

  // Redirect to dashboard only when AuthContext confirms an active session
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // ── Dev autofill handler ──────────────────────────────────────────────────
  const handleDevAutofill = useCallback((user) => {
    setCredentials({ username: user.email, password: user.password, confirmPassword: '' });
    setFieldErrors({ username: '', password: '', confirmPassword: '' });
    setError('');
    setSuccess('');
    setIsSignup(false);
    setActiveDevRole(user.role);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    // Validate password in real-time during signup
    if (name === 'password' && isSignup) {
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

  const validateAuthForm = () => {
    const username = credentials.username.trim();
    const password = credentials.password;
    const nextFieldErrors = { username: '', password: '', confirmPassword: '' };
    let firstError = '';

    if (!username) {
      nextFieldErrors.username = 'Username is required.';
      firstError = firstError || nextFieldErrors.username;
    } else if (!isSignup && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) {
      nextFieldErrors.username = 'Enter a valid email address.';
      firstError = firstError || nextFieldErrors.username;
    }
    if (!password.trim()) {
      nextFieldErrors.password = 'Password is required.';
      firstError = firstError || nextFieldErrors.password;
    }

    if (isSignup) {
      if (!isPasswordValid()) {
        nextFieldErrors.password = 'Password does not meet the required criteria.';
        firstError = firstError || nextFieldErrors.password;
      }
      if (!credentials.confirmPassword.trim()) {
        nextFieldErrors.confirmPassword = 'Confirm password is required.';
        firstError = firstError || nextFieldErrors.confirmPassword;
      }
      if (password !== credentials.confirmPassword) {
        nextFieldErrors.confirmPassword = 'Passwords do not match.';
        firstError = firstError || nextFieldErrors.confirmPassword;
      }
    }

    return {
      fieldErrors: nextFieldErrors,
      message: firstError
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const validation = validateAuthForm();
    setFieldErrors(validation.fieldErrors);
    if (validation.message) {
      setError(validation.message);
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        // Only send username and password to the API
        const username = credentials.username.trim();
        const { password } = credentials;
        await register({ username, password });
        // Track signup event
        analyticsService.trackSignup(username);
        setSuccess("Account created successfully! You can now sign in.");
        setIsSignup(false);
        setCredentials({ username: "", password: "", confirmPassword: "" });
        setPasswordValidation({
          minLength: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumber: false,
          hasSpecialChar: false
        });
      } else {
        await login({
          username: credentials.username.trim(),
          password: credentials.password
        });
        navigate("/dashboard");
      }
    } catch (err) {
      if (isSignup) {
        setError("Registration failed. Username might already exist.");
      } else {
        setError("Invalid username or password");
      }
    }
    setLoading(false);
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SeoHead
        title={isSignup ? "Sign Up for Invoice Management | Solidev Books" : "Sign In to Invoice Management | Solidev Books"}
        description={isSignup ? "Create a free Solidev Books account to start managing your invoices, payments, and financial operations." : "Sign in to your Solidev Books account to access your invoicing and financial management dashboard."}
        canonicalPath="/login"
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

        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6, lg: 5 }} sx={{ mx: 'auto' }}>
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
                    overflow: 'visible',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    maxHeight: 'none'
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 5 }, overflow: 'visible' }}>
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
                          <LoginOutlined sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
                          {isSignup ? 'Create Account' : 'Welcome Back'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {isSignup
                            ? 'Start your professional bookkeeping journey'
                            : 'Sign in to access your dashboard'
                          }
                        </Typography>
                      </Box>
                    </motion.div>

                    {/* Alerts — AnimatePresence avoids stagger-hidden opacity on dynamic errors */}
                    <AnimatePresence mode="wait">
                      {sessionExpired && !error && (
                        <motion.div
                          key="session-expired"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                            Session expired. Please login again.
                          </Alert>
                        </motion.div>
                      )}
                      {error && (
                        <motion.div
                          key="login-error"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                          </Alert>
                        </motion.div>
                      )}
                      {success && (
                        <motion.div
                          key="login-success"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                            {success}
                          </Alert>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                      {/* Username Field */}
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        type="email"
                        value={credentials.username}
                        onChange={handleChange}
                        error={Boolean(fieldErrors.username)}
                        helperText={fieldErrors.username || ' '}
                        variant="outlined"
                        margin="normal"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />

                      {/* Password Field */}
                      <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={credentials.password}
                        onChange={handleChange}
                        error={Boolean(fieldErrors.password)}
                        helperText={fieldErrors.password || ' '}
                        variant="outlined"
                        margin="normal"
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
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: isSignup ? 1 : 2 }}
                      />

                      {/* Confirm Password Field - Only for signup */}
                      {isSignup && (
                        <TextField
                          fullWidth
                          label="Confirm Password"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={credentials.confirmPassword}
                          onChange={handleChange}
                          error={Boolean(fieldErrors.confirmPassword)}
                          helperText={fieldErrors.confirmPassword || ' '}
                          variant="outlined"
                          margin="normal"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Security color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  edge="end"
                                >
                                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{ mb: 2 }}
                        />
                      )}

                      {/* Password Requirements - Only for signup when password is entered */}
                      {isSignup && credentials.password && (
                        <Paper
                          variant="outlined"
                          sx={{ p: 2, mb: 3, bgcolor: 'grey.50', borderRadius: 2 }}
                        >
                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Password Requirements:
                          </Typography>
                          <List dense sx={{ py: 0 }}>
                            {[
                              { key: 'minLength', text: 'At least 8 characters' },
                              { key: 'hasUppercase', text: 'One uppercase letter' },
                              { key: 'hasLowercase', text: 'One lowercase letter' },
                              { key: 'hasNumber', text: 'One number' },
                              { key: 'hasSpecialChar', text: 'One special character' }
                            ].map(({ key, text }) => (
                              <ListItem key={key} sx={{ py: 0, px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  {passwordValidation[key] ? (
                                    <CheckCircle color="success" sx={{ fontSize: 18 }} />
                                  ) : (
                                    <Cancel color="error" sx={{ fontSize: 18 }} />
                                  )}
                                </ListItemIcon>
                                <ListItemText
                                  primary={text}
                                  primaryTypographyProps={{
                                    variant: 'body2',
                                    color: passwordValidation[key] ? 'success.main' : 'error.main'
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Paper>
                      )}

                      {/* Remember Me & Forgot Password - Only for login */}
                      {!isSignup && (
                        <motion.div variants={fadeInUp}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={rememberMe}
                                  onChange={(e) => setRememberMe(e.target.checked)}
                                  color="primary"
                                />
                              }
                              label="Remember me"
                            />
                            <Link
                              component="button"
                              type="button"
                              variant="body2"
                              onClick={() => console.log('Forgot password clicked')}
                              sx={{ textDecoration: 'none' }}
                            >
                              Forgot Password?
                            </Link>
                          </Box>
                        </motion.div>
                      )}

                      {/* ── Dev RBAC Autofill Panel (development only) ── */}
                      {IS_DEV && !isSignup && (
                        <Box
                          sx={{
                            mb: 3,
                            p: 2,
                            borderRadius: 2,
                            border: '1.5px dashed #f59e0b',
                            background: 'rgba(254,243,199,0.7)',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                            <BugReport sx={{ fontSize: 16, color: '#b45309' }} />
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              sx={{ color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                            >
                              Dev — Quick Login
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {DEV_USERS.map((user) => (
                              <Box
                                key={user.role}
                                component="button"
                                type="button"
                                id={`dev-autofill-${user.role.toLowerCase()}`}
                                onClick={() => handleDevAutofill(user)}
                                title={user.description}
                                sx={{
                                  cursor: 'pointer',
                                  border: activeDevRole === user.role
                                    ? `2px solid ${user.color}`
                                    : `1.5px solid ${user.color}55`,
                                  borderRadius: '20px',
                                  px: 1.5,
                                  py: 0.5,
                                  background: activeDevRole === user.role ? user.bg : 'white',
                                  color: user.color,
                                  fontSize: '0.78rem',
                                  fontWeight: activeDevRole === user.role ? 700 : 500,
                                  fontFamily: 'inherit',
                                  transition: 'all 0.15s ease',
                                  outline: 'none',
                                  '&:hover': {
                                    background: user.bg,
                                    borderColor: user.color,
                                    fontWeight: 700,
                                    transform: 'scale(1.04)',
                                  },
                                }}
                              >
                                {user.role}
                              </Box>
                            ))}
                          </Box>
                          {activeDevRole && (
                            <Typography
                              variant="caption"
                              sx={{ display: 'block', mt: 1, color: '#78350f', fontSize: '0.7rem' }}
                            >
                              Filled as <strong>{activeDevRole}</strong> — press Sign In to continue
                            </Typography>
                          )}
                        </Box>
                      )}

                     {/* Submit Button */}
                      <motion.div variants={fadeInUp}>
                        <Button
                          component={motion.button}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          fullWidth
                          variant="contained"
                          size="large"
                          disabled={loading}
                          sx={{
                            mb: 2,
                            py: 1.5,
                            background: 'linear-gradient(135deg, #0057e7 0%, #1976d2 100%)',
                            borderRadius: 2,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(0, 87, 231, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #003fa3 0%, #1565c0 100%)',
                              boxShadow: '0 6px 16px rgba(0, 87, 231, 0.4)',
                            }
                          }}
                          startIcon={loading && <CircularProgress size={20} color="inherit" />}
                        >
                          {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
                        </Button>
                      </motion.div>

                      {/* Customer Portal Link */}
                      <motion.div variants={fadeInUp}>
                        <Button
                          component={motion.button}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          fullWidth
                          variant="outlined"
                          size="large"
                          onClick={() => navigate('/customer/login')}
                          sx={{
                            py: 1.5,
                            mb: 2,
                            borderRadius: 2,
                            fontSize: '1rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            borderColor: 'secondary.main',
                            color: 'secondary.main',
                            '&:hover': {
                              bgcolor: 'secondary.main',
                              color: 'white',
                              borderColor: 'secondary.main'
                            }
                          }}
                        >
                          Customer Portal Login
                        </Button>
                      </motion.div>

                      {/* Toggle Sign up / Sign in */}
                      <motion.div variants={fadeInUp}>
                        <Button
                          component={motion.button}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          fullWidth
                          variant="text"
                          size="large"
                          onClick={() => {
                            setIsSignup(!isSignup);
                            setError("");
                            setSuccess("");
                            setCredentials({ username: "", password: "", confirmPassword: "" });
                            setPasswordValidation({
                              minLength: false,
                              hasUppercase: false,
                              hasLowercase: false,
                              hasNumber: false,
                              hasSpecialChar: false
                            });
                          }}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            fontSize: '1rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            color: 'primary.main',
                            '&:hover': {
                              bgcolor: 'primary.50'
                            }
                          }}
                        >
                          {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                        </Button>
                      </motion.div>
                    </Box>

                    {/* Footer Text */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                      sx={{ mt: 3 }}
                    >
                      By continuing, you agree to our{' '}
                      <Link href="/terms" underline="hover">Terms of Service</Link>
                      {' '}and{' '}
                      <Link href="/privacy" underline="hover">Privacy Policy</Link>
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default LoginPage;
