import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminLogin from '../../admin/pages/Login';
import adminAuthService from '../../admin/services/adminAuthService';

jest.mock('../../admin/services/adminAuthService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AdminLogin', () => {
  const getUsername = () => document.querySelector('input[name="username"]');
  const getPassword = () => document.querySelector('input[name="password"]');

  it('renders login form', () => {
    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(getUsername()).toBeInTheDocument();
    expect(getPassword()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation error when username is empty', async () => {
    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
    });
  });

  it('shows validation error when password is empty', async () => {
    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );
    fireEvent.change(getUsername(), { target: { value: 'admin' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('navigates to dashboard on successful login', async () => {
    adminAuthService.login.mockResolvedValue({
      token: 'tok',
      user: { is_super_admin: true },
    });

    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );
    fireEvent.change(getUsername(), { target: { value: 'admin' } });
    fireEvent.change(getPassword(), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('shows error for non-admin user', async () => {
    adminAuthService.login.mockRejectedValue(
      new Error('Access denied. Super admin privileges required.')
    );

    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );
    fireEvent.change(getUsername(), { target: { value: 'regular' } });
    fireEvent.change(getPassword(), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Access denied. Super admin privileges required.')
      ).toBeInTheDocument();
    });
  });

  it('shows error for invalid credentials', async () => {
    adminAuthService.login.mockRejectedValue({
      response: { data: { message: 'Invalid username or password.' } },
    });

    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );
    fireEvent.change(getUsername(), { target: { value: 'wrong' } });
    fireEvent.change(getPassword(), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
    });
  });

  it('disables button while loading', async () => {
    adminAuthService.login.mockReturnValue(new Promise(() => {})); // never resolves

    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );
    fireEvent.change(getUsername(), { target: { value: 'admin' } });
    fireEvent.change(getPassword(), { target: { value: 'pass' } });

    const btn = screen.getByRole('button', { name: /sign in/i });
    expect(btn).not.toBeDisabled();

    fireEvent.click(btn);

    // After submitting, the button text changes from "Sign In" to a CircularProgress.
    // We verify the login function was called, meaning the loading state kicked in.
    await waitFor(() => {
      expect(adminAuthService.login).toHaveBeenCalledWith({
        username: 'admin',
        password: 'pass',
      });
    });
  });
});
