import React from 'react';
import axios from 'axios';
import { fireEvent, renderWithProviders, screen, waitFor } from '../../test-utils';
import CustomerList from '../../components/CustomerList';

const mockNavigate = jest.fn();

jest.mock('axios');

jest.mock('@mui/material/useMediaQuery', () => jest.fn(() => false));

jest.mock('../../components/Layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../components/common/ResponsiveDataView', () => ({
  __esModule: true,
  default: ({ toolbar, rows, emptyTitle }) => (
    <div>
      {toolbar}
      {rows.length > 0 ? rows.map((row) => <div key={row.id}>{row.name}</div>) : <div>{emptyTitle}</div>}
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

describe('CustomerList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({
      data: [{ id: 'cust-1', display_name: 'Acme Corp', email: 'acme@example.com', tenant_id: 'tenant-1' }],
    });
  });

  it('loads customers using created range from the URL and shows the active filter chip', async () => {
    renderWithProviders(<CustomerList />, { route: '/customers?created_range=this_week' });

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const requestUrl = axios.get.mock.calls[0][0];
    expect(requestUrl).toContain('/api/customers?');
    expect(requestUrl).toContain('created_from=');
    expect(requestUrl).toContain('created_to=');
    expect(screen.getByText('Created: This Week')).toBeInTheDocument();
  });

  it('preserves explicit custom dates from the URL and clears the filter chip', async () => {
    renderWithProviders(<CustomerList />, { route: '/customers?created_from=2026-04-01&created_to=2026-04-30' });

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const requestUrl = axios.get.mock.calls[0][0];
    expect(requestUrl).toContain('created_from=2026-04-01T00%3A00%3A00');
    expect(requestUrl).toContain('created_to=2026-04-30T23%3A59%3A59.999999');
    expect(screen.getByText('Created: 2026-04-01 to 2026-04-30')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('clear-created-filter'));
    expect(mockNavigate).toHaveBeenCalledWith('/customers');
  });
});