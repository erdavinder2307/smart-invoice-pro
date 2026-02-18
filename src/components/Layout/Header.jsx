import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Business,
  Login,
  Dashboard,
  Logout,
  Person,
  Person as PersonIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import '../../styles/components/header.css';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [shouldNavigateHome, setShouldNavigateHome] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Navigate to home after logout completes and state updates
  useEffect(() => {
    if (shouldNavigateHome && !isAuthenticated) {
      navigate('/');
      setShouldNavigateHome(false);
    }
  }, [shouldNavigateHome, isAuthenticated, navigate]);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleLogoutClick = () => {
    handleCloseUserMenu();
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    logout();
    setShouldNavigateHome(true);
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  const handleDashboard = () => {
    handleCloseUserMenu();
    navigate('/dashboard');
  };

  const handleProfile = () => {
    handleCloseUserMenu();
    navigate('/profile');
  };

  const handleSettings = () => {
    handleCloseUserMenu();
    navigate('/settings');
  };

  // Helper function to check if route is active
  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Style for active menu item
  const getMenuItemStyle = (path) => ({
    color: isActiveRoute(path) ? 'primary.main' : 'text.primary',
    fontWeight: isActiveRoute(path) ? 700 : 400,
    borderBottom: isActiveRoute(path) ? '2px solid' : 'none',
    borderColor: isActiveRoute(path) ? 'primary.main' : 'transparent',
    '&:hover': {
      bgcolor: 'grey.100',
      borderBottom: '2px solid',
      borderColor: 'primary.main'
    }
  });

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{ bgcolor: 'white', color: 'text.primary' }}
    >
      <Container maxWidth="lg">
        <Toolbar className="header-toolbar">
          {/* Logo */}
          <Box
            component="a"
            href={isAuthenticated ? "/dashboard" : "/"}
            onClick={handleLogoClick}
            className="header-logo"
          >
            <Business sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
            <Typography
              variant="h6"
              className="header-logo-text"
              sx={{
                color: 'text.primary',
                fontSize: isMobile ? '1.1rem' : '1.25rem'
              }}
            >
              Smart Invoice Pro
            </Typography>
          </Box>

          {/* Navigation Links (Desktop) */}
          {!isMobile && (
            <Box className="header-nav-links">
              {/* Public Links - Always visible */}
              <Button component={Link} to="/" sx={getMenuItemStyle('/')}>Home</Button>
              <Button component={Link} to="/about" sx={getMenuItemStyle('/about')}>About</Button>
              <Button component={Link} to="/features" sx={getMenuItemStyle('/features')}>Features</Button>
              <Button component={Link} to="/contact" sx={getMenuItemStyle('/contact')}>Contact</Button>

              {/* Dashboard Link - Only when authenticated */}
              {isAuthenticated && (
                <Button component={Link} to="/dashboard" sx={getMenuItemStyle('/dashboard')}>Dashboard</Button>
              )}
            </Box>
          )}

          {/* Auth Action */}
          {!isAuthenticated ? (
            <Button
              variant="contained"
              startIcon={<Login />}
              onClick={() => navigate('/login')}
              color="primary"
              className="header-login-button"
            >
              Login
            </Button>
          ) : (
            <Box className="header-user-container">
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} className="header-avatar-button">
                  <Avatar
                    alt={user?.username || "User"}
                    src={user?.profile_image || user?.avatar}
                    sx={{
                      bgcolor: 'primary.main',
                      background: user?.profile_image || user?.avatar ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  >
                    {!user?.profile_image && !user?.avatar && (user?.username ? user.username.charAt(0).toUpperCase() : <Person />)}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    borderRadius: 2,
                    minWidth: 180,
                    overflow: 'visible',
                    mt: 1.5,
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  }
                }}
              >
                <Box className="header-user-info">
                  <Typography variant="subtitle2" className="header-user-name">
                    {user?.username || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" className="header-user-role">
                    User Account
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleDashboard}>
                  <ListItemIcon>
                    <Dashboard fontSize="small" />
                  </ListItemIcon>
                  Dashboard
                </MenuItem>
                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleSettings}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <MenuItem onClick={handleLogoutClick}>
                  <ListItemIcon>
                    <Logout fontSize="small" color="error" />
                  </ListItemIcon>
                  <Typography color="error">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}

          {/* Logout Confirmation Dialog */}
          <Dialog
            open={showLogoutDialog}
            onClose={handleLogoutCancel}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Confirm Sign Out"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to sign out of your account?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleLogoutCancel} color="primary">
                Cancel
              </Button>
              <Button onClick={handleLogoutConfirm} color="error" autoFocus>
                Sign Out
              </Button>
            </DialogActions>
          </Dialog>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
