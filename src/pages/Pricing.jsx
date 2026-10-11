import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import SeoHead from '../seo/SeoHead';
import { getBillingPlans } from '../services/billingService';
import {
  PLANS,
  TRIAL_DAYS,
  formatInr,
  gstPercentLabel,
  priceWithGst,
} from '../config/plans';

const PERIOD_SUFFIX = { monthly: '/month', yearly: '/year' };

const PlanCard = ({ plan, period, checkoutEnabled, onStartTrial, onUpgrade }) => {
  // Plans without a yearly price stay on monthly billing.
  const shownPeriod = plan.prices[period] ? period : 'monthly';
  const price = plan.prices[shownPeriod];

  return (
    <Paper
      elevation={0}
      data-testid={`plan-${plan.code}`}
      sx={{
        p: { xs: 3, md: 4 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: plan.highlighted ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
        {plan.name}
      </Typography>
      <Typography sx={{ color: '#64748B', mb: 3 }}>{plan.tagline}</Typography>

      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <Typography sx={{ fontSize: { xs: '2.25rem', md: '2.75rem' }, fontWeight: 800, color: '#0f172a' }}>
          {formatInr(price)}
        </Typography>
        <Typography sx={{ color: '#475569' }}>{PERIOD_SUFFIX[shownPeriod]}</Typography>
      </Box>
      <Typography sx={{ color: '#475569', fontSize: '0.95rem' }}>
        excl. {gstPercentLabel} GST · {formatInr(priceWithGst(price))} incl. GST
      </Typography>
      {shownPeriod !== period && (
        <Typography sx={{ color: '#64748B', fontSize: '0.85rem', mt: 0.5 }}>
          Monthly billing only
        </Typography>
      )}

      <List dense sx={{ my: 2, flex: 1 }}>
        {plan.features.map((feature) => (
          <ListItem key={feature} disableGutters>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CheckCircle sx={{ color: '#16a34a', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText primary={feature} primaryTypographyProps={{ color: '#334155' }} />
          </ListItem>
        ))}
      </List>

      <Button
        variant={plan.highlighted ? 'contained' : 'outlined'}
        size="large"
        onClick={onStartTrial}
        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
      >
        Start free trial
      </Button>
      {checkoutEnabled && (
        <Button variant="text" onClick={onUpgrade} sx={{ mt: 1, textTransform: 'none' }}>
          Upgrade
        </Button>
      )}
    </Paper>
  );
};

const Pricing = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('monthly');
  const [checkoutEnabled, setCheckoutEnabled] = useState(false);

  // The API decides whether online checkout is on; until it answers, or if it fails, Upgrade stays hidden.
  useEffect(() => {
    let active = true;
    getBillingPlans()
      .then((data) => active && setCheckoutEnabled(Boolean(data?.checkout_enabled)))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SeoHead
        title="Pricing"
        description={`Solidev Books plans in Indian rupees: Starter ₹599/month and Growth ₹1,499/month, excluding GST. ${TRIAL_DAYS}-day free trial, no card needed.`}
        canonicalPath="/pricing"
      />
      <Header />

      <Box sx={{ flex: 1, py: { xs: 6, md: 8 }, bgcolor: '#f8fafc' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h2"
              sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '3rem' }, color: '#0f172a' }}
            >
              Simple pricing in ₹
            </Typography>
            <Typography sx={{ color: '#475569', fontSize: '1.05rem', mb: 3 }}>
              {TRIAL_DAYS}-day free trial · no card needed
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={period}
              onChange={(_, value) => value && setPeriod(value)}
              aria-label="Billing period"
            >
              <ToggleButton value="monthly">Monthly</ToggleButton>
              <ToggleButton value="yearly">Yearly</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Grid container spacing={3}>
            {PLANS.map((plan) => (
              <Grid key={plan.code} size={{ xs: 12, sm: 6 }}>
                <PlanCard
                  plan={plan}
                  period={period}
                  checkoutEnabled={checkoutEnabled}
                  onStartTrial={() => navigate('/signup')}
                  onUpgrade={() => navigate('/settings/billing')}
                />
              </Grid>
            ))}
          </Grid>

          <Typography sx={{ color: '#64748B', textAlign: 'center', mt: 4, fontSize: '0.95rem' }}>
            All prices in ₹, excl. {gstPercentLabel} GST. A GST tax invoice is issued for every payment.
          </Typography>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Pricing;
