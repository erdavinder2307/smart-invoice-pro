import React from 'react';
import { renderWithProviders, screen, waitFor } from '../../test-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QuoteDetail from '../../pages/QuoteDetail';
import { getAuditLogs } from '../../services/auditLogService';
import { getQuoteById, downloadQuotePdf } from '../../services/quoteService';

const mockNavigate = jest.fn();

jest.mock('../../services/quoteService', () => ({
  getQuoteById: jest.fn(),
  downloadQuotePdf: jest.fn(),
}));

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
    useParams: () => ({ id: 'qt-detail-001' }),
  };
});

const SAMPLE_QUOTE = {
  id: 'qt-detail-001',
  quote_number: 'QT-00042',
  status: 'Accepted',
  customer_name: 'Acme Corp',
  customer_email: 'billing@acme.com',
  issue_date: '2026-05-01',
  expiry_date: '2026-05-31',
  payment_terms: 'Net 30',
  salesperson: 'davinder',
  subject: 'Annual Services',
  notes: 'Thank you for your business',
  subtotal: 10000,
  total_tax: 1800,
  total_amount: 11800,
  cgst_amount: 900,
  sgst_amount: 900,
  igst_amount: 0,
  converted_to_invoice_id: null,
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
};

beforeEach(() => {
  jest.clearAllMocks();

  getQuoteById.mockResolvedValue(SAMPLE_QUOTE);

  getAuditLogs.mockResolvedValue({
    logs: [
      {
        id: 'log-1',
        action: 'CREATE',
        changed_by: 'davinder',
        timestamp: '2026-05-01T10:00:00Z',
        description: 'Quote created',
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
      <QuoteDetail />
    </QueryClientProvider>
  );
};

describe('QuoteDetail', () => {
  it('renders quote number and customer name after loading', async () => {
    renderDetail();

    expect(await screen.findByText('QT-00042')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('renders quote status chip', async () => {
    renderDetail();

    await screen.findByText('QT-00042');
    expect(screen.getByText('Accepted')).toBeInTheDocument();
  });

  it('renders line items table with product name', async () => {
    renderDetail();

    await screen.findByText('QT-00042');
    expect(screen.getByText('Implementation Service')).toBeInTheDocument();
  });

  it('shows activity log entries', async () => {
    renderDetail();

    await screen.findByText('QT-00042');
    expect(screen.getByText('Quote created')).toBeInTheDocument();
    expect(screen.getAllByText(/davinder/i).length).toBeGreaterThan(0);
  });

  it('shows "No activity recorded yet" when audit logs are empty', async () => {
    getAuditLogs.mockResolvedValue({ logs: [], total: 0 });
    renderDetail();

    await screen.findByText('QT-00042');
    expect(screen.getByText('No activity recorded yet.')).toBeInTheDocument();
  });

  it('shows loading skeleton while fetching', () => {
    getQuoteById.mockImplementation(() => new Promise(() => {}));
    renderDetail();

    expect(screen.queryByText('QT-00042')).not.toBeInTheDocument();
  });

  it('shows error state when API fails', async () => {
    getQuoteById.mockRejectedValue(new Error('Network error'));
    renderDetail();

    expect(await screen.findByText(/Failed to load quote/i)).toBeInTheDocument();
  });

  it('Edit button navigates to edit route', async () => {
    renderDetail();

    await screen.findByText('QT-00042');
    const editButton = screen.getByRole('button', { name: /Edit/i });
    editButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/quotes/edit/qt-detail-001');
  });

  it('Back button navigates to quotes list', async () => {
    renderDetail();

    await screen.findByText('QT-00042');
    const backButton = screen.getByRole('button', { name: /Quotes/i });
    backButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/quotes');
  });

  it('Convert to Invoice button visible when status is Accepted and not converted', async () => {
    renderDetail();

    await screen.findByText('QT-00042');
    expect(screen.getByRole('button', { name: /Convert to Invoice/i })).toBeInTheDocument();
  });

  it('Convert to Invoice button navigates correctly', async () => {
    renderDetail();

    await screen.findByText('QT-00042');
    screen.getByRole('button', { name: /Convert to Invoice/i }).click();

    expect(mockNavigate).toHaveBeenCalledWith('/quotes/convert/qt-detail-001/invoice');
  });

  it('View Invoice button visible when converted_to_invoice_id is set', async () => {
    getQuoteById.mockResolvedValue({ ...SAMPLE_QUOTE, status: 'Converted', converted_to_invoice_id: 'inv-xyz-001' });
    renderDetail();

    await screen.findByText('QT-00042');
    expect(screen.getByRole('button', { name: /View Invoice/i })).toBeInTheDocument();
  });
});
