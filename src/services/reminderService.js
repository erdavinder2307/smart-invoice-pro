import axios from 'axios';
import { createApiUrl } from '../config/api';

const BASE = createApiUrl('/api/settings/reminders');

export const getReminderSettings = async () => {
  const res = await axios.get(BASE);
  return res.data;
};

export const saveReminderSettings = async (payload) => {
  const res = await axios.post(BASE, payload);
  return res.data;
};
