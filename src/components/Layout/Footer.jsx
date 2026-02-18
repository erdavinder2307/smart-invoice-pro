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
import '../../styles/components/footer.css';

const Footer = () => {
  return (
    <Box
      component="footer"
      className="footer-container"
      sx={{
        bgcolor: 'grey.800',
        color: 'white'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box className="footer-company-header">
              <Business sx={{ color: 'primary.main', mr: 1, fontSize: 32 }} />
              <Typography variant="h6" className="footer-company-name">
                Smart Invoice Pro
              </Typography>
            </Box>
            <Typography variant="body2" className="footer-company-description" sx={{ color: 'grey.400' }}>
              Simplifying invoicing and bookkeeping for modern businesses with
              AI-powered solutions and seamless user experience.
            </Typography>

            {/* Social Links */}
            <Box className="footer-social-links">
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
            <Typography variant="h6" className="footer-section-heading">
              Quick Links
            </Typography>
            <Box className="footer-links-container">
              <Link href="/" className="footer-link" sx={{ color: 'grey.300', '&:hover': { color: 'white' } }}>
                Home
              </Link>
              <Link href="/about" className="footer-link" sx={{ color: 'grey.300', '&:hover': { color: 'white' } }}>
                About
              </Link>
              <Link href="/features" className="footer-link" sx={{ color: 'grey.300', '&:hover': { color: 'white' } }}>
                Features
              </Link>
              <Link href="/contact" className="footer-link" sx={{ color: 'grey.300', '&:hover': { color: 'white' } }}>
                Contact
              </Link>
            </Box>
          </Grid>

          {/* Product Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" className="footer-section-heading">
              Product
            </Typography>
            <Box className="footer-links-container">
              <Link href="/login" className="footer-link" sx={{ color: 'grey.300', '&:hover': { color: 'white' } }}>
                Dashboard
              </Link>
              <Link href="/customer/login" className="footer-link" sx={{ color: 'grey.300', '&:hover': { color: 'white' } }}>
                Customer Portal
              </Link>
              <Link href="/api-docs" className="footer-link" sx={{ color: 'grey.300', '&:hover': { color: 'white' } }}>
                API Documentation
              </Link>
              <Link href="/support" className="footer-link" sx={{ color: 'grey.300', '&:hover': { color: 'white' } }}>
                Support
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={12} md={3}>
            <Typography variant="h6" className="footer-section-heading">
              Contact Info
            </Typography>
            <Box className="footer-links-container">
              <Typography variant="body2" className="footer-contact-item" sx={{ color: 'grey.300' }}>
                <Email className="footer-contact-icon" />
                admin@solidevelectrosoft.com
              </Typography>
              <Typography variant="body2" className="footer-contact-item" sx={{ color: 'grey.300' }}>
                <Phone className="footer-contact-icon" />
                +91 9115866828
              </Typography>
              <Typography variant="body2" className="footer-contact-item" sx={{ color: 'grey.300' }}>
                <LocationOn className="footer-contact-icon" />
                Next57 Coworking, Cabin No - 11,  C205 Sm Heights Industrial Area Phase 8b Mohali, 140308
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider className="footer-divider" sx={{ borderColor: 'grey.600' }} />

        {/* Bottom Section */}
        <Box className="footer-bottom">
          <Typography variant="body2" sx={{ color: 'grey.400' }}>
            © 2024 Smart Invoice Pro. All rights reserved.
          </Typography>
          <Box className="footer-bottom-links">
            <Link href="/privacy" className="footer-bottom-link" sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}>
              Privacy Policy
            </Link>
            <Link href="/terms" className="footer-bottom-link" sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}>
              Terms of Service
            </Link>
            <Link href="/cookies" className="footer-bottom-link" sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}>
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
