import axios from 'axios';
import { createApiUrl } from '../config/api';

const API_VENDORS = createApiUrl('/api/vendors');

const compactParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );

export const getVendorsList = async (params = {}, signal) => {
  const response = await axios.get(API_VENDORS, {
    params: compactParams(params),
    signal,
  });
  return response.data;
};

export const deleteVendorById = async (id) => {
  const response = await axios.delete(`${API_VENDORS}/${id}`);
  return response.data;
};

export const bulkVendorAction = async (payload) => {
  const response = await axios.post(`${API_VENDORS}/bulk`, payload);
  return response.data;
};
