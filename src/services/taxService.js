import axios from 'axios';
import { createApiUrl } from '../config/api';

// ── Tax Rates ─────────────────────────────────────────────────────────────────

export const getTaxRates = async () => {
  const response = await axios.get(createApiUrl('/api/settings/taxes'));
  return response.data;
};

export const createTaxRate = async (data) => {
  const response = await axios.post(createApiUrl('/api/settings/taxes'), data);
  return response.data;
};

export const updateTaxRate = async (id, data) => {
  const response = await axios.put(createApiUrl(`/api/settings/taxes/${id}`), data);
  return response.data;
};

export const deleteTaxRate = async (id) => {
  const response = await axios.delete(createApiUrl(`/api/settings/taxes/${id}`));
  return response.data;
};

// ── GST Config ────────────────────────────────────────────────────────────────

export const getGstConfig = async () => {
  const response = await axios.get(createApiUrl('/api/settings/gst-config'));
  return response.data;
};

// ── Invoice Tax Calculation ───────────────────────────────────────────────────

/**
 * @param {Array}   items            - invoice line items [{quantity, rate, discount, tax, ...}]
 * @param {string}  customerId       - customer id (to auto-resolve customer state + gst_treatment)
 * @param {string}  placeOfSupply    - optional override: destination state name
 * @param {boolean} isGstApplicable
 * @returns {Promise<{cgst_amount, sgst_amount, igst_amount, total_tax, tax_type, items_with_tax}>}
 */
export const calculateInvoiceTax = async ({
  items,
  customerId,
  placeOfSupply = '',
  isGstApplicable = true,
}) => {
  const response = await axios.post(createApiUrl('/api/invoices/calculate-tax'), {
    items,
    customer_id: customerId,
    place_of_supply: placeOfSupply,
    is_gst_applicable: isGstApplicable,
  });
  return response.data;
};
