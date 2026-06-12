import axios from 'axios';
import { createApiUrl } from '../config/api';

const BASE = createApiUrl('/api/settings/integrations');

export const getIntegrationSettings = async () => {
  const { data } = await axios.get(BASE);
  return data;
};

export const saveIntegrationSettings = async (payload) => {
  const { data } = await axios.put(BASE, payload);
  return data;
};

export const sendTestEmail = async (to) => {
  const { data } = await axios.post(`${BASE}/test-email`, { to });
  return data;
};

export const getWebhookLogs = async () => {
  const { data } = await axios.get(`${BASE}/webhook-logs`);
  return data;
};
