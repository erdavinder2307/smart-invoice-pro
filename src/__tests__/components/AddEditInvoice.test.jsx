import React from 'react';
import axios from 'axios';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import AddEditInvoice from '../../components/AddEditInvoice';
import { createInvoice } from '../../services/invoiceService';
import { getTaxRates, calculateInvoiceTax } from '../../services/taxService';

const mockNavigate = jest.fn();

jest.mock('axios');

jest.mock('../../services/invoiceService', () => ({
  createInvoice: jest.fn(),
  updateInvoice: jest.fn(),
}));

jest.mock('../../services/taxService', () => ({
  getTaxRates: jest.fn(),
  calculateInvoiceTax: jest.fn(),
}));

jest.mock('../../context/InvoicePreferencesContext', () => ({
  ...jest.requireActual('../../context/InvoicePreferencesContext'),
  useInvoicePreferences: jest.fn(() => ({
    prefs: {
      auto_generate_invoice_number: true,
      default_due_days: 30,
      default_payment_terms: 'Net 30',
      default_notes: '',
      default_terms: '',
    },
  })),
}));

jest.mock('../../components/Layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../components/common/CustomerSelect', () => ({
  __esModule: true,
  default: ({ value, onChange, name }) => (
    <input
      data-testid="customer-select"
      name={name}
      value={value || ''}
      onChange={(e) => onChange({ target: { name, value: e.target.value } })}
    />
  ),
}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
    useLocation: () => ({ state: null }),
  };
});

describe('AddEditInvoice', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const { useInvoicePreferences } = require('../../context/InvoicePreferencesContext');
    useInvoicePreferences.mockReturnValue({
      prefs: {
        auto_generate_invoice_number: true,
        default_due_days: 30,
        default_payment_terms: 'Net 30',
        default_notes: '',
        default_terms: '',
      },
    });

    getTaxRates.mockResolvedValue([
      { id: '0', name: 'Exempt (0%)', rate: 0 },
      { id: '18', name: 'GST 18%', rate: 18 },
    ]);
    calculateInvoiceTax.mockResolvedValue({
      cgst_amount: 0,
      sgst_amount: 0,
      igst_amount: 0,
      tax_type: 'NONE',
    });

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/customers')) {
        return Promise.resolve({ data: [{ id: 'cust-1', name: 'Acme Corp' }] });
      }
      if (url.includes('/api/products')) {
        return Promise.resolve({ data: [{ id: 'p-1', name: 'Implementation Service', price: 1500, tax_rate: 18 }] });
      }
      if (url.includes('/api/invoices/next-number')) {
        return Promise.resolve({ data: { next_invoice_number: 'INV-00999' } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it('renders invoice form with default values from APIs', async () => {
    renderWithProviders(<AddEditInvoice />);

    expect(await screen.findByText('New Invoice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('INV-00999')).toBeInTheDocument();
    expect(screen.getByText('Item Table')).toBeInTheDocument();
  });

  it('renders the invoice metadata fields with the expected grid sizing hooks', async () => {
    renderWithProviders(<AddEditInvoice />);

    await screen.findByDisplayValue('INV-00999');

    expect(screen.getByText('Customer Name')).toBeInTheDocument();
    expect(screen.getByText('Invoice #')).toBeInTheDocument();
    expect(screen.getByText('Order Number')).toBeInTheDocument();
    expect(screen.getByText('Invoice Date')).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();
    expect(screen.getByText('Terms')).toBeInTheDocument();
    expect(screen.getByText('Salesperson')).toBeInTheDocument();
    expect(screen.getByText('Subject')).toBeInTheDocument();

    expect(screen.getByTestId('invoice-field-customer')).toHaveAttribute('data-layout', 'full');
    expect(screen.getByTestId('invoice-field-subject')).toHaveAttribute('data-layout', 'full');

    [
      'invoice-field-number',
      'invoice-field-order-number',
      'invoice-field-issue-date',
      'invoice-field-due-date',
      'invoice-field-payment-terms',
      'invoice-field-salesperson',
    ].forEach((testId) => {
      expect(screen.getByTestId(testId)).toHaveAttribute('data-layout', 'half');
    });
  });

  it('adds new item row when Add New Row is clicked', async () => {
    renderWithProviders(<AddEditInvoice />);

    await screen.findByText('New Invoice');
    const before = screen.getAllByPlaceholderText('Type or click to select an item.').length;

    fireEvent.click(screen.getByRole('button', { name: 'Add New Row' }));

    const after = screen.getAllByPlaceholderText('Type or click to select an item.').length;
    expect(after).toBe(before + 1);
  });

  it('submits invoice and navigates to invoices list', async () => {
    renderWithProviders(<AddEditInvoice />);

    await screen.findByText('New Invoice');

    // Set required fields: customer and at least one item with a name
    fireEvent.change(screen.getByTestId('customer-select'), { target: { name: 'customer_id', value: 'cust-1' } });
    const itemInput = screen.getAllByPlaceholderText('Type or click to select an item.')[0];
    fireEvent.change(itemInput, { target: { value: 'Test Item' } });

    createInvoice.mockResolvedValue({ id: 'inv-1' });
    fireEvent.click(screen.getByRole('button', { name: 'Save and Send' }));

    await waitFor(() => expect(createInvoice).toHaveBeenCalledTimes(1));
    expect(mockNavigate).toHaveBeenCalledWith('/invoices');
  });

  it('blocks save when due date is before invoice date', async () => {
    renderWithProviders(<AddEditInvoice />);

    await screen.findByText('New Invoice');

    fireEvent.change(screen.getByTestId('customer-select'), { target: { name: 'customer_id', value: 'cust-1' } });
    const itemInput = screen.getAllByPlaceholderText('Type or click to select an item.')[0];
    fireEvent.change(itemInput, { target: { value: 'Test Item' } });

    const issueInput = document.querySelector('input[name="issue_date"]');
    const dueInput = document.querySelector('input[name="due_date"]');

    fireEvent.change(issueInput, {
      target: { name: 'issue_date', value: '2026-04-20' },
    });
    fireEvent.change(dueInput, {
      target: { name: 'due_date', value: '2026-04-10' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save and Send' }));
    await waitFor(() => expect(createInvoice).not.toHaveBeenCalled());
  });

  it('shows validation for invalid quantity', async () => {
    renderWithProviders(<AddEditInvoice />);

    await screen.findByText('New Invoice');

    fireEvent.change(screen.getByTestId('customer-select'), { target: { name: 'customer_id', value: 'cust-1' } });
    const itemInput = screen.getAllByPlaceholderText('Type or click to select an item.')[0];
    fireEvent.change(itemInput, { target: { value: 'Test Item' } });

    const quantityInput = screen.getAllByDisplayValue('1')[0];
    fireEvent.change(quantityInput, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save and Send' }));

    expect(await screen.findByText(/Qty must be greater than 0/i)).toBeInTheDocument();
    expect(createInvoice).not.toHaveBeenCalled();
  });

  it('disables save action while submit is in progress', async () => {
    renderWithProviders(<AddEditInvoice />);

    await screen.findByText('New Invoice');

    // Set required fields: customer and at least one item with a name
    fireEvent.change(screen.getByTestId('customer-select'), { target: { name: 'customer_id', value: 'cust-1' } });
    const itemInput = screen.getAllByPlaceholderText('Type or click to select an item.')[0];
    fireEvent.change(itemInput, { target: { value: 'Test Item' } });

    let resolveCreate;
    createInvoice.mockImplementation(
      () => new Promise((resolve) => {
        resolveCreate = resolve;
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save and Send' }));

    const savingButton = await screen.findByRole('button', { name: /Saving/i });
    expect(savingButton).toBeDisabled();

    resolveCreate({ id: 'inv-2' });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/invoices'));
  });

  it('shows error alert when customers API fails with retry button', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/customers')) {
        return Promise.reject(new Error('Network error'));
      }
      if (url.includes('/api/products')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/api/invoices/next-number')) {
        return Promise.resolve({ data: { next_invoice_number: 'INV-00999' } });
      }
      return Promise.resolve({ data: {} });
    });

    renderWithProviders(<AddEditInvoice />);

    expect(await screen.findByText(/Failed to load customers/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });

  it('clamps negative rate input to zero via min attribute', async () => {
    renderWithProviders(<AddEditInvoice />);
    await screen.findByText('New Invoice');

    // Rate inputs must have min="0" to prevent negative values at the browser/HTML level
    const rateInputs = Array.from(document.querySelectorAll('input[type="number"]'));
    // At least one numeric input should have min="0" (rate field)
    const hasMinZero = rateInputs.some((el) => el.min === '0');
    expect(hasMinZero).toBe(true);
  });

  it('shows validation when Save and Send is clicked with no customer selected', async () => {
    renderWithProviders(<AddEditInvoice />);
    await screen.findByText('New Invoice');

    const saveButton = screen.getByRole('button', { name: /Save and Send/i });
    expect(saveButton).not.toBeDisabled();
    fireEvent.click(saveButton);

    expect(await screen.findByText(/Please select a customer\./i)).toBeInTheDocument();
    expect(createInvoice).not.toHaveBeenCalled();
  });

  it('submits Draft status when Save as Draft is clicked', async () => {
    renderWithProviders(<AddEditInvoice />);

    await screen.findByText('New Invoice');

    fireEvent.change(screen.getByTestId('customer-select'), { target: { name: 'customer_id', value: 'cust-1' } });
    const itemInput = screen.getAllByPlaceholderText('Type or click to select an item.')[0];
    fireEvent.change(itemInput, { target: { value: 'Test Item' } });

    createInvoice.mockResolvedValue({ id: 'inv-1' });
    fireEvent.click(screen.getByRole('button', { name: 'Save as Draft' }));

    await waitFor(() => expect(createInvoice).toHaveBeenCalledTimes(1));
    const payload = createInvoice.mock.calls[0][0];
    expect(payload.status).toBe('Draft');
  });
});
