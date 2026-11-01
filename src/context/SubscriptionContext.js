import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getCurrentSubscription } from '../services/subscriptionService';

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [plan, setPlan] = useState(null);
  const [entitlements, setEntitlements] = useState(null);
  const [usage, setUsage] = useState(null);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setPlan(null);
      setEntitlements(null);
      setUsage(null);
      setTrialDaysRemaining(null);
      setLoading(false);
      return;
    }
    try {
      const data = await getCurrentSubscription();
      setSubscription(data.subscription || null);
      setPlan(data.plan || null);
      setEntitlements(data.entitlements || null);
      setUsage(data.usage || null);
      setTrialDaysRemaining(data.trial_days_remaining ?? null);
    } catch (e) {
      // Non-fatal — app works without subscription data
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isTrialActive = () => {
    const status = subscription?.status;
    return ['trial', 'trial_extension_1', 'trial_extension_2', 'founding_customer'].includes(status);
  };

  const isExpired = () => {
    const status = subscription?.status;
    return ['expired', 'suspended'].includes(status);
  };

  const isPaid = () => subscription?.status === 'active';

  const showTrialBanner = () => {
    if (!isTrialActive()) return false;
    return trialDaysRemaining !== null && trialDaysRemaining <= 10;
  };

  const canCreate = (resource) => {
    if (!entitlements) return true;
    if (entitlements.read_only || entitlements.upgrade_required) return false;
    const key = `can_create_${resource}`;
    return entitlements[key] !== false;
  };

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      plan,
      entitlements,
      usage,
      trialDaysRemaining,
      loading,
      refresh,
      isTrialActive,
      isExpired,
      isPaid,
      showTrialBanner,
      canCreate,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used inside SubscriptionProvider');
  return ctx;
};

export default SubscriptionContext;
