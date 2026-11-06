import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BillingSettings, { ACTIVATION_WAIT_MS } from '../../pages/BillingSettings';
import {
  cancelSubscription,
  createSubscription,
  downloadTaxInvoicePdf,
  getSubscription,
} from '../../services/billingService';
import { openSubscriptionCheckout } from '../../utils/razorpayCheckout';

jest.mock('../../components/Layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../services/billingService', () => ({
  getSubscription: jest.fn(),
  createSubscription: jest.fn(),
  cancelSubscription: jest.fn(),
  downloadTaxInvoicePdf: jest.fn(),
}));
jest.mock('../../utils/razorpayCheckout', () => ({
  openSubscriptionCheckout: jest.fn(),
}));

const trial = {
  plan: 'trial',
  trial_ends_at: '2026-11-10T00:00:00Z',
  plan_period_end: null,
  billing: { status: null, cancel_at_period_end: false },
  checkout_enabled: true,
  invoices: [],
};

const activeStarter = {
  ...trial,
  plan: 'starter',
  plan_period_end: '2026-12-10T00:00:00Z',
  billing: { status: 'active', plan_code: 'starter', period: 'monthly', cancel_at_period_end: false },
};

describe('BillingSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the trial end date and plans with the amount charged incl. GST', async () => {
    getSubscription.mockResolvedValue(trial);
    render(<BillingSettings />);
    expect(await screen.findByText('Free trial')).toBeInTheDocument();
    expect(screen.getByText(/free trial ends on 10 Nov 2026/)).toBeInTheDocument();
    const starter = screen.getByTestId('billing-plan-starter');
    expect(within(starter).getByText(/₹707 charged/)).toBeInTheDocument();
    expect(within(starter).getByRole('button', { name: 'Upgrade to Starter' })).toBeEnabled();
  });

  it('disables Upgrade and explains when online payment is off', async () => {
    getSubscription.mockResolvedValue({ ...trial, checkout_enabled: false });
    render(<BillingSettings />);
    expect(await screen.findByText(/Online payment is not switched on yet/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upgrade to Starter' })).toBeDisabled();
  });

  it('opens Checkout for the chosen plan and period, then waits for the webhook to activate it', async () => {
    getSubscription.mockResolvedValueOnce(trial).mockResolvedValue(activeStarter);
    createSubscription.mockResolvedValue({ subscription_id: 'sub_test', key_id: 'key_test', prefill: { email: 'a@b.c' } });
    openSubscriptionCheckout.mockResolvedValue(true);
    render(<BillingSettings />);

    await userEvent.click(await screen.findByRole('button', { name: 'Yearly' }));
    await userEvent.click(screen.getByRole('button', { name: 'Upgrade to Starter' }));

    expect(createSubscription).toHaveBeenCalledWith('starter', 'yearly');
    await waitFor(() =>
      expect(openSubscriptionCheckout).toHaveBeenCalledWith(
        expect.objectContaining({ keyId: 'key_test', subscriptionId: 'sub_test', prefill: { email: 'a@b.c' } })
      )
    );
    expect(await screen.findByText(/Payment received. You are on Starter now./)).toBeInTheDocument();
  });

  it('says the payment was not completed when Checkout is closed', async () => {
    getSubscription.mockResolvedValue(trial);
    createSubscription.mockResolvedValue({ subscription_id: 'sub_test', key_id: 'key_test', prefill: {} });
    openSubscriptionCheckout.mockResolvedValue(false);
    render(<BillingSettings />);
    await userEvent.click(await screen.findByRole('button', { name: 'Upgrade to Growth' }));
    expect(await screen.findByText(/Payment was not completed/)).toBeInTheDocument();
  });

  it('shows the API error when the subscription cannot be created', async () => {
    getSubscription.mockResolvedValue(trial);
    createSubscription.mockRejectedValue({ response: { data: { error: 'billing not enabled' } } });
    render(<BillingSettings />);
    await userEvent.click(await screen.findByRole('button', { name: 'Upgrade to Starter' }));
    expect(await screen.findByText('billing not enabled')).toBeInTheDocument();
    expect(openSubscriptionCheckout).not.toHaveBeenCalled();
  });

  it('stops waiting at the deadline even if timers were delayed', async () => {
    jest.useFakeTimers();
    try {
      const start = Date.now();
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(start);
      getSubscription.mockResolvedValue(trial);
      createSubscription.mockResolvedValue({ subscription_id: 'sub_test', key_id: 'key_test', prefill: {} });
      openSubscriptionCheckout.mockResolvedValue(true);
      render(<BillingSettings />);
      fireEvent.click(await screen.findByRole('button', { name: 'Upgrade to Starter' }));
      expect(await screen.findByText(/Activating your plan/)).toBeInTheDocument();

      // The tab was suspended past the deadline: the next check must give up instead of waiting another minute.
      nowSpy.mockReturnValue(start + ACTIVATION_WAIT_MS + 1);
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      expect(await screen.findByText(/Your payment is being confirmed/)).toBeInTheDocument();
      nowSpy.mockRestore();
    } finally {
      jest.useRealTimers();
    }
  });

  it('cancels at the end of the paid period after confirmation', async () => {
    getSubscription.mockResolvedValue(activeStarter);
    cancelSubscription.mockResolvedValue({ cancel_at_period_end: true, plan_period_end: '2026-12-10T00:00:00Z' });
    render(<BillingSettings />);
    expect(await screen.findByText(/Paid until 10 Dec 2026/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Current plan' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel subscription' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel subscription' }));

    expect(cancelSubscription).toHaveBeenCalled();
    expect(await screen.findByText(/keeps working until 10 Dec 2026/)).toBeInTheDocument();
  });

  describe('tax invoices', () => {
    const invoice = {
      id: 'tinv_pay_1',
      number: 'SB/2026-27/0001',
      issue_date: '2026-10-11',
      description: 'Starter plan, monthly',
      total: 707.82,
      currency: 'INR',
    };
    const downloadButton = () =>
      screen.findByRole('button', { name: 'Download invoice SB/2026-27/0001 as PDF' });

    it('says when there are no invoices yet', async () => {
      getSubscription.mockResolvedValue(trial);
      render(<BillingSettings />);
      expect(await screen.findByText(/No invoices yet/)).toBeInTheDocument();
    });

    it('lists each invoice with its number, date and amount incl. GST', async () => {
      getSubscription.mockResolvedValue({ ...activeStarter, invoices: [invoice] });
      render(<BillingSettings />);
      const table = await screen.findByRole('table', { name: 'Tax invoices' });
      expect(within(table).getByText('SB/2026-27/0001')).toBeInTheDocument();
      expect(within(table).getByText('11 Oct 2026')).toBeInTheDocument();
      expect(within(table).getByText('₹707.82')).toBeInTheDocument();
    });

    it('downloads the PDF of the chosen invoice', async () => {
      getSubscription.mockResolvedValue({ ...activeStarter, invoices: [invoice] });
      downloadTaxInvoicePdf.mockResolvedValue();
      render(<BillingSettings />);
      const button = await downloadButton();
      await userEvent.click(button);
      expect(downloadTaxInvoicePdf).toHaveBeenCalledWith(invoice);
      await waitFor(() => expect(button).toBeEnabled());
    });

    it('shows an error when the download fails', async () => {
      getSubscription.mockResolvedValue({ ...activeStarter, invoices: [invoice] });
      downloadTaxInvoicePdf.mockRejectedValue(new Error('network'));
      render(<BillingSettings />);
      await userEvent.click(await downloadButton());
      expect(await screen.findByText('Could not download the invoice. Please try again.')).toBeInTheDocument();
      expect(await downloadButton()).toBeEnabled();
    });
  });
});
