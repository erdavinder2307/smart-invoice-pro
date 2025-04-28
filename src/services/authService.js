import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';

const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  return response.data.token;
};

const authService = {
  login,
};

export default authService;
