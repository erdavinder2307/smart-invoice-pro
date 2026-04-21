import axios from 'axios';
import { createApiUrl } from '../config/api';

const BRANDING_URL = createApiUrl('/api/settings/branding');

export async function getBranding() {
  const { data } = await axios.get(BRANDING_URL);
  return data;
}

export async function updateBranding(payload) {
  const { data } = await axios.put(BRANDING_URL, payload);
  return data;
}
