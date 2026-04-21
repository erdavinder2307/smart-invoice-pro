import axios from 'axios';
import { createApiUrl } from '../../config/api';

const API_URL = createApiUrl('/api');

const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_REFRESH_TOKEN_KEY = 'admin_refresh_token';
const ADMIN_USER_KEY = 'admin_user';

const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  const { token, access_token, refresh_token, user } = response.data;

  if (!user?.is_super_admin) {
    throw new Error('Access denied. Super admin privileges required.');
  }

  const accessToken = access_token || token;

  localStorage.setItem(ADMIN_TOKEN_KEY, accessToken);
  localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, refresh_token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));

  return { token: accessToken, user };
};

const logout = async () => {
  const refreshToken = localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
  const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
  try {
    await axios.post(
      `${API_URL}/auth/logout`,
      { refresh_token: refreshToken },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
  } catch {
    // Ignore logout API errors
  }
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
};

const getToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

const getUser = () => {
  try {
    const stored = localStorage.getItem(ADMIN_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const isAuthenticated = () => {
  const token = getToken();
  const user = getUser();
  return !!(token && user?.is_super_admin);
};

const adminAuthService = {
  login,
  logout,
  getToken,
  getUser,
  isAuthenticated,
  ADMIN_TOKEN_KEY,
  ADMIN_REFRESH_TOKEN_KEY,
  ADMIN_USER_KEY,
};

export default adminAuthService;
