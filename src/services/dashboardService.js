import axios from 'axios';
import { createApiUrl } from '../config/api';

const DASHBOARD_BASE = '/api/dashboard';

export const getDashboardSummary = async (params) => {
  const query = new URLSearchParams(params).toString();
  const response = await axios.get(createApiUrl(`${DASHBOARD_BASE}/summary?${query}`));
  return response.data;
};

export const getDashboardMonthlyRevenue = async (params) => {
  const query = new URLSearchParams(params).toString();
  const response = await axios.get(createApiUrl(`${DASHBOARD_BASE}/monthly-revenue?${query}`));
  return response.data;
};

export const getDashboardLowStock = async () => {
  const response = await axios.get(createApiUrl(`${DASHBOARD_BASE}/low-stock`));
  return response.data;
};

export const getDashboardRecentInvoices = async (params) => {
  const query = new URLSearchParams(params).toString();
  const response = await axios.get(createApiUrl(`${DASHBOARD_BASE}/recent-invoices?${query}`));
  return response.data;
};
