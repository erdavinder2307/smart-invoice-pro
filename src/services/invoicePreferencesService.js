import axios from 'axios';
import { createApiUrl } from '../config/api';

const PREFS_URL = createApiUrl('/api/settings/invoice-preferences');

export async function getInvoicePreferences() {
  const { data } = await axios.get(PREFS_URL);
  return data;
}

export async function updateInvoicePreferences(payload) {
  const { data } = await axios.put(PREFS_URL, payload);
  return data;
}
