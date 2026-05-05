import React from 'react';
import axios from 'axios';
import { fireEvent, renderWithProviders, screen, waitFor } from '../../test-utils';
import AddEditPurchaseOrder from '../../components/AddEditPurchaseOrder';

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

describe('AddEditPurchaseOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/vendors')) {
        return Promise.resolve({
          data: [{ id: 'vendor-1', vendor_name: 'Acme Supplies' }],
        });
      }
      if (url.includes('/api/products')) {
        return Promise.resolve({
          data: [
            { id: 'product-1', name: 'Packaging Material', price: 100, tax_rate: 18 },
            { id: 'product-2', name: 'Barcode Labels', price: 50, tax_rate: 12 },
          ],
        });
      }
      if (url.includes('/api/purchase-orders/next-number')) {
        return Promise.resolve({ data: { next_number: 'PO-321' } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it('renders purchase order form with default values', async () => {
    renderWithProviders(<AddEditPurchaseOrder />);

    expect(await screen.findByText('New Purchase Order')).toBeInTheDocument();
    expect(screen.getByDisplayValue('PO-321')).toBeInTheDocument();
    expect(screen.getByText('Line Items')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('updates line item amount and totals in real-time', async () => {
    renderWithProviders(<AddEditPurchaseOrder />);

    await screen.findByText('New Purchase Order');

    const itemInput = screen.getByPlaceholderText('Search item...');
    fireEvent.change(itemInput, { target: { value: 'Packaging Material' } });
    fireEvent.keyDown(itemInput, { key: 'ArrowDown' });
    fireEvent.keyDown(itemInput, { key: 'Enter' });

    const qtyInput = document.querySelector('input[name="item_0_quantity"]');
    fireEvent.change(qtyInput, { target: { value: '2' } });

    await waitFor(() => {
      expect(screen.getAllByText('₹236.00').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('₹200.00')).toBeInTheDocument();
      expect(screen.getByText('₹36.00')).toBeInTheDocument();
    });
  });

  it('creates purchase order and navigates to list on success', async () => {
    axios.post.mockResolvedValue({ data: { id: 'po-1' } });

    renderWithProviders(<AddEditPurchaseOrder />);

    await screen.findByText('New Purchase Order');

    const vendorSelect = document.querySelector('[name="vendor_id"]');
    fireEvent.change(vendorSelect, { target: { name: 'vendor_id', value: 'vendor-1' } });

    const orderDateInput = document.querySelector('input[name="order_date"]');
    fireEvent.change(orderDateInput, { target: { name: 'order_date', value: '2026-05-01' } });

    const itemInput = screen.getByPlaceholderText('Search item...');
    fireEvent.change(itemInput, { target: { value: 'Packaging Material' } });
    fireEvent.keyDown(itemInput, { key: 'ArrowDown' });
    fireEvent.keyDown(itemInput, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(mockNavigate).toHaveBeenCalledWith('/purchase-orders');
  });

  it('shows validation and keeps save disabled when required fields are missing', async () => {
    renderWithProviders(<AddEditPurchaseOrder />);

    await screen.findByText('New Purchase Order');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();

    const vendorSelect = document.querySelector('[name="vendor_id"]');
    fireEvent.change(vendorSelect, { target: { name: 'vendor_id', value: 'vendor-1' } });

    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });
});
