/**
 * The app-wide settings providers (InvoicePreferencesProvider, OrgGstProvider)
 * wrap every route, including the public home page. Their endpoints
 * (/api/settings/invoice-preferences, /api/settings/gst-config) need a signed-in
 * user, so they must not be called while signed out (that produced 401s in the
 * console on the public site), and must load once the user signs in.
 */
jest.unmock('../../context/OrgGstContext');
jest.unmock('../../context/InvoicePreferencesContext');

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { InvoicePreferencesProvider, useInvoicePreferences } from '../../context/InvoicePreferencesContext';
import { OrgGstProvider, useOrgGst } from '../../context/OrgGstContext';
import { getInvoicePreferences } from '../../services/invoicePreferencesService';
import authService from '../../services/authService';

jest.mock('../../config/api', () => ({
  createApiUrl: (path) => `http://test.local${path}`,
}));
jest.mock('../../services/invoicePreferencesService', () => ({
  getInvoicePreferences: jest.fn(),
  updateInvoicePreferences: jest.fn(),
}));
jest.mock('../../services/authService');
jest.mock('../../services/analyticsService', () => ({
  __esModule: true,
  default: {
    trackLogin: jest.fn(),
    trackLogout: jest.fn(),
    trackInteractiveWorkspaceStart: jest.fn(),
  },
}));

const USER = { username: 'asha', role: 'Admin' };

function gstFetchCalls() {
  return global.fetch.mock.calls.filter(([url]) => String(url).includes('/api/settings/gst-config'));
}

function Consumer() {
  const { login, logout } = useAuth();
  const { prefs } = useInvoicePreferences();
  const { gst_mode } = useOrgGst();
  return (
    <div>
      <span data-testid="prefix">{prefs.invoice_prefix}</span>
      <span data-testid="gst-mode">{gst_mode}</span>
      <button onClick={() => login({ username: 'asha', password: 'x' })}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

// Same nesting order as src/index.js
function renderApp() {
  return render(
    <AuthProvider>
      <InvoicePreferencesProvider>
        <OrgGstProvider>
          <Consumer />
        </OrgGstProvider>
      </InvoicePreferencesProvider>
    </AuthProvider>
  );
}

describe('settings providers only load settings for a signed-in user', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
    getInvoicePreferences.mockResolvedValue({ invoice_prefix: 'SB-' });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ gst_mode: 'COMPOSITION' }),
    });
    authService.login.mockImplementation(async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(USER));
      return 'test-token';
    });
    authService.logout.mockImplementation(async () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
  });

  it('makes no invoice-preferences or gst-config request while signed out', async () => {
    await act(async () => {
      renderApp();
    });

    expect(getInvoicePreferences).not.toHaveBeenCalled();
    expect(gstFetchCalls()).toHaveLength(0);
    expect(screen.getByTestId('prefix')).toHaveTextContent('INV-');
    expect(screen.getByTestId('gst-mode')).toHaveTextContent('FULL_GST');
  });

  it('loads both settings on mount when already signed in', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(USER));

    await act(async () => {
      renderApp();
    });

    await waitFor(() => expect(screen.getByTestId('prefix')).toHaveTextContent('SB-'));
    await waitFor(() => expect(screen.getByTestId('gst-mode')).toHaveTextContent('COMPOSITION'));
    expect(getInvoicePreferences).toHaveBeenCalledTimes(1);
    expect(gstFetchCalls()).toHaveLength(1);
    expect(gstFetchCalls()[0][1].headers.Authorization).toBe('Bearer test-token');
  });

  it('loads settings after sign-in and resets them on sign-out', async () => {
    await act(async () => {
      renderApp();
    });
    expect(getInvoicePreferences).not.toHaveBeenCalled();
    expect(gstFetchCalls()).toHaveLength(0);

    await act(async () => {
      screen.getByText('login').click();
    });
    await waitFor(() => expect(screen.getByTestId('prefix')).toHaveTextContent('SB-'));
    await waitFor(() => expect(screen.getByTestId('gst-mode')).toHaveTextContent('COMPOSITION'));
    expect(getInvoicePreferences).toHaveBeenCalledTimes(1);
    expect(gstFetchCalls()).toHaveLength(1);

    await act(async () => {
      screen.getByText('logout').click();
    });
    await waitFor(() => expect(screen.getByTestId('prefix')).toHaveTextContent('INV-'));
    expect(screen.getByTestId('gst-mode')).toHaveTextContent('FULL_GST');
    expect(getInvoicePreferences).toHaveBeenCalledTimes(1);
    expect(gstFetchCalls()).toHaveLength(1);
  });
});
