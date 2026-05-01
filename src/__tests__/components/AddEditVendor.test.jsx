import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

jest.mock('axios');
jest.mock('../../config/api', () => ({ createApiUrl: (path) => `http://localhost:5001${path}` }));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({}) };
});

jest.mock('../../utils/mockDataGenerators', () => ({ generateVendorMockData: jest.fn(() => ({})) }));

jest.mock('../../components/Layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

import AddEditVendor from '../../components/AddEditVendor';

beforeEach(() => {
  jest.clearAllMocks();
  // JSDOM doesn't implement scrollIntoView
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  useAuth.mockReturnValue({
    user: { id: 'u1', username: 'test', role: 'Admin' },
    isAuthenticated: true,
    isAdmin: true,
    isManager: true,
    canApprove: true,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    loading: false,
    sessionExpired: false,
  });
});

describe('AddEditVendor', () => {
  it('renders the vendor form', () => {
    renderWithProviders(<AddEditVendor />);
    expect(screen.getByText(/vendor name/i)).toBeInTheDocument();
  });

  it('shows validation error when submitting without vendor name', async () => {
    renderWithProviders(<AddEditVendor />);
    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(screen.getByText(/vendor name is required/i)).toBeInTheDocument();
    });
  });

  it('submits form and navigates to /vendors on success', async () => {
    axios.post.mockResolvedValue({ data: { id: 'v1', vendor_name: 'ACME' } });
    renderWithProviders(<AddEditVendor />);

    const nameInput = document.querySelector('input[name="vendor_name"]');
    fireEvent.change(nameInput, { target: { name: 'vendor_name', value: 'ACME Corp' } });

    const emailInput = document.querySelector('input[name="email"]');
    fireEvent.change(emailInput, { target: { name: 'email', value: 'accounts@acmecorp.in' } });

    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/vendors');
    });
  });

  it('shows API error message on server failure', async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 400,
        data: {
          success: false,
          error: {
            type: 'validation_error',
            message: 'Vendor already exists',
            fields: { vendor_name: 'Duplicate vendor name' },
          },
        },
      },
    });
    renderWithProviders(<AddEditVendor />);

    const nameInput = document.querySelector('input[name="vendor_name"]');
    fireEvent.change(nameInput, { target: { name: 'vendor_name', value: 'ACME Corp' } });

    const emailInput = document.querySelector('input[name="email"]');
    fireEvent.change(emailInput, { target: { name: 'email', value: 'ops@acmecorp.in' } });

    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/vendor already exists/i)).toBeInTheDocument();
    });
  });

  it('clears field error when user edits the field', async () => {
    renderWithProviders(<AddEditVendor />);
    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/vendor name is required/i)).toBeInTheDocument();
    });

    const nameInput = document.querySelector('input[name="vendor_name"]');
    fireEvent.change(nameInput, { target: { name: 'vendor_name', value: 'A' } });

    await waitFor(() => {
      expect(screen.queryByText(/vendor name is required/i)).not.toBeInTheDocument();
    });
  });

  it('shows email validation error for invalid email', async () => {
    renderWithProviders(<AddEditVendor />);

    const nameInput = document.querySelector('input[name="vendor_name"]');
    fireEvent.change(nameInput, { target: { name: 'vendor_name', value: 'Test Vendor' } });

    const emailInput = document.querySelector('input[name="email"]');
    fireEvent.change(emailInput, { target: { name: 'email', value: 'not-an-email' } });

    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });
});
