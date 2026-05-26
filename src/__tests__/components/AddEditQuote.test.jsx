import React from 'react';
import axios from 'axios';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import AddEditQuote from '../../components/AddEditQuote';

jest.mock('axios');

jest.mock('../../components/Layout/MainLayout', () => ({ children }) => <div>{children}</div>);

jest.mock('../../components/common/CustomerSelect', () => ({ value, onChange, name, required }) => (
  <input
    aria-label="Customer Name"
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

describe('AddEditQuote layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/customers')) {
        return Promise.resolve({ data: [{ id: 'customer-1', name: 'Acme Corp' }] });
      }

      if (url.includes('/api/products')) {
        return Promise.resolve({
          data: [
            {
              id: 'product-1',
              name: 'Premium Setup Service',
              price: 2500,
              tax_rate: 18,
              unit: 'pcs',
              stock: 12,
            },
          ],
        });
      }

      if (url.includes('/api/quotes/next-number')) {
        return Promise.resolve({ data: { next_number: 'QT-000123' } });
      }

      return Promise.resolve({ data: {} });
    });
  });

  it('renders the quote form fields with the expected grid sizing hooks', async () => {
    renderWithProviders(<AddEditQuote />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('QT-000123')).toBeInTheDocument();
    });

    expect(screen.getByText('Customer Name')).toBeInTheDocument();
    expect(screen.getByText('Quote #')).toBeInTheDocument();
    expect(screen.getByText('Reference #')).toBeInTheDocument();
    expect(screen.getByText('Quote Date')).toBeInTheDocument();
    expect(screen.getByText('Expiry Date')).toBeInTheDocument();
    expect(screen.getByText('Salesperson')).toBeInTheDocument();
    expect(screen.getByText('Project Name')).toBeInTheDocument();
    expect(screen.getByText('Subject')).toBeInTheDocument();

    expect(screen.getByTestId('quote-field-customer')).toHaveAttribute('data-layout', 'full');
    expect(screen.getByTestId('quote-field-subject')).toHaveAttribute('data-layout', 'full');

    [
      'quote-field-number',
      'quote-field-reference',
      'quote-field-issue-date',
      'quote-field-expiry-date',
      'quote-field-salesperson',
      'quote-field-project-name',
    ].forEach((testId) => {
      expect(screen.getByTestId(testId)).toHaveAttribute('data-layout', 'half');
    });
  });

  it('shows all auto fill modes in dev/test environments', async () => {
    renderWithProviders(<AddEditQuote />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('QT-000123')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /auto fill/i }));

    expect(screen.getByText('Minimal Auto Fill (quick testing)')).toBeInTheDocument();
    expect(screen.getByText('Full Auto Fill (realistic scenario)')).toBeInTheDocument();
    expect(screen.getByText('Edge Case Auto Fill (advanced testing)')).toBeInTheDocument();
  });

  it('blocks submit when an item quantity is zero', async () => {
    renderWithProviders(<AddEditQuote />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('QT-000123')).toBeInTheDocument();
    });

    const customerInput = screen.getByLabelText('Customer Name');
    fireEvent.change(customerInput, { target: { name: 'customer_id', value: 'customer-1' } });

    const itemInput = screen.getByPlaceholderText('Type or click to select an item.');
    fireEvent.change(itemInput, { target: { value: 'Premium Setup Service' } });

    const quantityInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(quantityInputs[0], { target: { value: '0' } });

    fireEvent.click(screen.getByRole('button', { name: /save and send/i }));

    await waitFor(() => {
      expect(screen.getByText('Item quantity must be greater than 0.')).toBeInTheDocument();
    });
  });

  it('shows a retry alert when the customers API fails', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/customers')) {
        return Promise.reject(new Error('Network error'));
      }
      if (url.includes('/api/products')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/api/quotes/next-number')) {
        return Promise.resolve({ data: { next_number: 'QT-000124' } });
      }
      return Promise.resolve({ data: [] });
    });

    renderWithProviders(<AddEditQuote />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load customers/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});