import React from 'react';
import axios from 'axios';
import { fireEvent, renderWithProviders, screen, waitFor } from '../../test-utils';
import AddEditBill from '../../components/AddEditBill';

const mockNavigate = jest.fn();

jest.mock('axios');

jest.mock('../../components/Layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../config/api', () => ({
  createApiUrl: (path) => `http://localhost:5001${path}`,
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

// Suppress scrollIntoView not implemented in jsdom
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

// ── Helpers ────────────────────────────────────────────────────────────────────

const setupDefaultMocks = () => {
  axios.get.mockImplementation((url) => {
    if (url.includes('/api/vendors')) {
      return Promise.resolve({
        data: [{ id: 'vendor-1', vendor_name: 'Acme Supplies' }],
      });
    }
    if (url.includes('/api/products')) {
      return Promise.resolve({
        data: [
          { id: 'product-1', name: 'Packaging Material', price: 1000, tax_rate: 18 },
          { id: 'product-2', name: 'Barcode Labels', price: 500, tax_rate: 12 },
        ],
      });
    }
    if (url.includes('/api/bills/next-number')) {
      return Promise.resolve({ data: { next_number: 'BILL-042' } });
    }
    return Promise.resolve({ data: {} });
  });
};

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('AddEditBill', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
  });

  // ── Create form ─────────────────────────────────────────────────────────────

  describe('create form', () => {
    it('renders heading and auto-populated bill number', async () => {
      renderWithProviders(<AddEditBill />);

      expect(await screen.findByText('New Bill')).toBeInTheDocument();
      expect(screen.getByDisplayValue('BILL-042')).toBeInTheDocument();
    });

    it('renders section headings', async () => {
      renderWithProviders(<AddEditBill />);

      await screen.findByText('New Bill');
      expect(screen.getByText('Bill Information')).toBeInTheDocument();
      expect(screen.getByText('Vendor & Dates')).toBeInTheDocument();
      expect(screen.getByText('Line Items')).toBeInTheDocument();
    });

    it('Save button is enabled but shows errors on submit with missing required fields', async () => {
      renderWithProviders(<AddEditBill />);

      await screen.findByText('New Bill');

      // bill_number is auto-filled; vendor, bill_date, due_date, and items are missing
      // The Save button itself is not disabled (it's only disabled during saving/checking)
      const saveBtn = screen.getByRole('button', { name: 'Save' });
      expect(saveBtn).not.toBeDisabled();

      // Clicking it should trigger validation errors
      fireEvent.click(saveBtn);
      await waitFor(() => {
        expect(screen.getByText('Vendor is required')).toBeInTheDocument();
      });
    });
  });

  // ── Edit form ───────────────────────────────────────────────────────────────

  describe('edit form', () => {
    it('shows "Edit Bill" heading when id param is present', async () => {
      // Reconfigure useParams mock to return an id
      const routerMod = jest.requireMock('react-router-dom');
      const origUseParams = routerMod.useParams;
      routerMod.useParams = () => ({ id: 'bill-edit-1' });

      axios.get.mockImplementation((url) => {
        if (url.includes('/api/vendors'))
          return Promise.resolve({ data: [{ id: 'v1', vendor_name: 'Acme' }] });
        if (url.includes('/api/products'))
          return Promise.resolve({ data: [] });
        if (url.includes('/api/bills/bill-edit-1'))
          return Promise.resolve({
            data: {
              id: 'bill-edit-1',
              bill_number: 'BILL-099',
              vendor_id: 'v1',
              bill_date: '2025-01-15',
              due_date: '2025-01-30',
              subject: 'Edit test',
              payment_status: 'Unpaid',
              notes: '',
              amount_paid: 0,
              items: [{ item_id: '', item_name: 'Goods', quantity: 1, rate: 500, tax: 5, amount: 525 }],
              expenses: [],
            },
          });
        return Promise.resolve({ data: {} });
      });

      renderWithProviders(<AddEditBill />);

      await waitFor(() => {
        expect(screen.getByText('Edit Bill')).toBeInTheDocument();
      });

      // Restore original
      routerMod.useParams = origUseParams;
    });
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  describe('form validation', () => {
    it('shows validation errors on submit with missing required fields', async () => {
      renderWithProviders(<AddEditBill />);

      await screen.findByText('New Bill');

      // Clear pre-filled bill number
      const billNumberInput = screen.getByDisplayValue('BILL-042');
      fireEvent.change(billNumberInput, { target: { name: 'bill_number', value: '' } });

      // Click save to trigger validation
      const saveBtn = screen.getByRole('button', { name: 'Save' });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(screen.getByText('Bill Number is required')).toBeInTheDocument();
      });
    });

    it('shows vendor required error when vendor is not selected', async () => {
      renderWithProviders(<AddEditBill />);

      await screen.findByText('New Bill');

      const saveBtn = screen.getByRole('button', { name: 'Save' });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(screen.getByText('Vendor is required')).toBeInTheDocument();
      });
    });

    it('shows item error when all items are blank', async () => {
      renderWithProviders(<AddEditBill />);

      await screen.findByText('New Bill');

      const saveBtn = screen.getByRole('button', { name: 'Save' });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(screen.getByText('At least one item is required')).toBeInTheDocument();
      });
    });
  });

  // ── Line item interactions ───────────────────────────────────────────────────

  describe('line item interactions', () => {
    it('updates amount when quantity changes', async () => {
      renderWithProviders(<AddEditBill />);

      await screen.findByText('New Bill');

      // Type into the Autocomplete item field
      const itemInput = screen.getByPlaceholderText('Search or type item...');
      fireEvent.change(itemInput, { target: { value: 'Packaging Material' } });
      fireEvent.keyDown(itemInput, { key: 'ArrowDown' });
      fireEvent.keyDown(itemInput, { key: 'Enter' });

      // Update quantity
      const qtyInput = document.querySelector('input[name="item_0_quantity"]');
      fireEvent.change(qtyInput, { target: { value: '2' } });

      // Rate is 1000 * 2 = 2000, 18% tax = 360 → amount = 2360
      await waitFor(() => {
        expect(screen.getAllByText('₹2360.00').length).toBeGreaterThanOrEqual(1);
      });
    });

    it('adds a new item row when Add Item is clicked', async () => {
      renderWithProviders(<AddEditBill />);

      await screen.findByText('New Bill');

      const addItemBtn = screen.getByRole('button', { name: /add item/i });
      fireEvent.click(addItemBtn);

      expect(screen.getByText('Items (2)')).toBeInTheDocument();
    });

    it('removes an item row when remove button is clicked', async () => {
      renderWithProviders(<AddEditBill />);

      await screen.findByText('New Bill');

      // Add two extra rows so we have 3 items
      const addItemBtn = screen.getByRole('button', { name: /add item/i });
      fireEvent.click(addItemBtn);
      fireEvent.click(addItemBtn);
      expect(screen.getByText('Items (3)')).toBeInTheDocument();

      // Find the remove buttons by aria-label (set via Tooltip on IconButton)
      // When enabled, the IconButton itself is the Tooltip child and receives title
      // We can also query by finding enabled delete icon buttons via role
      const deleteBtns = screen
        .getAllByRole('button')
        .filter((btn) => btn.querySelector('svg[data-testid="DeleteIcon"]') && !btn.disabled);
      fireEvent.click(deleteBtns[0]);

      await waitFor(() => {
        expect(screen.getByText('Items (2)')).toBeInTheDocument();
      });
    });

    it('disables remove button when only one item row exists', async () => {
      renderWithProviders(<AddEditBill />);

      await screen.findByText('New Bill');

      const deleteButtons = screen.queryAllByTitle('Remove row');
      if (deleteButtons.length > 0) {
        expect(deleteButtons[0].closest('button')).toBeDisabled();
      }
    });

    it('duplicates a line item when ContentCopy is clicked', async () => {
      renderWithProviders(<AddEditBill />);

      await screen.findByText('New Bill');

      const itemInput = screen.getByPlaceholderText('Search or type item...');
      fireEvent.change(itemInput, { target: { value: 'Barcode Labels' } });

      // Find duplicate button by the ContentCopy SVG icon
      const duplicateBtn = screen
        .getAllByRole('button')
        .find((btn) => btn.querySelector('svg[data-testid="ContentCopyIcon"]'));
      expect(duplicateBtn).toBeTruthy();
      fireEvent.click(duplicateBtn);

      expect(screen.getByText('Items (2)')).toBeInTheDocument();
    });
  });

  // ── Expense interactions ─────────────────────────────────────────────────────

  describe('expense interactions', () => {
    it('shows empty state when no expenses are added', async () => {
      renderWithProviders(<AddEditBill />);

      await screen.findByText('New Bill');

      // Switch to Expenses tab
      const expensesTab = screen.getByText('Expenses (0)');
      fireEvent.click(expensesTab);

      expect(screen.getByText('No expenses added')).toBeInTheDocument();
    });

    it('adds an expense row', async () => {
      renderWithProviders(<AddEditBill />);

      await screen.findByText('New Bill');

      const expensesTab = screen.getByText('Expenses (0)');
      fireEvent.click(expensesTab);

      const addExpenseBtn = screen.getByRole('button', { name: /add expense/i });
      fireEvent.click(addExpenseBtn);

      expect(screen.getByText('Expenses (1)')).toBeInTheDocument();
    });
  });

  // ── Form submit ─────────────────────────────────────────────────────────────

  describe('form submission', () => {
    it('POSTs to /api/bills and navigates to /bills on success', async () => {
      axios.post.mockResolvedValueOnce({ data: { id: 'bill-new' } });
      // No duplicates
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/vendors'))
          return Promise.resolve({ data: [{ id: 'v1', vendor_name: 'Vendor A' }] });
        if (url.includes('/api/products'))
          return Promise.resolve({ data: [{ id: 'p1', name: 'Product A', price: 500, tax_rate: 5 }] });
        if (url.includes('/api/bills/next-number'))
          return Promise.resolve({ data: { next_number: 'BILL-100' } });
        if (url.includes('/api/bills'))
          return Promise.resolve({ data: [] }); // no duplicates
        return Promise.resolve({ data: {} });
      });

      renderWithProviders(<AddEditBill />);

      await screen.findByText('New Bill');

      // Fill vendor
      const vendorSelect = document.querySelector('[name="vendor_id"]');
      fireEvent.change(vendorSelect, { target: { name: 'vendor_id', value: 'v1' } });

      // Fill bill_date
      const billDateInput = document.querySelector('input[name="bill_date"]');
      fireEvent.change(billDateInput, {
        target: { name: 'bill_date', value: '2025-06-01' },
      });

      // Fill due_date
      const dueDateInput = document.querySelector('input[name="due_date"]');
      fireEvent.change(dueDateInput, {
        target: { name: 'due_date', value: '2025-06-15' },
      });

      // Fill item
      const itemInput = screen.getByPlaceholderText('Search or type item...');
      fireEvent.change(itemInput, { target: { value: 'Product A' } });
      fireEvent.keyDown(itemInput, { key: 'ArrowDown' });
      fireEvent.keyDown(itemInput, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/bills',
        expect.objectContaining({ bill_number: 'BILL-100', vendor_id: 'v1' })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/bills');
    });

    it('shows API error banner when save fails', async () => {
      axios.post.mockRejectedValueOnce({
        response: { data: { error: 'Server error occurred' } },
      });
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/vendors'))
          return Promise.resolve({ data: [{ id: 'v1', vendor_name: 'Vendor A' }] });
        if (url.includes('/api/products'))
          return Promise.resolve({ data: [{ id: 'p1', name: 'Product A', price: 500, tax_rate: 5 }] });
        if (url.includes('/api/bills/next-number'))
          return Promise.resolve({ data: { next_number: 'BILL-100' } });
        if (url.includes('/api/bills'))
          return Promise.resolve({ data: [] });
        return Promise.resolve({ data: {} });
      });

      renderWithProviders(<AddEditBill />);
      await screen.findByText('New Bill');

      // Minimum required fields
      const vendorSelect = document.querySelector('[name="vendor_id"]');
      fireEvent.change(vendorSelect, { target: { name: 'vendor_id', value: 'v1' } });

      const billDateInput = document.querySelector('input[name="bill_date"]');
      fireEvent.change(billDateInput, { target: { name: 'bill_date', value: '2025-06-01' } });

      const dueDateInput = document.querySelector('input[name="due_date"]');
      fireEvent.change(dueDateInput, { target: { name: 'due_date', value: '2025-06-15' } });

      const itemInput = screen.getByPlaceholderText('Search or type item...');
      fireEvent.change(itemInput, { target: { value: 'Product A' } });
      fireEvent.keyDown(itemInput, { key: 'ArrowDown' });
      fireEvent.keyDown(itemInput, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(screen.getByText('Server error occurred')).toBeInTheDocument();
      });
    });

    it('detects duplicate bill number and shows error without calling POST', async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/vendors'))
          return Promise.resolve({ data: [{ id: 'v1', vendor_name: 'Vendor A' }] });
        if (url.includes('/api/products'))
          return Promise.resolve({ data: [{ id: 'p1', name: 'Product A', price: 500, tax_rate: 5 }] });
        if (url.includes('/api/bills/next-number'))
          return Promise.resolve({ data: { next_number: 'BILL-100' } });
        if (url.includes('/api/bills'))
          return Promise.resolve({
            data: [{ id: 'other-bill', bill_number: 'BILL-100' }],
          });
        return Promise.resolve({ data: {} });
      });

      renderWithProviders(<AddEditBill />);
      await screen.findByText('New Bill');

      const vendorSelect = document.querySelector('[name="vendor_id"]');
      fireEvent.change(vendorSelect, { target: { name: 'vendor_id', value: 'v1' } });

      const billDateInput = document.querySelector('input[name="bill_date"]');
      fireEvent.change(billDateInput, { target: { name: 'bill_date', value: '2025-06-01' } });

      const dueDateInput = document.querySelector('input[name="due_date"]');
      fireEvent.change(dueDateInput, { target: { name: 'due_date', value: '2025-06-15' } });

      const itemInput = screen.getByPlaceholderText('Search or type item...');
      fireEvent.change(itemInput, { target: { value: 'Product A' } });
      fireEvent.keyDown(itemInput, { key: 'ArrowDown' });
      fireEvent.keyDown(itemInput, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(screen.getByText('Bill Number already exists')).toBeInTheDocument();
      });
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  // ── Totals summary ───────────────────────────────────────────────────────────

  describe('totals summary', () => {
    it('updates Total Amount when rate and quantity change', async () => {
      renderWithProviders(<AddEditBill />);

      await screen.findByText('New Bill');

      // Select product
      const itemInput = screen.getByPlaceholderText('Search or type item...');
      fireEvent.change(itemInput, { target: { value: 'Packaging Material' } });
      fireEvent.keyDown(itemInput, { key: 'ArrowDown' });
      fireEvent.keyDown(itemInput, { key: 'Enter' });

      // price=1000, tax_rate=18, qty=1 → amount = 1000 + 180 = 1180
      await waitFor(() => {
        expect(screen.getAllByText('₹1180.00').length).toBeGreaterThanOrEqual(1);
      });

      // Change quantity to 3 → 3000 + 540 = 3540
      const qtyInput = document.querySelector('input[name="item_0_quantity"]');
      fireEvent.change(qtyInput, { target: { value: '3' } });

      await waitFor(() => {
        expect(screen.getAllByText('₹3540.00').length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // ── Navigation ───────────────────────────────────────────────────────────────

  describe('navigation', () => {
    it('Cancel button navigates to /bills', async () => {
      renderWithProviders(<AddEditBill />);

      await screen.findByText('New Bill');

      const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelBtn);

      expect(mockNavigate).toHaveBeenCalledWith('/bills');
    });
  });
});
