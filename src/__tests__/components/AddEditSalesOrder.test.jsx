import React from 'react';
import axios from 'axios';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import AddEditSalesOrder from '../../components/AddEditSalesOrder';

jest.mock('axios');

jest.mock('../../components/Layout/MainLayout', () => ({ children }) => <div>{children}</div>);

jest.mock('../../components/common/CustomerSelect', () => ({ value, onChange, name, required }) => (
  <input
    aria-label="Customer"
    name={name}
    required={required}
    value={value}
    onChange={onChange}
  />
));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
    useLocation: () => ({ state: null }),
  };
});

describe('AddEditSalesOrder layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/customers')) {
        return Promise.resolve({ data: [{ id: 'customer-1', name: 'Acme Corp' }] });
      }

      if (url.includes('/api/sales-orders/next-number')) {
        return Promise.resolve({ data: { next_number: 'SO-01001' } });
      }

      return Promise.resolve({ data: {} });
    });
  });

  it('renders the sales order metadata fields with the expected grid sizing hooks', async () => {
    renderWithProviders(<AddEditSalesOrder />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('SO-01001')).toBeInTheDocument();
    });

    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('SO Number')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Order Date')).toBeInTheDocument();
    expect(screen.getByText('Delivery Date')).toBeInTheDocument();
    expect(screen.getByText('Payment Terms')).toBeInTheDocument();
    expect(screen.getByText('Salesperson')).toBeInTheDocument();
    expect(screen.getByText('Subject')).toBeInTheDocument();

    expect(screen.getByTestId('sales-order-field-customer')).toHaveAttribute('data-layout', 'full');
    expect(screen.getByTestId('sales-order-field-subject')).toHaveAttribute('data-layout', 'full');

    [
      'sales-order-field-number',
      'sales-order-field-status',
      'sales-order-field-order-date',
      'sales-order-field-delivery-date',
      'sales-order-field-payment-terms',
      'sales-order-field-salesperson',
    ].forEach((testId) => {
      expect(screen.getByTestId(testId)).toHaveAttribute('data-layout', 'half');
    });
  });
});