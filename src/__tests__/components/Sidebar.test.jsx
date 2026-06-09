import React from 'react';
import { renderWithProviders, screen, fireEvent } from '../../test-utils';
import { useAuth } from '../../context/AuthContext';
import { useMe } from '../../context/MeContext';
import Sidebar from '../../components/Sidebar';

const mockNavigate = jest.fn();

jest.mock('../../context/MeContext', () => ({
  useMe: jest.fn(),
  MeProvider: ({ children }) => children,
}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' }),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  useMe.mockReturnValue({
    me: { full_name: 'Test User', display_name: 'Test User', role: 'Admin' },
    meLoading: false,
    meError: null,
    refreshMe: jest.fn(),
    displayName: 'Test User',
    initials: 'TU',
  });
  // Reset to default admin user for each test
  useAuth.mockReturnValue({
    user: { id: '1', username: 'admin', role: 'Admin' },
    isAuthenticated: true,
    isAdmin: true,
    isManager: true,
    canApprove: true,
    logout: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    loading: false,
    sessionExpired: false,
    userRole: 'Admin',
  });
});

describe('Sidebar', () => {
  it('renders main navigation items', () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Items')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Purchases')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('shows Settings for admin users', () => {
    useAuth.mockReturnValue({
      user: { id: '1', username: 'admin', role: 'Admin' },
      isAuthenticated: true,
      isAdmin: true,
      isManager: true,
      canApprove: true,
      logout: jest.fn(),
      login: jest.fn(),
      register: jest.fn(),
      loading: false,
      sessionExpired: false,
      userRole: 'Admin',
    });
    renderWithProviders(<Sidebar />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('hides Settings for non-admin users', () => {
    useAuth.mockReturnValue({
      user: { id: '2', username: 'viewer', role: 'Viewer' },
      isAuthenticated: true,
      isAdmin: false,
      isManager: false,
      canApprove: false,
      logout: jest.fn(),
      login: jest.fn(),
      register: jest.fn(),
      loading: false,
      sessionExpired: false,
      userRole: 'Viewer',
    });
    renderWithProviders(<Sidebar />);
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('navigates to dashboard on click', () => {
    renderWithProviders(<Sidebar />);
    fireEvent.click(screen.getByText('Dashboard'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('expands Sales section on click', () => {
    renderWithProviders(<Sidebar />);
    fireEvent.click(screen.getByText('Sales'));
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Invoices')).toBeInTheDocument();
    expect(screen.getByText('Quotes')).toBeInTheDocument();
  });
});
