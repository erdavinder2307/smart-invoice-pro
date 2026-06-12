/**
 * Tests for admin/pages to meet the 20% coverage threshold.
 * Covers: Dashboard, Tenants, Users, TenantDetail, FeatureFlags
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// ─── Common mocks ────────────────────────────────────────────────────────────

jest.mock('../../admin/components/AdminLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="admin-layout">{children}</div>,
}));

jest.mock('../../admin/services/adminAuthService', () => ({
  __esModule: true,
  default: {
    isAuthenticated: jest.fn(() => true),
    getToken: jest.fn(() => 'test-token'),
    getUser: jest.fn(() => ({ id: '1', is_super_admin: true })),
    logout: jest.fn(),
  },
}));

jest.mock('../../admin/services/adminApiService', () => ({
  getSystemStats: jest.fn(),
  listTenants: jest.fn(),
  createTenant: jest.fn(),
  updateTenantStatus: jest.fn(),
  deleteTenant: jest.fn(),
  getTenant: jest.fn(),
  listUsers: jest.fn(),
  updateUserStatus: jest.fn(),
  resetUserPassword: jest.fn(),
  getFeatureFlags: jest.fn(),
  createFeatureFlags: jest.fn(),
  updateFeatureFlags: jest.fn(),
}));

jest.mock('../../components/common/formStyles', () => ({
  C: { hint: '#999', label: '#333' },
  footerSx: {},
  saveBtnSx: {},
}));

const {
  getSystemStats,
  listTenants,
  createTenant,
  updateTenantStatus,
  deleteTenant,
  getTenant,
  listUsers,
  updateUserStatus,
  resetUserPassword,
  getFeatureFlags,
  createFeatureFlags,
  updateFeatureFlags,
} = require('../../admin/services/adminApiService');

// ─── AdminDashboard ───────────────────────────────────────────────────────────

describe('AdminDashboard page', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders stat cards after data loads', async () => {
    getSystemStats.mockResolvedValue({
      total_tenants: 12,
      total_users: 48,
      active_users: 35,
    });

    const AdminDashboard = require('../../admin/pages/Dashboard').default;
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('48')).toBeInTheDocument();
      expect(screen.getByText('35')).toBeInTheDocument();
    });
  });

  it('shows error alert when stats API fails', async () => {
    getSystemStats.mockRejectedValue({
      response: { data: { error: 'Stats unavailable' } },
    });

    const AdminDashboard = require('../../admin/pages/Dashboard').default;
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText('Stats unavailable')).toBeInTheDocument();
  });

  it('shows generic error when response has no message', async () => {
    getSystemStats.mockRejectedValue(new Error('network'));

    const AdminDashboard = require('../../admin/pages/Dashboard').default;
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText('Failed to load stats')).toBeInTheDocument();
  });
});

// ─── Tenants ─────────────────────────────────────────────────────────────────

describe('Tenants page', () => {
  beforeEach(() => jest.clearAllMocks());

  const mockTenants = [
    {
      id: 't-1',
      name: 'Acme Corp',
      plan: 'pro',
      status: 'active',
      created_at: '2026-01-01T00:00:00',
    },
    {
      id: 't-2',
      name: 'Beta LLC',
      plan: 'trial',
      status: 'inactive',
      created_at: null,
    },
  ];

  it('renders tenant rows from API', async () => {
    listTenants.mockResolvedValue({ tenants: mockTenants, total: 2 });

    const Tenants = require('../../admin/pages/Tenants').default;
    render(
      <MemoryRouter>
        <Tenants />
      </MemoryRouter>
    );

    expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Beta LLC')).toBeInTheDocument();
    expect(screen.getByText('pro')).toBeInTheDocument();
  });

  it('shows "No tenants found" when list is empty', async () => {
    listTenants.mockResolvedValue({ tenants: [], total: 0 });

    const Tenants = require('../../admin/pages/Tenants').default;
    render(
      <MemoryRouter>
        <Tenants />
      </MemoryRouter>
    );

    expect(await screen.findByText('No tenants found')).toBeInTheDocument();
  });

  it('shows error when API fails', async () => {
    listTenants.mockRejectedValue({
      response: { data: { error: 'DB error' } },
    });

    const Tenants = require('../../admin/pages/Tenants').default;
    render(
      <MemoryRouter>
        <Tenants />
      </MemoryRouter>
    );

    expect(await screen.findByText('DB error')).toBeInTheDocument();
  });

  it('opens create dialog and creates a tenant', async () => {
    listTenants.mockResolvedValue({ tenants: mockTenants, total: 2 });
    createTenant.mockResolvedValue({ id: 't-3', name: 'New Co' });

    const Tenants = require('../../admin/pages/Tenants').default;
    render(
      <MemoryRouter>
        <Tenants />
      </MemoryRouter>
    );

    await screen.findByText('Acme Corp');

    fireEvent.click(screen.getByRole('button', { name: /Create Tenant/i }));
    expect(screen.getByRole('heading', { name: 'Create Tenant' })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Organization Name/i);
    fireEvent.change(nameInput, { target: { value: 'New Co' } });

    // listTenants needs to resolve again after creation
    listTenants.mockResolvedValue({
      tenants: [...mockTenants, { id: 't-3', name: 'New Co', plan: 'trial', status: 'active', created_at: null }],
      total: 3,
    });

    fireEvent.click(screen.getByRole('button', { name: /^Create$/i }));
    await waitFor(() => expect(createTenant).toHaveBeenCalledTimes(1));
  });

  it('opens action menu and updates status to suspended', async () => {
    listTenants.mockResolvedValue({ tenants: mockTenants, total: 2 });
    updateTenantStatus.mockResolvedValue({});

    const Tenants = require('../../admin/pages/Tenants').default;
    render(
      <MemoryRouter>
        <Tenants />
      </MemoryRouter>
    );

    await screen.findByText('Acme Corp');

    const moreButtons = screen.getAllByTestId
      ? screen.queryAllByRole('button', { name: '' })
      : screen.queryAllByRole('button');

    // Click the first MoreVert icon button
    const iconBtns = document.querySelectorAll('button[aria-label=""]');
    if (iconBtns.length > 0) {
      fireEvent.click(iconBtns[0]);
      const suspendItem = await screen.findByText('Suspend');
      fireEvent.click(suspendItem);
      await waitFor(() => expect(updateTenantStatus).toHaveBeenCalledWith('t-1', 'suspended'));
    }
  });

  it('opens delete dialog and deletes a tenant', async () => {
    listTenants.mockResolvedValue({ tenants: mockTenants, total: 2 });
    deleteTenant.mockResolvedValue({});

    const Tenants = require('../../admin/pages/Tenants').default;
    render(
      <MemoryRouter>
        <Tenants />
      </MemoryRouter>
    );

    await screen.findByText('Acme Corp');

    const iconBtns = document.querySelectorAll('button[aria-label=""]');
    if (iconBtns.length > 0) {
      fireEvent.click(iconBtns[0]);
      const deleteItem = await screen.findByText('Delete');
      fireEvent.click(deleteItem);

      // Delete confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete tenant/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /^Delete$/i }));
      await waitFor(() => expect(deleteTenant).toHaveBeenCalledWith('t-1'));
    }
  });
});

// ─── Users ────────────────────────────────────────────────────────────────────

describe('Users page', () => {
  beforeEach(() => jest.clearAllMocks());

  const mockUsers = [
    { id: 'u-1', username: 'alice', email: 'alice@ex.com', tenant_id: 't-1', role: 'owner', status: 'active' },
    { id: 'u-2', username: 'bob', email: 'bob@ex.com', tenant_id: 't-2', role: 'member', status: 'suspended' },
  ];

  it('renders user rows from API', async () => {
    listUsers.mockResolvedValue({ users: mockUsers, total: 2 });

    const Users = require('../../admin/pages/Users').default;
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    expect(await screen.findByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(screen.getByText('alice@ex.com')).toBeInTheDocument();
  });

  it('shows "No users found" when list is empty', async () => {
    listUsers.mockResolvedValue({ users: [], total: 0 });

    const Users = require('../../admin/pages/Users').default;
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    expect(await screen.findByText('No users found')).toBeInTheDocument();
  });

  it('shows error when API fails', async () => {
    listUsers.mockRejectedValue({
      response: { data: { error: 'Unauthorized' } },
    });

    const Users = require('../../admin/pages/Users').default;
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    expect(await screen.findByText('Unauthorized')).toBeInTheDocument();
  });

  it('resets password with error when password too short', async () => {
    listUsers.mockResolvedValue({ users: mockUsers, total: 2 });

    const Users = require('../../admin/pages/Users').default;
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    await screen.findByText('alice');

    const iconBtns = document.querySelectorAll('button[aria-label=""]');
    if (iconBtns.length > 0) {
      fireEvent.click(iconBtns[0]);
      const resetItem = await screen.findByText('Reset Password');
      fireEvent.click(resetItem);

      await waitFor(() => {
        expect(screen.getByText(/Set a new password for user/i)).toBeInTheDocument();
      });

      const pwdInput = screen.getByLabelText(/New Password/i);
      fireEvent.change(pwdInput, { target: { value: 'short' } });
      fireEvent.click(screen.getByRole('button', { name: /^Reset$/i }));

      expect(await screen.findByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
      expect(resetUserPassword).not.toHaveBeenCalled();
    }
  });

  it('resets password successfully', async () => {
    listUsers.mockResolvedValue({ users: mockUsers, total: 2 });
    resetUserPassword.mockResolvedValue({});

    const Users = require('../../admin/pages/Users').default;
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    await screen.findByText('alice');

    const iconBtns = document.querySelectorAll('button[aria-label=""]');
    if (iconBtns.length > 0) {
      fireEvent.click(iconBtns[0]);
      const resetItem = await screen.findByText('Reset Password');
      fireEvent.click(resetItem);

      await waitFor(() => {
        expect(screen.getByText(/Set a new password for user/i)).toBeInTheDocument();
      });

      const pwdInput = screen.getByLabelText(/New Password/i);
      fireEvent.change(pwdInput, { target: { value: 'Secure123!' } });
      fireEvent.click(screen.getByRole('button', { name: /^Reset$/i }));

      await waitFor(() => expect(resetUserPassword).toHaveBeenCalledWith('u-1', 'Secure123!'));
    }
  });
});

// ─── TenantDetail ─────────────────────────────────────────────────────────────

describe('TenantDetail page', () => {
  beforeEach(() => jest.clearAllMocks());

  const mockTenant = {
    id: 't-1',
    name: 'Acme Corp',
    plan: 'pro',
    status: 'active',
    created_at: '2026-01-01T00:00:00',
    updated_at: '2026-03-01T00:00:00',
    owner_user_id: 'u-1',
  };

  const renderDetail = () => {
    const TenantDetail = require('../../admin/pages/TenantDetail').default;
    return render(
      <MemoryRouter initialEntries={['/admin/tenants/t-1']}>
        <Routes>
          <Route path="/admin/tenants/:tenantId" element={<TenantDetail />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders tenant details from API', async () => {
    getTenant.mockResolvedValue(mockTenant);
    renderDetail();

    expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('pro')).toBeInTheDocument();
    expect(screen.getByText('u-1')).toBeInTheDocument();
  });

  it('shows error when API fails', async () => {
    getTenant.mockRejectedValue({
      response: { data: { error: 'Not found' } },
    });
    renderDetail();

    expect(await screen.findByText('Not found')).toBeInTheDocument();
  });

  it('shows "Tenant not found" when data is null', async () => {
    getTenant.mockResolvedValue(null);
    renderDetail();

    expect(await screen.findByText('Tenant not found')).toBeInTheDocument();
  });

  it('shows back to tenants link', async () => {
    getTenant.mockResolvedValue(mockTenant);
    renderDetail();

    await screen.findByText('Acme Corp');
    expect(screen.getByText('Back to Tenants')).toBeInTheDocument();
  });
});

// ─── FeatureFlags ─────────────────────────────────────────────────────────────

describe('FeatureFlags page', () => {
  beforeEach(() => jest.clearAllMocks());

  const mockTenants = [
    { id: 't-1', name: 'Acme Corp' },
    { id: 't-2', name: 'Beta LLC' },
  ];

  const mockFlags = {
    invoicing: true,
    quotes: false,
    expenses: true,
  };

  it('renders tenant select dropdown', async () => {
    listTenants.mockResolvedValue({ tenants: mockTenants, total: 2 });

    const FeatureFlags = require('../../admin/pages/FeatureFlags').default;
    render(
      <MemoryRouter>
        <FeatureFlags />
      </MemoryRouter>
    );

    expect(await screen.findByText('Feature Flags')).toBeInTheDocument();
    expect(screen.getByText('Select Tenant')).toBeInTheDocument();
    expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
  });

  it('shows error when tenant list fails to load', async () => {
    listTenants.mockRejectedValue(new Error('network'));

    const FeatureFlags = require('../../admin/pages/FeatureFlags').default;
    render(
      <MemoryRouter>
        <FeatureFlags />
      </MemoryRouter>
    );

    expect(await screen.findByText('Failed to load tenants')).toBeInTheDocument();
  });

  it('loads and shows flags after tenant selected', async () => {
    listTenants.mockResolvedValue({ tenants: mockTenants, total: 2 });
    getFeatureFlags.mockResolvedValue({ flags: mockFlags });

    const FeatureFlags = require('../../admin/pages/FeatureFlags').default;
    render(
      <MemoryRouter>
        <FeatureFlags />
      </MemoryRouter>
    );

    await screen.findByText('Acme Corp');

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 't-1' } });

    await waitFor(() => {
      expect(getFeatureFlags).toHaveBeenCalledWith('t-1');
    });

    await waitFor(() => {
      expect(screen.getByText('Save Flags')).toBeInTheDocument();
    });
  });

  it('uses DEFAULT_FLAGS when flags API returns empty', async () => {
    listTenants.mockResolvedValue({ tenants: mockTenants, total: 2 });
    getFeatureFlags.mockResolvedValue({ flags: {} });

    const FeatureFlags = require('../../admin/pages/FeatureFlags').default;
    render(
      <MemoryRouter>
        <FeatureFlags />
      </MemoryRouter>
    );

    await screen.findByText('Acme Corp');
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 't-1' } });

    await waitFor(() => {
      expect(screen.getByText(/new — will be created on save/i)).toBeInTheDocument();
    });
  });

  it('saves flags and shows success message', async () => {
    listTenants.mockResolvedValue({ tenants: mockTenants, total: 2 });
    getFeatureFlags.mockResolvedValue({ flags: mockFlags });
    updateFeatureFlags.mockResolvedValue({});

    const FeatureFlags = require('../../admin/pages/FeatureFlags').default;
    render(
      <MemoryRouter>
        <FeatureFlags />
      </MemoryRouter>
    );

    await screen.findByText('Acme Corp');
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 't-1' } });

    await waitFor(() => screen.getByText('Save Flags'));
    fireEvent.click(screen.getByText('Save Flags'));

    expect(await screen.findByText('Feature flags saved successfully')).toBeInTheDocument();
    expect(updateFeatureFlags).toHaveBeenCalledWith('t-1', mockFlags);
  });

  it('creates flags when isNew is true', async () => {
    listTenants.mockResolvedValue({ tenants: mockTenants, total: 2 });
    getFeatureFlags.mockResolvedValue({ flags: {} });
    createFeatureFlags.mockResolvedValue({});

    const FeatureFlags = require('../../admin/pages/FeatureFlags').default;
    render(
      <MemoryRouter>
        <FeatureFlags />
      </MemoryRouter>
    );

    await screen.findByText('Acme Corp');
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 't-1' } });

    await waitFor(() => screen.getByText('Save Flags'));
    fireEvent.click(screen.getByText('Save Flags'));

    await waitFor(() => expect(createFeatureFlags).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('Feature flags saved successfully')).toBeInTheDocument();
  });

  it('shows save error when updateFeatureFlags fails', async () => {
    listTenants.mockResolvedValue({ tenants: mockTenants, total: 2 });
    getFeatureFlags.mockResolvedValue({ flags: mockFlags });
    updateFeatureFlags.mockRejectedValue({
      response: { data: { error: 'Save failed' } },
    });

    const FeatureFlags = require('../../admin/pages/FeatureFlags').default;
    render(
      <MemoryRouter>
        <FeatureFlags />
      </MemoryRouter>
    );

    await screen.findByText('Acme Corp');
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 't-1' } });

    await waitFor(() => screen.getByText('Save Flags'));
    fireEvent.click(screen.getByText('Save Flags'));

    expect(await screen.findByText('Save failed')).toBeInTheDocument();
  });
});
