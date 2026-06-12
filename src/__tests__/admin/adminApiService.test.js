import axios from 'axios';
import adminApiService from '../../admin/services/adminApiService';
import adminAuthService from '../../admin/services/adminAuthService';

jest.mock('axios');

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  // Set up admin auth state
  localStorage.setItem('admin_token', 'test-admin-token');
  localStorage.setItem('admin_user', JSON.stringify({ id: '1', is_super_admin: true }));
});

describe('adminApiService', () => {
  describe('Tenant APIs', () => {
    it('listTenants sends correct request', async () => {
      axios.get.mockResolvedValue({ data: { tenants: [], total: 0 } });
      const result = await adminApiService.listTenants(0, 25);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/admin/tenants'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-admin-token',
          }),
          params: { page: 0, limit: 25 },
        })
      );
      expect(result.tenants).toEqual([]);
    });

    it('createTenant sends POST with name and plan', async () => {
      axios.post.mockResolvedValue({ data: { id: 't-new', name: 'New Org' } });
      const result = await adminApiService.createTenant({
        name: 'New Org',
        plan: 'trial',
      });
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/admin/tenants'),
        { name: 'New Org', plan: 'trial', status: 'active' },
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-admin-token' }),
        })
      );
      expect(result.name).toBe('New Org');
    });

    it('getTenant sends correct request', async () => {
      axios.get.mockResolvedValue({ data: { id: 't-1', name: 'Test' } });
      const result = await adminApiService.getTenant('t-1');
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/admin/tenants/t-1'),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-admin-token' }),
        })
      );
      expect(result.id).toBe('t-1');
    });

    it('updateTenantStatus sends PATCH', async () => {
      axios.patch.mockResolvedValue({ data: { status: 'inactive' } });
      const result = await adminApiService.updateTenantStatus('t-1', 'inactive');
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/tenants/t-1/status'),
        { status: 'inactive' },
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-admin-token' }),
        })
      );
      expect(result.status).toBe('inactive');
    });

    it('deleteTenant sends DELETE', async () => {
      axios.delete.mockResolvedValue({ data: { message: 'Tenant deleted' } });
      const result = await adminApiService.deleteTenant('t-1');
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/admin/tenants/t-1'),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-admin-token' }),
        })
      );
      expect(result.message).toBe('Tenant deleted');
    });
  });

  describe('User APIs', () => {
    it('listUsers sends correct request', async () => {
      axios.get.mockResolvedValue({ data: { users: [], total: 0 } });
      await adminApiService.listUsers(1, 50);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/admin/users'),
        expect.objectContaining({ params: { page: 1, limit: 50 } })
      );
    });

    it('updateUserStatus sends PATCH', async () => {
      axios.patch.mockResolvedValue({ data: { status: 'suspended' } });
      await adminApiService.updateUserStatus('u-1', 'suspended');
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/users/u-1/status'),
        { status: 'suspended' },
        expect.any(Object)
      );
    });

    it('resetUserPassword sends POST', async () => {
      axios.post.mockResolvedValue({ data: { message: 'Password reset successfully' } });
      await adminApiService.resetUserPassword('u-1', 'newpass123');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/admin/users/u-1/reset-password'),
        { new_password: 'newpass123' },
        expect.any(Object)
      );
    });
  });

  describe('Feature Flag APIs', () => {
    it('getFeatureFlags sends correct request', async () => {
      axios.get.mockResolvedValue({ data: { tenant_id: 't-1', flags: {} } });
      await adminApiService.getFeatureFlags('t-1');
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/admin/feature-flags/t-1'),
        expect.any(Object)
      );
    });

    it('createFeatureFlags sends POST', async () => {
      axios.post.mockResolvedValue({ data: { flags: { invoicing: true } } });
      await adminApiService.createFeatureFlags('t-1', { invoicing: true });
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/admin/feature-flags/t-1'),
        { flags: { invoicing: true } },
        expect.any(Object)
      );
    });

    it('updateFeatureFlags sends PATCH', async () => {
      axios.patch.mockResolvedValue({ data: { flags: { invoicing: false } } });
      await adminApiService.updateFeatureFlags('t-1', { invoicing: false });
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/feature-flags/t-1'),
        { flags: { invoicing: false } },
        expect.any(Object)
      );
    });
  });

  describe('Stats API', () => {
    it('getSystemStats sends correct request', async () => {
      axios.get.mockResolvedValue({
        data: { total_users: 10, active_users: 8, total_tenants: 3 },
      });
      const result = await adminApiService.getSystemStats();
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/admin/stats'),
        expect.any(Object)
      );
      expect(result.total_users).toBe(10);
    });
  });

  describe('Audit Logs API', () => {
    it('getAdminAuditLogs sends correct request', async () => {
      axios.get.mockResolvedValue({ data: { logs: [], total: 0 } });
      const result = await adminApiService.getAdminAuditLogs({ action: 'DELETE', page: 0, limit: 25 });
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/admin/audit-logs'),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-admin-token' }),
          params: { action: 'DELETE', page: 0, limit: 25 },
        })
      );
      expect(result.logs).toEqual([]);
    });
  });

  describe('Auth isolation', () => {
    it('uses admin_token, not regular token', async () => {
      localStorage.setItem('token', 'regular-user-token');
      axios.get.mockResolvedValue({ data: {} });
      await adminApiService.getSystemStats();
      const callHeaders = axios.get.mock.calls[0][1].headers;
      expect(callHeaders.Authorization).toBe('Bearer test-admin-token');
      expect(callHeaders.Authorization).not.toContain('regular-user-token');
    });
  });
});
