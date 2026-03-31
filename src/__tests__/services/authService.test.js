import axios from 'axios';
import authService from '../../services/authService';

jest.mock('axios');

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('authService', () => {
  describe('login', () => {
    it('stores token, refresh_token, and user in localStorage', async () => {
      const mockResponse = {
        data: {
          access_token: 'access-123',
          refresh_token: 'refresh-456',
          user: { id: '1', username: 'test' },
        },
      };
      axios.post.mockResolvedValue(mockResponse);

      const result = await authService.login({ username: 'test', password: 'pass' });

      expect(result).toBe('access-123');
      expect(localStorage.getItem('token')).toBe('access-123');
      expect(localStorage.getItem('refresh_token')).toBe('refresh-456');
      expect(JSON.parse(localStorage.getItem('user'))).toEqual({ id: '1', username: 'test' });
      expect(axios.defaults.headers.common['Authorization']).toBe('Bearer access-123');
    });

    it('falls back to token field when access_token is absent', async () => {
      axios.post.mockResolvedValue({
        data: { token: 'tok-789', refresh_token: 'r', user: { id: '1' } },
      });

      const result = await authService.login({ username: 'u', password: 'p' });
      expect(result).toBe('tok-789');
      expect(localStorage.getItem('token')).toBe('tok-789');
    });

    it('throws on network error', async () => {
      axios.post.mockRejectedValue(new Error('Network Error'));
      await expect(authService.login({ username: 'u', password: 'p' })).rejects.toThrow('Network Error');
    });
  });

  describe('register', () => {
    it('returns response data', async () => {
      axios.post.mockResolvedValue({ data: { message: 'User created' } });
      const result = await authService.register({ username: 'new', password: 'pass' });
      expect(result).toEqual({ message: 'User created' });
    });

    it('throws on duplicate username', async () => {
      axios.post.mockRejectedValue(new Error('409'));
      await expect(authService.register({ username: 'dup', password: 'p' })).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('clears localStorage and auth headers', async () => {
      localStorage.setItem('token', 'abc');
      localStorage.setItem('refresh_token', 'xyz');
      localStorage.setItem('user', '{}');
      axios.defaults.headers.common['Authorization'] = 'Bearer abc';

      axios.post.mockResolvedValue({});
      await authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
    });

    it('clears localStorage even if API call fails', async () => {
      localStorage.setItem('token', 'abc');
      localStorage.setItem('refresh_token', 'xyz');
      axios.post.mockRejectedValue(new Error('fail'));

      await authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  describe('refreshAccessToken', () => {
    it('refreshes and stores new token', async () => {
      localStorage.setItem('refresh_token', 'old-refresh');
      axios.post.mockResolvedValue({
        data: { access_token: 'new-access', refresh_token: 'new-refresh' },
      });

      const result = await authService.refreshAccessToken();

      expect(result).toBe('new-access');
      expect(localStorage.getItem('token')).toBe('new-access');
      expect(localStorage.getItem('refresh_token')).toBe('new-refresh');
    });

    it('throws when no refresh token exists', async () => {
      await expect(authService.refreshAccessToken()).rejects.toThrow('No refresh token');
    });
  });
});
