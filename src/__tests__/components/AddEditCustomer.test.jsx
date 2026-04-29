import React from 'react';
import axios from 'axios';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import AddEditCustomer from '../../components/AddEditCustomer';
import { getCustomers } from '../../services/customerService';

const mockNavigate = jest.fn();

jest.mock('axios');
jest.mock('../../services/customerService', () => ({
  getCustomers: jest.fn(),
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
    useParams: () => ({}),
  };
});

const setInput = (container, name, value) => {
  const input = container.querySelector(`input[name="${name}"]`);
  fireEvent.change(input, { target: { name, value } });
};

describe('AddEditCustomer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    getCustomers.mockResolvedValue([]);
  });

  it('renders customer form fields', async () => {
    const { container } = renderWithProviders(<AddEditCustomer />);

    await waitFor(() => expect(container.querySelector('input[name="display_name"]')).toBeInTheDocument());
    expect(container.querySelector('input[name="display_name"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="email"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="phone"]')).toBeInTheDocument();
  });

  it('renders the customer form with the expected shared layout hooks', async () => {
    const { container } = renderWithProviders(<AddEditCustomer />);

    await waitFor(() => expect(container.querySelector('input[name="display_name"]')).toBeInTheDocument());

    expect(screen.getByTestId('customer-field-primary-contact')).toHaveAttribute('data-layout', 'full');
    expect(screen.getByTestId('customer-field-company-name')).toHaveAttribute('data-layout', 'full');
    expect(screen.getByTestId('customer-field-display-name')).toHaveAttribute('data-layout', 'full');
    expect(screen.getByTestId('customer-field-phone')).toHaveAttribute('data-layout', 'full');
    expect(screen.getByTestId('customer-field-communication')).toHaveAttribute('data-layout', 'full');

    ['customer-field-email', 'customer-field-language'].forEach((testId) => {
      expect(screen.getByTestId(testId)).toHaveAttribute('data-layout', 'half');
    });

    [
      'customer-detail-field-gst-treatment',
      'customer-detail-field-place-of-supply',
      'customer-detail-field-pan',
      'customer-detail-field-tax-preference',
      'customer-detail-field-currency',
      'customer-detail-field-opening-balance',
    ].forEach((testId) => {
      expect(screen.getByTestId(testId)).toHaveAttribute('data-layout', 'half');
    });

    ['customer-detail-field-payment-terms', 'customer-detail-field-portal', 'customer-detail-field-documents'].forEach((testId) => {
      expect(screen.getByTestId(testId)).toHaveAttribute('data-layout', 'full');
    });

    expect(screen.getByText('Basic Info')).toBeInTheDocument();
    expect(screen.getByText('Contact Info')).toBeInTheDocument();
    expect(screen.getByText('Additional Details')).toBeInTheDocument();
  });

  it('shows required-field validation errors', async () => {
    renderWithProviders(<AddEditCustomer />);

    fireEvent.click(await screen.findByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Required for business customers')).toBeInTheDocument();
    expect(screen.getAllByText('Required').length).toBeGreaterThanOrEqual(3);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('submits when required fields are valid', async () => {
    const { container } = renderWithProviders(<AddEditCustomer />);

    await waitFor(() => expect(container.querySelector('input[name="display_name"]')).toBeInTheDocument());

    setInput(container, 'company_name', 'Acme Pvt Ltd');
    setInput(container, 'display_name', 'Acme Billing');
    setInput(container, 'email', 'billing@acme.com');
    setInput(container, 'phone', '9999999999');

    axios.post.mockResolvedValue({ data: { id: 'c-1' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(mockNavigate).toHaveBeenCalledWith('/customers', {
      state: { successMessage: 'Customer created successfully.' },
    });
  });

  it('supports save and new for creating another customer immediately', async () => {
    const { container } = renderWithProviders(<AddEditCustomer />);

    await waitFor(() => expect(container.querySelector('input[name="display_name"]')).toBeInTheDocument());

    setInput(container, 'company_name', 'Acme Pvt Ltd');
    setInput(container, 'display_name', 'Acme Billing');
    setInput(container, 'email', 'billing@acme.com');
    setInput(container, 'phone', '9999999999');

    axios.post.mockResolvedValue({ data: { id: 'c-9' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save & New' }));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(mockNavigate).toHaveBeenCalledWith('/customers/add', {
      state: { successMessage: 'Customer created successfully.' },
    });
  });

  it('disables submit button while saving', async () => {
    const { container } = renderWithProviders(<AddEditCustomer />);

    await waitFor(() => expect(container.querySelector('input[name="display_name"]')).toBeInTheDocument());

    setInput(container, 'company_name', 'Acme Pvt Ltd');
    setInput(container, 'display_name', 'Acme Billing');
    setInput(container, 'email', 'billing@acme.com');
    setInput(container, 'phone', '9999999999');

    let resolvePost;
    axios.post.mockImplementation(
      () => new Promise((resolve) => {
        resolvePost = resolve;
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    const savingButton = await screen.findByRole('button', { name: /Saving/i });
    expect(savingButton).toBeDisabled();

    resolvePost({ data: { id: 'c-2' } });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/customers', expect.any(Object)));
  });

  it('blocks duplicate customers by email or phone or GSTIN', async () => {
    getCustomers.mockResolvedValue([
      {
        id: 'cust-1',
        display_name: 'Acme Corp',
        email: 'billing@acme.com',
        phone: '9999999999',
        gst_number: '27ABCDE1234F1Z5',
      },
    ]);

    const { container } = renderWithProviders(<AddEditCustomer />);

    await waitFor(() => expect(container.querySelector('input[name="display_name"]')).toBeInTheDocument());

    setInput(container, 'company_name', 'Acme Pvt Ltd');
    setInput(container, 'display_name', 'Acme Billing');
    setInput(container, 'email', 'billing@acme.com');
    setInput(container, 'phone', '9999999999');

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Duplicate customer detected via email. Matches Acme Corp.')).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });
});
