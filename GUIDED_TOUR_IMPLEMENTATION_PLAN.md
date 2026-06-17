# Guided Product Tour Implementation Plan

This document outlines the architecture, design, and implementation plan for the Guided Product Tour on the **Solidev Books** interactive workspace (`demo.solidevbooks.com`).

---

## Architecture Review

### 1. Current Demo & Routing Architecture
- **Demo Subdomain Recognition**: Handled via `isDemoHost()` checking for `demo.solidevbooks.com`.
- **Demo Landing**: `/` on the demo host renders `<DemoLanding />` directly.
- **Demo Login**: Handled by `demoLogin({ role })` in `AuthContext.js` calling `/api/auth/demo-login`.
- **Route Guards**: `PermissionRoute` restricts pages based on role permissions. `DemoRouteBlock` blocks write settings pages.
- **Analytics**: `analyticsService.js` handles Firebase events.

### 2. Available Tour Libraries
- **React-Joyride** (Recommended)
  - Native React support, active maintenance.
  - Flexible control over steps, callbacks, and styles.
  - Supports Spotlight, Next/Previous controls, and custom overlays.
  - Route-aware transitions can be easily managed by intercepting state changes and updating the step index dynamically.

---

## Proposed Changes

### Component Design

We will introduce a `TourProvider` (with a corresponding `TourContext`) that will manage the lifecycle of the tour.

#### `src/context/TourContext.jsx`
- Exposes:
  - `startTour()`: Resets steps, sets `run` to true, redirects to `/dashboard` if needed.
  - `stopTour()`: Stops the tour.
  - `nextStep()` / `prevStep()`: Navigation functions.
  - `tourState`: Current step index, active status, completion status.
- Triggers analytics events upon starting, skipping, and completing the tour.

#### `src/components/Tour/ProductTour.jsx`
- The wrapper containing the `<Joyride>` component.
- Reads state from `TourContext`.
- Handles callbacks (`status`, `action`, `step` change) to perform page transitions:
  - Step 1 (Dashboard) -> Step 2 (Customers): navigate to `/customers`.
  - Step 2 (Customers) -> Step 3 (Quotes): navigate to `/quotes`.
  - Step 3 (Quotes) -> Step 4 (Invoices): navigate to `/invoices`.
  - Step 4 (Invoices) -> Step 5 (Inventory): navigate to `/products`.
  - Step 5 (Inventory) -> Step 6 (Purchases): navigate to `/purchase-orders`.
  - Step 6 (Purchases) -> Step 7 (Banking): navigate to `/bank-accounts`.
  - Step 7 (Banking) -> Step 8 (Reports): navigate to `/reports`.

#### `src/components/Tour/WelcomeModal.jsx`
- Standard modal popup shown upon first login.
- Features custom buttons: "Start Tour" and "Explore Yourself".

#### `src/components/Tour/CompletionModal.jsx`
- completion screen: "You're Ready to Explore".
- Displays suggested workflows.
- Buttons: "Continue Exploring", "Start Free" (redirects to signup/marketing), "Book Consultation" (redirects to consultation page/booking).

### Route Navigation Strategy
To make the tour multi-page and route-aware, the Joyride tour will run globally within `AppLayout.jsx`.
- When a step requires moving to a new route, the `callback` intercepts the "next" action, halts Joyride (`run: false`), triggers `navigate(targetPath)`, and stores the target step index.
- Once the destination component mounts and the DOM target is ready, Joyride resumes (`run: true`) at the stored step index.

---

## Proposed Code Changes

### `smart-invoice-pro` (Frontend)

#### [HeroSection.jsx](file:///Users/davinderpal/Development/invoicing/smart-invoice-pro/src/components/Layout/HeroSection.jsx)
- Update CTAs structure:
  - **Primary**: "Start Free" (`/login` or `/signup`)
  - **Secondary**: "Take Guided Tour" (links to `demo.solidevbooks.com?startTour=true`)
  - **Tertiary**: "Explore Interactive Workspace" (links to `demo.solidevbooks.com`)

#### [DemoLanding.jsx](file:///Users/davinderpal/Development/invoicing/smart-invoice-pro/src/pages/DemoLanding.jsx)
- Add auto-login support if URL query parameter `startTour=true` is present.
- It will automatically invoke `handleStart('Manager')` to access a high-privileged role suitable for highlighting all modules.

#### [TopUtilityBar.jsx](file:///Users/davinderpal/Development/invoicing/smart-invoice-pro/src/components/Layout/TopUtilityBar.jsx)
- In the user profile popover menu:
  - Add "Start Guided Tour" option if `isDemoHost()` is true.
  - Invokes `startTour()` from `TourContext`.

#### [AppLayout.jsx](file:///Users/davinderpal/Development/invoicing/smart-invoice-pro/src/components/Layout/AppLayout.jsx)
- Wrap layout in `TourProvider`.
- Insert `<ProductTour />` so the tour engine is active across all dashboard pages.

---

## State Management & Storage
- **`solidevbooks_tour_seen`** (localStorage): Boolean flag indicating whether the user has previously completed/skipped the tour. Prevents auto-showing the welcome modal on future sessions.
- **`solidevbooks_tour_session_seen`** (sessionStorage): Tracks whether the welcome modal has already been shown in the current browser session.

---

## Analytics Tracking
We will track the following events using the existing analytics framework:
1. `tour_started`: Triggered when welcome modal is accepted or tour is manually restarted.
2. `tour_completed`: Triggered on completing the final step or clicking completion CTAs.
3. `tour_skipped`: Triggered when clicking "Skip" or "Explore Yourself".
4. `tour_step_completed`: Triggered with payload `{ step_index: X, step_title: 'Title' }`.

---

## Verification Plan

### Automated Tests
- Verify `isDemoHost` and route permissions with Jest unit tests.
- Add test suites for `TourContext` to verify correct state changes.

### Manual Verification
- Deploy locally and access with a mock `demo.solidevbooks.com` hostname override (e.g. modify `/etc/hosts` or mock the hostname in tests).
- Walk through all 8 steps, checking that clicking "Next" transitions pages correctly and highlights target DOM elements.
- Verify welcome and completion modals display beautifully.
