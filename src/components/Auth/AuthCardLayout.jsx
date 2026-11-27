import React from 'react';
import { Box, Card, Container, Typography } from '@mui/material';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import SeoHead from '../../seo/SeoHead';

/** Public one-card page (email verification, invite acceptance). */
const AuthCardLayout = ({ seoTitle, canonicalPath, title, children }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <SeoHead title={seoTitle} description={title} canonicalPath={canonicalPath} robots="noindex,follow" />
    <Header />
    <Box
      sx={{
        flex: 1,
        background: 'linear-gradient(135deg, #0a0e27 0%, #1e3a8a 50%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            {title}
          </Typography>
          {children}
        </Card>
      </Container>
    </Box>
    <Footer />
  </Box>
);

export default AuthCardLayout;
