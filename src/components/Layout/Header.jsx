import React, { useState } from 'react';
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
  Divider
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import {
  Business,
  Login,
  Dashboard,
  Logout,
  Person
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [anchorElUser, setAnchorElUser] = useState(null);

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

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/');
  };

  const handleDashboard = () => {
    handleCloseUserMenu();
    navigate('/dashboard');
  };

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{ bgcolor: 'white', color: 'text.primary' }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ px: 0 }}>
          {/* Logo */}
          <Box
            component="a"
            href={isAuthenticated ? "/dashboard" : "/"}
            onClick={handleLogoClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
              textDecoration: 'none',
              cursor: 'pointer'
            }}
          >
            <Business sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                fontSize: isMobile ? '1.1rem' : '1.25rem'
              }}
            >
              Smart Invoice Pro
            </Typography>
          </Box>

          {/* Navigation Links (Desktop) */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, mr: 3 }}>
              {!isAuthenticated ? (
                // Public Links
                <>
                  <Button component={Link} to="/" color="inherit">Home</Button>
                  <Button component={Link} to="/about" color="inherit">About</Button>
                  <Button component={Link} to="/features" color="inherit">Features</Button>
                  <Button component={Link} to="/contact" color="inherit">Contact</Button>
                </>
              ) : (
                // Private Links (Optional/Reduced when logged in)
                <>
                  <Button component={Link} to="/dashboard" color="inherit">Dashboard</Button>
                  <Button component={Link} to="/invoices" color="inherit">Invoices</Button>
                </>
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
              sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
            >
              Login
            </Button>
          ) : (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt={user?.username || "User"}
                    sx={{ bgcolor: 'primary.main' }}
                  >
                    {user?.username ? user.username.charAt(0).toUpperCase() : <Person />}
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
                  <Typography variant="subtitle2" noWrap>
                    {user?.username || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
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
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" color="error" />
                  </ListItemIcon>
                  <Typography color="error">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
