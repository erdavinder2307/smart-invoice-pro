import React from 'react';
import { act } from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';

// Capture real console.error before any mocks are applied
const originalConsoleError = console.error;
import LoginPage from '../../components/Auth/Login';
import { useAuth } from '../../context/AuthContext';

// Mock Header and Footer to avoid their complex rendering (useMediaQuery, etc.)
jest.mock('../../components/Layout/Header', () => () => <div data-testid="mock-header" />);
jest.mock('../../components/Layout/Footer', () => () => <div data-testid="mock-footer" />);

// react-router-dom navigation mock
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Suppress the React 18 "not wrapped in act" warning for async event handlers.
// This is a known limitation when plain async functions call setState after an
// await — there is no way to keep act active across the microtask boundary
// without @testing-library/user-event v14.
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    if (typeof args[0] === 'string' && args[0].includes('not wrapped in act')) return;
    originalConsoleError(...args);
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  useAuth.mockReturnValue({
    login: jest.fn(),
    register: jest.fn(),
    sessionExpired: false,
    user: null,
    isAuthenticated: false,
    userRole: null,
    isAdmin: false,
    isManager: false,
    canApprove: false,
    logout: jest.fn(),
    loading: false,
  });
});

describe('LoginPage', () => {
  // Helper to find password field (MUI TextField with InputAdornment)
  const getPasswordInput = () => document.querySelector('input[name="password"]');
  const getUsernameInput = () => document.querySelector('input[name="username"]');

  it('renders login form by default', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(getUsernameInput()).toBeInTheDocument();
    expect(getPasswordInput()).toBeInTheDocument();
  });

  it('toggles to signup form', () => {
    renderWithProviders(<LoginPage />);
    const signupBtn = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signupBtn);
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('shows validation error on signup with weak password', async () => {
    renderWithProviders(<LoginPage />);
    // Switch to signup
    const signupBtn = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(signupBtn);

    // Fill weak password
    fireEvent.change(getUsernameInput(), { target: { value: 'testuser' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'weak' } });

    // Submit via form
    const form = document.querySelector('form');
    await act(async () => { fireEvent.submit(form); });

    await waitFor(() => {
      expect(screen.getAllByText(/password does not meet/i).length).toBeGreaterThan(0);
    });
  });

  it('calls login on form submit', async () => {
    const mockLogin = jest.fn().mockResolvedValue('token');
    useAuth.mockReturnValue({
      login: mockLogin,
      register: jest.fn(),
      sessionExpired: false,
      user: null,
      isAuthenticated: false,
      userRole: null,
      isAdmin: false,
      isManager: false,
      canApprove: false,
      logout: jest.fn(),
      loading: false,
    });

    renderWithProviders(<LoginPage />);

    fireEvent.change(getUsernameInput(), { target: { value: 'admin' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'Pass123!' } });

    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    await act(async () => { fireEvent.click(submitBtn); });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'admin', password: 'Pass123!' })
      );
    });
  });

  it('shows error message on login failure', async () => {
    const mockLogin = jest.fn().mockRejectedValue(new Error('Invalid'));
    useAuth.mockReturnValue({
      login: mockLogin,
      register: jest.fn(),
      sessionExpired: false,
      user: null,
      isAuthenticated: false,
      userRole: null,
      isAdmin: false,
      isManager: false,
      canApprove: false,
      logout: jest.fn(),
      loading: false,
    });

    renderWithProviders(<LoginPage />);

    fireEvent.change(getUsernameInput(), { target: { value: 'admin' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'wrong' } });

    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    await act(async () => { fireEvent.click(submitBtn); });

    await waitFor(() => {
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
    });
  });

  it('redirects to dashboard if already logged in', () => {
    localStorage.setItem('token', 'existing-token');
    renderWithProviders(<LoginPage />);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
