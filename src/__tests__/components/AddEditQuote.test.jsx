import React from 'react';
import axios from 'axios';
import { screen, waitFor } from '@testing-library/react';
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
});