import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Facebook,
  Twitter,
  LinkedIn,
  GitHub
} from '@mui/icons-material';
import Logo from '../common/Logo';


const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const linkSx = {
    textDecoration: 'none',
    color: 'grey.300',
    fontSize: '0.9rem',
    py: 0.5,
    display: 'block',
    textAlign: { xs: 'center', md: 'left' },
    '&:hover': { color: 'white' }
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        pt: { xs: 5, md: 6.5 },
        pb: { xs: 3.5, md: 4.5 },
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 5 }} justifyContent={{ xs: 'center', md: 'flex-start' }}>

          {/* Company Info — full width on mobile */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Logo size={30} showText={true} textColor="#ffffff" variant="light" />
            </Box>
            <Typography variant="body2" sx={{ color: 'grey.400', mb: 3, lineHeight: 1.7, maxWidth: 320, textAlign: { xs: 'center', md: 'left' } }}>
              Workflow-driven financial operations for modern businesses, from quote to insight,
              with secure execution and real-time visibility.
            </Typography>

            {/* Social Links — larger touch targets on mobile */}
            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              {[
                { icon: <Facebook />, label: 'Facebook' },
                { icon: <Twitter />, label: 'Twitter' },
                { icon: <LinkedIn />, label: 'LinkedIn' },
                { icon: <GitHub />, label: 'GitHub' },
              ].map(({ icon, label }) => (
                <IconButton
                  key={label}
                  size={isMobile ? 'medium' : 'small'}
                  aria-label={label}
                  sx={{
                    color: 'grey.400',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: 2,
                    '&:hover': { color: 'white', bgcolor: 'primary.main' },
                    transition: 'all 0.2s'
                  }}
                >
                  {icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Quick Links + Product — side by side on mobile, separate columns on desktop */}
          <Grid item xs={6} sm={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'white', letterSpacing: 0.5, textAlign: { xs: 'center', md: 'left' } }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' } }}>
              {[
                { label: 'Home', href: '/' },
                { label: 'About', href: '/about' },
                { label: 'Features', href: '/features' },
                { label: 'Contact', href: '/contact' },
              ].map(({ label, href }) => (
                <Link key={label} href={href} sx={linkSx}>{label}</Link>
              ))}
            </Box>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'white', letterSpacing: 0.5, textAlign: { xs: 'center', md: 'left' } }}>
              Product
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' } }}>
              {[
                { label: 'Dashboard', href: '/login' },
                { label: 'Customer Portal', href: '/customer/login' },
                { label: 'Documentation', href: 'https://docs.solidevbooks.com', external: true },
                { label: 'Contact Support', href: '/contact' },
              ].map(({ label, href, external }) => (
                <Link 
                  key={label} 
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  sx={linkSx}
                >
                  {label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Contact Info — full width on mobile */}
          <Grid item xs={12} sm={12} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'white', letterSpacing: 0.5, textAlign: { xs: 'center', md: 'left' } }}>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: { xs: 'center', md: 'flex-start' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Box sx={{ flexShrink: 0, color: 'primary.light' }}>
                  <Email sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="body2" sx={{ color: 'grey.300', wordBreak: 'break-all' }}>
                  admin@solidevelectrosoft.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Box sx={{ flexShrink: 0, color: 'primary.light' }}>
                  <Phone sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="body2" sx={{ color: 'grey.300' }}>
                  +91 9115866828
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Box sx={{ flexShrink: 0, color: 'primary.light', mt: 0.2 }}>
                  <LocationOn sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="body2" sx={{ color: 'grey.300', lineHeight: 1.6 }}>
                  Next57 Coworking, Cabin No - 11, C205 Sm Heights,
                  Industrial Area Phase 8b, Mohali 140308
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 3.2, md: 4 }, borderColor: 'grey.700' }} />

        {/* Bottom bar — stacked and centered on mobile */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          <Typography variant="body2" sx={{ color: 'grey.500' }}>
            © {new Date().getFullYear()} Solidev Books. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Cookie Policy', href: '/cookies' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                sx={{ textDecoration: 'none', fontSize: '0.8rem', color: 'grey.500', '&:hover': { color: 'white' } }}
              >
                {label}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
