import axios from 'axios';
import { createApiUrl } from '../config/api';

const API_RECURRING = createApiUrl('/api/recurring-profiles');

const compactParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );

export const getRecurringProfilesList = async (params = {}, signal) => {
  const response = await axios.get(API_RECURRING, {
    params: compactParams(params),
    signal,
  });
  return response.data;
};

export const getRecurringProfileById = async (id) => {
  const response = await axios.get(`${API_RECURRING}/${id}`);
  return response.data;
};

export const createRecurringProfile = async (payload) => {
  const response = await axios.post(API_RECURRING, payload);
  return response.data;
};

export const updateRecurringProfile = async (id, payload) => {
  const response = await axios.put(`${API_RECURRING}/${id}`, payload);
  return response.data;
};

export const deleteRecurringProfile = async (id) => {
  const response = await axios.delete(`${API_RECURRING}/${id}`);
  return response.data;
};

export const patchRecurringProfileAction = async (id, action) => {
  const response = await axios.patch(`${API_RECURRING}/${id}`, { action });
  return response.data;
};

export const bulkRecurringProfileAction = async (payload) => {
  const response = await axios.post(`${API_RECURRING}/bulk`, payload);
  return response.data;
};
