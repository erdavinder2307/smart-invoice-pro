# Smart Invoice Pro Frontend - Copilot Instructions

> Additional mandatory frontend testing policy: see `.github/copilot-instructions-frontend.md`.

## Project Overview

React-based SPA frontend for Smart Invoice Pro, using MUI for UI components, axios for API calls, and React Context for state management.

## Architecture

- **Framework**: React 19 with Create React App (react-scripts 5.0.1)
- **UI Library**: MUI 7 (@mui/material, @mui/icons-material, @mui/x-data-grid)
- **Routing**: react-router-dom 7+ (BrowserRouter with ~160 routes in `src/routes.js`)
- **HTTP Client**: axios with request/response interceptors in `src/index.js`
- **State**: 5 React Context providers nested in `src/index.js`
- **Animation**: framer-motion
- **Charts**: recharts, react-chartjs-2
- **Export**: jspdf + jspdf-autotable, xlsx

## Context Provider Stack

Providers are nested in `src/index.js` in this order:
```
AuthProvider > BrandingProvider > InvoicePreferencesProvider > PermissionProvider > NotificationProvider
```

- **AuthContext** — `useAuth()`: user, isAuthenticated, login, logout, register, isAdmin, isManager
- **BrandingContext** — `useBranding()`: branding colors, dynamic MUI theme via `<ThemeProvider>`
- **InvoicePreferencesContext** — `useInvoicePreferences()`: invoice numbering defaults
- **PermissionContext** — `usePermission()`: `can(module, action)` helper, PERMISSION_MODULES
- **NotificationContext** — `useNotifications()`: 60s polling, markRead, markAllAsRead

## Super Admin Module

The admin panel lives in `src/admin/` — fully isolated from the main app with its own auth, routing, layout, and services.

### Admin Folder Structure

```
src/admin/
  components/
    AdminHeader.jsx      — Dark-themed app bar with logout
    AdminSidebar.jsx     — Permanent drawer nav
    AdminLayout.jsx      — Header + Sidebar + content wrapper
  pages/
    Login.jsx            — Standalone admin login
    Dashboard.jsx        — System stats cards
    Tenants.jsx          — Tenant management table
    Users.jsx            — User management + password reset
    FeatureFlags.jsx     — Per-tenant feature toggles
  routes/
    AdminProtectedRoute.jsx — Route guard (checks admin_token + is_super_admin)
    AdminRoutes.jsx         — All /admin/* route definitions
  services/
    adminAuthService.js  — Login/logout/token management (separate from user auth)
    adminApiService.js   — All admin API calls with admin-specific auth header
```

### Admin Routes

| Path | Page | Protected |
|------|------|-----------|
| `/admin/login` | Login | No |
| `/admin/dashboard` | Dashboard | Yes |
| `/admin/tenants` | Tenants | Yes |
| `/admin/users` | Users | Yes |
| `/admin/feature-flags` | FeatureFlags | Yes |

Admin routes are mounted in `src/routes.js` via `<Route path="/admin/*" element={<AdminRoutes />} />`.

### Admin Authentication (ISOLATED)

Admin auth uses **separate** localStorage keys — never mixed with regular user auth:

| Key | Purpose |
|-----|---------|
| `admin_token` | JWT access token |
| `admin_refresh_token` | Refresh token |
| `admin_user` | Serialized user object (must have `is_super_admin: true`) |

```jsx
// CORRECT — use adminAuthService for admin pages
import adminAuthService from '../services/adminAuthService';
const token = adminAuthService.getToken();
const isAuth = adminAuthService.isAuthenticated();

// WRONG — never use regular auth for admin
import { useAuth } from '../../context/AuthContext'; // DON'T DO THIS in admin module
const token = localStorage.getItem('token');         // DON'T DO THIS — wrong key
```

### Admin API Service

All admin API calls go through `src/admin/services/adminApiService.js`. It uses `adminAuthService.getToken()` for the Authorization header.

```jsx
// CORRECT — import from admin service
import { listTenants, updateTenantStatus } from '../services/adminApiService';

// WRONG — don't use regular services or axios directly in admin pages
import axios from 'axios';
```

### Admin Route Guard

`AdminProtectedRoute` checks `adminAuthService.isAuthenticated()` (verifies both token exists AND `is_super_admin === true`). Redirects to `/admin/login` if not authorized.

## Key Conventions

### Authentication

Always use the `useAuth()` hook from `AuthContext`. Never read localStorage directly for auth state in components.

```jsx
// CORRECT
const { user, isAuthenticated, isAdmin } = useAuth();

// WRONG — don't read localStorage for auth
const token = localStorage.getItem('token');
```

### Services

All API services are thin axios wrappers in `src/services/`. They return `response.data`.

```jsx
// CORRECT — import from service
import { getInvoices, createInvoice } from '../services/invoiceService';

// WRONG — don't call axios directly in components
import axios from 'axios';
const res = await axios.get('/api/invoices');
```

### Form Pattern

All form components follow this pattern:
```jsx
const [form, setForm] = useState(INIT);
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);

const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
  e.preventDefault();
  const validationErrors = validate(form);
  if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }
  setLoading(true);
  try { /* API call */ } catch { /* error handling */ }
  setLoading(false);
};
```

### Common Components

Use shared components from `src/components/common/`:
- `FormInput` — TextField + ZohoRow label wrapper
- `FormSelect` — Select or Autocomplete + ZohoRow wrapper
- `SectionHeader` — Page title with primary/secondary actions
- `StandardDataTable` — Table with skeleton loading, pagination, empty states
- `StatusBadge` — Status string → colored MUI Chip
- `EmptyState` — Consistent empty/no-data placeholder
- `StatCard` — Dashboard metric summary card
- `TableSkeleton` — Skeleton loading rows for tables

## Unit Testing

### Test Infrastructure

- **Framework**: Jest (via react-scripts) + React Testing Library
- **Test utilities**: `src/test-utils.jsx` — `renderWithProviders()` wraps components with MemoryRouter, ThemeProvider, and mocked context hooks
- **Setup**: `src/setupTests.js` — jest-dom, framer-motion mock, canvas mock, matchMedia mock, ResizeObserver mock
- **ESM handling**: `package.json` jest config has `transformIgnorePatterns` for axios, react-router, react-router-dom

### Running Tests

```bash
cd smart-invoice-pro

# Quick run
npx react-scripts test --watchAll=false

# With coverage
npx react-scripts test --watchAll=false --coverage

# Single file
npx react-scripts test --watchAll=false --testPathPattern=authService
```

### When to Run Tests

**Always run tests after:**
- Adding, modifying, or removing any component, page, or service
- Changing context providers or hooks
- Modifying route definitions in `routes.js`
- Updating shared components in `components/common/`
- Changing API configuration or interceptors

### Writing Tests for New/Modified Code

When creating or updating a component or service, **always create or update the corresponding test file** in `src/__tests__/`.

#### Test File Organization

```
src/__tests__/
  services/       — Service layer tests (axios mocked)
  components/     — Component rendering & interaction tests
  context/        — Context provider & hook tests
  config/         — Configuration tests
  admin/          — Admin module tests (auth, API, components, routes)
```

#### Service Test Pattern

```jsx
import axios from 'axios';
import { getItems, createItem } from '../../services/itemService';

jest.mock('axios');
beforeEach(() => jest.clearAllMocks());

describe('itemService', () => {
  it('returns items list', async () => {
    axios.get.mockResolvedValue({ data: [{ id: '1', name: 'Item' }] });
    const result = await getItems();
    expect(result).toEqual([{ id: '1', name: 'Item' }]);
  });
});
```

#### Component Test Pattern

```jsx
import React from 'react';
import { renderWithProviders, screen, fireEvent } from '../../test-utils';
import { useAuth } from '../../context/AuthContext';
import MyComponent from '../../components/MyComponent';

beforeEach(() => {
  jest.clearAllMocks();
  // Reset useAuth to default test values
  useAuth.mockReturnValue({
    user: { id: '1', username: 'test', role: 'Admin' },
    isAuthenticated: true,
    isAdmin: true,
    // ... other auth values
  });
});

describe('MyComponent', () => {
  it('renders correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

#### Key Testing Rules

1. **Mock axios** — `jest.mock('axios')` for all service tests
2. **Use renderWithProviders** — Wraps components with MemoryRouter + ThemeProvider + mocked contexts
3. **Reset mocks in beforeEach** — Always `jest.clearAllMocks()` and reset `useAuth.mockReturnValue(...)` as needed
4. **Mock react-router-dom** — For components using `useNavigate`:
   ```jsx
   const mockNavigate = jest.fn();
   jest.mock('react-router-dom', () => {
     const actual = jest.requireActual('react-router-dom');
     return { ...actual, useNavigate: () => mockNavigate };
   });
   ```
5. **Mock framer-motion** — Already handled globally in `setupTests.js`
6. **No real API calls** — Always mock services or axios
7. **Test user interactions** — Use `fireEvent` or `userEvent` for clicks, typing, form submits
8. **Test loading states** — Verify skeletons/spinners during loading
9. **Test error states** — Verify error messages appear on API failures
10. **Test auth-gated UI** — Verify admin-only elements are hidden for non-admin users

#### Admin Module Test Patterns

Admin tests live in `src/__tests__/admin/`. Key files:

| Test File | What It Tests |
|-----------|---------------|
| `adminAuthService.test.js` | Login, logout, token storage, `is_super_admin` validation |
| `adminApiService.test.js` | All admin API endpoints, auth header isolation |
| `AdminProtectedRoute.test.jsx` | Route guard renders/redirects correctly |
| `AdminLogin.test.jsx` | Form validation, login flow, error/loading states |
| `AdminSidebar.test.jsx` | Menu items render correctly |

##### Admin Auth Service Test Pattern

```jsx
import axios from 'axios';
import adminAuthService from '../../admin/services/adminAuthService';

jest.mock('axios');
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('adminAuthService', () => {
  it('stores admin_token on successful super admin login', async () => {
    axios.post.mockResolvedValue({
      data: {
        token: 'admin-jwt',
        user: { id: '1', username: 'admin', is_super_admin: true },
      },
    });
    await adminAuthService.login({ email: 'admin@test.com', password: 'pass' });
    expect(localStorage.getItem('admin_token')).toBe('admin-jwt');
  });

  it('rejects non-super-admin users', async () => {
    axios.post.mockResolvedValue({
      data: { token: 'jwt', user: { id: '2', is_super_admin: false } },
    });
    await expect(adminAuthService.login({ email: 'user@test.com', password: 'pass' }))
      .rejects.toThrow('Access denied');
    expect(localStorage.getItem('admin_token')).toBeNull();
  });
});
```

##### Admin Component Test Pattern

Admin components do NOT use `useAuth` context — they use `adminAuthService` directly. Mock it accordingly:

```jsx
import adminAuthService from '../../admin/services/adminAuthService';

jest.mock('../../admin/services/adminAuthService', () => ({
  __esModule: true,
  default: {
    isAuthenticated: jest.fn(() => true),
    getToken: jest.fn(() => 'admin-jwt'),
    getUser: jest.fn(() => ({ id: '1', is_super_admin: true })),
    login: jest.fn(),
    logout: jest.fn(),
  },
}));
```

### Coverage Thresholds

Coverage thresholds are enforced in `package.json`:

| Directory | Min Statements | Min Functions | Min Lines |
|-----------|---------------|---------------|-----------|
| `src/services/` | 80% | 80% | 80% |
| `src/context/` | 50% | 40% | 50% |
| `src/config/` | 50% | — | 50% |

### Coverage Targets for Admin Module

| Directory | Min Statements | Min Functions | Min Lines |
|-----------|---------------|---------------|----------|
| `src/admin/services/` | 80% | 80% | 80% |
| `src/admin/routes/` | 60% | 60% | 60% |
| `src/admin/pages/` | 40% | 40% | 40% |

## Common Pitfalls

1. **ESM modules**: axios and react-router-dom are ESM — `transformIgnorePatterns` in package.json handles this
2. **jest.mock variable scoping**: Variables referenced in `jest.mock()` factories must be prefixed with `mock` (e.g., `mockAuthValue`)
3. **React Router v7**: Use `jest.requireActual('react-router-dom')` spread when mocking to preserve non-mocked exports
4. **MUI useMediaQuery**: Requires `window.matchMedia` mock (already in setupTests.js)
5. **Context hook mocking**: When a test overrides `useAuth.mockReturnValue()`, it persists across tests — always reset in `beforeEach`
6. **Chart components**: Canvas and recharts need mock context (already in setupTests.js)
7. **framer-motion components**: Globally mocked in setupTests.js to render plain HTML elements
8. **Admin auth isolation**: Admin module uses `admin_token`/`admin_user` localStorage keys — never `token`/`user`. Tests must mock `adminAuthService`, not `useAuth`
9. **Admin routes**: Admin routes are nested under `/admin/*` via `<AdminRoutes />`. Do NOT add admin pages to the main `routes.js` — add them to `src/admin/routes/AdminRoutes.jsx`
10. **Admin API headers**: `adminApiService.js` builds its own Authorization header from `adminAuthService.getToken()` — it does NOT use the axios interceptor from `src/index.js`
