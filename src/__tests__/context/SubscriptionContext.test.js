import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { SubscriptionProvider, useSubscription } from '../../context/SubscriptionContext';
import { AuthProvider } from '../../context/AuthContext';
import * as subscriptionService from '../../services/subscriptionService';

// Mock the auth context so we control the user value
jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: jest.fn(),
  AuthProvider: ({ children }) => <>{children}</>,
}));

jest.mock('../../services/subscriptionService');
jest.mock('../../services/authService', () => ({
  __esModule: true,
  default: { getUser: jest.fn().mockResolvedValue(null) },
}));

const { useAuth } = require('../../context/AuthContext');

function Consumer() {
  const sub = useSubscription();
  return (
    <div>
      <span data-testid="status">{sub.subscription?.status || 'none'}</span>
      <span data-testid="days">{sub.trialDaysRemaining ?? 'null'}</span>
      <span data-testid="loading">{String(sub.loading)}</span>
      <span data-testid="isTrialActive">{String(sub.isTrialActive())}</span>
      <span data-testid="isExpired">{String(sub.isExpired())}</span>
      <span data-testid="isPaid">{String(sub.isPaid())}</span>
      <span data-testid="showBanner">{String(sub.showTrialBanner())}</span>
      <span data-testid="canInvoice">{String(sub.canCreate('invoice'))}</span>
    </div>
  );
}

function renderWithProviders() {
  return render(
    <SubscriptionProvider>
      <Consumer />
    </SubscriptionProvider>
  );
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('SubscriptionContext', () => {
  describe('when user is not logged in', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ user: null });
    });

    it('sets loading to false and subscription to null', async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });
      expect(screen.getByTestId('status').textContent).toBe('none');
    });
  });

  describe('when user is logged in with active trial', () => {
    const mockResponse = {
      subscription: { status: 'trial', trial_ends_at: new Date(Date.now() + 7 * 86400000).toISOString() },
      plan: { id: 'starter_monthly', name: 'Starter' },
      entitlements: { can_create_invoice: true, read_only: false, upgrade_required: false },
      usage: { invoices_created: 5 },
      trial_days_remaining: 7,
    };

    beforeEach(() => {
      useAuth.mockReturnValue({ user: { id: 'user-1', username: 'test' } });
      subscriptionService.getCurrentSubscription.mockResolvedValue(mockResponse);
    });

    it('loads subscription data on mount', async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByTestId('status').textContent).toBe('trial');
      });
      expect(screen.getByTestId('days').textContent).toBe('7');
    });

    it('isTrialActive returns true for trial status', async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByTestId('isTrialActive').textContent).toBe('true');
      });
    });

    it('isExpired returns false for trial status', async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByTestId('isExpired').textContent).toBe('false');
      });
    });

    it('isPaid returns false for trial status', async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByTestId('isPaid').textContent).toBe('false');
      });
    });

    it('showTrialBanner is true when ≤10 days remaining', async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByTestId('showBanner').textContent).toBe('true');
      });
    });

    it('canCreate returns true when entitlements allow it', async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByTestId('canInvoice').textContent).toBe('true');
      });
    });
  });

  describe('when trial banner threshold', () => {
    it('showTrialBanner is false when >10 days remaining', async () => {
      useAuth.mockReturnValue({ user: { id: 'user-1' } });
      subscriptionService.getCurrentSubscription.mockResolvedValue({
        subscription: { status: 'trial' },
        plan: {},
        entitlements: {},
        usage: {},
        trial_days_remaining: 15,
      });
      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByTestId('showBanner').textContent).toBe('false');
      });
    });
  });

  describe('when subscription is expired', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ user: { id: 'user-1' } });
      subscriptionService.getCurrentSubscription.mockResolvedValue({
        subscription: { status: 'expired' },
        plan: {},
        entitlements: { read_only: true, upgrade_required: true },
        usage: {},
        trial_days_remaining: 0,
      });
    });

    it('isExpired returns true', async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByTestId('isExpired').textContent).toBe('true');
      });
    });

    it('canCreate returns false when upgrade_required', async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByTestId('canInvoice').textContent).toBe('false');
      });
    });
  });

  describe('when subscription is active (paid)', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ user: { id: 'user-1' } });
      subscriptionService.getCurrentSubscription.mockResolvedValue({
        subscription: { status: 'active' },
        plan: { id: 'starter_monthly' },
        entitlements: { can_create_invoice: true, read_only: false, upgrade_required: false },
        usage: {},
        trial_days_remaining: null,
      });
    });

    it('isPaid returns true', async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByTestId('isPaid').textContent).toBe('true');
      });
    });

    it('showTrialBanner is false for paid status', async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByTestId('showBanner').textContent).toBe('false');
      });
    });
  });

  describe('when API call fails', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ user: { id: 'user-1' } });
      subscriptionService.getCurrentSubscription.mockRejectedValue(new Error('Network error'));
    });

    it('gracefully handles failure and sets loading to false', async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });
      expect(screen.getByTestId('status').textContent).toBe('none');
    });
  });

  describe('canCreate helper', () => {
    it('returns true by default when no entitlements loaded', async () => {
      useAuth.mockReturnValue({ user: { id: 'user-1' } });
      subscriptionService.getCurrentSubscription.mockResolvedValue({
        subscription: { status: 'trial' },
        plan: {},
        entitlements: null,
        usage: {},
        trial_days_remaining: 5,
      });
      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByTestId('canInvoice').textContent).toBe('true');
      });
    });

    it('returns false when specific resource limit is false', async () => {
      useAuth.mockReturnValue({ user: { id: 'user-1' } });
      subscriptionService.getCurrentSubscription.mockResolvedValue({
        subscription: { status: 'trial' },
        plan: {},
        entitlements: { read_only: false, upgrade_required: false, can_create_invoice: false },
        usage: {},
        trial_days_remaining: 5,
      });
      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByTestId('canInvoice').textContent).toBe('false');
      });
    });
  });
});
