import React from 'react';
import axios from 'axios';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import AddEditCustomer from '../../components/AddEditCustomer';

const mockNavigate = jest.fn();

jest.mock('axios');

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
  });

  it('renders customer form fields', async () => {
    const { container } = renderWithProviders(<AddEditCustomer />);

    await waitFor(() => expect(container.querySelector('input[name="display_name"]')).toBeInTheDocument());
    expect(container.querySelector('input[name="display_name"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="email"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="phone"]')).toBeInTheDocument();
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
});
