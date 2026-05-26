# Smart Invoice Pro — Frontend Testing Discipline

This file defines enforceable frontend testing rules for React + MUI changes.

> Additional full-stack architecture context: see `.github/copilot-instructions.md`.

---

## Scope

Applies to all changes under:
- `src/components/`
- `src/pages/`
- `src/services/`
- `src/context/`
- `src/admin/`
- `src/routes.js`

---

## Unit Testing Rules

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

---

## Unit Test Folder and Naming Conventions

Use existing repository test layout:

```
src/__tests__/
  components/     ← ComponentName.test.jsx
  pages/          ← PageName.test.jsx
  services/       ← serviceName.test.js
  admin/          ← AdminComponent.test.jsx | adminService.test.js
```

---

## Unit Test Utilities and Patterns

1. Use `renderWithProviders()` from `src/test-utils.jsx`.
2. Use `mockAuthContext()` from `src/test-utils.jsx` for auth-state overrides.
3. Use `mockApiResponse()` from `src/test-utils.jsx` for consistent mocked HTTP payloads.
4. Mock `axios` in service tests via `jest.mock('axios')`.
5. Mock service modules in component/page tests to isolate UI behavior.

---

## Coverage Policy

Minimum frontend unit coverage target is **70%** for tested UI scopes.

Directory-level thresholds enforced in Jest configuration:

| Directory | Statements | Functions | Lines |
|-----------|-----------|-----------|-------|
| `src/services/` | 80%+ | 80%+ | 80%+ |
| `src/pages/` + `src/components/` | 70%+ | 70%+ | 70%+ |
| `src/admin/services/` | 80%+ | 80%+ | 80%+ |
| `src/admin/routes/` | 60%+ | 60%+ | 60%+ |
| `src/admin/pages/` | 40%+ | 40%+ | 40%+ |
| `src/context/` + `src/config/` | retain existing or improve | | |

---

## Merge Gate Policy

Code must **not** be merged when:
- Unit tests fail
- E2E tests fail on critical paths
- Coverage thresholds fail
- Required behavior tests are missing for changed forms, components, or services

---

## CI Requirements

CI must run on every pull request and must include:

1. Dependency install
2. Unit test execution in CI mode with coverage
3. E2E test suite execution against a live dev server
4. Coverage threshold enforcement

Reference commands:
```bash
# Unit tests
npx react-scripts test --watchAll=false --ci --coverage

# E2E tests
node qa-automation/live_qa_runner.js
```

---

## End-to-End (E2E) Testing

E2E tests validate complete user workflows through a **real, running Chrome browser** against the live application stack. They complement unit tests by covering integration, navigation, and UX flows that cannot be mocked.

### Philosophy

| Principle | Rule |
|-----------|------|
| **Real browser only** | All E2E tests run against a live Chrome instance — no mocking the browser |
| **Full stack required** | Frontend (`localhost:3000`) + API server must both be running |
| **Human-like interaction** | Tests click, type, scroll, and navigate exactly as a real user would |
| **Bookkeeping-safe** | Never hard-delete production data — use archive actions and test-only records |
| **Screenshot every step** | Capture a named screenshot at each key interaction point |
| **Module isolation** | Each suite covers one module completely before moving to the next |

---

### E2E Setup

#### Step 1 — Start the Application Stack

```bash
# Terminal 1 — Frontend
cd smart-invoice-pro
npm start
# → http://localhost:3000

# Terminal 2 — API Server
cd smart-invoice-pro-api-2
# (see API README for the exact start command)
```

#### Step 2 — Launch Chrome with Remote Debugging (CDP)

```bash
# Close any existing Chrome first
pkill -f "Google Chrome"

# Open Chrome with DevTools Protocol enabled
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-qa-profile \
  --no-first-run \
  --no-default-browser-check \
  "http://localhost:3000/login" &
```

> **Why CDP?** Chrome DevTools Protocol gives direct Node.js-controlled access to the browser: navigation, DOM inspection, JS evaluation, screenshot capture — all without a separate browser driver process.

#### Step 3 — Verify the CDP Connection

```bash
curl http://localhost:9222/json/version
# Should return JSON with Browser version and webSocketDebuggerUrl
```

#### Step 4 — Run the E2E Suite

```bash
node qa-automation/live_qa_runner.js
```

---

### E2E File Structure

```
qa-automation/
  live_qa_runner.js      ← Main CDP-based E2E runner (all suites)

qa-screenshots/          ← Auto-saved screenshots (gitignored)
  01-login-page.png
  02-post-login.png
  03-dashboard.png
  ...

qa-live-results.json     ← Auto-generated results JSON (gitignored)
```

---

### E2E Architecture — How It Works

The runner establishes a **WebSocket connection** to Chrome's CDP endpoint and controls the browser by sending protocol commands:

```
Node.js Runner
     │
     │  WebSocket (ws://localhost:9222/devtools/page/<tabId>)
     ▼
Chrome DevTools Protocol
     │
     ├── Page.navigate        → change URL
     ├── Page.captureScreenshot → save PNG
     ├── Runtime.evaluate     → execute JS in page context
     └── Network.enable       → observe HTTP traffic
```

#### Core Helper Functions

```js
// Navigate to a URL and wait for React to render
async function navigate(url) {
  await send('Page.navigate', { url });
  await sleep(3000);
}

// Fill a React-controlled input correctly
// IMPORTANT: Plain .value = '' does NOT trigger React's onChange.
// Must use the native value setter + dispatch bubbling events.
async function fillInput(selector, value) {
  await evaluate(`
    (function() {
      var el = document.querySelector('${selector}');
      if (!el) return false;
      var nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      ).set;
      nativeSetter.call(el, '${value}');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()
  `);
}

// Click any element by CSS selector
async function click(selector) {
  await evaluate(`document.querySelector('${selector}')?.click()`);
}

// Click by visible text content (buttons, links, menu items)
async function clickText(text) {
  await evaluate(`
    [...document.querySelectorAll('button, a, [role="button"], li')]
      .find(e => e.textContent.trim().includes('${text}'))?.click()
  `);
}

// Capture a named screenshot to qa-screenshots/
async function screenshot(name) {
  const res = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`qa-screenshots/${name}.png`, Buffer.from(res.data, 'base64'));
}

// Log a test result
function log(type, id, msg) {
  // type: 'pass' | 'fail' | 'warn' | 'info'
  const icons = { pass: '✅', fail: '❌', warn: '⚠️', info: 'ℹ️' };
  console.log(`${icons[type]} ${id} ${msg}`);
  results[type === 'pass' ? 'passed' : type === 'fail' ? 'failed' : 'warnings'].push({ id, msg });
}
```

---

### E2E Test Suite Index

Each suite runs sequentially in a single browser session:

| Suite | Module | Key Scenarios Tested |
|-------|--------|---------------------|
| 1 | 🔐 Auth / Login | Form fields, credential fill, redirect to dashboard |
| 2 | 📊 Dashboard | Metrics visible, charts loaded, no error banners |
| 3 | 🧾 Invoices | List filters, Add form fields, empty-save validation, export |
| 4 | 📋 Quotes | List, Add form, expiry date, status labels |
| 5 | 📦 Sales Orders | List access, Add form accessibility |
| 6 | 🏢 Vendors | List, Add form, email/GST/phone fields, email validation |
| 7 | 💳 Bills & POs | List accessible, create button present |
| 8 | 💰 Expenses | List, category column, add button |
| 9 | 📈 Reports | P&L, AR Aging, GST Summary, Balance Sheet, Cash Flow |
| 10 | 🏦 Banking | Bank Accounts list, balance display, Reconciliation page |
| 11 | ⚙️ Settings | Org profile, Tax, Branding, Audit Log accessibility |
| 12 | 🔄 E2E Workflow | Customer list → duplicate warning → bulk label → invoice cross-link |
| 13 | 📦 Products | List, Add form, HSN/SAC/Unit/Price/Tax fields |
| 14 | 💸 Payments | Payments Received + Made report columns |
| 15 | 🔍 Search & Notifications | Global search results, notifications page |
| 16 | 🐛 Edge Cases | Invalid IDs (404 UX), special characters in names, empty states |

---

### Writing a New E2E Suite

Follow this exact pattern when adding a suite for a new module or feature:

```js
section('SUITE N — Your Module Name');

// 1. Navigate and screenshot
await navigate(`${BASE_URL}/your-module`);
await sleep(2000);
await screenshot('NN-module-list');

// 2. Confirm the page loaded (URL check)
const url = await getURL();
if (url.includes('/your-module')) log('pass', 'N.1', 'Module list accessible');
else log('fail', 'N.1', `Module redirect: ${url}`);

// 3. Check key UI elements
const bodyText = await evaluate('document.body.innerText');
if (bodyText.includes('New Widget')) log('pass', 'N.2', 'Create button present');
else log('warn', 'N.2', 'Create button not found');

// 4. Open the Add/Create form
await navigate(`${BASE_URL}/your-module/add`);
await sleep(2000);
await screenshot('NN-add-form');

// 5. Check required form fields
const formBody = await evaluate('document.body.innerText');
if (formBody.includes('Name')) log('pass', 'N.3', 'Name field present');
else log('fail', 'N.3', 'Name field MISSING from form');

// 6. Test empty-form validation
await clickText('Save');
await sleep(1500);
const validationMsg = await evaluate(`
  [...document.querySelectorAll('[class*="error" i], [class*="helper" i]')]
    .map(e => e.textContent.trim()).filter(t => t.length > 0).join(' | ')
`);
if (validationMsg) log('pass', 'N.4', `Validation fires: "${validationMsg.substring(0, 80)}"`);
else log('fail', 'N.4', 'No validation on empty form submit — form accepted blank data');

await screenshot('NN-form-validation');

// 7. Confirm form did NOT navigate away on failed validation
const urlAfter = await getURL();
if (urlAfter.includes('/add')) log('pass', 'N.5', 'Form held on page after failed validation');
else log('fail', 'N.5', `Form wrongly navigated away to: ${urlAfter}`);
```

---

### Critical Validations — Required for Every Module

Every suite **must** verify these:

#### ✅ Form Behaviour
- [ ] Required fields show validation on empty submit
- [ ] Validation messages are **visible on screen** (not just in DOM)
- [ ] Email fields reject `not-an-email` format
- [ ] Form stays on page when validation fails (does not silently navigate away)
- [ ] Form shows loading state while saving

#### ✅ Bookkeeping Safety
- [ ] Bulk operations are labeled **"Archive"** — never **"Delete"**
- [ ] Archive dialogs warn when linked invoices/payments exist
- [ ] Hard delete is inaccessible via UI for any record with financial history

#### ✅ Data Integrity
- [ ] Special characters (`O'Brien & Sons`, `M&M Corp`, `<Test>`) are accepted or explicitly rejected with a visible error — **never silently fail**
- [ ] Long strings (500+ chars) are capped at `maxLength` or display a character counter

#### ✅ Navigation
- [ ] Invalid record IDs show a **friendly 404 page** with a "Back" button — not a raw error string
- [ ] Name/row links navigate correctly to the detail page

#### ✅ AR/AP Compliance
- [ ] Revenue/Amount columns show real values — `₹0.00` for every row is a bug
- [ ] An **"Archived"** filter option exists in every list module
- [ ] A restore path is accessible for archived records

---

### E2E Logging Reference

```js
log('pass', 'N.X', 'Exact value confirmed — e.g. "Archive Customer" dialog text');
log('fail', 'N.X', 'What failed and what was actually observed');
log('warn', 'N.X', 'Unexpected behavior needing investigation — not a hard failure');
log('info', 'N.X', 'Diagnostic data point — e.g. page title, count of elements');
```

Results accumulate automatically into `results.passed`, `results.failed`, `results.warnings` and are written to `qa-live-results.json` at the end of each run.

---

### Screenshot Naming Convention

Screenshots are saved to `qa-screenshots/` with a **zero-padded sequential prefix**:

```
01-login-page.png
02-post-login.png
03-dashboard.png
04-invoice-list.png
05-add-invoice-form.png
06-invoice-form-validation.png
07-quote-list.png
...
NN-descriptive-kebab-name.png
```

> Screenshots are **gitignored** locally. In CI they are uploaded as build artifacts for QA review.

---

### E2E Results JSON Structure

Written to `qa-live-results.json` after every run:

```json
{
  "timestamp": "2026-05-25T05:43:00.000Z",
  "totals": {
    "passed": 62,
    "failed": 8,
    "warnings": 14,
    "info": 12,
    "total": 84,
    "passRate": 74
  },
  "failures": [
    { "id": "3.8",  "msg": "No Export button found in Invoice list" },
    { "id": "16.2", "msg": "[PERSISTS] Invalid customer ID shows raw error string" }
  ],
  "warnings": [
    { "id": "2.6", "msg": "Dashboard: Failed to load revenue chart | Failed to load low stock items" },
    { "id": "9.11", "msg": "Print button not found on P&L report" }
  ],
  "screenshots": ["01-login-page.png", "02-post-login.png", "03-dashboard.png", "..."]
}
```

---

### Known Open Issues (Do Not Re-Report)

These are **already tracked** in repo audit files. When running E2E, mark these as `[PERSISTS]` or `[FIXED]` — do not open duplicate tickets.

| ID | Issue | Status | Audit File |
|----|-------|--------|------------|
| C01 | 31 duplicate customer records on dashboard | 🔴 Open | `customers_module_qa_audit.md` |
| C02 | Bulk action labeled "Delete Selected" (should be Archive) | 🔴 Open | `customers_module_qa_audit.md` |
| C03 | No email validation on customer Add form | 🔴 Open | `customers_module_qa_audit.md` |
| C04 | No "Archived" filter in customer list | 🟠 Open | `customers_module_qa_audit.md` |
| C05 | Archive dialog missing linked-invoice warning | 🟠 Open | `customers_module_qa_audit.md` |
| C06 | Customer name row click unreliable | 🟠 Open | `customers_module_qa_audit.md` |
| C08 | Total Revenue column shows ₹0.00 for all customers | 🟡 Open | `customers_module_qa_audit.md` |
| C09 | No Export in Customers module | 🟡 Open | `customers_module_qa_audit.md` |
| C12 | Special characters in customer name cause silent save failure | 🟡 Open | `customers_module_qa_audit.md` |
| I01 | No Export button in Invoice list | 🟠 Open | Live QA 2026-05-25 |
| D01 | Dashboard: revenue chart fails to load | 🟠 Open | Live QA 2026-05-25 |
| D02 | Dashboard: low stock items and inventory data fail to load | 🟠 Open | Live QA 2026-05-25 |

---

### CI Integration (Planned)

When E2E is wired into the CI pipeline:

```yaml
# .github/workflows/e2e.yml
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - name: Start frontend dev server
        run: npm start &

      - name: Wait for server
        run: npx wait-on http://localhost:3000

      - name: Launch headless Chrome with CDP
        run: |
          google-chrome \
            --headless \
            --remote-debugging-port=9222 \
            --no-sandbox \
            --disable-gpu \
            "http://localhost:3000" &

      - name: Run E2E suite
        run: node qa-automation/live_qa_runner.js

      - name: Upload screenshots as artifacts
        uses: actions/upload-artifact@v4
        with:
          name: qa-screenshots-${{ github.run_id }}
          path: qa-screenshots/

      - name: Fail if E2E failures exceed threshold
        run: |
          FAILED=$(node -e "const r=require('./qa-live-results.json'); process.exit(r.totals.failed > 5 ? 1 : 0)")
```

> Until CI integration is complete, E2E tests are run **manually** by the QA lead before every release candidate.
