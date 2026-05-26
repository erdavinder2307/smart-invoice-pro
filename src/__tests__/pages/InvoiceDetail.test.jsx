import React from 'react';
import { renderWithProviders, screen, waitFor } from '../../test-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InvoiceDetail from '../../pages/InvoiceDetail';
import { getAuditLogs } from '../../services/auditLogService';
import axios from 'axios';

const mockNavigate = jest.fn();

jest.mock('axios');

jest.mock('../../services/auditLogService', () => ({
  getAuditLogs: jest.fn(),
}));

jest.mock('../../components/Layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'inv-detail-001' }),
  };
});

const SAMPLE_INVOICE = {
  id: 'inv-detail-001',
  invoice_number: 'INV-00042',
  status: 'Issued',
  customer_name: 'Acme Corp',
  customer_email: 'billing@acme.com',
  issue_date: '2026-05-01',
  due_date: '2026-05-31',
  payment_terms: 'Net 30',
  subtotal: 10000,
  total_tax: 1800,
  total_amount: 11800,
  amount_paid: 5000,
  balance_due: 6800,
  cgst_amount: 900,
  sgst_amount: 900,
  igst_amount: 0,
  items: [
    {
      product_name: 'Implementation Service',
      description: 'Initial setup',
      quantity: 2,
      rate: 5000,
      tax: 18,
      amount: 10000,
    },
  ],
  payment_history: [
    {
      payment_date: '2026-05-10',
      amount: 5000,
      payment_mode: 'Bank Transfer',
      reference_number: 'REF-001',
      recorded_by: 'davinder',
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();

  axios.get.mockResolvedValue({ data: SAMPLE_INVOICE });

  getAuditLogs.mockResolvedValue({
    logs: [
      {
        id: 'log-1',
        action: 'CREATE',
        changed_by: 'davinder',
        timestamp: '2026-05-01T10:00:00Z',
        description: 'Invoice created',
      },
    ],
    total: 1,
  });
});

const renderDetail = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  renderWithProviders(
    <QueryClientProvider client={queryClient}>
      <InvoiceDetail />
    </QueryClientProvider>
  );
};

describe('InvoiceDetail', () => {
  it('renders invoice number and customer name after loading', async () => {
    renderDetail();

    expect(await screen.findByText('INV-00042')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('renders invoice status chip', async () => {
    renderDetail();

    await screen.findByText('INV-00042');
    expect(screen.getByText('Issued')).toBeInTheDocument();
  });

  it('shows payment history entries', async () => {
    renderDetail();

    await screen.findByText('INV-00042');
    expect(screen.getByText('Bank Transfer')).toBeInTheDocument();
    expect(screen.getByText('REF-001')).toBeInTheDocument();
    expect(screen.getByText('davinder')).toBeInTheDocument();
  });

  it('shows "No payments recorded yet" when payment history is empty', async () => {
    axios.get.mockResolvedValue({ data: { ...SAMPLE_INVOICE, payment_history: [] } });
    renderDetail();

    await screen.findByText('INV-00042');
    expect(screen.getByText('No payments recorded yet.')).toBeInTheDocument();
  });

  it('shows loading skeleton while fetching', () => {
    // Mock a never-resolving promise to keep loading state
    axios.get.mockImplementation(() => new Promise(() => {}));
    renderDetail();

    // There should be no invoice data visible yet
    expect(screen.queryByText('INV-00042')).not.toBeInTheDocument();
  });

  it('shows error state when API fails', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));
    renderDetail();

    expect(await screen.findByText(/Failed to load invoice/i)).toBeInTheDocument();
  });

  it('Edit button navigates to edit route', async () => {
    renderDetail();

    await screen.findByText('INV-00042');
    const editButton = screen.getByRole('button', { name: /Edit/i });
    editButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/invoices/edit/inv-detail-001');
  });

  it('Back button navigates to invoices list', async () => {
    renderDetail();

    await screen.findByText('INV-00042');
    const backButton = screen.getByRole('button', { name: /Invoices/i });
    backButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/invoices');
  });

  it('renders line items table with product name and amount', async () => {
    renderDetail();

    await screen.findByText('INV-00042');
    expect(screen.getByText('Implementation Service')).toBeInTheDocument();
  });
});
