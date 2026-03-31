import axios from 'axios';
import { createApiUrl } from '../../config/api';
import adminAuthService from './adminAuthService';

const API_URL = createApiUrl('/api');

const getHeaders = () => ({
  Authorization: `Bearer ${adminAuthService.getToken()}`,
  'Content-Type': 'application/json',
});

// ── Tenants ──────────────────────────────────────────────────────────────────

export const listTenants = async (page = 0, limit = 50) => {
  const response = await axios.get(`${API_URL}/admin/tenants`, {
    headers: getHeaders(),
    params: { page, limit },
  });
  return response.data;
};

export const getTenant = async (tenantId) => {
  const response = await axios.get(`${API_URL}/admin/tenants/${tenantId}`, {
    headers: getHeaders(),
  });
  return response.data;
};

export const updateTenantStatus = async (tenantId, status) => {
  const response = await axios.patch(
    `${API_URL}/admin/tenants/${tenantId}/status`,
    { status },
    { headers: getHeaders() }
  );
  return response.data;
};

export const deleteTenant = async (tenantId) => {
  const response = await axios.delete(`${API_URL}/admin/tenants/${tenantId}`, {
    headers: getHeaders(),
  });
  return response.data;
};

// ── Users ────────────────────────────────────────────────────────────────────

export const listUsers = async (page = 0, limit = 50) => {
  const response = await axios.get(`${API_URL}/admin/users`, {
    headers: getHeaders(),
    params: { page, limit },
  });
  return response.data;
};

export const updateUserStatus = async (userId, status) => {
  const response = await axios.patch(
    `${API_URL}/admin/users/${userId}/status`,
    { status },
    { headers: getHeaders() }
  );
  return response.data;
};

export const resetUserPassword = async (userId, newPassword) => {
  const response = await axios.post(
    `${API_URL}/admin/users/${userId}/reset-password`,
    { new_password: newPassword },
    { headers: getHeaders() }
  );
  return response.data;
};

// ── Feature Flags ────────────────────────────────────────────────────────────

export const getFeatureFlags = async (tenantId) => {
  const response = await axios.get(`${API_URL}/admin/feature-flags/${tenantId}`, {
    headers: getHeaders(),
  });
  return response.data;
};

export const createFeatureFlags = async (tenantId, flags) => {
  const response = await axios.post(
    `${API_URL}/admin/feature-flags/${tenantId}`,
    { flags },
    { headers: getHeaders() }
  );
  return response.data;
};

export const updateFeatureFlags = async (tenantId, flags) => {
  const response = await axios.patch(
    `${API_URL}/admin/feature-flags/${tenantId}`,
    { flags },
    { headers: getHeaders() }
  );
  return response.data;
};

// ── Stats ────────────────────────────────────────────────────────────────────

export const getSystemStats = async () => {
  const response = await axios.get(`${API_URL}/admin/stats`, {
    headers: getHeaders(),
  });
  return response.data;
};

const adminApiService = {
  listTenants,
  getTenant,
  updateTenantStatus,
  deleteTenant,
  listUsers,
  updateUserStatus,
  resetUserPassword,
  getFeatureFlags,
  createFeatureFlags,
  updateFeatureFlags,
  getSystemStats,
};

export default adminApiService;
