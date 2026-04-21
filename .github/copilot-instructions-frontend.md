# Smart Invoice Pro Frontend Testing Discipline

This file defines enforceable frontend testing rules for React + MUI changes.

## Scope

Applies to all changes under:
- `src/components/`
- `src/pages/`
- `src/services/`
- `src/context/`
- `src/admin/`
- `src/routes.js`

## Mandatory Testing Rules

1. Every new or modified component must include updated behavior tests.
2. Every form must include tests for:
- required field validation
- error message rendering
- submit behavior
- loading/disabled submit state
3. Every API integration must be mocked in tests.
4. Do not call real network APIs in unit tests.
5. Avoid snapshot-only tests. Prefer behavior assertions with user events.
6. Route-protected and role-based UI must have explicit auth tests.
7. Empty, loading, and error states are required test scenarios for list and dashboard views.

## Folder and Naming Conventions

Use existing repository test layout:
- `src/__tests__/components/*.test.jsx`
- `src/__tests__/pages/*.test.jsx`
- `src/__tests__/services/*.test.js`
- `src/__tests__/admin/*.test.jsx|.test.js`

Test naming style:
- `ComponentName.test.jsx` for UI components/pages
- `serviceName.test.js` for service modules

## Utilities and Patterns

1. Use `renderWithProviders()` from `src/test-utils.jsx`.
2. Use `mockAuthContext()` from `src/test-utils.jsx` for auth-state overrides.
3. Use `mockApiResponse()` from `src/test-utils.jsx` for consistent mocked HTTP payloads.
4. Mock `axios` in service tests via `jest.mock('axios')`.
5. Mock service modules in component/page tests to isolate UI behavior.

## Coverage Policy

Minimum frontend unit coverage target is 70% for tested UI scopes.

Directory-level thresholds are enforced in Jest configuration:
- services: 80%+
- pages/components/admin: 70%+
- context/config: existing thresholds retained or improved

## Merge Gate Policy

Code must not be merged when:
- tests fail
- coverage thresholds fail
- required behavior tests are missing for changed forms/components/services

## CI Requirements

CI must run on every pull request and must include:
1. dependency install
2. test execution in CI mode
3. coverage generation and threshold enforcement

Reference command:
- `npx react-scripts test --watchAll=false --ci --coverage`
