import React from 'react';
import { Box, Container, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import SeoHead from '../../seo/SeoHead';

export const LEGAL_LAST_UPDATED = '11 October 2026';

// Shared layout for /terms, /privacy and /refund. Each section is { title, paragraphs?, bullets?, after? };
// paragraphs and bullets may hold strings or JSX (for links).
const LegalPage = ({ title, seoTitle, seoDescription, canonicalPath, intro, sections }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <SeoHead title={seoTitle} description={seoDescription} canonicalPath={canonicalPath} />
    <Header />

    <Box sx={{ flex: 1, py: { xs: 6, md: 8 }, bgcolor: '#f8fafc' }}>
      <Container maxWidth="md">
        <Typography
          variant="h2"
          component="h1"
          sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '3rem' }, color: '#0f172a' }}
        >
          {title}
        </Typography>
        <Typography sx={{ color: '#64748B', mb: 2 }}>Last updated: {LEGAL_LAST_UPDATED}</Typography>
        <Typography
          sx={{
            display: 'inline-block',
            mb: 4,
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            bgcolor: '#FEF3C7',
            color: '#92400E',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          Draft — pending legal review
        </Typography>
        {intro && (
          <Typography paragraph sx={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7, mb: 4 }}>
            {intro}
          </Typography>
        )}

        {sections.map((section, index) => (
          <Box key={section.title} component="section" sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{ fontWeight: 700, mb: 2, color: '#0f172a', fontSize: { xs: '1.35rem', md: '1.6rem' } }}
            >
              {section.title}
            </Typography>
            {(section.paragraphs || []).map((text, i) => (
              <Typography key={i} paragraph sx={{ color: '#475569', lineHeight: 1.75 }}>
                {text}
              </Typography>
            ))}
            {section.bullets && (
              <List sx={{ ml: 2, listStyleType: 'disc', pl: 2 }}>
                {section.bullets.map((text, i) => (
                  <ListItem key={i} sx={{ display: 'list-item', px: 0, py: 0.5 }}>
                    <ListItemText primary={text} primaryTypographyProps={{ color: '#475569', lineHeight: 1.7 }} />
                  </ListItem>
                ))}
              </List>
            )}
            {(section.after || []).map((text, i) => (
              <Typography key={i} paragraph sx={{ color: '#475569', lineHeight: 1.75, mt: 1 }}>
                {text}
              </Typography>
            ))}
            {index < sections.length - 1 && <Divider sx={{ mt: 4 }} />}
          </Box>
        ))}
      </Container>
    </Box>

    <Footer />
  </Box>
);

export default LegalPage;
