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

jest.mock('../../components/Dashboard/RevenueTrendChart', () => ({
  __esModule: true,
  default: ({ data, loading, error, onNavigateToRevenue, onCreateInvoice }) => (
    <div>
      {loading ? <div data-testid="revenue-loading" /> : null}
      {error ? <div data-testid="revenue-error">{error}</div> : null}
      {!loading && !error && data.length > 0 && <div data-testid="revenue-bar-chart" />}
      <div data-testid="revenue-chart-area" role="button" tabIndex={0} onClick={onNavigateToRevenue} />
      {!loading && !error && data.length === 0 && (
        <button onClick={onCreateInvoice}>Create Invoice</button>
      )}
    </div>
  ),
}));

jest.mock('../../components/Dashboard/InventoryOverviewCard', () => ({
  __esModule: true,
  default: ({ lowStock, loading, error, onViewInventory, onViewCritical, onItemClick }) => (
    <div>
      {loading ? <div data-testid="inventory-loading" /> : null}
      {!loading && lowStock && lowStock.map((item) => (
        <div key={item.id || item.product_id} onClick={() => onItemClick(item)}>
          <span>{item.name}</span>
          {item.stock <= 0 && <span>Critical</span>}
        </div>
      ))}
      {!loading && <button onClick={onViewInventory}>View Inventory</button>}
      {!loading && <button onClick={onViewCritical}>View Critical</button>}
    </div>
  ),
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
  const buildSummary = () => ({
    period: {
      current: { label: 'This Year' },
      previous: { label: 'Previous This Year' },
    },
    metrics: {
      customers_added: { value: 12, previous_value: 10, percentage_change: 20 },
      invoices_created: { value: 20, previous_value: 16, percentage_change: 25 },
      revenue: { value: 150000, previous_value: 120000, percentage_change: 25 },
      payments_received: { value: 90000, previous_value: 70000, percentage_change: 28.57 },
      payables: { value: 21000, previous_value: 18000, percentage_change: 16.67 },
      overdue_invoices_current: { value: 1, is_time_based: false },
      total_customers: { value: 40, is_time_based: false },
      total_products: { value: 8, is_time_based: false },
    },
    overdue_count: 1,
    total_customers: 40,
    total_products: 8,
  });

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
      data: buildSummary(),
    });

    await waitFor(() => expect(screen.getByText('Customers Added')).toBeInTheDocument());
  });

  it('renders summary and chart data on successful API responses', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/dashboard/summary')) {
        return Promise.resolve({ data: buildSummary() });
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

    expect(await screen.findByText('Customers Added')).toBeInTheDocument();
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

    expect(await screen.findByText('Customers Added')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('renders search box (navigation) without mutating dashboard data', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/dashboard/summary')) {
        return Promise.resolve({ data: buildSummary() });
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
        return Promise.resolve({ data: buildSummary() });
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

  it('fetches and navigates with custom range dates when context provides custom range', async () => {
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

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/dashboard/summary')) {
        return Promise.resolve({ data: buildSummary() });
      }
      return Promise.resolve({ data: [] });
    });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/api/dashboard/monthly-revenue?range=custom&start_date=${customStart}&end_date=${customEnd}`)
      );
    });

    fireEvent.click(await screen.findByRole('button', { name: 'Revenue' }));
    expect(mockNavigate).toHaveBeenCalledWith(
      `/reports/sales-summary?start_date=${customStart}&end_date=${customEnd}`
    );
  });

  it('navigates when business overview cards are clicked', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/dashboard/summary')) {
        return Promise.resolve({ data: buildSummary() });
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

    await screen.findByText('Customers Added');

    fireEvent.click(screen.getByRole('button', { name: 'Customers Added' }));
    expect(mockNavigate).toHaveBeenCalledWith('/customers?created_range=this_year');

    fireEvent.click(screen.getByRole('button', { name: 'Revenue' }));
    expect(mockNavigate).toHaveBeenCalledWith('/reports/sales-summary?range=this_year');

    fireEvent.click(screen.getByRole('button', { name: 'Inventory Alerts (Current)' }));
    expect(mockNavigate).toHaveBeenCalledWith('/products?filter=Low+Stock');
  });

  it('keeps all dashboard click targets safe and actionable', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/dashboard/summary')) {
        return Promise.resolve({ data: buildSummary() });
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
    await screen.findByText('Customers Added');

    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'View Invoices' }));
      fireEvent.click(screen.getByRole('button', { name: 'Customers Added' }));
      fireEvent.click(screen.getByRole('button', { name: 'Invoices Created' }));
      fireEvent.click(screen.getByRole('button', { name: 'Revenue' }));
      fireEvent.click(screen.getByRole('button', { name: 'Payments Received' }));
      fireEvent.click(screen.getByRole('button', { name: 'Expenses / Payables' }));
      fireEvent.click(screen.getByRole('button', { name: 'Overdue Invoices (Current)' }));
      fireEvent.click(screen.getByRole('button', { name: 'Inventory Alerts (Current)' }));
      fireEvent.click(screen.getByRole('button', { name: 'Total Customers' }));
      fireEvent.click(screen.getByRole('button', { name: 'Total Products' }));
      fireEvent.click(screen.getByRole('button', { name: 'View All' }));
      fireEvent.click(screen.getByRole('button', { name: /New Invoice/i }));
      fireEvent.click(screen.getByRole('button', { name: /Add Customer/i }));
      fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));
      fireEvent.click(screen.getByRole('button', { name: 'View All Products' }));
      fireEvent.click(screen.getByLabelText('Refresh'));
    }).not.toThrow();

    expect(mockNavigate).toHaveBeenCalledWith('/invoices?status=Overdue');
    expect(mockNavigate).toHaveBeenCalledWith('/customers?created_range=this_year');
    expect(mockNavigate).toHaveBeenCalledWith('/invoices?created_range=this_year');
    expect(mockNavigate).toHaveBeenCalledWith('/reports/sales-summary?range=this_year');
    expect(mockNavigate).toHaveBeenCalledWith('/reports/payments-received?range=this_year');
    expect(mockNavigate).toHaveBeenCalledWith('/expenses?range=this_year');
    expect(mockNavigate).toHaveBeenCalledWith('/products?filter=Low+Stock');
    expect(mockNavigate).toHaveBeenCalledWith('/customers');
    expect(mockNavigate).toHaveBeenCalledWith('/products');
    expect(mockNavigate).toHaveBeenCalledWith('/invoices/add');
    expect(mockNavigate).toHaveBeenCalledWith('/customers/add');
    expect(mockNavigate).toHaveBeenCalledWith('/products/add');

    const disabledButtons = screen.getAllByRole('button').filter((btn) => btn.disabled);
    expect(disabledButtons.length).toBeGreaterThan(0);
  });

  it('navigates to revenue report when chart area is clicked', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/dashboard/summary')) return Promise.resolve({ data: buildSummary() });
      if (url.includes('/api/dashboard/low-stock')) return Promise.resolve({ data: [] });
      if (url.includes('/api/dashboard/monthly-revenue')) return Promise.resolve({ data: [{ month: '2026-01', label: 'Jan', revenue: 50000, previous_revenue: 40000, percentage_change: 25 }] });
      if (url.includes('/api/dashboard/recent-invoices')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderWithProviders(<DashboardPage />);
    await screen.findByText('Customers Added');

    fireEvent.click(screen.getByTestId('revenue-chart-area'));
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/reports/sales-summary'));
  });

  it('shows critical inventory items in InventoryOverviewCard', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/dashboard/summary')) return Promise.resolve({ data: buildSummary() });
      if (url.includes('/api/dashboard/low-stock')) return Promise.resolve({ data: [{ id: 'p-1', product_id: 'p-1', name: 'Paper', stock: 0 }] });
      if (url.includes('/api/dashboard/monthly-revenue')) return Promise.resolve({ data: [] });
      if (url.includes('/api/dashboard/recent-invoices')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderWithProviders(<DashboardPage />);
    await screen.findByText('Customers Added');
    await screen.findByText('Paper');

    expect(screen.getAllByText('Critical').length).toBeGreaterThan(0);
  });

  it('navigates to product page when critical inventory item is clicked', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/dashboard/summary')) return Promise.resolve({ data: buildSummary() });
      if (url.includes('/api/dashboard/low-stock')) return Promise.resolve({ data: [{ id: 'p-1', product_id: 'p-1', name: 'Paper', stock: 2 }] });
      if (url.includes('/api/dashboard/monthly-revenue')) return Promise.resolve({ data: [] });
      if (url.includes('/api/dashboard/recent-invoices')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderWithProviders(<DashboardPage />);
    await screen.findByText('Paper');

    fireEvent.click(screen.getByText('Paper'));
    expect(mockNavigate).toHaveBeenCalledWith('/products/edit/p-1');
  });

  it('limits recent invoice feed to max 7 and groups by attention/paid', async () => {
    const invoices = Array.from({ length: 10 }).map((_, idx) => ({
      id: `inv-${idx + 1}`,
      invoice_number: `INV-00${idx + 1}`,
      customer_name: `Customer ${idx + 1}`,
      total_amount: 1000 + idx * 50,
      balance_due: idx === 8 ? 0 : 100,
      status: idx === 0 ? 'Overdue' : idx === 1 ? 'Draft' : idx === 8 ? 'Paid' : 'Issued',
      issue_date: `2026-04-${String(10 + idx).padStart(2, '0')}`,
      due_date: idx === 0 ? '2026-04-01' : idx === 1 ? '2026-04-28' : `2026-05-${String(10 + idx).padStart(2, '0')}`,
    }));

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/dashboard/summary')) return Promise.resolve({ data: buildSummary() });
      if (url.includes('/api/dashboard/low-stock')) return Promise.resolve({ data: [] });
      if (url.includes('/api/dashboard/monthly-revenue')) return Promise.resolve({ data: [] });
      if (url.includes('/api/dashboard/recent-invoices')) return Promise.resolve({ data: invoices });
      if (url.includes('/api/products/stock-summary')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderWithProviders(<DashboardPage />);
    await screen.findByText('Priority Invoice Feed');
    await screen.findByRole('button', { name: 'INV-001' });

    expect(screen.getAllByText('Overdue').length).toBeGreaterThan(0);
    expect(screen.getByText('Showing 7 of 10')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /INV-/i }).length).toBeLessThanOrEqual(7);

    fireEvent.click(screen.getByRole('button', { name: 'Attention' }));
    expect(screen.queryByText('Recently Paid')).not.toBeInTheDocument();
  });

  it('executes send reminder and mark as paid actions from recent invoice cards', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/dashboard/summary')) return Promise.resolve({ data: buildSummary() });
      if (url.includes('/api/dashboard/low-stock')) return Promise.resolve({ data: [] });
      if (url.includes('/api/dashboard/monthly-revenue')) return Promise.resolve({ data: [] });
      if (url.includes('/api/dashboard/recent-invoices')) {
        return Promise.resolve({
          data: [
            {
              id: 'inv-22',
              invoice_number: 'INV-022',
              customer_name: 'Acme Corp',
              total_amount: 1200,
              balance_due: 1200,
              status: 'Issued',
              issue_date: '2026-04-20',
              due_date: '2026-04-25',
            },
          ],
        });
      }
      if (url.includes('/api/products/stock-summary')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    axios.post.mockResolvedValue({ data: { message: 'ok' } });

    renderWithProviders(<DashboardPage />);
    await screen.findByRole('button', { name: 'INV-022' }, { timeout: 5000 });

    fireEvent.click(screen.getByRole('button', { name: 'Send reminder' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mark as paid' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/invoices/inv-22/send-email'), expect.any(Object));
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/invoices/inv-22/record-payment'), expect.any(Object));
    });
  });

});
