import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Business, Login } from '@mui/icons-material';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  return (
    <AppBar 
      position="sticky" 
      elevation={1}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ px: 0 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Business sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 700,
                fontSize: isMobile ? '1.1rem' : '1.25rem'
              }}
            >
              Smart Invoice Pro
            </Typography>
          </Box>

          {/* Navigation Links */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 3, mr: 3 }}>
              <Button
                component={Link}
                to="/"
                sx={{ 
                  color: 'text.primary',
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                Home
              </Button>
              <Button
                component={Link}
                to="/about"
                sx={{ 
                  color: 'text.primary',
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                About
              </Button>
              <Button
                component={Link}
                to="/features"
                sx={{ 
                  color: 'text.primary',
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                Features
              </Button>
              <Button
                component={Link}
                to="/contact"
                sx={{ 
                  color: 'text.primary',
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                Contact
              </Button>
            </Box>
          )}

          {/* Login Button */}
          <Button
            variant="contained"
            startIcon={<Login />}
            onClick={() => navigate('/login')}
            color="primary"
          >
            Login
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
