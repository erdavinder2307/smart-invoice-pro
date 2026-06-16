import axios from 'axios';
import { createApiUrl } from '../config/api';

const API_URL = createApiUrl('/api');

const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  const { token, access_token, refresh_token, user } = response.data;

  const accessToken = access_token || token;

  localStorage.setItem('token', accessToken);
  localStorage.setItem('refresh_token', refresh_token);
  localStorage.setItem('user', JSON.stringify(user));

  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  return accessToken;
};

const demoLogin = async ({ role }) => {
  const response = await axios.post(`${API_URL}/auth/demo-login`, { role });
  const { token, access_token, refresh_token, user } = response.data;
  const accessToken = access_token || token;

  localStorage.setItem('token', accessToken);
  localStorage.setItem('refresh_token', refresh_token);
  localStorage.setItem('user', JSON.stringify(user));
  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  return accessToken;
};

const register = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/register`, credentials);
  return response.data;
};

const clearLocalSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common['Authorization'];
};

const logout = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  const token = localStorage.getItem('token');
  // Clear immediately so route guards and Login cannot read stale tokens.
  clearLocalSession();
  try {
    await axios.post(
      `${API_URL}/auth/logout`,
      { refresh_token: refreshToken },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        _skipAuthRetry: true,
      }
    );
  } catch {
    // Ignore logout API errors — local session is already cleared
  }
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) throw new Error('No refresh token');

  const response = await axios.post(
    `${API_URL}/auth/refresh`,
    { refresh_token: refreshToken },
    { _skipAuthRetry: true }
  );

  const { access_token, token, refresh_token } = response.data;
  const newAccessToken = access_token || token;

  localStorage.setItem('token', newAccessToken);
  if (refresh_token) {
    localStorage.setItem('refresh_token', refresh_token);
  }
  axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
  return newAccessToken;
};

const authService = {
  login,
  demoLogin,
  register,
  logout,
  clearLocalSession,
  refreshAccessToken,
};

export default authService;
