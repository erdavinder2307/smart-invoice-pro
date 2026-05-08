import axios from 'axios';
import { createApiUrl } from '../config/api';

const BASE = createApiUrl('/api/me');

export const getMe = async () => {
  const res = await axios.get(BASE);
  return res.data;
};

export const updateMe = async (data) => {
  const res = await axios.put(BASE, data);
  return res.data;
};

export const getPreferences = async () => {
  const res = await axios.get(`${BASE}/preferences`);
  return res.data;
};

export const updatePreferences = async (data) => {
  const res = await axios.put(`${BASE}/preferences`, data);
  return res.data;
};

export const getMeSessions = async () => {
  const res = await axios.get(`${BASE}/sessions`);
  return res.data;
};

export const revokeSession = async (sessionId) => {
  const res = await axios.delete(`${BASE}/sessions/${sessionId}`);
  return res.data;
};

export const changePassword = async ({ current_password, new_password }) => {
  const res = await axios.put(`${BASE}/password`, { current_password, new_password });
  return res.data;
};
