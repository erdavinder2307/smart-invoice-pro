import React from 'react';
import axios from 'axios';
import { renderWithProviders, screen, waitFor } from '../../test-utils';
import DashboardPage from '../../pages/Dashboard';

const mockNavigate = jest.fn();

jest.mock('axios');

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
        return Promise.resolve({ data: [{ month: 'Jan', revenue: 50000 }] });
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
});
