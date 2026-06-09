import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import UserManagement, { getUserDisplayName, getUserDisplayEmail } from '../../pages/UserManagement';
import {
  getSettingsUsers,
  getRoles,
  inviteUser,
} from '../../services/rolesService';

jest.mock('../../services/rolesService', () => ({
  getSettingsUsers: jest.fn(),
  getRoles: jest.fn(),
  inviteUser: jest.fn(),
  updateSettingsUser: jest.fn(),
  deactivateUser: jest.fn(),
}));

jest.mock('../../components/Layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

const adminAuth = {
  user: { id: 'admin-1', username: 'admin', role: 'Admin' },
  isAdmin: true,
};

const salesAuth = {
  user: { id: 'sales-1', username: 'sales', role: 'Sales' },
  isAdmin: false,
};

describe('user display helpers', () => {
  it('falls back through name, username, and email', () => {
    expect(getUserDisplayName({ name: 'Ada' })).toBe('Ada');
    expect(getUserDisplayName({ email: 'a@b.com' })).toBe('a@b.com');
    expect(getUserDisplayName({})).toBe('Unknown user');
    expect(getUserDisplayEmail({ email: 'a@b.com' })).toBe('a@b.com');
    expect(getUserDisplayEmail({ username: 'ada' })).toBe('ada');
  });
});

describe('UserManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getRoles.mockResolvedValue([{ id: 'role-1', name: 'Sales', is_system_role: true }]);
  });

  it('renders user name and email from API payload', async () => {
    getSettingsUsers.mockResolvedValue([
      {
        id: 'u1',
        name: 'QA Test User',
        email: 'qa@example.com',
        username: 'qa',
        role: 'Admin',
        is_active: true,
        created_at: '2026-05-08T00:00:00',
      },
    ]);

    renderWithProviders(<UserManagement />, { authValue: adminAuth });

    expect(await screen.findByText('QA Test User')).toBeInTheDocument();
    expect(screen.getByText('qa@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows admin access message for non-admin users', async () => {
    renderWithProviders(<UserManagement />, { authValue: salesAuth });

    expect(await screen.findByText(/Admin access is required/i)).toBeInTheDocument();
    expect(getSettingsUsers).not.toHaveBeenCalled();
  });

  it('requires email before inviting', async () => {
    getSettingsUsers.mockResolvedValue([]);

    renderWithProviders(<UserManagement />, { authValue: adminAuth });
    await screen.findByRole('button', { name: 'Invite User' });

    fireEvent.click(screen.getByRole('button', { name: 'Invite User' }));
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Invite' }));

    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(inviteUser).not.toHaveBeenCalled();
  });
});
