import React, { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  Divider, LinearProgress, Paper, Stack, Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../context/SubscriptionContext';
import { getBillingInvoices, requestExtension } from '../../services/subscriptionService';
import MainLayout from '../../components/Layout/MainLayout';

const STATUS_COLORS = {
  trial: 'info',
  trial_extension_1: 'info',
  trial_extension_2: 'info',
  founding_customer: 'secondary',
  active: 'success',
  expired: 'error',
  suspended: 'error',
  cancelled: 'warning',
};

const STATUS_LABELS = {
  trial: 'Free Trial',
  trial_extension_1: 'Trial Extended',
  trial_extension_2: 'Trial Extended',
  founding_customer: 'Founding Customer',
  active: 'Active',
  expired: 'Expired',
  suspended: 'Suspended',
  cancelled: 'Cancelled',
};

function UsageBar({ label, used, limit }) {
  const pct = limit === -1 ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const color = pct >= 95 ? 'error' : pct >= 80 ? 'warning' : 'primary';
  return (
    <Box mb={2}>
      <Stack direction="row" justifyContent="space-between" mb={0.5}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" color="text.secondary">
          {limit === -1 ? `${used} / Unlimited` : `${used} / ${limit}`}
        </Typography>
      </Stack>
      {limit !== -1 && <LinearProgress variant="determinate" value={pct} color={color} sx={{ borderRadius: 1, height: 6 }} />}
    </Box>
  );
}

export default function Billing() {
  const navigate = useNavigate();
  const { subscription, plan, entitlements, usage, trialDaysRemaining, loading, refresh } = useSubscription();
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [extLoading, setExtLoading] = useState(false);
  const [extResult, setExtResult] = useState(null);

  useEffect(() => {
    getBillingInvoices()
      .then(d => setInvoices(d.invoices || []))
      .catch(() => setInvoices([]))
      .finally(() => setInvoicesLoading(false));
  }, []);

  const handleRequestExt1 = async () => {
    setExtLoading(true);
    try {
      const res = await requestExtension('1');
      setExtResult({ type: 'success', message: 'Extension granted! Your trial has been extended by 30 days.' });
      refresh();
    } catch (e) {
      setExtResult({ type: 'error', message: e.response?.data?.error || 'Could not process extension request.' });
    } finally {
      setExtLoading(false);
    }
  };

  const handleRequestExt2 = async () => {
    setExtLoading(true);
    try {
      await requestExtension('2', 'Requesting additional time to complete evaluation');
      setExtResult({ type: 'info', message: 'Extension request submitted. Our team will review it within 1–2 business days.' });
      refresh();
    } catch (e) {
      setExtResult({ type: 'error', message: e.response?.data?.error || 'Could not submit extension request.' });
    } finally {
      setExtLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Billing">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
      </MainLayout>
    );
  }

  const status = subscription?.status || 'trial';
  const isTrialActive = ['trial', 'trial_extension_1', 'trial_extension_2', 'founding_customer'].includes(status);
  const isExpired = ['expired', 'suspended'].includes(status);
  const isCancelled = status === 'cancelled';
  const isPaid = status === 'active';
  const canRequestExt1 = isTrialActive && !subscription?.trial_extension_1_requested_at;
  const canRequestExt2 = isTrialActive && subscription?.trial_extension_1_requested_at && !subscription?.trial_extension_2_requested_at;

  return (
    <MainLayout title="Billing & Subscription">
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        {extResult && (
          <Alert severity={extResult.type} onClose={() => setExtResult(null)} sx={{ mb: 2 }}>
            {extResult.message}
          </Alert>
        )}

        {/* Current plan card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                  <Typography variant="h6" fontWeight={700}>
                    {plan?.name || 'Free Trial'}
                  </Typography>
                  <Chip
                    label={STATUS_LABELS[status] || status}
                    color={STATUS_COLORS[status] || 'default'}
                    size="small"
                  />
                  {subscription?.is_founding_customer && (
                    <Chip label="Founding Customer" color="secondary" size="small" />
                  )}
                </Stack>
                {isTrialActive && trialDaysRemaining !== null && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <AccessTimeIcon fontSize="small" color={trialDaysRemaining <= 3 ? 'error' : 'action'} />
                    <Typography variant="body2" color={trialDaysRemaining <= 3 ? 'error.main' : 'text.secondary'}>
                      {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining in trial
                    </Typography>
                  </Stack>
                )}
                {isPaid && subscription?.next_billing_date && (
                  <Typography variant="body2" color="text.secondary">
                    Next billing: {new Date(subscription.next_billing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {subscription.amount_inr ? ` · ₹${subscription.amount_inr.toLocaleString('en-IN')}` : ''}
                  </Typography>
                )}
                {isExpired && (
                  <Typography variant="body2" color="error">
                    Your subscription has ended. Your data is retained for 90 days.
                  </Typography>
                )}
                {isCancelled && (
                  <Typography variant="body2" color="warning.main">
                    Your subscription is cancelled. You keep access for a 7-day grace
                    period, and your data is retained for 90 days. Upgrade to restore
                    full access.
                  </Typography>
                )}
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {!isPaid && (
                  <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/settings/billing/upgrade')}>
                    Upgrade
                  </Button>
                )}
                {isPaid && (
                  <Button variant="outlined" onClick={() => navigate('/settings/billing/upgrade')}>
                    Change Plan
                  </Button>
                )}
              </Stack>
            </Stack>

            {/* Trial extension options */}
            {isTrialActive && (canRequestExt1 || canRequestExt2) && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>Need more time?</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {canRequestExt1 && (
                    <Button size="small" variant="outlined" disabled={extLoading} onClick={handleRequestExt1}>
                      Get 30 more days (free)
                    </Button>
                  )}
                  {canRequestExt2 && (
                    <Button size="small" variant="outlined" disabled={extLoading} onClick={handleRequestExt2}>
                      Request another 30 days
                    </Button>
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                  Extension 1 is instant. Extension 2 requires team approval (1–2 business days).
                </Typography>
              </>
            )}
          </CardContent>
        </Card>

        {/* Usage */}
        {/* Only render usage when the plan actually reports limits. Inactive
            subscriptions (cancelled/expired/none) omit `limits` entirely, and a
            missing limit would otherwise fall back to -1 and read "Unlimited". */}
        {entitlements?.limits && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>This month's usage</Typography>
              <UsageBar
                label="Invoices"
                used={usage?.invoices_created || 0}
                limit={entitlements.limits?.invoices_per_month ?? -1}
              />
              <UsageBar
                label="Active users"
                used={usage?.users_active || 0}
                limit={entitlements.limits?.max_users ?? -1}
              />
              {entitlements.limits?.invoices_per_month !== -1 && (
                <Typography variant="caption" color="text.secondary">
                  Limits reset on the 1st of each month.
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {/* Billing invoices */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>Billing history</Typography>
            {invoicesLoading ? (
              <CircularProgress size={20} />
            ) : invoices.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <ReceiptLongIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No billing invoices yet.</Typography>
                <Typography variant="caption" color="text.secondary">
                  Invoices will appear here after your first subscription payment.
                </Typography>
              </Box>
            ) : (
              <Box>
                {invoices.map(inv => (
                  <Stack key={inv.id} direction="row" justifyContent="space-between" alignItems="center"
                    sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{inv.plan_name} — {inv.billing_cycle}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(inv.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={inv.status}
                        color={inv.status === 'paid' ? 'success' : inv.status === 'pending' ? 'warning' : 'default'}
                        size="small"
                      />
                      <Typography variant="body2" fontWeight={500}>₹{inv.total_inr?.toLocaleString('en-IN')}</Typography>
                    </Stack>
                  </Stack>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
}
