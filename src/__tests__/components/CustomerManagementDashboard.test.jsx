import React from 'react';
import axios from 'axios';
import { fireEvent, renderWithProviders, screen, waitFor } from '../../test-utils';
import CustomerList from '../../components/CustomerList';
import { getCustomers } from '../../services/customerService';
import { recordPayment } from '../../services/invoiceService';

const mockNavigate = jest.fn();

jest.mock('axios');

jest.mock('../../services/customerService', () => ({
  getCustomers: jest.fn(),
}));

jest.mock('../../services/invoiceService', () => ({
  recordPayment: jest.fn(),
}));

jest.mock('@mui/material/useMediaQuery', () => jest.fn(() => false));

jest.mock('../../components/Layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../components/common/ResponsiveDataView', () => ({
  __esModule: true,
  default: ({ toolbar, rows, renderHeader, renderRow, emptyTitle }) => (
    <div>
      {toolbar}
      <table>
        <thead>{renderHeader ? renderHeader() : null}</thead>
        <tbody>
          {rows.length > 0
            ? rows.map((row) => renderRow(row))
            : (
              <tr>
                <td>{emptyTitle}</td>
              </tr>
            )}
        </tbody>
      </table>
    </div>
  ),
}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const customers = [
  {
    id: 'cust-1',
    display_name: 'Acme Corp',
    company_name: 'Acme Corp',
    email: 'acme@example.com',
    phone: '1111111111',
    status: 'Active',
    receivables: 3000,
    overdue_amount: 1200,
    total_revenue: 250000,
    last_transaction_date: '2026-04-28',
  },
  {
    id: 'cust-2',
    display_name: 'Acme Corp Duplicate',
    company_name: 'Acme Corp Duplicate',
    email: 'acme@example.com',
    phone: '1111111111',
    status: 'Active',
    receivables: 3000,
    overdue_amount: 1200,
    total_revenue: 250000,
    last_transaction_date: '2026-04-27',
  },
  {
    id: 'cust-3',
    display_name: 'Beta Stores',
    company_name: 'Beta Stores',
    email: 'beta@example.com',
    phone: '2222222222',
    status: 'Inactive',
    receivables: 0,
    overdue_amount: 0,
    total_revenue: 10000,
    last_transaction_date: '2026-04-15',
  },
  {
    id: 'cust-4',
    display_name: 'Gamma Retail',
    company_name: 'Gamma Retail',
    email: 'gamma@example.com',
    phone: '3333333333',
    status: 'Active',
    receivables: 500,
    overdue_amount: 0,
    total_revenue: 50000,
    last_transaction_date: '2026-04-21',
  },
];

describe('CustomerManagementDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCustomers.mockResolvedValue(customers);
    axios.get.mockResolvedValue({
      data: {
        invoices: [
          { id: 'inv-1', invoice_number: 'INV-001', balance_due: 1200 },
        ],
      },
    });
    recordPayment.mockResolvedValue({ success: true });
  });

  it('collapses duplicate customers and shows the duplicate warning', async () => {
    renderWithProviders(<CustomerList />, { route: '/customers' });

    expect(await screen.findByText(/duplicate customer records were collapsed/i)).toBeInTheDocument();
    expect(screen.getAllByText('Acme Corp').length).toBeGreaterThan(0);
    expect(screen.queryByText('Acme Corp Duplicate')).not.toBeInTheDocument();
  });

  it('applies the overdue URL filter and navigates to customer details on row click', async () => {
    renderWithProviders(<CustomerList />, { route: '/customers?view=Overdue' });

    const acmeEntries = await screen.findAllByText('Acme Corp');
    expect(screen.queryByLabelText('Create invoice for Gamma Retail')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Create invoice for Beta Stores')).not.toBeInTheDocument();

    fireEvent.click(acmeEntries[acmeEntries.length - 1]);
    expect(mockNavigate).toHaveBeenCalledWith('/customers/cust-1');
  });

  it('starts invoice creation from a customer row action', async () => {
    renderWithProviders(<CustomerList />, { route: '/customers' });

    fireEvent.click(await screen.findByLabelText('Create invoice for Acme Corp'));

    expect(mockNavigate).toHaveBeenCalledWith('/invoices/add', {
      state: { quickCreateCustomerId: 'cust-1' },
    });
  });

  it('records a payment from the customer dashboard', async () => {
    renderWithProviders(<CustomerList />, { route: '/customers' });

    fireEvent.click(await screen.findByLabelText('Record payment for Acme Corp'));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/customers/cust-1/overview'));
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('1200')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Record Payment' }));

    await waitFor(() => {
      expect(recordPayment).toHaveBeenCalledWith('inv-1', expect.objectContaining({
        amount: 1200,
        payment_mode: 'Bank Transfer',
      }));
    });
  });
});