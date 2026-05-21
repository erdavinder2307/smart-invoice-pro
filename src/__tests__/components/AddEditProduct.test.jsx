import React from 'react';
import axios from 'axios';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import AddEditProduct from '../../components/AddEditProduct';
import { createProduct } from '../../services/productService';

const mockNavigate = jest.fn();

jest.mock('axios');
jest.mock('../../services/productService', () => ({
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
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

const selectUnit = async (container, unit = 'pcs') => {
  fireEvent.mouseDown(container.querySelector('#mui-component-select-unit'));
  fireEvent.click(await screen.findByRole('option', { name: unit }));
};

describe('AddEditProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: [] });
  });

  it('renders key fields', async () => {
    const { container } = renderWithProviders(<AddEditProduct />);

    await waitFor(() => expect(container.querySelector('input[name="name"]')).toBeInTheDocument());
    expect(container.querySelector('input[name="name"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="price"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="purchase_rate"]')).toBeInTheDocument();
  });

  it('shows validation errors when required fields are missing', async () => {
    renderWithProviders(<AddEditProduct />);

    fireEvent.click(await screen.findByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Item name is required')).toBeInTheDocument();
    expect(screen.getByText('Selling price is required')).toBeInTheDocument();
    expect(screen.getByText('Cost price is required')).toBeInTheDocument();
    expect(createProduct).not.toHaveBeenCalled();
  });

  it('submits valid payload and navigates back to list', async () => {
    const { container } = renderWithProviders(<AddEditProduct />);

    await waitFor(() => expect(container.querySelector('input[name="name"]')).toBeInTheDocument());

    setInput(container, 'name', 'USB Cable');
    await selectUnit(container, 'pcs');
    setInput(container, 'price', '120');
    setInput(container, 'purchase_rate', '75');

    createProduct.mockResolvedValue({ id: 'p-1' });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(createProduct).toHaveBeenCalledTimes(1));
    expect(mockNavigate).toHaveBeenCalledWith('/products');
  });

  it('disables submit while request is in progress', async () => {
    const { container } = renderWithProviders(<AddEditProduct />);

    await waitFor(() => expect(container.querySelector('input[name="name"]')).toBeInTheDocument());

    setInput(container, 'name', 'Notebook');
    await selectUnit(container, 'pcs');
    setInput(container, 'price', '300');
    setInput(container, 'purchase_rate', '220');

    let resolveCreate;
    createProduct.mockImplementation(
      () => new Promise((resolve) => {
        resolveCreate = resolve;
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    const savingButton = await screen.findByRole('button', { name: /Saving/i });
    expect(savingButton).toBeDisabled();

    resolveCreate({ id: 'p-2' });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/products'));
  });

  it('supports searching and selecting preferred vendor', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 'v-1', name: 'Acme Supplies' },
        { id: 'v-2', name: 'Beta Traders' },
      ],
    });

    const { container } = renderWithProviders(<AddEditProduct />);

    await waitFor(() => expect(container.querySelector('input[name="name"]')).toBeInTheDocument());

    setInput(container, 'name', 'USB Cable');
    await selectUnit(container, 'pcs');
    setInput(container, 'price', '120');
    setInput(container, 'purchase_rate', '75');

    const vendorInput = screen.getByPlaceholderText('Search vendor');
    fireEvent.change(vendorInput, { target: { value: 'Acme' } });
    fireEvent.click(await screen.findByRole('option', { name: 'Acme Supplies' }));

    createProduct.mockResolvedValue({ id: 'p-3' });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(createProduct).toHaveBeenCalledTimes(1));
    expect(createProduct).toHaveBeenCalledWith(expect.objectContaining({ preferred_vendor_id: 'v-1' }));
  });

  it('clears preferred vendor with clear button', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 'v-1', name: 'Acme Supplies' },
        { id: 'v-2', name: 'Beta Traders' },
      ],
    });

    const { container } = renderWithProviders(<AddEditProduct />);

    await waitFor(() => expect(container.querySelector('input[name="name"]')).toBeInTheDocument());

    setInput(container, 'name', 'USB Cable');
    await selectUnit(container, 'pcs');
    setInput(container, 'price', '120');
    setInput(container, 'purchase_rate', '75');

    const vendorInput = screen.getByPlaceholderText('Search vendor');
    fireEvent.change(vendorInput, { target: { value: 'Acme' } });
    fireEvent.click(await screen.findByRole('option', { name: 'Acme Supplies' }));

    fireEvent.click(screen.getByLabelText('Clear'));

    createProduct.mockResolvedValue({ id: 'p-4' });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(createProduct).toHaveBeenCalledTimes(1));
    expect(createProduct).toHaveBeenCalledWith(expect.objectContaining({ preferred_vendor_id: '' }));
  });
});
