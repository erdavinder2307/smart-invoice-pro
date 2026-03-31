import axios from 'axios';
import adminAuthService from '../../admin/services/adminAuthService';

jest.mock('axios');

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('adminAuthService', () => {
  describe('login', () => {
    it('stores admin token and user on successful super admin login', async () => {
      const mockResponse = {
        data: {
          access_token: 'admin-access-123',
          refresh_token: 'admin-refresh-456',
          user: { id: '1', username: 'superadmin', is_super_admin: true },
        },
      };
      axios.post.mockResolvedValue(mockResponse);

      const result = await adminAuthService.login({ username: 'superadmin', password: 'pass' });

      expect(result.token).toBe('admin-access-123');
      expect(result.user.is_super_admin).toBe(true);
      expect(localStorage.getItem('admin_token')).toBe('admin-access-123');
      expect(localStorage.getItem('admin_refresh_token')).toBe('admin-refresh-456');
      expect(JSON.parse(localStorage.getItem('admin_user')).username).toBe('superadmin');
    });

    it('falls back to token field when access_token is absent', async () => {
      axios.post.mockResolvedValue({
        data: {
          token: 'tok-789',
          refresh_token: 'r',
          user: { id: '1', is_super_admin: true },
        },
      });

      const result = await adminAuthService.login({ username: 'u', password: 'p' });
      expect(result.token).toBe('tok-789');
      expect(localStorage.getItem('admin_token')).toBe('tok-789');
    });

    it('rejects non-super-admin users', async () => {
      axios.post.mockResolvedValue({
        data: {
          access_token: 'token-abc',
          refresh_token: 'ref-abc',
          user: { id: '2', username: 'regular', is_super_admin: false },
        },
      });

      await expect(
        adminAuthService.login({ username: 'regular', password: 'pass' })
      ).rejects.toThrow('Access denied. Super admin privileges required.');

      expect(localStorage.getItem('admin_token')).toBeNull();
    });

    it('rejects when is_super_admin is missing', async () => {
      axios.post.mockResolvedValue({
        data: {
          access_token: 'token-abc',
          refresh_token: 'ref-abc',
          user: { id: '2', username: 'regular' },
        },
      });

      await expect(
        adminAuthService.login({ username: 'regular', password: 'pass' })
      ).rejects.toThrow('Access denied');
    });

    it('throws on network error', async () => {
      axios.post.mockRejectedValue(new Error('Network Error'));
      await expect(
        adminAuthService.login({ username: 'u', password: 'p' })
      ).rejects.toThrow('Network Error');
    });
  });

  describe('logout', () => {
    it('clears admin tokens from localStorage', async () => {
      localStorage.setItem('admin_token', 'tok');
      localStorage.setItem('admin_refresh_token', 'ref');
      localStorage.setItem('admin_user', '{}');
      axios.post.mockResolvedValue({});

      await adminAuthService.logout();

      expect(localStorage.getItem('admin_token')).toBeNull();
      expect(localStorage.getItem('admin_refresh_token')).toBeNull();
      expect(localStorage.getItem('admin_user')).toBeNull();
    });

    it('does not affect regular user tokens', async () => {
      localStorage.setItem('token', 'user-token');
      localStorage.setItem('admin_token', 'admin-token');
      axios.post.mockResolvedValue({});

      await adminAuthService.logout();

      expect(localStorage.getItem('token')).toBe('user-token');
      expect(localStorage.getItem('admin_token')).toBeNull();
    });

    it('clears local state even if API call fails', async () => {
      localStorage.setItem('admin_token', 'tok');
      axios.post.mockRejectedValue(new Error('fail'));

      await adminAuthService.logout();

      expect(localStorage.getItem('admin_token')).toBeNull();
    });
  });

  describe('getToken', () => {
    it('returns admin token from localStorage', () => {
      localStorage.setItem('admin_token', 'my-admin-tok');
      expect(adminAuthService.getToken()).toBe('my-admin-tok');
    });

    it('returns null when no token', () => {
      expect(adminAuthService.getToken()).toBeNull();
    });
  });

  describe('getUser', () => {
    it('returns parsed admin user', () => {
      localStorage.setItem('admin_user', JSON.stringify({ id: '1', is_super_admin: true }));
      expect(adminAuthService.getUser()).toEqual({ id: '1', is_super_admin: true });
    });

    it('returns null for invalid JSON', () => {
      localStorage.setItem('admin_user', 'not-json');
      expect(adminAuthService.getUser()).toBeNull();
    });

    it('returns null when not set', () => {
      expect(adminAuthService.getUser()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when token and super admin user exist', () => {
      localStorage.setItem('admin_token', 'tok');
      localStorage.setItem('admin_user', JSON.stringify({ is_super_admin: true }));
      expect(adminAuthService.isAuthenticated()).toBe(true);
    });

    it('returns false when token is missing', () => {
      localStorage.setItem('admin_user', JSON.stringify({ is_super_admin: true }));
      expect(adminAuthService.isAuthenticated()).toBe(false);
    });

    it('returns false when user is not super admin', () => {
      localStorage.setItem('admin_token', 'tok');
      localStorage.setItem('admin_user', JSON.stringify({ is_super_admin: false }));
      expect(adminAuthService.isAuthenticated()).toBe(false);
    });

    it('returns false when nothing is set', () => {
      expect(adminAuthService.isAuthenticated()).toBe(false);
    });
  });
});
