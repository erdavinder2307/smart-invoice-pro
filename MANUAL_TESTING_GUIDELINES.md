# Smart Invoice Pro Manual Testing Guidelines

## 1. Overview

### Purpose
This document defines production-ready manual testing guidelines for Smart Invoice Pro based on actual frontend structure, route map, shared components, context providers, and implemented user flows.

### Scope
In scope:
- Authenticated app flows under dashboard layout
- Sales modules: Customers, Quotes, Invoices, Recurring Profiles, Sales Orders
- Purchases modules: Vendors, Purchase Orders, Bills, Expenses
- Inventory and stock adjustment
- Banking and reconciliation
- Reports module and report detail pages
- Settings modules: Organization Profile, Branding, Invoice Preferences, Taxes, Users, Roles, Automation, Integrations, Audit Logs
- Notifications, approvals, profile, global search, command palette, keyboard shortcuts
- Localization behavior (English and Hindi)
- Customer portal and admin routes (high-level smoke)

Out of scope:
- Deep backend data migration validation
- Non-functional testing requiring specialized tooling (full load/stress)

---

## 2. Testing Principles

- Test like real users, not only fields:
  - Cover complete journeys such as customer creation to invoice to payment recording.
- Prioritize business-critical flows:
  - Invoicing lifecycle, approvals, conversions, tax calculations, and settings impact.
- Validate behavior under change:
  - Save, refresh, relogin, and cross-page navigation.
- Include negative and interruption cases:
  - API failure, token expiry, duplicate values, invalid formats, and partial data.
- Validate UX quality with data correctness:
  - Loading, empty states, error states, and responsiveness.
- Verify role and permission behavior:
  - Visibility and access differences for admin vs non-admin users.

---

## 3. Global Test Checklist

Run this checklist on every module page before module-specific testing.

- UI consistency:
  - Header, breadcrumbs, spacing, typography, chip colors, table alignment, button states.
- Form validation:
  - Required fields, boundaries, invalid formats, trimmed values, number constraints.
- Error handling:
  - Inline errors, alerts, snackbars, failure fallback messages.
- Data persistence:
  - Save then refresh, navigate away and return, relogin verification.
- Responsive behavior:
  - Desktop and mobile widths, sidebar collapse behavior, table/card switching.
- Localization:
  - English and Hindi labels, truncation, overlap, and semantic correctness.
- Keyboard behavior:
  - Tab order, Enter submit, Esc close, Cmd or Ctrl shortcuts.
- Loading and empty states:
  - Skeletons/spinners shown and removed correctly.
- API recovery:
  - Retry operation after transient failure.
- Security basics:
  - No unauthorized data exposure by URL manipulation.

---

## 4. Module-Wise Test Scenarios

Use these as execution-ready manual scenarios. For each scenario, capture evidence (screenshots and request/response snapshot).

## 4.1 Dashboard

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Load summary widgets | Open Dashboard after login | Cards, charts, recent items load without broken placeholders | API delay, partial widget failure should not crash page |
| Time/range interactions | Change revenue range/filter if available | Metrics and chart update correctly | No data range shows empty/zero-safe UI |
| Navigate from cards | Click linked metric/detail entries | Navigates to matching list/report | Broken link route fallback |

## 4.2 Customers

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Create customer | Go Customers, Add, fill valid data, Save | Success toast, customer appears in list and searchable | Duplicate email or name handling, optional fields blank |
| Edit customer | Open existing customer, modify data, Save | Updated data visible in list and detail page | Concurrent update conflict message |
| Delete customer | Delete from list/actions | Row removed and count updates | Blocked deletion if linked docs, confirm dialog cancel |
| Search and filter | Search by name/email/phone | Matching rows only | Mixed case, leading/trailing spaces |
| Customer detail history | Open customer detail page | Related invoices/quotes shown correctly | Empty history state |

## 4.3 Products and Stock

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Create product | Add product with SKU/rate/stock | Product appears in list and can be selected in invoice item row | Duplicate SKU, negative rate/stock rejection |
| Edit product | Update product pricing/stock fields | Changes reflect in list and dependent forms | Decimal precision handling |
| Delete product | Delete product from actions | Removed from list and unavailable for new docs | Linked usage restriction behavior |
| Search products | Search by product name or code | Correct filtered list | Very long query |
| Stock adjustment impact | Perform stock adjustment entry | Updated stock reflected in product listing/summary | Negative balance prevention, invalid qty |

## 4.4 Quotes

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Create quote | Add quote with customer and line items | Quote saved with computed totals and status | Zero-quantity lines, tax off/on behavior |
| Edit quote | Modify line items and save | Recomputed totals persist | Rounding consistency |
| Delete quote | Delete from list | Row removed | Confirm cancel path |
| Convert quote | Use Convert action to Invoice or Sales Order | New target document opens with mapped data | Next-number API failure fallback and manual correction |
| Search and empty | Search no-match query | Empty state displayed with safe UI | Special characters in search |

## 4.5 Invoices

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Create invoice from scratch | Invoices Add, select customer, add line items, save as issued | Invoice saved, totals and tax computed correctly | Missing customer, invalid item values |
| Save as draft then issue | Save draft first, reopen, issue | Status transitions correctly and fields persist | Draft with incomplete lines |
| Edit invoice | Update terms, items, due date, save | List and detail values update | Recalculation mismatch check |
| Delete invoice | Delete via actions | Invoice removed from list | Permission denied behavior |
| Search and status filters | Use search and status dropdown | List reflects intersection of query and status | Empty filter result handling |
| Send invoice email | Open email dialog, send | Success toast and no UI lock | Missing recipient, API failure |
| Download PDF | Trigger PDF download | Valid PDF file downloaded | PDF generation failure message |
| Record payment | Record partial/full payment from dialog | Amount paid and balance due update, status adjusts | Overpayment, zero/negative amount blocked |
| Portal link generation | Copy portal link for invoice | Link copied and portal page accessible | Legacy invoice token generation failure |
| Approval actions | Submit for approval, approve or reject with reason | Status and approval feedback updated | Role without approval permission |

## 4.6 Recurring Profiles

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Create recurring profile | Add profile with frequency, customer, items | Profile listed and editable | Invalid frequency/date range |
| Edit recurring profile | Update schedule/details | Saved changes persist | Disable vs active behavior |
| Delete recurring profile | Delete profile | Removed from list | Confirm cancel path |

## 4.7 Sales Orders

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Create sales order | Add new order with valid line items | Saved with computed totals | Tax/no-tax path consistency |
| Edit and status flow | Update order details/status | Persisted values in list and reopened form | Invalid status transition |
| Delete and search | Delete and verify search behavior | Removed from result set | Search after deletion stale data |

## 4.8 Vendors

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Create vendor | Add vendor with contact/tax data | Vendor appears and selectable in purchase docs | Duplicate vendor/email validation |
| Edit and delete vendor | Modify then delete | Updates then removes correctly | Linked document restriction |
| Search vendor | Search by name/GST/contact | Correct list filtering | Empty state messaging |

## 4.9 Purchase Orders

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Create purchase order | Add PO with vendor and items | PO created with accurate totals | Missing vendor/item validation |
| Edit PO | Update quantities/rates | Totals recalculate and save | Large numeric values |
| Delete/search/filter | Delete and verify list/search | Correct UI state updates | Pagination shift after deletion |

## 4.10 Bills

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Create bill | Add bill from vendor data | Bill listed with correct amount and due date | Invalid due date or amount |
| Edit bill | Change fields and save | Updated bill visible | Tax handling mismatch |
| Delete/search | Remove and search remaining | Correct filtered output | Empty dataset state |

## 4.11 Expenses

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Create expense | Add expense with category/date/amount | Expense appears and totals update | Negative/zero amount blocked |
| Edit/delete expense | Update then delete | List reflects changes | Linked reconciliation behavior |
| Stats and filtering | Apply date/category filters | Stats/list update consistently | No data range |

## 4.12 Banking and Reconciliation

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Bank account CRUD | Add/edit/delete bank account | Accounts persist and appear in banking modules | Duplicate account number |
| Reconciliation workflow | Open reconciliation, match transaction to document | Match state saved and reflected | Unmatched transaction handling |
| Error/empty behavior | Load with no transactions | Meaningful empty state | API timeout and retry |

## 4.13 Reports

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Report navigation | Open reports hub then each report page | Correct report loads with no route errors | Direct URL access |
| Date/filter changes | Change date range/filter | Data refreshes and totals align | Empty report period |
| Accuracy spot-check | Compare report totals with source docs | Values consistent within rounding rules | Boundary dates and timezone |

## 4.14 Settings: Organization Profile

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Update org profile | Modify org name/address/contact and save | Values persist after refresh/relogin | Required fields missing |
| Logo upload and crop | Upload logo, crop, save | Preview updates and persists | Invalid image type/size |
| Remove logo | Delete logo and save | Fallback branding appears | Cache stale image |

## 4.15 Settings: Branding

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Theme color update | Change primary/accent/secondary, save | Theme updates in top-level UI and persists | Invalid hex format blocked |
| Preview validation | Check invoice preview panel | Preview reflects selected colors/logo toggles | Extreme contrast colors readability |
| Reset branding | Use reset/default option | Values return to defaults | Save required after reset |

## 4.16 Settings: Invoice Preferences

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Number format config | Set prefix/suffix/padding/next number and save | Next new invoice uses expected numbering pattern | Padding bounds and non-integer input |
| Payment defaults | Set default terms/due days and save | New invoice form prefilled with defaults | Negative due days blocked |
| Notes and terms defaults | Save default notes/terms | New invoice pulls defaults | Large text length handling |

## 4.17 Settings: Taxes

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| GST toggle and org GST data | Enable/disable GST, update GSTIN/registration | Settings save and affect invoice tax behavior | Invalid GSTIN length/format |
| Tax rate CRUD | Add/edit/delete rates | Tax list updates and selectable in forms | Duplicate rate names |
| Default tax behavior | Mark default rate and create new doc | Default rate auto-select logic validated | No default configured |

## 4.18 Settings: Users and Roles

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| User create/edit/deactivate | Manage users in settings | User lifecycle reflects in login/visibility | Duplicate username/email |
| Role permission matrix | Modify module permissions and save | UI actions reflect new permissions after relogin/refresh | Permission fetch failure fallback |
| Access enforcement | Test restricted user against protected actions | Restricted actions hidden or blocked | Direct URL access to restricted pages |

## 4.19 Settings: Automation and Integrations

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Save automation settings | Modify reminders/workflow toggles | Settings persist and success feedback shown | Validation for missing required fields |
| Save integration settings | Configure integration entries | Save and retrieval consistent | Invalid credentials/API key handling |

## 4.20 Settings: Audit Logs and Notifications

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Audit logs listing | Open audit logs page | Log entries render with metadata | Empty log state |
| Notifications polling | Trigger notification event and wait for poll | Unread badge updates and dropdown shows item | Mark read and mark all read correctness |

## 4.21 Global Search and Command Palette

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Inline global search | Use top search input with query | Dropdown grouped results shown | Debounce and fast typing behavior |
| Recent searches and recently viewed | Focus empty search input | Prior searches and recently viewed entries appear | Clear single/all actions |
| Search result navigation | Select customer/invoice/product result | Navigates to expected route and tracks recent item | Broken path fallback |
| Full search page | Submit free text to Search page | Category sections and filters work | No-result quick actions |
| Command palette navigation | Cmd/Ctrl + K then select item | Correct navigation/action triggered | Arrow key and enter selection |

## 4.22 Approvals

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Pending approvals list | Open approvals page with approver role | Pending docs visible | Non-approver access behavior |
| Approve or reject | Perform approve or reject with reason | Status updates and toast shown | Double-submit or stale item |

## 4.23 Profile and Session

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Profile view/edit | Open profile and update fields | Changes persist | Validation errors |
| Session refresh behavior | Simulate token expiry and perform API action | Silent refresh or session-expired flow | Refresh token invalid path |

## 4.24 Customer Portal and Admin (Smoke)

| Scenario | Steps | Expected Result | Edge Cases |
|---|---|---|---|
| Customer portal invoice | Open portal invoice link token | Invoice view loads without full app auth | Invalid/expired token handling |
| Admin module access | Open admin login and protected admin routes | Isolation from regular auth tokens verified | Non-super-admin rejected |

---

## 5. End-to-End Flows

## E2E-1 Customer to Invoice to Payment

- Steps:
  - Create customer.
  - Create invoice for that customer with multiple items and tax.
  - Save as issued.
  - Send email and download PDF.
  - Record partial payment, then final payment.
- Expected:
  - Invoice status transitions correctly, balance due reaches zero, customer history shows invoice.
- Edge checks:
  - Partial payment greater than balance rejected.
  - Payment mode/reference persistence.

## E2E-2 Quote to Invoice Conversion

- Steps:
  - Create quote.
  - Convert quote to invoice.
  - Verify mapped fields (customer, items, amounts, tax, notes).
  - Save converted invoice and compare source quote remains intact.
- Expected:
  - New invoice created with unique number and correct totals.
- Edge checks:
  - Next-number service fallback handled safely.

## E2E-3 Search to Navigate to Action

- Steps:
  - Use top global search with known customer/invoice keyword.
  - Open result from dropdown.
  - From opened module, perform edit and save.
  - Verify recent search/recently viewed entries update.
- Expected:
  - Correct route navigation and tracking persistence.
- Edge checks:
  - No-result path routes to search page with quick actions.

## E2E-4 Settings Impact Validation

- Steps:
  - Update branding colors/logo.
  - Update invoice preferences (prefix, due days, notes).
  - Update tax settings (GST and rate).
  - Create new invoice.
- Expected:
  - New invoice reflects updated defaults and tax behavior; UI theme changes persist.
- Edge checks:
  - Refresh and relogin preserve all settings.

## E2E-5 Approval Workflow

- Steps:
  - Create invoice as non-approver.
  - Submit for approval.
  - Login as approver and approve or reject.
  - Reopen invoice list and approvals list.
- Expected:
  - Status and comments reflect final action and item leaves pending queue.
- Edge checks:
  - Unauthorized approver actions blocked.

---

## 6. Edge Cases

Run these systematically across modules with representative data.

- Empty inputs:
  - Submit with required fields blank.
- Invalid formats:
  - Email, phone, tax IDs, date formats, hex colors.
- Large values:
  - Very large amount, quantity, long notes, long names.
- Duplicate entries:
  - Duplicate customer/vendor/product identifiers.
- Boundary numbers:
  - Zero, negative, decimal where integer required.
- Data race:
  - Same record edited in two tabs or by two users.
- API failures:
  - 400 validation error, 401 session refresh path, 403 forbidden, 404 missing record, 500 unknown.
- Pagination edge:
  - Delete last item on current page.
- Search edge:
  - Special characters, mixed scripts, extremely long query.
- Localization edge:
  - Hindi text truncation in tables/buttons/chips.

---

## 7. Keyboard Shortcut Testing

## Core Shortcuts

- Cmd or Ctrl + K:
  - Opens command palette from normal app pages.
- Cmd or Ctrl + Enter:
  - Submits focused form when form is active.
- Cmd or Ctrl + /:
  - Opens shortcuts help modal.
- Esc:
  - Closes top-most open overlay in sequence.

## Test Cases

- Open palette from dashboard and from a form page.
- Navigate palette with arrow keys and Enter.
- Verify recent customers appear in command palette and open invoice add flow with preselected customer.
- Verify Esc closes only the active overlay layer.
- Verify shortcuts do not break text entry and standard browser shortcuts.
- Verify behavior on macOS and Windows keyboard mapping.

## Conflict Checks

- While modal is open, shortcuts should not trigger unintended page actions.
- While typing in input fields, only allowed shortcuts should fire.

---

## 8. Localization Testing

## Language Switch

- Switch language from top utility bar between English and Hindi.
- Refresh page and relogin to confirm language persistence.

## Validation Areas

- Navigation labels, table headers, form labels, buttons, toasts, empty states.
- Report names and settings menu items.
- Search and command palette labels.

## Hinglish and Readability

- Validate that Hindi strings remain understandable in accounting context.
- Ensure mixed English accounting terms remain usable and not misleading.

## Layout Stability

- Check for clipping, overlap, wrapping, and misalignment in both languages.
- Validate mobile width and narrow breakpoints for translated content.

---

## 9. Test Result Format

Use this format for each executed test case.

| Feature | Scenario | Status | Issue ID or Summary | Steps to Reproduce | Expected | Actual | Environment |
|---|---|---|---|---|---|---|---|
| Invoices | Record partial payment | Pass | NA | Open invoice, record payment 1000 | Balance updates | Balance updated | Staging, Chrome 123 |
| Search | Recent history delete | Fail | BUG-214 | Search customer, delete history item | Item removed | Item reappears after refresh | Staging, Chrome 123 |

Status values:
- Pass
- Fail
- Blocked
- Not Run

Defect quality checklist:
- Include exact route.
- Include test data used.
- Include timestamp and user role.
- Attach screenshot or screen recording.
- Attach request and response snippet for API-related issues.

---

## Execution Strategy Recommendation

- Sprint smoke suite (daily):
  - Login, dashboard, global search, create invoice, record payment, one report, notifications.
- Release regression suite:
  - Full module matrix above plus all E2E flows and localization pass.
- Role matrix run:
  - Admin, Manager or Approver, Standard user.
- Browser matrix:
  - Latest Chrome, Edge, Safari.
- Device matrix:
  - Desktop, tablet width, mobile width.
