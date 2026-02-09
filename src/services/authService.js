import axios from 'axios';
import { createApiUrl } from '../config/api';

const API_URL = createApiUrl('/api');

const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  const { token, user } = response.data;

  // Store both token and user information
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  return token;
};

const register = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/register`, credentials);
  return response.data;
};

const logout = async () => {
  const token = localStorage.getItem('token');
  try {
    await axios.post(`${API_URL}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common['Authorization'];
};

const authService = {
  login,
  register,
  logout,
};

export default authService;
