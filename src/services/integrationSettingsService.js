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
