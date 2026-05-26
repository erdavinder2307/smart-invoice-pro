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

jest.mock('../../utils/mockDataGenerators', () => ({ generateExpenseMockData: jest.fn(() => ({})) }));

jest.mock('../../components/Layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

// Mock FormDatePicker to avoid MUI X date-picker complexity in tests
jest.mock('../../components/common/FormDatePicker', () =>
  function MockFormDatePicker({ label, name, value, onChange, error, helperText }) {
    return (
      <div>
        <label htmlFor={name}>{label}</label>
        <input
          id={name}
          name={name}
          data-testid={`date-${name}`}
          value={value || ''}
          onChange={(e) => onChange && onChange(e.target.value, name)}
        />
        {helperText && <span>{helperText}</span>}
      </div>
    );
  }
);

import AddEditExpense from '../../components/AddEditExpense';

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

describe('AddEditExpense', () => {
  it('renders the expense form', () => {
    renderWithProviders(<AddEditExpense />);
    expect(screen.getByText(new RegExp('vendor / payee', 'i'))).toBeInTheDocument();
  });

  it('shows validation error when vendor name is empty on submit', async () => {
    renderWithProviders(<AddEditExpense />);
    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(screen.getByText(new RegExp('vendor / payee is required', 'i'))).toBeInTheDocument();
    });
  });

  // Helper: fill all required fields so validation passes
  const fillRequiredFields = () => {
    const vendorInput = document.querySelector('input[name="vendor_name"]');
    fireEvent.change(vendorInput, { target: { name: 'vendor_name', value: 'Office Supplier' } });
    // date is auto-set to today on mount (new form), category defaults to 'Other'
    const amountInput = document.querySelector('input[name="amount"]');
    fireEvent.change(amountInput, { target: { name: 'amount', value: '500' } });
  };

  it('submits form and navigates on success', async () => {
    axios.post.mockResolvedValue({ data: { id: 'e1' } });
    renderWithProviders(<AddEditExpense />);
    fillRequiredFields();

    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    // Toast appears once API call resolves
    await waitFor(() => {
      expect(screen.getByText(/expense saved successfully/i)).toBeInTheDocument();
    });

    // Navigate is deferred by 1500ms
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/expenses');
    }, { timeout: 3000 });
  });

  it('shows success snackbar after saving a new expense', async () => {
    axios.post.mockResolvedValue({ data: { id: 'e2' } });
    renderWithProviders(<AddEditExpense />);
    fillRequiredFields();

    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/expense saved successfully/i)).toBeInTheDocument();
    });
  });

  it('shows API error message on server 400 response', async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 400,
        data: {
          success: false,
          error: {
            type: 'validation_error',
            message: 'Amount must be positive',
            fields: { amount: 'Amount must be positive' },
          },
        },
      },
    });

    renderWithProviders(<AddEditExpense />);
    fillRequiredFields();

    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/amount must be positive/i).length).toBeGreaterThanOrEqual(1);
    });
  });
});
