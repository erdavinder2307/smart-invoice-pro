import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import VerifyEmail from '../../pages/VerifyEmail';
import AcceptInvite from '../../pages/AcceptInvite';
import EmailVerificationBanner from '../../components/EmailVerificationBanner';
import authService from '../../services/authService';

jest.mock('../../services/authService', () => ({
  __esModule: true,
  default: {
    verifyEmail: jest.fn(),
    resendVerification: jest.fn(),
    acceptInvite: jest.fn(),
  },
}));

jest.mock('../../components/Layout/Header', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/Layout/Footer', () => ({ __esModule: true, default: () => null }));
jest.mock('../../seo/SeoHead', () => ({ __esModule: true, default: () => null }));

const apiError = (error, status = 400) => Object.assign(new Error(error), { response: { status, data: { error } } });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('VerifyEmail page', () => {
  it('posts the token once and marks the signed-in user verified', async () => {
    const setEmailVerified = jest.fn();
    authService.verifyEmail.mockResolvedValue({ email_verified: true });

    renderWithProviders(<VerifyEmail />, {
      route: '/verify-email?token=abc123',
      authValue: { setEmailVerified },
    });

    expect(await screen.findByText(/Your email is verified/i)).toBeInTheDocument();
    expect(authService.verifyEmail).toHaveBeenCalledTimes(1);
    expect(authService.verifyEmail).toHaveBeenCalledWith('abc123');
    expect(setEmailVerified).toHaveBeenCalledWith(true);
    expect(screen.getByRole('link', { name: 'Go to dashboard' })).toBeInTheDocument();
  });

  it('shows the API message for an expired link and offers a new one when signed in', async () => {
    authService.verifyEmail.mockRejectedValue(apiError('This link has expired. Sign in and ask for a new one.'));
    authService.resendVerification.mockResolvedValue({ email_verified: false });

    renderWithProviders(<VerifyEmail />, { route: '/verify-email?token=old', authValue: { setEmailVerified: jest.fn() } });

    expect(await screen.findByText(/This link has expired/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Send a new link' }));
    expect(await screen.findByText(/We sent you a new link/i)).toBeInTheDocument();
    expect(authService.resendVerification).toHaveBeenCalledTimes(1);
  });

  it('asks a signed-out visitor to sign in when the link fails', async () => {
    authService.verifyEmail.mockRejectedValue(apiError('This link is not valid or has already been used.'));

    renderWithProviders(<VerifyEmail />, { route: '/verify-email?token=used', authValue: { user: null } });

    expect(await screen.findByText(/not valid or has already been used/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in to get a new link' })).toBeInTheDocument();
  });

  it('does not call the API without a token', () => {
    renderWithProviders(<VerifyEmail />, { route: '/verify-email' });

    expect(screen.getByText(/missing its code/i)).toBeInTheDocument();
    expect(authService.verifyEmail).not.toHaveBeenCalled();
  });
});

describe('AcceptInvite page', () => {
  const fill = (password, confirm) => {
    fireEvent.change(screen.getByLabelText(/New password/i), { target: { value: password } });
    fireEvent.change(screen.getByLabelText(/Confirm password/i), { target: { value: confirm } });
    fireEvent.click(screen.getByRole('button', { name: 'Set password' }));
  };

  it('sets the password with the token and shows the username to sign in with', async () => {
    authService.acceptInvite.mockResolvedValue({ username: 'priya' });

    renderWithProviders(<AcceptInvite />, { route: '/accept-invite?token=inv1', authValue: { user: null } });
    fill('longenough1', 'longenough1');

    expect(await screen.findByText(/Sign in with the username priya/i)).toBeInTheDocument();
    expect(authService.acceptInvite).toHaveBeenCalledWith('inv1', 'longenough1');
  });

  it('checks length and match before calling the API', async () => {
    renderWithProviders(<AcceptInvite />, { route: '/accept-invite?token=inv1' });

    fill('short', 'short');
    expect(screen.getByText(/at least 8 characters\./i)).toBeInTheDocument();
    fill('longenough1', 'different11');
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(authService.acceptInvite).not.toHaveBeenCalled();
  });

  it('shows the API message for an expired invite', async () => {
    authService.acceptInvite.mockRejectedValue(apiError('This invite link has expired. Ask your admin to send a new one.'));

    renderWithProviders(<AcceptInvite />, { route: '/accept-invite?token=inv1' });
    fill('longenough1', 'longenough1');

    expect(await screen.findByText(/Ask your admin to send a new one/i)).toBeInTheDocument();
  });

  it('hides the form when the link has no token', () => {
    renderWithProviders(<AcceptInvite />, { route: '/accept-invite' });

    expect(screen.getByText(/missing its code/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Set password' })).not.toBeInTheDocument();
  });
});

describe('EmailVerificationBanner', () => {
  it('is hidden for verified users and for older accounts without the field', () => {
    const { unmount } = renderWithProviders(<EmailVerificationBanner />, {
      authValue: { user: { id: 'u1', email_verified: true } },
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    unmount();

    renderWithProviders(<EmailVerificationBanner />, { authValue: { user: { id: 'u1' } } });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('asks an unverified user to verify and resends the email', async () => {
    authService.resendVerification.mockResolvedValue({ email_verified: false });

    renderWithProviders(<EmailVerificationBanner />, {
      authValue: { user: { id: 'u1', email_verified: false }, setEmailVerified: jest.fn() },
    });

    expect(screen.getByText(/verify your email address before creating invoices/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resend email' }));
    expect(await screen.findByText(/Email sent/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Resend email' })).not.toBeInTheDocument();
  });

  it('shows the wait message when asked again too soon', async () => {
    authService.resendVerification.mockRejectedValue(apiError('Please wait a minute before asking for another email.', 429));

    renderWithProviders(<EmailVerificationBanner />, {
      authValue: { user: { id: 'u1', email_verified: false }, setEmailVerified: jest.fn() },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Resend email' }));

    await waitFor(() => expect(screen.getByText(/Please wait a minute/i)).toBeInTheDocument());
  });
});
