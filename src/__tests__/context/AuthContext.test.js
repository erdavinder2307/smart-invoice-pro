import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

jest.mock('../../services/authService');
jest.mock('../../services/analyticsService', () => ({
  __esModule: true,
  default: {
    trackLogin: jest.fn(),
    trackLogout: jest.fn(),
    trackInteractiveWorkspaceStart: jest.fn(),
  },
}));

afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

// Test component that exposes auth context values
function AuthConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="username">{auth.user?.username || 'none'}</span>
      <span data-testid="role">{auth.userRole || 'none'}</span>
      <span data-testid="isAdmin">{String(auth.isAdmin)}</span>
      <span data-testid="isManager">{String(auth.isManager)}</span>
      <span data-testid="canApprove">{String(auth.canApprove)}</span>
      <span data-testid="loading">{String(auth.loading)}</span>
      <button data-testid="login" onClick={() => auth.login({ username: 'test', password: 'pass' })}>Login</button>
      <button data-testid="logout" onClick={auth.logout}>Logout</button>
    </div>
  );
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  it('provides default unauthenticated state', async () => {
    await act(async () => {
      renderWithAuth();
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('username')).toHaveTextContent('none');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('restores user from localStorage on mount', async () => {
    const mockUser = { id: '1', username: 'admin', role: 'Admin' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'test-token');

    await act(async () => {
      renderWithAuth();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('username')).toHaveTextContent('admin');
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('true');
  });

  it('computes role helpers correctly for Admin', async () => {
    localStorage.setItem('user', JSON.stringify({ id: '1', username: 'admin', role: 'Admin' }));
    localStorage.setItem('token', 'token');

    await act(async () => {
      renderWithAuth();
    });

    expect(screen.getByTestId('isAdmin')).toHaveTextContent('true');
    expect(screen.getByTestId('isManager')).toHaveTextContent('true');
    expect(screen.getByTestId('canApprove')).toHaveTextContent('true');
  });

  it('computes role helpers correctly for Manager', async () => {
    localStorage.setItem('user', JSON.stringify({ id: '2', username: 'mgr', role: 'Manager' }));
    localStorage.setItem('token', 'token');

    await act(async () => {
      renderWithAuth();
    });

    expect(screen.getByTestId('isAdmin')).toHaveTextContent('false');
    expect(screen.getByTestId('isManager')).toHaveTextContent('true');
    expect(screen.getByTestId('canApprove')).toHaveTextContent('true');
  });

  it('computes role helpers correctly for Staff', async () => {
    localStorage.setItem('user', JSON.stringify({ id: '3', username: 'staff', role: 'Staff' }));
    localStorage.setItem('token', 'token');

    await act(async () => {
      renderWithAuth();
    });

    expect(screen.getByTestId('isAdmin')).toHaveTextContent('false');
    expect(screen.getByTestId('isManager')).toHaveTextContent('false');
    expect(screen.getByTestId('canApprove')).toHaveTextContent('false');
  });

  it('logout clears user state', async () => {
    localStorage.setItem('user', JSON.stringify({ id: '1', username: 'admin', role: 'Admin' }));
    localStorage.setItem('token', 'token');
    authService.logout.mockImplementation(() => {
      localStorage.clear();
      return Promise.resolve();
    });

    await act(async () => {
      renderWithAuth();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');

    await act(async () => {
      screen.getByTestId('logout').click();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('username')).toHaveTextContent('none');
  });

  it('attempts token refresh when only refresh_token exists', async () => {
    localStorage.setItem('refresh_token', 'refresh-token');
    authService.refreshAccessToken.mockResolvedValue('new-token');

    await act(async () => {
      renderWithAuth();
    });

    expect(authService.refreshAccessToken).toHaveBeenCalled();
  });

  it('useAuth throws when used outside provider', () => {
    // Suppress console.error for the expected error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    function BadComponent() {
      useAuth();
      return null;
    }

    expect(() => render(<BadComponent />)).toThrow('useAuth must be used within an AuthProvider');
    consoleSpy.mockRestore();
  });

  it('demoLogin sets user from authService response', async () => {
    const mockUser = { id: 'demo-1', username: 'demo-sales', role: 'Sales', is_demo: true };
    authService.demoLogin.mockResolvedValue('demo-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    function DemoConsumer() {
      const auth = useAuth();
      return (
        <div>
          <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
          <span data-testid="username">{auth.user?.username || 'none'}</span>
          <button data-testid="demo-login" onClick={() => auth.demoLogin({ role: 'Sales' })}>
            Demo
          </button>
        </div>
      );
    }

    await act(async () => {
      render(
        <AuthProvider>
          <DemoConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      screen.getByTestId('demo-login').click();
    });

    await waitFor(() => {
      expect(authService.demoLogin).toHaveBeenCalledWith({ role: 'Sales' });
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('username')).toHaveTextContent('demo-sales');
    });
  });
});
