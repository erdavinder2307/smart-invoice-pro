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
  DialogActions,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Login,
  Dashboard,
  Logout,
  Person,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Logo from '../common/Logo';
import { useAuth } from '../../context/AuthContext';


const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [shouldNavigateHome, setShouldNavigateHome] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Navigate to home after logout completes and state updates
  useEffect(() => {
    if (shouldNavigateHome && !isAuthenticated) {
      navigate('/');
      setShouldNavigateHome(false);
    }
  }, [shouldNavigateHome, isAuthenticated, navigate]);

  // Close drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

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

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Features', path: '/features' },
    { label: 'Contact', path: '/contact' },
    ...(isAuthenticated ? [{ label: 'Dashboard', path: '/dashboard' }] : []),
  ];

  return (
    <>
      <AppBar
        position="sticky"
        elevation={1}
        sx={{ bgcolor: 'white', color: 'text.primary' }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: 0 }}>
            {/* Hamburger — mobile only */}
            {isMobile && (
              <IconButton
                edge="start"
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ mr: 1, color: 'text.primary' }}
                aria-label="open navigation menu"
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Box
              component="a"
              href={isAuthenticated ? "/dashboard" : "/"}
              onClick={handleLogoClick}
              sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, textDecoration: 'none', cursor: 'pointer' }}
            >
              <Logo size={isMobile ? 28 : 32} showText={true} textColor="inherit" />
            </Box>

            {/* Navigation Links (Desktop) */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1, mr: 3 }}>
                {navLinks.map((link) => (
                  <Button key={link.path} component={Link} to={link.path} sx={getMenuItemStyle(link.path)}>
                    {link.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Auth Action */}
            {!isAuthenticated ? (
              <Button
                variant="contained"
                startIcon={<Login />}
                onClick={() => navigate('/login')}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
                sx={{ borderRadius: 1, textTransform: 'none', px: isMobile ? 2 : 3 }}
              >
                Login
              </Button>
            ) : (
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
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
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap' }}>
                      {user?.username || 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
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

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            pt: 2,
          }
        }}
      >
        {/* Drawer Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Logo size={28} showText={true} textColor="inherit" />
          </Box>
          <IconButton onClick={() => setMobileDrawerOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        {/* Nav Links */}
        <List sx={{ pt: 1 }}>
          {navLinks.map((link) => (
            <ListItem key={link.path} disablePadding>
              <ListItemButton
                component={Link}
                to={link.path}
                selected={isActiveRoute(link.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    '& .MuiListItemText-primary': { fontWeight: 700 }
                  }
                }}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mt: 1 }} />

        {/* Login CTA in drawer */}
        {!isAuthenticated && (
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Login />}
              onClick={() => { navigate('/login'); setMobileDrawerOpen(false); }}
              sx={{ borderRadius: 2, textTransform: 'none', py: 1.5 }}
            >
              Login
            </Button>
          </Box>
        )}
      </Drawer>
    </>
  );
};

export default Header;
