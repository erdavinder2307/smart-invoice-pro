import React from 'react';
import axios from 'axios';
import { renderWithProviders, screen, waitFor, fireEvent } from '../../test-utils';
import DashboardPage from '../../pages/Dashboard';
import { useDashboardFilter } from '../../context/DashboardFilterContext';

const mockSetRevenueRange = jest.fn();
const mockSetCustomStartDate = jest.fn();
const mockSetCustomEndDate = jest.fn();

jest.mock('../../context/DashboardFilterContext', () => ({
  useDashboardFilter: jest.fn(),
  DashboardFilterProvider: ({ children }) => children,
}));

const mockNavigate = jest.fn();

jest.mock('axios');

jest.mock('../../components/Dashboard/DashboardSearchBox', () => ({
  __esModule: true,
  default: ({ placeholder }) => (
    <input
      data-testid="dashboard-search-box"
      placeholder={placeholder}
      aria-label="search dashboard"
    />
  ),
}));

jest.mock('../../components/Layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="revenue-bar-chart" />,
}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('user', JSON.stringify({ username: 'qa-user' }));
    useDashboardFilter.mockReturnValue({
      revenueRange: 'this_year',
      setRevenueRange: mockSetRevenueRange,
      customStartDate: '2026-01-01',
      setCustomStartDate: mockSetCustomStartDate,
      customEndDate: '2026-12-31',
      setCustomEndDate: mockSetCustomEndDate,
    });
  });

  it('shows loading indicators while fetching dashboard data', async () => {
    let resolveSummary;
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/dashboard/summary')) {
        return new Promise((resolve) => {
          resolveSummary = resolve;
        });
      }
      return Promise.resolve({ data: [] });
    });

    renderWithProviders(<DashboardPage />);

    expect(await screen.findAllByRole('progressbar')).not.toHaveLength(0);

    resolveSummary({
      data: {
        total_customers: 1,
        total_products: 2,
        total_invoices: 3,
        total_revenue: 100,
        overdue_count: 0,
      },
    });

    await waitFor(() => expect(screen.getByText('Total Customers')).toBeInTheDocument());
  });

  it('renders summary and chart data on successful API responses', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/dashboard/summary')) {
        return Promise.resolve({
          data: {
            total_customers: 12,
            total_products: 8,
            total_invoices: 20,
            total_revenue: 150000,
            overdue_count: 0,
          },
        });
      }
      if (url.includes('/api/dashboard/low-stock')) {
        return Promise.resolve({ data: [{ id: 'p-1', name: 'Paper', stock: 2 }] });
      }
      if (url.includes('/api/dashboard/monthly-revenue')) {
        return Promise.resolve({ data: [{ month: '2026-01', revenue: 50000 }] });
      }
      if (url.includes('/api/dashboard/recent-invoices')) {
        return Promise.resolve({ data: [{ id: 'inv-1', invoice_number: 'INV-001' }] });
      }
      return Promise.resolve({ data: [] });
    });

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('Total Customers')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByTestId('revenue-bar-chart')).toBeInTheDocument();
  });

  it('shows error messages when core dashboard APIs fail', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/dashboard/summary')) {
        return Promise.reject(new Error('summary failed'));
      }
      if (url.includes('/api/dashboard/low-stock')) {
        return Promise.reject(new Error('stock failed'));
      }
      if (url.includes('/api/dashboard/monthly-revenue')) {
        return Promise.reject(new Error('revenue failed'));
      }
      if (url.includes('/api/dashboard/recent-invoices')) {
        return Promise.reject(new Error('recent failed'));
      }
      return Promise.resolve({ data: [] });
    });

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('Total Customers')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('renders search box (navigation) without mutating dashboard data', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/dashboard/summary')) {
        return Promise.resolve({
          data: { total_customers: 12, total_products: 8, total_invoices: 20, total_revenue: 150000, overdue_count: 0 },
        });
      }
      if (url.includes('/api/dashboard/recent-invoices')) {
        return Promise.resolve({
          data: [
            { id: 'inv-1', invoice_number: 'INV-001', customer_name: 'Acme Corp', total_amount: 1000, status: 'issued', issue_date: '2026-04-10' },
            { id: 'inv-2', invoice_number: 'INV-002', customer_name: 'Zen Ltd', total_amount: 1500, status: 'issued', issue_date: '2026-04-11' },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });

    renderWithProviders(<DashboardPage />);

    // Both invoices appear regardless of search — search never filters dashboard data
    expect(await screen.findByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('INV-002')).toBeInTheDocument();

    // The search box is present and is a DashboardSearchBox (navigation, not filter)
    expect(screen.getByTestId('dashboard-search-box')).toBeInTheDocument();
  });

  it('fetches dashboard data using the time range from context', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/dashboard/summary')) {
        return Promise.resolve({
          data: { total_customers: 12, total_products: 8, total_invoices: 20, total_revenue: 150000, overdue_count: 0 },
        });
      }
      if (url.includes('/api/dashboard/monthly-revenue')) {
        return Promise.resolve({ data: [{ month: '2026-04', revenue: 50000 }] });
      }
      return Promise.resolve({ data: [] });
    });

    renderWithProviders(<DashboardPage />);

    // Context default is 'this_year' — verify both summary and revenue APIs get the range param
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/dashboard/summary?range=this_year'));
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/dashboard/monthly-revenue?range=this_year'));
    });
  });

  it('calls setRevenueRange when user changes time filter', async () => {
    axios.get.mockResolvedValue({ data: [] });

    renderWithProviders(<DashboardPage />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByText('This Month'));

    expect(mockSetRevenueRange).toHaveBeenCalledWith('this_month');
  });

  it('fetches with custom range dates when context provides custom range', async () => {
    const customStart = '2026-04-01';
    const customEnd = '2026-04-30';

    useDashboardFilter.mockReturnValue({
      revenueRange: 'custom',
      setRevenueRange: mockSetRevenueRange,
      customStartDate: customStart,
      setCustomStartDate: mockSetCustomStartDate,
      customEndDate: customEnd,
      setCustomEndDate: mockSetCustomEndDate,
    });

    axios.get.mockResolvedValue({ data: [] });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/api/dashboard/monthly-revenue?range=custom&start_date=${customStart}&end_date=${customEnd}`)
      );
    });
  });

  it('navigates when business overview cards are clicked', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/dashboard/summary')) {
        return Promise.resolve({
          data: {
            total_customers: 12,
            total_products: 8,
            total_invoices: 20,
            total_revenue: 150000,
            overdue_count: 0,
          },
        });
      }
      if (url.includes('/api/dashboard/low-stock')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/api/dashboard/monthly-revenue')) {
        return Promise.resolve({ data: [{ month: '2026-04', revenue: 50000 }] });
      }
      if (url.includes('/api/dashboard/recent-invoices')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    renderWithProviders(<DashboardPage />);

    await screen.findByText('Total Customers');

    fireEvent.click(screen.getByRole('button', { name: 'Total Customers' }));
    expect(mockNavigate).toHaveBeenCalledWith('/customers');

    fireEvent.click(screen.getByRole('button', { name: 'Total Revenue' }));
    expect(mockNavigate).toHaveBeenCalledWith('/reports/sales-summary');

    fireEvent.click(screen.getByRole('button', { name: 'Monthly Recurring Revenue' }));
    expect(mockNavigate).toHaveBeenCalledWith('/recurring-profiles');
  });

  it('keeps all dashboard click targets safe and actionable', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/dashboard/summary')) {
        return Promise.resolve({
          data: {
            total_customers: 12,
            total_products: 8,
            total_invoices: 20,
            total_revenue: 150000,
            overdue_count: 1,
          },
        });
      }
      if (url.includes('/api/dashboard/low-stock')) {
        return Promise.resolve({ data: [{ id: 'p-1', name: 'Paper', stock: 2 }] });
      }
      if (url.includes('/api/dashboard/monthly-revenue')) {
        return Promise.resolve({ data: [{ month: '2026-04', revenue: 50000 }] });
      }
      if (url.includes('/api/dashboard/recent-invoices')) {
        return Promise.resolve({ data: [{ id: 'inv-1', invoice_number: 'INV-001', total_amount: 1000 }] });
      }
      if (url.includes('/api/products/stock-summary')) {
        return Promise.resolve({ data: [{ id: 'prod-1', name: 'Paper', sku: 'P-1', stock: 4 }] });
      }
      return Promise.resolve({ data: [] });
    });

    renderWithProviders(<DashboardPage />);
    await screen.findByText('Total Customers');

    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'View Invoices' }));
      fireEvent.click(screen.getByRole('button', { name: 'Total Customers' }));
      fireEvent.click(screen.getByRole('button', { name: 'Total Products' }));
      fireEvent.click(screen.getByRole('button', { name: 'Total Invoices' }));
      fireEvent.click(screen.getByRole('button', { name: 'Total Revenue' }));
      fireEvent.click(screen.getByRole('button', { name: 'Total Receivables' }));
      fireEvent.click(screen.getByRole('button', { name: 'Total Payables' }));
      fireEvent.click(screen.getByRole('button', { name: 'Overdue Invoices' }));
      fireEvent.click(screen.getByRole('button', { name: 'Monthly Recurring Revenue' }));
      fireEvent.click(screen.getByRole('button', { name: 'View All' }));
      fireEvent.click(screen.getByRole('button', { name: 'New Invoice' }));
      fireEvent.click(screen.getByRole('button', { name: 'Add Customer' }));
      fireEvent.click(screen.getByRole('button', { name: 'Add Product' }));
      fireEvent.click(screen.getByRole('button', { name: 'View All Products' }));
      fireEvent.click(screen.getByLabelText('Refresh'));
    }).not.toThrow();

    expect(mockNavigate).toHaveBeenCalledWith('/invoices?filter=overdue');
    expect(mockNavigate).toHaveBeenCalledWith('/customers');
    expect(mockNavigate).toHaveBeenCalledWith('/products');
    expect(mockNavigate).toHaveBeenCalledWith('/invoices');
    expect(mockNavigate).toHaveBeenCalledWith('/reports/sales-summary');
    expect(mockNavigate).toHaveBeenCalledWith('/reports/ar-aging');
    expect(mockNavigate).toHaveBeenCalledWith('/reports/ap-aging');
    expect(mockNavigate).toHaveBeenCalledWith('/recurring-profiles');
    expect(mockNavigate).toHaveBeenCalledWith('/invoices/add');
    expect(mockNavigate).toHaveBeenCalledWith('/customers/add');
    expect(mockNavigate).toHaveBeenCalledWith('/products/add');

    const disabledButtons = screen.getAllByRole('button').filter((btn) => btn.disabled);
    expect(disabledButtons.length).toBeGreaterThan(0);
  });

});
