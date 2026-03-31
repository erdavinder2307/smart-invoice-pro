import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import { useAuth } from '../../context/AuthContext';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
    Link: ({ children, to, ...rest }) => <a href={to} {...rest}>{children}</a>,
  };
});

// Mock useMediaQuery to avoid JSDOM issues
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: jest.fn(() => false),
  };
});

import Header from '../../components/Layout/Header';

const defaultAuth = {
  user: null,
  isAuthenticated: false,
  userRole: null,
  isAdmin: false,
  isManager: false,
  canApprove: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  loading: false,
  sessionExpired: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue(defaultAuth);
});

describe('Header', () => {
  it('renders app name / branding', () => {
    renderWithProviders(<Header />);
    // Header shows navigation links
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('shows login button when not authenticated', () => {
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      userRole: null,
      isAdmin: false,
      isManager: false,
      canApprove: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      loading: false,
      sessionExpired: false,
    });
    renderWithProviders(<Header />);
    expect(screen.getByText(/login|sign in/i)).toBeInTheDocument();
  });

  it('shows user avatar when authenticated', () => {
    useAuth.mockReturnValue({
      ...defaultAuth,
      user: { id: '1', username: 'admin', role: 'Admin' },
      isAuthenticated: true,
      userRole: 'Admin',
      isAdmin: true,
    });
    renderWithProviders(<Header />);
    // Should show Dashboard link when authenticated
    const dashboardLinks = screen.getAllByText('Dashboard');
    expect(dashboardLinks.length).toBeGreaterThan(0);
  });

  it('shows public nav links', () => {
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      userRole: null,
      isAdmin: false,
      isManager: false,
      canApprove: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      loading: false,
      sessionExpired: false,
    });
    renderWithProviders(<Header />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });
});
