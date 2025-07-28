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
  Divider,
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
  Business,
  Security,
  CheckCircle,
  Cancel
} from "@mui/icons-material";
import "./Login.css";
import myImage from "../../assets/laptop.jpg";
import authService from "../../services/authService";

const LoginPage = () => {
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
        const response = await authService.register({ username, password });
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
        const token = await authService.login(credentials);
        console.log("Login successful, token:", token);
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
            {/* Left Panel - Branding & Image */}
            <Grid 
              item 
              xs={12} 
              md={6} 
              sx={{ 
                background: 'linear-gradient(135deg, #0057e7 0%, #1976d2 100%)',
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
                <Business sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h3" fontWeight={700} gutterBottom>
                  Smart Invoice Pro
                </Typography>
                <Typography variant="h6" fontWeight={400} sx={{ opacity: 0.9, mb: 4 }}>
                  Professional Bookkeeping & Invoice Management
                </Typography>
                
                {/* Feature highlights */}
                <Box sx={{ textAlign: 'left', maxWidth: 300 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircle sx={{ mr: 2, fontSize: 20 }} />
                    <Typography variant="body1">Invoice Generation & Management</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircle sx={{ mr: 2, fontSize: 20 }} />
                    <Typography variant="body1">Customer & Product Tracking</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircle sx={{ mr: 2, fontSize: 20 }} />
                    <Typography variant="body1">Real-time Financial Reports</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircle sx={{ mr: 2, fontSize: 20 }} />
                    <Typography variant="body1">Secure Data Management</Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Decorative Image */}
              <Box
                component="img"
                src={myImage}
                alt="Professional bookkeeping"
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
                      {isSignup ? 'Create Account' : 'Welcome Back'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {isSignup 
                        ? 'Start your professional bookkeeping journey' 
                        : 'Sign in to access your dashboard'
                      }
                    </Typography>
                  </Box>

                  {/* Alerts */}
                  {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}
                  {success && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                      {success}
                    </Alert>
                  )}

                  {/* Form */}
                  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <CardContent sx={{ p: 4 }}>
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
                        )}

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

                        {/* Divider */}
                        <Divider sx={{ my: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            or
                          </Typography>
                        </Divider>

                        {/* Toggle Sign up / Sign in */}
                        <Button
                          fullWidth
                          variant="outlined"
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
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                              bgcolor: 'primary.main',
                              color: 'white',
                              borderColor: 'primary.main'
                            }
                          }}
                        >
                          {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                        </Button>
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
                    By continuing, you agree to our{' '}
                    <Link href="#" underline="hover">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="#" underline="hover">Privacy Policy</Link>
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

export default LoginPage;
