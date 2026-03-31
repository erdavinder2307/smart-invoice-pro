import axios from 'axios';
import { createApiUrl } from '../config/api';

const BASE = createApiUrl('/api/notifications');

export const getNotifications = async ({ limit = 50, unreadOnly = false } = {}) => {
  const { data } = await axios.get(BASE, {
    params: { limit, unread_only: unreadOnly },
  });
  return data; // { notifications: [], unread_count: number }
};

export const markNotificationRead = async (id) => {
  const { data } = await axios.put(`${BASE}/${id}/read`);
  return data;
};

export const markAllRead = async () => {
  const { data } = await axios.put(`${BASE}/read-all`);
  return data;
};
