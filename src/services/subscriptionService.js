import axios from 'axios';
import { createApiUrl } from '../config/api';

export const getPublicPlans = async () => {
  const res = await axios.get(createApiUrl('/api/plans'));
  return res.data;
};

export const getCurrentSubscription = async () => {
  const res = await axios.get(createApiUrl('/api/subscription/current'));
  return res.data;
};

export const getSubscriptionUsage = async () => {
  const res = await axios.get(createApiUrl('/api/subscription/usage'));
  return res.data;
};

export const requestExtension = async (extensionType, reason = '') => {
  const res = await axios.post(createApiUrl('/api/subscription/request-extension'), {
    extension_type: String(extensionType),
    reason,
  });
  return res.data;
};

export const cancelSubscription = async (reason = '') => {
  const res = await axios.post(createApiUrl('/api/subscription/cancel'), { reason });
  return res.data;
};

export const createPaymentLink = async (planId, billingCycle) => {
  const res = await axios.post(createApiUrl('/api/billing/create-payment-link'), {
    plan_id: planId,
    billing_cycle: billingCycle,
  });
  return res.data;
};

export const getBillingInvoices = async () => {
  const res = await axios.get(createApiUrl('/api/billing/invoices'));
  return res.data;
};
