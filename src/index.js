import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './i18n';
import { AuthProvider } from './context/AuthContext';
import { BrandingProvider } from './context/BrandingContext';
import { InvoicePreferencesProvider } from './context/InvoicePreferencesContext';
import { PermissionProvider } from './context/PermissionContext';
import { NotificationProvider } from './context/NotificationContext';
import { SidebarProvider } from './context/SidebarContext';
import { KeyboardShortcutsProvider } from './context/KeyboardShortcutsContext';
import { DashboardFilterProvider } from './context/DashboardFilterContext';
import { MeProvider } from './context/MeContext';
import { OrgGstProvider } from './context/OrgGstContext';
import axios from 'axios';
import authService from './services/authService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import './config/firebase'; // Initialize Firebase
import { API_BASE_URL, IS_PRODUCTION } from './config/environment';

// ── Production API guard ──────────────────────────────────────────────────────
// Detect if a production deployment is accidentally using a local API URL.
// This fires at app startup — before any network call — and renders a
// blocking error screen so the issue is immediately visible.
(function guardProductionApiConfig() {
  const hostname = window.location.hostname;
  const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(hostname);
  const apiIsLocal =
    !API_BASE_URL ||
    API_BASE_URL.includes('127.0.0.1') ||
    API_BASE_URL.includes('localhost');

  if (!isLocalHost && apiIsLocal) {
    // eslint-disable-next-line no-console
    console.error(
      '[CRITICAL] Solidev Books: Production deployment is misconfigured.\n' +
      `Host: ${hostname}\n` +
      `API_BASE_URL: "${API_BASE_URL || '(empty)'}"\n` +
      'Set REACT_APP_API_BASE_URL to your production API URL and redeploy.'
    );

    // Render a blocking error page — never allow the app to load with a broken config.
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fafafa;padding:2rem">
          <div style="max-width:480px;text-align:center;background:#fff;border:1px solid #fecaca;border-radius:8px;padding:2.5rem 2rem">
            <div style="font-size:2rem;margin-bottom:1rem">⚠️</div>
            <h1 style="font-size:1.125rem;font-weight:700;color:#991b1b;margin:0 0 0.75rem">Configuration Error</h1>
            <p style="font-size:0.875rem;color:#6b7280;line-height:1.6;margin:0">
              The application is not configured correctly for this environment.
              Please contact your administrator.
            </p>
          </div>
        </div>
      `;
    }
    throw new Error(
      `[Solidev Books] REACT_APP_API_BASE_URL is "${API_BASE_URL || '(empty)'}" on host "${hostname}". ` +
      'Production deployments must set this variable to the production API URL.'
    );
  }

  if (IS_PRODUCTION && !isLocalHost) {
    // eslint-disable-next-line no-console
    console.info(`[Solidev Books] Production build. API: ${API_BASE_URL}`);
  }
})();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// ── Request interceptor: attach JWT to all outgoing requests ──────────────────
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: auto-refresh on 401 ────────────────────────────────
let _isRefreshing = false;
let _pendingQueue = []; // [{ resolve, reject }]

const _processQueue = (error, token = null) => {
  _pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  _pendingQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401s once per request, and don't retry refresh calls.
    // Also only attempt refresh if the user has an active session (refresh token present);
    // otherwise a 401 on an unauthenticated request would incorrectly trigger the
    // "Session expired" banner.
    if (
      error.response?.status === 401 &&
      !originalRequest._retried &&
      !originalRequest._skipAuthRetry &&
      localStorage.getItem('refresh_token')
    ) {
      if (_isRefreshing) {
        // Another refresh is in flight — queue this request
        return new Promise((resolve, reject) => {
          _pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axios(originalRequest);
        });
      }

      originalRequest._retried = true;
      _isRefreshing = true;

      try {
        const newToken = await authService.refreshAccessToken();
        _processQueue(null, newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        _processQueue(refreshError, null);
        // Refresh failed — clear session and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        // Dispatch a custom event so AuthContext can update its state and
        // show the "Session expired" message without a hard page reload.
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrandingProvider>
            <SidebarProvider>
              <MeProvider>
                <InvoicePreferencesProvider>
                  <OrgGstProvider>
                    <PermissionProvider>
                      <NotificationProvider>
                        <KeyboardShortcutsProvider>
                          <DashboardFilterProvider>
                            <App />
                          </DashboardFilterProvider>
                        </KeyboardShortcutsProvider>
                      </NotificationProvider>
                    </PermissionProvider>
                  </OrgGstProvider>
                </InvoicePreferencesProvider>
              </MeProvider>
            </SidebarProvider>
          </BrandingProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);

reportWebVitals();
