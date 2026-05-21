import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import VendorList from '../../components/VendorList';
import * as vendorService from '../../services/vendorService';

const mockNavigate = jest.fn();
const mockLocation = { pathname: '/vendors', search: '' };

jest.mock('../../services/vendorService');
jest.mock('@mui/material/useMediaQuery', () => jest.fn(() => false));

jest.mock('../../components/Layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../components/common/ResponsiveDataView', () => ({
  __esModule: true,
  default: ({ rows, emptyTitle }) => (
    <div>
      {rows.length > 0 ? rows.map((row) => <div key={row.id}>{row.vendor_name}</div>) : <div>{emptyTitle}</div>}
    </div>
  ),
}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: jest.fn(() => ({ user: { id: 'test-user-id', username: 'testuser' } })),
  AuthProvider: ({ children }) => children,
}));

const testTheme = createTheme();

const sampleResponse = {
  data: [
    {
      id: 'v-1',
      vendor_name: 'Acme Supplies',
      contact_person: 'Mia Patel',
      email: 'mia@acme.test',
      phone: '9999999999',
      total_purchases: 120000,
      outstanding_amount: 72000,
      payment_terms: 'Net 30',
      last_transaction_date: '2026-05-10',
      status: 'Active',
    },
  ],
  total: 1,
  page: 1,
  limit: 10,
  summary: {
    total_vendors: 1,
    active_vendors: 1,
    vendors_with_payables: 1,
    high_outstanding_vendors: 1,
  },
};

const renderVendorList = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <MemoryRouter initialEntries={['/vendors']}>
      <ThemeProvider theme={testTheme}>
        <QueryClientProvider client={queryClient}>
          <VendorList />
        </QueryClientProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('VendorList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    vendorService.getVendorsList.mockResolvedValue(sampleResponse);
    vendorService.bulkVendorAction.mockResolvedValue({ deleted: 0, updated: 0, errors: [] });
  });

  it('fetches vendors with standard list params', async () => {
    renderVendorList();

    await waitFor(() => expect(vendorService.getVendorsList).toHaveBeenCalled());

    const params = vendorService.getVendorsList.mock.calls[0][0];
    expect(params.include_meta).toBe('1');
    expect(params.sort_by).toBe('vendor_name');
    expect(params.sort_order).toBe('asc');
    expect(params.page).toBe(1);
    expect(params.page_size).toBe(10);
  });

  it('applies Active filter when clicking Active Vendors summary chip', async () => {
    renderVendorList();

    await waitFor(() => expect(vendorService.getVendorsList).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByText(/Active Vendors:/i));

    await waitFor(() => {
      const latestParams = vendorService.getVendorsList.mock.calls[vendorService.getVendorsList.mock.calls.length - 1][0];
      expect(latestParams.status).toBe('Active');
    });
  });

  it('applies high_outstanding filter when clicking High Outstanding Vendors summary chip', async () => {
    renderVendorList();

    await waitFor(() => expect(vendorService.getVendorsList).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByText(/High Outstanding Vendors:/i));

    await waitFor(() => {
      const latestParams = vendorService.getVendorsList.mock.calls[vendorService.getVendorsList.mock.calls.length - 1][0];
      expect(latestParams.outstanding).toBe('high_outstanding');
    });
  });
});
