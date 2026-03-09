import React, { useState, useEffect } from "react";
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
  LoginOutlined
} from "@mui/icons-material";
import { motion } from 'framer-motion';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const { login, register } = useAuth();
  const [credentials, setCredentials] = useState({ username: "", password: "", confirmPassword: "" });
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

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isSignup) {
        // Validate password strength
        if (!isPasswordValid()) {
          setError("Password does not meet the required criteria.");
          setLoading(false);
          return;
        }

        // Validate password confirmation
        if (credentials.password !== credentials.confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }

        // Only send username and password to the API
        const { username, password } = credentials;
        const response = await register({ username, password });
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
        const token = await login(credentials);
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
            <Grid item xs={12} md={6} lg={5} sx={{ mx: 'auto' }}>
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

                    {/* Alerts */}
                    {error && (
                      <motion.div variants={fadeInUp}>
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                          {error}
                        </Alert>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div variants={fadeInUp}>
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                          {success}
                        </Alert>
                      </motion.div>
                    )}

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                      {/* Username Field */}
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        variant="outlined"
                        margin="normal"
                        required
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
                        variant="outlined"
                        margin="normal"
                        required
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
                          variant="outlined"
                          margin="normal"
                          required
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
