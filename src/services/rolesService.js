import axios from 'axios';
import { createApiUrl } from '../config/api';

// ── Roles ─────────────────────────────────────────────────────────────────────
export const getRoles = () =>
  axios.get(createApiUrl('/api/settings/roles')).then((r) => r.data);

export const createRole = (data) =>
  axios.post(createApiUrl('/api/settings/roles'), data).then((r) => r.data);

export const updateRole = (id, data) =>
  axios.put(createApiUrl(`/api/settings/roles/${id}`), data).then((r) => r.data);

export const deleteRole = (id) =>
  axios.delete(createApiUrl(`/api/settings/roles/${id}`)).then((r) => r.data);

// ── Users ─────────────────────────────────────────────────────────────────────
export const getSettingsUsers = () =>
  axios.get(createApiUrl('/api/settings/users')).then((r) => r.data);

export const inviteUser = (data) =>
  axios.post(createApiUrl('/api/settings/users'), data).then((r) => r.data);

export const updateSettingsUser = (id, data) =>
  axios.put(createApiUrl(`/api/settings/users/${id}`), data).then((r) => r.data);

export const deactivateUser = (id) =>
  axios.delete(createApiUrl(`/api/settings/users/${id}`)).then((r) => r.data);

// ── Permissions ───────────────────────────────────────────────────────────────
export const getMyPermissions = () =>
  axios.get(createApiUrl('/api/settings/permissions')).then((r) => r.data);
