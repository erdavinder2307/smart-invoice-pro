import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider
} from '@mui/material';
import {
  Business,
  Email,
  Phone,
  LocationOn,
  Facebook,
  Twitter,
  LinkedIn,
  GitHub
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.800',
        color: 'white',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Business sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                Smart Invoice Pro
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'grey.400', mb: 3 }}>
              Simplifying invoicing and bookkeeping for modern businesses with 
              AI-powered solutions and seamless user experience.
            </Typography>
            
            {/* Social Links */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'primary.main' } }}>
                <Facebook />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'primary.main' } }}>
                <Twitter />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'primary.main' } }}>
                <LinkedIn />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'primary.main' } }}>
                <GitHub />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'white' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" sx={{ color: 'grey.300', textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Home
              </Link>
              <Link href="/about" sx={{ color: 'grey.300', textDecoration: 'none', '&:hover': { color: 'white' } }}>
                About
              </Link>
              <Link href="/features" sx={{ color: 'grey.300', textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Features
              </Link>
              <Link href="/contact" sx={{ color: 'grey.300', textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Contact
              </Link>
            </Box>
          </Grid>

          {/* Product Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'white' }}>
              Product
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/login" sx={{ color: 'grey.300', textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Dashboard
              </Link>
              <Link href="/customer/login" sx={{ color: 'grey.300', textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Customer Portal
              </Link>
              <Link href="#" sx={{ color: 'grey.300', textDecoration: 'none', '&:hover': { color: 'white' } }}>
                API Documentation
              </Link>
              <Link href="#" sx={{ color: 'grey.300', textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Support
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={12} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'white' }}>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'grey.300', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 16 }} />
                admin@solidevelectrosoft.com
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.300', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 16 }} />
                +91 9115866828
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.300', display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 16 }} />
                Next57 Coworking, Cabin No - 11,  C205 Sm Heights Industrial Area Phase 8b Mohali, 140308
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'grey.600' }} />

        {/* Bottom Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'grey.400' }}>
            © 2024 Smart Invoice Pro. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: 'white' } }}>
              Privacy Policy
            </Link>
            <Link href="#" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: 'white' } }}>
              Terms of Service
            </Link>
            <Link href="#" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: 'white' } }}>
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
