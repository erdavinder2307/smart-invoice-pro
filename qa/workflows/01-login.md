# Workflow: Authentication & Session

## Business Objective

Verify tenant users can authenticate, reach the operational dashboard, and maintain a valid session for downstream bookkeeping workflows.

## Preconditions

- Frontend at `http://localhost:3000`
- Backend API reachable at `http://127.0.0.1:5001`
- Valid QA credentials in `.env.qa`

## Workflow Steps

### 1. Navigate to Login
- Navigate to `/login`
- Verify Solidev Books branding and sign-in form
- Screenshot: login page

### 2. Authenticate
- Enter `QA_USERNAME` and `QA_PASSWORD`
- Submit sign-in
- Verify redirect to `/dashboard`
- Screenshot: dashboard loaded

### 3. Session Integrity
- Refresh page — user remains authenticated
- Verify sidebar shows Dashboard, Sales, Purchases, Banking, Reports
- Confirm no session-expired banner
- Screenshot: sidebar navigation visible

## Validation Rules

- JWT stored in localStorage (`token`, `user`)
- No console errors on login
- Dashboard KPI cards or empty states render (not blank screen)

## Bookkeeping Expectations

- Authenticated user has tenant context for all subsequent AR/AP operations
- Role-appropriate menu items visible (Settings admin-only)

## Screenshots Required

- login-page
- dashboard-after-login
- session-persisted-refresh

## Success Criteria

- Login completes in < 30s
- Dashboard URL active
- User can navigate to `/customers` without re-login

## Test Data

- Credentials: `.env.qa` (not committed)
