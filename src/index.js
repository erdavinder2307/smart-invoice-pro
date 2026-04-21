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
import axios from 'axios';
import authService from './services/authService';

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

    // Only handle 401s once per request, and don't retry refresh calls
    if (
      error.response?.status === 401 &&
      !originalRequest._retried &&
      !originalRequest._skipAuthRetry
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
    <AuthProvider>
      <BrandingProvider>
        <SidebarProvider>
          <InvoicePreferencesProvider>
            <PermissionProvider>
              <NotificationProvider>
                <KeyboardShortcutsProvider>
                  <App />
                </KeyboardShortcutsProvider>
              </NotificationProvider>
            </PermissionProvider>
          </InvoicePreferencesProvider>
        </SidebarProvider>
      </BrandingProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
