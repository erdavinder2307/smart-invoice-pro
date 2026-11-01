import React, { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  Divider, FormControlLabel, Grid, Paper, Stack, Switch, Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getPublicPlans, createPaymentLink } from '../../services/subscriptionService';
import { useSubscription } from '../../context/SubscriptionContext';
import MainLayout from '../../components/Layout/MainLayout';

const CONTACT_EMAIL = 'sales@solidevbooks.com';

export default function BillingUpgrade() {
  const [plans, setPlans] = useState([]);
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { subscription, refresh } = useSubscription();

  const paymentSuccess = searchParams.get('payment') === 'success';
  const paymentCancelled = searchParams.get('payment') === 'cancelled';

  useEffect(() => {
    getPublicPlans().then(d => setPlans(d.plans || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (paymentSuccess) {
      refresh();
    }
  }, [paymentSuccess, refresh]);

  const starterPlan = plans.find(p => p.id === (annual ? 'starter_annual' : 'starter_monthly'));
  const monthlyPrice = plans.find(p => p.id === 'starter_monthly')?.pricing?.inr_monthly || 599;
  const annualPrice = plans.find(p => p.id === 'starter_annual')?.pricing?.inr_annual || 5999;
  const displayPrice = annual ? Math.round(annualPrice / 12) : monthlyPrice;

  const handleUpgrade = async () => {
    if (!starterPlan) return;
    setLoading(true);
    setError(null);
    try {
      const data = await createPaymentLink(starterPlan.id, annual ? 'annual' : 'monthly');
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Could not create payment link. Please try again.');
      setLoading(false);
    }
  };

  const currentStatus = subscription?.status;
  const isAlreadyActive = currentStatus === 'active';

  return (
    <MainLayout title="Upgrade Plan">
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        {paymentSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Payment successful! Your subscription is now active. Welcome to Solidev Books Starter.
          </Alert>
        )}
        {paymentCancelled && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Payment was cancelled. Your trial continues until its end date.
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}

        <Typography variant="h5" fontWeight={700} mb={1}>Choose your plan</Typography>
        <Typography color="text.secondary" mb={3}>
          All plans include a 30-day free trial. Upgrade at any time.
        </Typography>

        <FormControlLabel
          control={<Switch checked={annual} onChange={e => setAnnual(e.target.checked)} />}
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <span>Annual billing</span>
              <Chip label="Save 17%" size="small" color="success" />
            </Stack>
          }
          sx={{ mb: 3 }}
        />

        <Grid container spacing={3}>
          {/* Starter */}
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ border: '2px solid', borderColor: 'primary.main', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700}>Starter</Typography>
                <Box sx={{ my: 2 }}>
                  <Typography variant="h4" fontWeight={800} component="span">₹{displayPrice}</Typography>
                  <Typography variant="body2" color="text.secondary" component="span"> /month</Typography>
                  {annual && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Billed ₹{annualPrice}/year
                    </Typography>
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1} mb={2}>
                  {(starterPlan?.display_features || ['3 users', '100 invoices/month', 'GST reports', 'Bank reconciliation']).map(f => (
                    <Stack key={f} direction="row" spacing={1}>
                      <CheckIcon fontSize="small" color="success" />
                      <Typography variant="body2">{f}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button
                  variant="contained" fullWidth size="large"
                  disabled={loading || isAlreadyActive}
                  onClick={handleUpgrade}
                  endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <OpenInNewIcon fontSize="small" />}
                >
                  {isAlreadyActive ? 'Current Plan' : loading ? 'Opening payment...' : `Pay via Zoho — ₹${annual ? annualPrice : monthlyPrice}`}
                </Button>
                <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
                  Secure payment via Zoho Payments · UPI, Cards, NetBanking
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Growth */}
          <Grid item xs={12} md={4}>
            <Card elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700}>Growth</Typography>
                <Box sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">Starting from</Typography>
                  <Typography variant="h4" fontWeight={800} component="span">₹1,499</Typography>
                  <Typography variant="body2" color="text.secondary" component="span"> /month</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1} mb={2}>
                  {['5–15 users', 'Unlimited invoices', 'API access', 'Automation', 'Priority support'].map(f => (
                    <Stack key={f} direction="row" spacing={1}>
                      <CheckIcon fontSize="small" color="success" />
                      <Typography variant="body2">{f}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button variant="outlined" fullWidth size="large"
                  href={`mailto:${CONTACT_EMAIL}?subject=Solidev Books Growth Plan Enquiry`}>
                  Contact Sales
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* Enterprise */}
          <Grid item xs={12} md={4}>
            <Card elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700}>Enterprise</Typography>
                <Box sx={{ my: 2 }}>
                  <Typography variant="h4" fontWeight={800}>Custom</Typography>
                  <Typography variant="body2" color="text.secondary">Tailored to your scale</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1} mb={2}>
                  {['Custom users', 'Multi-GSTIN', 'Custom domain', 'Dedicated CSM', 'SLA support'].map(f => (
                    <Stack key={f} direction="row" spacing={1}>
                      <CheckIcon fontSize="small" color="success" />
                      <Typography variant="body2">{f}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button variant="outlined" fullWidth size="large"
                  href={`mailto:${CONTACT_EMAIL}?subject=Solidev Books Enterprise Enquiry`}>
                  Contact Sales
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button variant="text" onClick={() => navigate('/settings/billing')}>
            ← Back to billing dashboard
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
}
