import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import UserManagement, { getUserDisplayName, getUserDisplayEmail } from '../../pages/UserManagement';
import {
  getSettingsUsers,
  getRoles,
  inviteUser,
  resendInvite,
} from '../../services/rolesService';

jest.mock('../../services/rolesService', () => ({
  getSettingsUsers: jest.fn(),
  getRoles: jest.fn(),
  inviteUser: jest.fn(),
  resendInvite: jest.fn(),
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
    fireEvent.click(screen.getByRole('button', { name: 'Invite' }));

    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(inviteUser).not.toHaveBeenCalled();
  });

  it('invites without a password and says a link was sent', async () => {
    getSettingsUsers.mockResolvedValue([]);
    inviteUser.mockResolvedValue({ id: 'u2', invite_pending: true, invite_email_sent: true });

    renderWithProviders(<UserManagement />, { authValue: adminAuth });
    fireEvent.click(await screen.findByRole('button', { name: 'Invite User' }));

    expect(screen.queryByLabelText(/Password/i)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'new@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Invite' }));

    expect(await screen.findByText(/Invite sent to new@example.com/i)).toBeInTheDocument();
    expect(inviteUser).toHaveBeenCalledWith(expect.not.objectContaining({ password: expect.anything() }));
    expect(inviteUser.mock.calls[0][0]).toMatchObject({ email: 'new@example.com', username: 'new' });
  });

  it('shows pending invites and resends the link', async () => {
    getSettingsUsers.mockResolvedValue([
      { id: 'u3', name: 'Pending Person', email: 'p@example.com', username: 'p', role: 'Sales', is_active: true, invite_pending: true },
    ]);
    resendInvite.mockResolvedValue({ id: 'u3', invite_pending: true, invite_email_sent: true });

    renderWithProviders(<UserManagement />, { authValue: adminAuth });

    expect(await screen.findByText('Invite pending')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resend invite' }));

    await waitFor(() => expect(resendInvite).toHaveBeenCalledWith('u3'));
    expect(await screen.findByText(/New invite sent to p@example.com/i)).toBeInTheDocument();
  });
});
