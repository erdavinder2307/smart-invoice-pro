import React from 'react';
import { fireEvent, renderWithProviders, screen, waitFor } from '../../test-utils';
import AddEditRecurringProfile from '../../components/AddEditRecurringProfile';
import { getCustomers } from '../../services/customerService';
import { createRecurringProfile } from '../../services/recurringProfileService';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
  };
});

jest.mock('../../components/Layout/MainLayout', () => ({ children }) => <div>{children}</div>);

jest.mock('../../components/common/CustomerSelect', () => ({ customers, value, onChange, name }) => (
  <select data-testid="customer-select" name={name} value={value} onChange={onChange}>
    <option value="">Select</option>
    {customers.map((customer) => (
      <option key={customer.id} value={customer.id}>{customer.name}</option>
    ))}
  </select>
));

jest.mock('../../components/common/DevAutoFillButton', () => ({ onClick }) => (
  <button type="button" onClick={onClick}>Auto Fill</button>
));

jest.mock('../../services/customerService', () => ({
  getCustomers: jest.fn(),
}));

jest.mock('../../services/recurringProfileService', () => ({
  createRecurringProfile: jest.fn(),
  updateRecurringProfile: jest.fn(),
  getRecurringProfileById: jest.fn(),
}));

describe('AddEditRecurringProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCustomers.mockResolvedValue([
      { id: 'cust-1', name: 'Acme Corp', email: 'billing@acme.com', phone: '9999999999' },
    ]);
    createRecurringProfile.mockResolvedValue({ id: 'rp-1' });
  });

  it('renders standardized sections and preview block', async () => {
    renderWithProviders(<AddEditRecurringProfile />);

    await waitFor(() => expect(getCustomers).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

    expect(screen.getByText('1. Basic Info')).toBeInTheDocument();
    expect(screen.getByText('2. Recurrence Rules')).toBeInTheDocument();
    expect(screen.getByText('3. Invoice Items')).toBeInTheDocument();
    expect(screen.getByText('4. Summary')).toBeInTheDocument();
    expect(screen.getByText('5. Automation Settings')).toBeInTheDocument();
    expect(screen.getByText('6. Notes')).toBeInTheDocument();
    expect(screen.getByText('Next 5 Invoice Dates')).toBeInTheDocument();
  });

  it('shows inline validation for invalid end date', async () => {
    const { container } = renderWithProviders(<AddEditRecurringProfile />);

    await waitFor(() => expect(getCustomers).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

    fireEvent.change(screen.getByTestId('customer-select'), { target: { value: 'cust-1' } });

    const profileNameInput = container.querySelector('input[name="profile_name"]');
    fireEvent.change(profileNameInput, { target: { value: 'Monthly Support' } });

    fireEvent.click(screen.getByLabelText('On date'));

    const dateInputs = container.querySelectorAll('input[type="date"]');
    const startDate = dateInputs[0]?.value || '2026-04-30';
    const startDateObj = new Date(`${startDate}T00:00:00`);
    const invalidEndDateObj = new Date(startDateObj);
    invalidEndDateObj.setDate(invalidEndDateObj.getDate() - 1);
    const invalidEndDate = invalidEndDateObj.toISOString().slice(0, 10);

    fireEvent.change(dateInputs[1], { target: { value: invalidEndDate } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Profile' }));

    expect(await screen.findByText('End date must be greater than start date.')).toBeInTheDocument();
    expect(createRecurringProfile).not.toHaveBeenCalled();
  });

  it('submits payload with recurrence_rule and totals', async () => {
    const { container } = renderWithProviders(<AddEditRecurringProfile />);

    await waitFor(() => expect(getCustomers).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

    fireEvent.change(screen.getByTestId('customer-select'), { target: { value: 'cust-1' } });

    fireEvent.change(container.querySelector('input[name="profile_name"]'), { target: { value: 'Weekly Billing' } });
    fireEvent.change(container.querySelector('input[name="item_name_0"]'), { target: { value: 'Support Plan' } });

    const qtyInput = container.querySelector('input[name="item_quantity_0"]');
    const rateInput = container.querySelector('input[name="item_rate_0"]');
    fireEvent.change(qtyInput, { target: { value: '2' } });
    fireEvent.change(rateInput, { target: { value: '1500' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Profile' }));

    await waitFor(() => expect(createRecurringProfile).toHaveBeenCalledTimes(1));

    const payload = createRecurringProfile.mock.calls[0][0];
    expect(payload.recurrence_rule).toBeDefined();
    expect(payload.recurrence_rule.frequency).toBe('Monthly');
    expect(payload.amount).toBeGreaterThan(0);
    expect(payload.items[0].amount).toBeGreaterThan(0);
  });

  it('applies dev auto fill data', async () => {
    renderWithProviders(<AddEditRecurringProfile />);

    await waitFor(() => expect(getCustomers).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Auto Fill' }));

    expect(await screen.findByDisplayValue('Weekly')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('12')).toBeInTheDocument();
  });
});
