import React from 'react';
import { renderWithProviders, screen, waitFor } from '../../test-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExpenseDetail from '../../pages/ExpenseDetail';
import { getAuditLogs } from '../../services/auditLogService';
import { getExpenseById } from '../../services/expenseService';

const mockNavigate = jest.fn();

jest.mock('../../services/expenseService', () => ({
  getExpenseById: jest.fn(),
}));

jest.mock('../../services/auditLogService', () => ({
  getAuditLogs: jest.fn(),
}));

jest.mock('../../components/Layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../config/api', () => ({
  createApiUrl: (path) => `http://localhost:5001${path}`,
}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'exp-001' }),
  };
});

const SAMPLE_EXPENSE = {
  id: 'exp-001',
  vendor_name: 'Staples',
  category: 'Office Supplies',
  amount: 2500,
  currency: 'INR',
  date: '2026-05-01',
  status: 'Pending',
  payment_mode: 'Cash',
  paid_through: 'Cash',
  notes: 'Office supplies purchase',
  billable: false,
  receipt_url: null,
  lifecycle_status: 'ACTIVE',
};

beforeEach(() => {
  jest.clearAllMocks();

  getExpenseById.mockResolvedValue(SAMPLE_EXPENSE);

  getAuditLogs.mockResolvedValue({
    logs: [
      {
        id: 'log-1',
        action: 'CREATE',
        changed_by: 'davinder',
        timestamp: '2026-05-01T10:00:00Z',
        description: 'Expense created',
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
      <ExpenseDetail />
    </QueryClientProvider>
  );
};

describe('ExpenseDetail', () => {
  it('renders vendor name after loading', async () => {
    renderDetail();
    const matches = await screen.findAllByText('Staples');
    expect(matches.length).toBeGreaterThan(0);
  });

  it('renders category and date info', async () => {
    renderDetail();
    await screen.findAllByText('Staples');
    const catMatches = screen.getAllByText('Office Supplies');
    expect(catMatches.length).toBeGreaterThan(0);
  });

  it('renders the expense status chip', async () => {
    renderDetail();
    await screen.findAllByText('Staples');
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders the amount formatted in INR', async () => {
    renderDetail();
    await screen.findAllByText('Staples');
    // INR 2500 → ₹2,500.00 — appears in header and info row
    const amountEls = screen.getAllByText(/2,500/);
    expect(amountEls.length).toBeGreaterThan(0);
  });

  it('shows activity log entries', async () => {
    renderDetail();
    await screen.findAllByText('Staples');
    expect(await screen.findByText('Expense created')).toBeInTheDocument();
  });

  it('shows "No receipt attached." when receipt_url is null', async () => {
    renderDetail();
    await screen.findAllByText('Staples');
    expect(screen.getByText(/no receipt attached/i)).toBeInTheDocument();
  });

  it('navigates to /expenses when Back button is clicked', async () => {
    renderDetail();
    await screen.findAllByText('Staples');
    const backBtn = screen.getByRole('button', { name: /expenses/i });
    backBtn.click();
    expect(mockNavigate).toHaveBeenCalledWith('/expenses');
  });

  it('navigates to edit page when Edit button is clicked', async () => {
    renderDetail();
    await screen.findAllByText('Staples');
    const editBtn = screen.getByRole('button', { name: /edit/i });
    editBtn.click();
    expect(mockNavigate).toHaveBeenCalledWith('/expenses/edit/exp-001');
  });

  it('shows error message when API call fails', async () => {
    getExpenseById.mockRejectedValue(new Error('Network error'));
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText(/failed to load expense/i)).toBeInTheDocument();
    });
  });

  it('shows loading skeleton before data arrives', () => {
    // Delay resolution
    getExpenseById.mockImplementation(() => new Promise(() => {}));
    renderDetail();
    // Skeletons render as aria-hidden or plain divs; check that Staples is not yet shown
    expect(screen.queryByText('Staples')).not.toBeInTheDocument();
  });
});
