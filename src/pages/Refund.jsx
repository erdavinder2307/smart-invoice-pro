import React from 'react';
import { Box, Container, Typography, List, ListItem, ListItemText, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import SeoHead from '../seo/SeoHead';
import { SUPPORT_EMAIL } from './Support';
import { TRIAL_DAYS } from '../config/plans';

const Refund = () => {
  const rules = [
    `Every plan starts with a ${TRIAL_DAYS}-day free trial. No card is needed, so nothing is charged during the trial.`,
    'You can cancel any time from Settings → Billing. Your plan keeps working until the end of the period you have already paid for, and you are not charged again.',
    'We do not refund part of a period: cancelling in the middle of a month or year does not give a pro-rata refund.',
    'If you were charged twice for the same period, or a payment failed but money left your account, we refund it to the same card, UPI or bank account within 7–10 working days.',
    'GST on a refunded payment is reversed with a credit note against the tax invoice for that payment.',
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SeoHead
        title="Refund and cancellation policy | Solidev Books"
        description={`Solidev Books refund and cancellation policy: ${TRIAL_DAYS}-day free trial with no card, cancel any time, refunds for duplicate or failed payments.`}
        canonicalPath="/refund"
      />
      <Header />

      <Box sx={{ flex: 1, py: { xs: 6, md: 8 }, bgcolor: '#f8fafc' }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '3rem' }, color: '#0f172a' }}
          >
            Refund and cancellation policy
          </Typography>
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

          <List sx={{ mb: 3 }}>
            {rules.map((rule) => (
              <ListItem key={rule} sx={{ alignItems: 'flex-start', px: 0 }}>
                <ListItemText primary={rule} primaryTypographyProps={{ color: '#334155', lineHeight: 1.7 }} />
              </ListItem>
            ))}
          </List>

          <Typography paragraph sx={{ color: '#475569', lineHeight: 1.7 }}>
            To ask for a refund, email{' '}
            <Link href={`mailto:${SUPPORT_EMAIL}`} sx={{ fontWeight: 600 }}>{SUPPORT_EMAIL}</Link>{' '}
            from the email of your Solidev Books account, with the date and amount of the payment. See also our{' '}
            <Link component={RouterLink} to="/pricing">pricing</Link> and{' '}
            <Link component={RouterLink} to="/support">support</Link> pages.
          </Typography>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Refund;
