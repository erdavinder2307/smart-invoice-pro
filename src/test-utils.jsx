/**
 * Custom render wrapper that provides all context providers needed by the app.
 *
 * Usage:
 *   import { renderWithProviders, screen } from '../test-utils';
 *   renderWithProviders(<MyComponent />);
 */
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Default mock values (prefixed with "mock" so jest.mock factories can reference them) ──

const mockAuthValue = {
  user: { id: 'test-user-id', username: 'testuser', role: 'Admin' },
  isAuthenticated: true,
  userRole: 'Admin',
  isAdmin: true,
  isManager: true,
  canApprove: true,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  loading: false,
  sessionExpired: false,
};

const mockPermissionValue = {
  permissions: {},
  isAdmin: true,
  can: jest.fn(() => true),
  loading: false,
  refetch: jest.fn(),
};

const mockBrandingValue = {
  branding: {
    primary_color: '#2563EB',
    secondary_color: '#10B981',
    accent_color: '#2d6cdf',
    logo_url: '',
    email_header_logo_url: '',
    invoice_template_settings: { show_logo: true, show_signature: false },
  },
  setBranding: jest.fn(),
  refreshBranding: jest.fn(),
};

const mockNotificationsValue = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  fetchNotifications: jest.fn(),
  markRead: jest.fn(),
  markAllAsRead: jest.fn(),
};

const mockInvoicePreferencesValue = {
  prefs: {
    invoice_prefix: 'INV-',
    invoice_suffix: '',
    next_invoice_number: 1,
    number_padding: 5,
    default_payment_terms: 'Net 30',
    default_due_days: 30,
    default_notes: 'Thank you for your business.',
    default_terms: 'Payment due within 30 days.',
    auto_generate_invoice_number: true,
  },
  setPrefs: jest.fn(),
  refreshPrefs: jest.fn(),
  loaded: true,
};

const mockSidebarValue = {
  isCollapsed: false,
  setIsCollapsed: jest.fn(),
  toggleSidebar: jest.fn(),
  mobileOpen: false,
  setMobileOpen: jest.fn(),
  toggleMobileDrawer: jest.fn(),
  isMobile: false,
};

const mockMeValue = {
  me: {
    full_name: 'Test User',
    display_name: 'Test User',
    email: 'test@example.com',
    role: 'Admin',
  },
  meLoading: false,
  meError: null,
  refreshMe: jest.fn(),
  displayName: 'Test User',
  initials: 'TU',
};

const mockOrgGstValue = {
  loading: false,
  error: null,
  gst_mode: 'FULL_GST',
  gst_registration_type: 'regular',
  gst_enabled: true,
  gstin: '',
  seller_state: '',
  isGstEnabled: true,
  isSalesTaxAllowed: true,
  isComposition: false,
  isUnregistered: false,
  refresh: jest.fn(),
};

// ── Mock context modules ─────────────────────────────────────────────────────

jest.mock('./context/AuthContext', () => ({
  ...jest.requireActual('./context/AuthContext'),
  useAuth: jest.fn(() => mockAuthValue),
  AuthProvider: ({ children }) => children,
}));

jest.mock('./context/PermissionContext', () => ({
  ...jest.requireActual('./context/PermissionContext'),
  usePermission: jest.fn(() => mockPermissionValue),
  PermissionProvider: ({ children }) => children,
  PERMISSION_MODULES: jest.requireActual('./context/PermissionContext').PERMISSION_MODULES,
  MODULE_LABELS: jest.requireActual('./context/PermissionContext').MODULE_LABELS,
}));

jest.mock('./context/BrandingContext', () => ({
  ...jest.requireActual('./context/BrandingContext'),
  useBranding: jest.fn(() => mockBrandingValue),
  BrandingProvider: ({ children }) => children,
}));

jest.mock('./context/NotificationContext', () => ({
  ...jest.requireActual('./context/NotificationContext'),
  useNotifications: jest.fn(() => mockNotificationsValue),
  NotificationProvider: ({ children }) => children,
}));

jest.mock('./context/InvoicePreferencesContext', () => ({
  ...jest.requireActual('./context/InvoicePreferencesContext'),
  useInvoicePreferences: jest.fn(() => mockInvoicePreferencesValue),
  InvoicePreferencesProvider: ({ children }) => children,
}));

jest.mock('./context/SidebarContext', () => ({
  ...jest.requireActual('./context/SidebarContext'),
  useSidebar: jest.fn(() => mockSidebarValue),
  SidebarProvider: ({ children }) => children,
}));

jest.mock('./context/MeContext', () => ({
  useMe: jest.fn(() => mockMeValue),
  MeProvider: ({ children }) => children,
}));

jest.mock('./context/DashboardFilterContext', () => ({
  ...jest.requireActual('./context/DashboardFilterContext'),
  useDashboardFilter: jest.fn(() => ({
    revenueRange: 'this_year',
    setRevenueRange: jest.fn(),
    customStartDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    setCustomStartDate: jest.fn(),
    customEndDate: new Date().toISOString().slice(0, 10),
    setCustomEndDate: jest.fn(),
  })),
  DashboardFilterProvider: ({ children }) => children,
}));

jest.mock('./context/OrgGstContext', () => ({
  ...jest.requireActual('./context/OrgGstContext'),
  useOrgGst: jest.fn(() => mockOrgGstValue),
  OrgGstProvider: ({ children }) => children,
}));

function resetMockHook(hook, value) {
  if (hook && typeof hook.mockReturnValue === 'function') {
    hook.mockReturnValue(value);
  }
}

/** Reset all context hook mocks after clearAllMocks/resetAllMocks in individual tests. */
export function resetContextMocks() {
  const { useAuth } = require('./context/AuthContext');
  const { usePermission } = require('./context/PermissionContext');
  const { useBranding } = require('./context/BrandingContext');
  const { useNotifications } = require('./context/NotificationContext');
  const { useInvoicePreferences } = require('./context/InvoicePreferencesContext');
  const { useSidebar } = require('./context/SidebarContext');
  const { useMe } = require('./context/MeContext');
  const { useOrgGst } = require('./context/OrgGstContext');

  resetMockHook(useAuth, mockAuthValue);
  resetMockHook(usePermission, mockPermissionValue);
  resetMockHook(useBranding, mockBrandingValue);
  resetMockHook(useNotifications, mockNotificationsValue);
  resetMockHook(useInvoicePreferences, mockInvoicePreferencesValue);
  resetMockHook(useSidebar, mockSidebarValue);
  resetMockHook(useMe, mockMeValue);
  resetMockHook(useOrgGst, mockOrgGstValue);
}

beforeEach(() => {
  resetContextMocks();
});

// ── Theme ────────────────────────────────────────────────────────────────────

const testTheme = createTheme({
  palette: {
    primary: { main: '#2563EB' },
    secondary: { main: '#10B981' },
  },
});

// ── renderWithProviders ──────────────────────────────────────────────────────

/**
 * @param {React.ReactElement} ui - Component to render
 * @param {object} options
 * @param {string} options.route      - Initial route for MemoryRouter (default: '/')
 * @param {object} options.authValue  - Override default auth context
 * @param {object} options.permValue  - Override default permission context
 * @param {object} options.brandValue - Override default branding context
 * @param {object} options.notifValue - Override default notification context
 * @param {object} options.prefValue  - Override default invoice prefs context
 * @param {object} options.sidebarValue - Override default sidebar context
 * @param {object} [options.renderOptions] - Additional options passed through to RTL render()
 */
export function renderWithProviders(
  ui,
  {
    route = '/',
    authValue,
    permValue,
    brandValue,
    notifValue,
    prefValue,
    sidebarValue,
    ...renderOptions
  } = {}
) {
  resetContextMocks();

  // Apply overrides to the mocked hooks when provided
  if (authValue) {
    const { useAuth } = require('./context/AuthContext');
    useAuth.mockReturnValue({ ...mockAuthValue, ...authValue });
  }
  if (permValue) {
    const { usePermission } = require('./context/PermissionContext');
    usePermission.mockReturnValue({ ...mockPermissionValue, ...permValue });
  }
  if (brandValue) {
    const { useBranding } = require('./context/BrandingContext');
    useBranding.mockReturnValue({ ...mockBrandingValue, ...brandValue });
  }
  if (notifValue) {
    const { useNotifications } = require('./context/NotificationContext');
    useNotifications.mockReturnValue({ ...mockNotificationsValue, ...notifValue });
  }
  if (prefValue) {
    const { useInvoicePreferences } = require('./context/InvoicePreferencesContext');
    useInvoicePreferences.mockReturnValue({ ...mockInvoicePreferencesValue, ...prefValue });
  }
  {
    const { useSidebar } = require('./context/SidebarContext');
    useSidebar.mockReturnValue({ ...mockSidebarValue, ...(sidebarValue || {}) });
  }

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <ThemeProvider theme={testTheme}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export function mockAuthContext(overrides = {}) {
  return { ...mockAuthValue, ...overrides };
}

export function mockApiResponse(data, extra = {}) {
  return { data, ...extra };
}

// Re-export everything from RTL so tests can import from one place
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Export defaults for direct manipulation in tests
export {
  mockAuthValue as defaultAuth,
  mockPermissionValue as defaultPermission,
  mockBrandingValue as defaultBranding,
  mockNotificationsValue as defaultNotifications,
  mockInvoicePreferencesValue as defaultInvoicePreferences,
  mockSidebarValue as defaultSidebar,
};
