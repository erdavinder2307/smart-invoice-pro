import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { PermissionProvider, usePermission, PERMISSION_MODULES, MODULE_LABELS } from '../../context/PermissionContext';
import { useAuth } from '../../context/AuthContext';
import { getMyPermissions } from '../../services/rolesService';

jest.mock('../../context/AuthContext');
jest.mock('../../services/rolesService');

afterEach(() => jest.clearAllMocks());

function PermConsumer() {
  const { can, isAdmin, loading } = usePermission();
  return (
    <div>
      <span data-testid="isAdmin">{String(isAdmin)}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="can-invoices-view">{String(can('invoices', 'view'))}</span>
      <span data-testid="can-invoices-delete">{String(can('invoices', 'delete'))}</span>
      <span data-testid="can-settings-edit">{String(can('settings', 'edit'))}</span>
    </div>
  );
}

function renderWithPerm(authOverride = {}) {
  useAuth.mockReturnValue({
    user: { id: '1', role: 'Staff' },
    isAuthenticated: true,
    ...authOverride,
  });

  return render(
    <PermissionProvider>
      <PermConsumer />
    </PermissionProvider>
  );
}

describe('PermissionContext', () => {
  it('grants all permissions when user is admin', async () => {
    getMyPermissions.mockResolvedValue({ is_admin: true, permissions: {} });

    await act(async () => {
      renderWithPerm();
    });

    expect(screen.getByTestId('isAdmin')).toHaveTextContent('true');
    expect(screen.getByTestId('can-invoices-view')).toHaveTextContent('true');
    expect(screen.getByTestId('can-settings-edit')).toHaveTextContent('true');
  });

  it('respects granular permissions for non-admin', async () => {
    getMyPermissions.mockResolvedValue({
      is_admin: false,
      permissions: {
        invoices: { view: true, create: true, edit: false, delete: false },
        settings: { view: true, edit: false },
      },
    });

    await act(async () => {
      renderWithPerm();
    });

    expect(screen.getByTestId('isAdmin')).toHaveTextContent('false');
    expect(screen.getByTestId('can-invoices-view')).toHaveTextContent('true');
    expect(screen.getByTestId('can-invoices-delete')).toHaveTextContent('false');
    expect(screen.getByTestId('can-settings-edit')).toHaveTextContent('false');
  });

  it('returns false for all when unauthenticated', async () => {
    getMyPermissions.mockResolvedValue({ is_admin: false, permissions: {} });

    await act(async () => {
      renderWithPerm({ user: null, isAuthenticated: false });
    });

    expect(screen.getByTestId('can-invoices-view')).toHaveTextContent('false');
  });

  it('falls back to admin when API fails and user role is Admin', async () => {
    getMyPermissions.mockRejectedValue(new Error('500'));

    await act(async () => {
      renderWithPerm({ user: { id: '1', role: 'Admin' }, isAuthenticated: true });
    });

    expect(screen.getByTestId('isAdmin')).toHaveTextContent('true');
    expect(screen.getByTestId('can-invoices-view')).toHaveTextContent('true');
  });

  it('exports PERMISSION_MODULES with expected modules', () => {
    const expectedModules = [
      'invoices', 'quotes', 'customers', 'products', 'vendors',
      'purchase_orders', 'bills', 'expenses', 'reports', 'settings',
    ];
    expect(Object.keys(PERMISSION_MODULES)).toEqual(expectedModules);
  });

  it('exports MODULE_LABELS for all modules', () => {
    for (const key of Object.keys(PERMISSION_MODULES)) {
      expect(MODULE_LABELS[key]).toBeDefined();
    }
  });
});
