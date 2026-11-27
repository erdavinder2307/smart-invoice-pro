import axios from 'axios';
import { createApiUrl } from '../config/api';

const BASE = createApiUrl('/api/billing');

// Public: plans, prices and whether online checkout is switched on.
export const getBillingPlans = async () => {
  const { data } = await axios.get(`${BASE}/plans`);
  return data;
};

// Admin: the organization's plan, trial or paid period end and billing status.
export const getSubscription = async () => {
  const { data } = await axios.get(`${BASE}/subscription`);
  return data;
};

// Admin: start a Razorpay subscription; returns { subscription_id, key_id, prefill } for Checkout.
export const createSubscription = async (planCode, period) => {
  const { data } = await axios.post(`${BASE}/subscriptions`, { plan_code: planCode, period });
  return data;
};

// Admin: cancel at the end of the paid period.
export const cancelSubscription = async () => {
  const { data } = await axios.post(`${BASE}/subscriptions/cancel`);
  return data;
};

// Admin: download one GST tax invoice as a PDF (saved as e.g. SB-2026-27-0001.pdf).
export const downloadTaxInvoicePdf = async (invoice) => {
  const response = await axios.get(`${BASE}/invoices/${encodeURIComponent(invoice.id)}/pdf`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${(invoice.number || invoice.id).replace(/\//g, '-')}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
