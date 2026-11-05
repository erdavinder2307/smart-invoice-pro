import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Pricing from '../../pages/Pricing';
import { getBillingPlans } from '../../services/billingService';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
jest.mock('../../components/Layout/Header', () => () => <div />);
jest.mock('../../components/Layout/Footer', () => () => <div />);
jest.mock('../../services/billingService', () => ({ getBillingPlans: jest.fn() }));

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>
    </HelmetProvider>
  );

describe('Pricing', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    getBillingPlans.mockResolvedValue({ checkout_enabled: false });
  });

  it('shows monthly prices with the GST-inclusive amount', () => {
    renderPage();
    const starter = screen.getByTestId('plan-starter');
    expect(within(starter).getByText('₹599')).toBeInTheDocument();
    expect(within(starter).getByText(/₹707 incl\. GST/)).toBeInTheDocument();
    const growth = screen.getByTestId('plan-growth');
    expect(within(growth).getByText('₹1,499')).toBeInTheDocument();
    expect(within(growth).getByText(/₹1,769 incl\. GST/)).toBeInTheDocument();
    expect(screen.getByText(/30-day free trial · no card needed/)).toBeInTheDocument();
  });

  it('switches Starter to the yearly price and keeps Growth monthly', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Yearly' }));
    const starter = screen.getByTestId('plan-starter');
    expect(within(starter).getByText('₹5,999')).toBeInTheDocument();
    expect(within(starter).getByText(/₹7,079 incl\. GST/)).toBeInTheDocument();
    const growth = screen.getByTestId('plan-growth');
    expect(within(growth).getByText('₹1,499')).toBeInTheDocument();
    expect(within(growth).getByText('Monthly billing only')).toBeInTheDocument();
  });

  it('sends "Start free trial" to sign-up and hides Upgrade while checkout is off', async () => {
    renderPage();
    const starter = screen.getByTestId('plan-starter');
    await userEvent.click(within(starter).getByRole('button', { name: 'Start free trial' }));
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
    expect(getBillingPlans).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Upgrade' })).not.toBeInTheDocument();
  });

  it('shows Upgrade when the API says checkout is on and sends it to the billing page', async () => {
    getBillingPlans.mockResolvedValue({ checkout_enabled: true });
    renderPage();
    const starter = screen.getByTestId('plan-starter');
    await userEvent.click(await within(starter).findByRole('button', { name: 'Upgrade' }));
    expect(mockNavigate).toHaveBeenCalledWith('/settings/billing');
  });

  it('keeps Upgrade hidden when the plans request fails', async () => {
    getBillingPlans.mockRejectedValue(new Error('offline'));
    renderPage();
    await screen.findByTestId('plan-starter');
    expect(screen.queryByRole('button', { name: 'Upgrade' })).not.toBeInTheDocument();
  });
});
