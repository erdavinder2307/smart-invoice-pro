import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import MainLayout from '../components/Layout/MainLayout';
import { C } from '../components/common/formStyles';
import { PLANS, TRIAL_DAYS, formatInr, gstPercentLabel, priceWithGst } from '../config/plans';
import { cancelSubscription, createSubscription, getSubscription } from '../services/billingService';
import { openSubscriptionCheckout } from '../utils/razorpayCheckout';

// After Checkout closes, the plan changes only when Razorpay's webhook arrives; wait this long for it.
export const ACTIVATION_WAIT_MS = 60 * 1000;
export const ACTIVATION_POLL_MS = 3 * 1000;

const PERIOD_SUFFIX = { monthly: '/month', yearly: '/year' };

const STATUS_LABELS = {
  active: 'Active',
  pending: 'Payment pending',
  halted: 'Payment failed',
  cancelled: 'Cancelled',
};

const formatDate = (iso) => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const planName = (code) => {
  if (!code || code === 'trial') return 'Free trial';
  const plan = PLANS.find((p) => p.code === code);
  return plan ? plan.name : code.charAt(0).toUpperCase() + code.slice(1);
};

const CurrentPlan = ({ subscription }) => {
  const billing = subscription.billing || {};
  const isTrial = !subscription.plan || subscription.plan === 'trial';
  const trialEnd = formatDate(subscription.trial_ends_at);
  const periodEnd = formatDate(subscription.plan_period_end);

  let detail = null;
  if (isTrial) {
    detail = trialEnd ? `Your ${TRIAL_DAYS}-day free trial ends on ${trialEnd}.` : `${TRIAL_DAYS}-day free trial.`;
  } else if (billing.cancel_at_period_end || billing.status === 'cancelled') {
    detail = periodEnd ? `Cancelled. Your plan keeps working until ${periodEnd}.` : 'Cancelled.';
  } else if (periodEnd) {
    detail = `Paid until ${periodEnd}. Renews automatically.`;
  }

  return (
    <Paper elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: '4px', p: 3, mb: 3 }}>
      <Typography sx={{ fontSize: '0.8125rem', color: C.hint }}>Current plan</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
        <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: C.label }}>
          {planName(subscription.plan)}
        </Typography>
        {billing.status && (
          <Chip
            size="small"
            label={STATUS_LABELS[billing.status] || billing.status}
            color={billing.status === 'active' ? 'success' : billing.status === 'halted' ? 'error' : 'default'}
            variant="outlined"
          />
        )}
      </Box>
      {detail && <Typography sx={{ fontSize: '0.875rem', color: C.label, mt: 1 }}>{detail}</Typography>}
    </Paper>
  );
};

const PlanOption = ({ plan, period, current, disabled, busy, onUpgrade }) => {
  const price = plan.prices[period];
  return (
    <Paper
      elevation={0}
      data-testid={`billing-plan-${plan.code}`}
      sx={{ border: `1px solid ${C.border}`, borderRadius: '4px', p: 3, flex: '1 1 260px' }}
    >
      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: C.label }}>{plan.name}</Typography>
      {price ? (
        <>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: C.label, mt: 1 }}>
            {formatInr(price)}
            <Typography component="span" sx={{ fontSize: '0.875rem', color: C.hint, fontWeight: 400 }}>
              {PERIOD_SUFFIX[period]}
            </Typography>
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: C.hint }}>
            excl. {gstPercentLabel} GST · {formatInr(priceWithGst(price))} charged
          </Typography>
        </>
      ) : (
        <Typography sx={{ fontSize: '0.875rem', color: C.hint, mt: 1 }}>Monthly billing only</Typography>
      )}
      <Typography sx={{ fontSize: '0.8125rem', color: C.label, mt: 1 }}>Up to {plan.seats} users</Typography>
      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}
        disabled={disabled || !price || current}
        onClick={() => onUpgrade(plan, period)}
      >
        {current ? 'Current plan' : busy ? 'Opening payment…' : `Upgrade to ${plan.name}`}
      </Button>
    </Paper>
  );
};

export default function BillingSettings() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const [busyPlan, setBusyPlan] = useState(null);
  const [activating, setActivating] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const pollTimer = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await getSubscription();
      setSubscription(data);
      setError('');
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load your billing details.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => clearTimeout(pollTimer.current);
  }, [load]);

  // Polls until the webhook has made the plan active, measured against a fixed deadline.
  const waitForActivation = useCallback(
    (planCode) => {
      const deadline = Date.now() + ACTIVATION_WAIT_MS;
      setActivating(true);
      const check = async () => {
        let data = null;
        try {
          data = await getSubscription();
          setSubscription(data);
        } catch {
          // keep polling until the deadline
        }
        if (data?.billing?.status === 'active' && data.plan === planCode) {
          setActivating(false);
          setNotice({ severity: 'success', text: `Payment received. You are on ${planName(planCode)} now.` });
          return;
        }
        if (Date.now() >= deadline) {
          setActivating(false);
          setNotice({
            severity: 'info',
            text: 'Your payment is being confirmed. This can take a few minutes; refresh this page later.',
          });
          return;
        }
        pollTimer.current = setTimeout(check, Math.min(ACTIVATION_POLL_MS, deadline - Date.now()));
      };
      check();
    },
    []
  );

  const handleUpgrade = async (plan, chosenPeriod) => {
    setNotice(null);
    setBusyPlan(plan.code);
    try {
      const created = await createSubscription(plan.code, chosenPeriod);
      const paid = await openSubscriptionCheckout({
        keyId: created.key_id,
        subscriptionId: created.subscription_id,
        description: `${plan.name} plan, ${chosenPeriod}`,
        prefill: created.prefill,
      });
      if (paid) {
        waitForActivation(plan.code);
      } else {
        setNotice({ severity: 'info', text: 'Payment was not completed. You can try again at any time.' });
      }
    } catch (err) {
      setNotice({
        severity: 'error',
        text: err.response?.data?.error || err.message || 'Could not start the payment. Please try again.',
      });
    } finally {
      setBusyPlan(null);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const result = await cancelSubscription();
      const until = formatDate(result.plan_period_end);
      setNotice({
        severity: 'success',
        text: until ? `Subscription cancelled. Your plan keeps working until ${until}.` : 'Subscription cancelled.',
      });
      await load();
    } catch (err) {
      setNotice({ severity: 'error', text: err.response?.data?.error || 'Could not cancel. Please try again.' });
    } finally {
      setCancelling(false);
      setConfirmCancel(false);
    }
  };

  const billing = subscription?.billing || {};
  const hasActive = billing.status === 'active';
  const canCancel = hasActive && !billing.cancel_at_period_end;
  const checkoutEnabled = Boolean(subscription?.checkout_enabled);

  return (
    <MainLayout title="Billing">
      <Box sx={{ bgcolor: C.pageBg, minHeight: '100vh', pb: 6 }}>
        <Container maxWidth="md" sx={{ pt: 3, px: 2.5 }}>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: C.label }}>Billing</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: C.hint, mt: 0.25 }}>
              Your plan, payments and subscription.
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <>
              {notice && (
                <Alert severity={notice.severity} sx={{ mb: 3 }} onClose={() => setNotice(null)}>
                  {notice.text}
                </Alert>
              )}
              {activating && (
                <Alert severity="info" icon={<CircularProgress size={18} />} sx={{ mb: 3 }}>
                  Activating your plan… we will confirm as soon as the payment is received.
                </Alert>
              )}

              <CurrentPlan subscription={subscription} />

              {!checkoutEnabled && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Online payment is not switched on yet. To upgrade, write to us from the Contact page.
                </Alert>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: C.label }}>Plans</Typography>
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
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                {PLANS.map((plan) => (
                  <PlanOption
                    key={plan.code}
                    plan={plan}
                    period={period}
                    current={hasActive && subscription.plan === plan.code}
                    disabled={!checkoutEnabled || hasActive || activating || Boolean(busyPlan)}
                    busy={busyPlan === plan.code}
                    onUpgrade={handleUpgrade}
                  />
                ))}
              </Box>
              <Typography sx={{ fontSize: '0.8125rem', color: C.hint, mb: 3 }}>
                Prices in ₹, excl. {gstPercentLabel} GST. You are charged the amount incl. GST, and a GST tax invoice is
                issued for every payment. To change plans, cancel first; your plan keeps working until the end of the
                paid period.
              </Typography>

              {canCancel && (
                <Button
                  variant="outlined"
                  color="error"
                  sx={{ textTransform: 'none' }}
                  onClick={() => setConfirmCancel(true)}
                >
                  Cancel subscription
                </Button>
              )}
            </>
          )}
        </Container>
      </Box>

      <Dialog open={confirmCancel} onClose={() => !cancelling && setConfirmCancel(false)}>
        <DialogTitle>Cancel subscription?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You will not be charged again. Your plan keeps working until
            {formatDate(subscription?.plan_period_end) ? ` ${formatDate(subscription.plan_period_end)}` : ' the end of the paid period'}.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCancel(false)} disabled={cancelling} sx={{ textTransform: 'none' }}>
            Keep subscription
          </Button>
          <Button color="error" onClick={handleCancel} disabled={cancelling} sx={{ textTransform: 'none' }}>
            {cancelling ? 'Cancelling…' : 'Cancel subscription'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
