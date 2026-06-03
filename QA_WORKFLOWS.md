# Solidev Books — QA Workflow Reference

## What is a Workflow?

A workflow is a **plain-English markdown file** that describes a complete bookkeeping business scenario. It is NOT a Playwright script. Workflow files are read by:

1. **AI agents** (Cursor, Copilot) — to understand what to do in the browser
2. **`npm run qa:parse`** — converts to structured JSON for programmatic use
3. **`npm run qa:run`** — launches Chrome and prepares execution context

Each workflow contains:

| Section | Purpose |
|---------|---------|
| Business Objective | Why this workflow exists (not just "click buttons") |
| Preconditions | What must be true before starting |
| Workflow Steps | Ordered steps with actions and validations |
| Validation Rules | Which bookkeeping validators to run |
| Bookkeeping Expectations | Financial correctness rules |
| Screenshots Required | Evidence checkpoints |
| Success Criteria | Definition of pass |
| Test Data | Which data files to load |

---

## Core Regression Workflows

| ID | File | Business Purpose |
|----|------|-----------------|
| 01 | `01-login.md` | Authentication & session |
| 02 | `02-customers.md` | AR master data + archive behavior |
| 03 | `03-items.md` | Products, services, stock adjustments |
| 04 | `04-quotes.md` | Quote → Invoice conversion |
| 05 | `05-invoices.md` | Invoice lifecycle: draft → sent → paid |
| 06 | `06-payments.md` | Partial/full payments, AR allocation |
| 07 | `07-vendors.md` | AP master data |
| 08 | `08-purchase-orders.md` | PO → Bill → AP impact |
| 09 | `09-bank-imports.md` | Statement upload + transaction staging |
| 10 | `10-reconciliation.md` | Match/unmatch + reconciliation status |

## Extended Workflows

| ID | File | Business Purpose |
|----|------|-----------------|
| 11 | `11-invoice-lifecycle-full.md` | Complete AR cycle with validators at every state |

## Legacy Extended Workflows (`qa-workflows/`)

These 19 files contain advanced scenarios. They remain fully usable:

| File | Coverage |
|------|---------|
| `10-invoice-payment-integrity.md` | Payment integrity deep-dive |
| `11-invoice-approval-workflow.md` | Approval gates |
| `12-purchase-order-to-bill.md` | PO → Bill detailed |
| `13-role-permission-enforcement.md` | RBAC: admin/manager/viewer |
| `14-payment-webhook-validation.md` | Zoho payment webhooks |
| `15-bank-reconciliation.md` | Reconciliation deep-dive |
| `16-customer-portal.md` | Customer self-service portal |
| `17-recurring-invoice-gap.md` | Recurring profile gaps |
| `18-report-accuracy.md` | Financial report figures |
| `19-multi-tenant-isolation.md` | Security: tenant data isolation |

---

## Validation Validators

```
npm run qa:validate -- <type> <payload.json>
```

| Type | Validates |
|------|----------|
| `invoice` | Line totals, subtotal, tax, grand total, status vs balance |
| `payment` | Allocation sum, overpayment guard, status consistency |
| `tax` | GST applicability, CGST+SGST split matches total_tax |
| `balance` | Customer outstanding vs open invoice sum |
| `reconciliation` | Matched pair amounts, no duplicate matches |

### Example: validate a captured invoice

```bash
# Save API response to file, then validate
npm run qa:validate -- invoice /tmp/invoice-captured.json
```

---

## Writing a New Workflow

1. Create `qa/workflows/NN-feature-name.md`
2. Use the sections: Business Objective, Preconditions, Workflow Steps (H3 per step), Validation Rules, Bookkeeping Expectations, Screenshots Required, Success Criteria, Test Data
3. Add to `qa/regression-manifest.json` if it should run in every regression pass
4. Run: `npm run qa:parse -- NN-feature-name` to verify it parses correctly

```bash
npm run qa:parse -- NN-feature-name | jq '.steps[].name'
```

---

## Test Data Integration

Workflows reference data files by filename. Load them:

```bash
npm run qa:data -- customers.json
npm run qa:data -- invoice-scenarios.json
npm run qa:data -- bank-statement-sample.csv
```

Create Excel versions from JSON:

```bash
npm run qa:seed-excel
# Generates customers.xlsx, items.xlsx, invoice-scenarios.xlsx
```

---

## Entity Tracking

When an agent creates a record, it should call `entityTracker.track(type, record)`. All tracked entities persist to `qa/evidence/<runId>/entities.json` and can be reused:

```js
// Reuse customer created in 02-customers for 05-invoices
const tracker = new EntityTracker(runDir);
const customer = tracker.getLatest('customer');
```
