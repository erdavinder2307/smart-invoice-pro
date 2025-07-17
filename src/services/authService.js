import axios from 'axios';
import { createApiUrl } from '../config/api';

const API_URL = createApiUrl('/api');

const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  return response.data.token;
};

const authService = {
  login,
};

export default authService;
