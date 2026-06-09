# Solidev Books — QA Execution Guide

## Quick Start (< 5 minutes)

```bash
# 1. Add credentials
cp qa/configs/env.qa.example .env.qa
# edit .env.qa with your QA_USERNAME and QA_PASSWORD

# 2. Start the app
npm start                          # Terminal 1 — frontend
cd ../smart-invoice-pro-api-2 && source venv/bin/activate && python main.py
                                   # Terminal 2 — backend

# 3. Run login workflow
npm run qa:run -- 01-login
# Chrome opens, logs in, then stays open for agent control
```

---

## Running Workflows with Cursor Agent

The recommended method. Cursor Agent uses the **Playwright MCP** to control Chrome directly.

### Prompts for Cursor

**Single workflow:**
```
Read qa/prompts/cursor-agent.md, then execute qa/workflows/05-invoices.md against http://localhost:3000.
Save screenshots to qa/screenshots/ and track all created entities.
```

**Full invoice lifecycle (with validation):**
```
Execute qa/workflows/11-invoice-lifecycle-full.md against http://localhost:3000.
Run invoice-validator after draft and after payment.
Produce a bug report for any failures using npm run qa:bug.
```

**Regression pass:**
```
Execute all workflows in qa/regression-manifest.json sequentially.
For each: login, execute steps, screenshot state changes, validate totals, log failures.
Produce one combined summary in qa/reports/.
```

**Exploratory:**
```
Navigate through /invoices, /quotes, and /bank-reconciliation.
Look for arithmetic errors, wrong status badges, broken UI, or console errors.
Report findings as structured bug reports.
```

---

## Running Workflows via CLI

```bash
# See all available workflows
npm run qa:list

# Parse a workflow to understand its structure
npm run qa:parse -- 02-customers

# Open Chrome + login, keep open for manual or agent use
npm run qa:run -- 05-invoices

# Run full regression plan
npm run qa:regression
```

---

## Running Invoice Workflow Step by Step

```bash
# 1. Start session
npm run qa:run -- 11-invoice-lifecycle-full

# Chrome opens and shows the dashboard. Now agent takes over...

# 2. After the agent creates an invoice, validate the captured payload
npm run qa:validate -- invoice /tmp/draft-invoice.json

# 3. After payment, validate balance
npm run qa:validate -- balance /tmp/customer-after-payment.json

# 4. File a bug if something is wrong
npm run qa:bug -- \
  --title "Invoice total wrong after line edit" \
  --severity High \
  --module Invoices \
  --workflow 11-invoice-lifecycle-full \
  --steps "Navigate to /invoices/add|Add line items|Edit quantity|Observe total" \
  --expected "Total = 1320.00 after qty 2→3 on $99 + 10% GST item" \
  --actual "Total still shows 1210.00" \
  --screenshot qa/screenshots/20260603-101500/11-invoice-lifecycle-full/04-invoice-edited.png
```

---

## Validating Bookkeeping Correctness

### From a JSON file

Save the API response or UI-scraped data to JSON, then:

```bash
# Invoice
npm run qa:validate -- invoice payload.json

# Payment allocation
npm run qa:validate -- payment payload.json   # payload: { payment, invoice }

# Customer balance
npm run qa:validate -- balance payload.json   # payload: { customer, invoices, payments }

# Bank reconciliation
npm run qa:validate -- reconciliation payload.json
```

Exit code 0 = PASS, exit code 1 = FAIL (with error list on stdout).

### Compare expected vs actual

```json
// compare.json
{
  "expected": { "subtotal": 1000, "total_tax": 100, "total_amount": 1100 },
  "actual":   { "subtotal": 1000, "total_tax": 100, "total_amount": 1099 },
  "fields":   ["subtotal", "total_tax", "total_amount"]
}
```

```bash
npm run qa:compare -- compare.json
# { "pass": false, "mismatches": [{ "field": "total_amount", "expected": 1100, "actual": 1099 }] }
```

---

## Bug Reporting

Bugs are written to two locations simultaneously:

- `qa/bugs/<runId>/<timestamp>-slug.md` — canonical bug
- `qa/reports/<runId>/<timestamp>-slug.md` — indexed in reports

### CLI

```bash
npm run qa:bug -- \
  --title "Save as Draft sets status to Issued" \
  --severity High \
  --module Invoices \
  --workflow 05-invoices \
  --steps "Open /invoices/add|Fill required fields|Click Save as Draft" \
  --expected "Status badge = Draft" \
  --actual "Status badge = Issued" \
  --screenshot qa/screenshots/.../02-draft-status.png \
  --recommendation "Check status assignment in AddEditInvoice.jsx submit handler"
```

### Agent (Cursor)

The agent should call this after any workflow step that produces unexpected results. The structured format enables:
- Regression test creation from the steps
- Severity-based triage
- Screenshot evidence linking

---

## Evidence Artifacts

Each run produces a folder at `qa/evidence/<runId>/`:

```
qa/evidence/20260603-101500/
├── entities.json                     All tracked created records
├── verify-browser-execution.log.json  Step log + pass/fail
└── <workflow>-agent-plan.json         Agent execution plan
```

Screenshots at `qa/screenshots/<runId>/<workflow>/01-login.png …`

Reports at `qa/reports/<runId>/<workflow>-summary.json`

---

## Adding a New Module to QA

1. Create `qa/workflows/NN-module-name.md` with business objective, steps, validators
2. Add test data to `qa/test-data/` (JSON + optionally CSV/XLSX)
3. Add workflow ID to `qa/regression-manifest.json`
4. Verify: `npm run qa:parse -- NN-module-name`
5. Tell Cursor: `Execute qa/workflows/NN-module-name.md against http://localhost:3000`

---

## Future Roadmap

| Capability | Status | Notes |
|-----------|--------|-------|
| Playwright MCP execution | Ready | `.cursor/mcp.json` configured |
| AI-validated totals | Ready | 5 validator types operational |
| Excel test data | Ready | `npm run qa:seed-excel` |
| Entity reuse across workflows | Ready | `EntityTracker` |
| Automated regression CI | Planned | Set `QA_HEADLESS=true`, add GH Actions step |
| OFX/QIF bank import formats | Planned | Extend `09-bank-imports.md` |
| AI-assisted auto-matching | Planned | `10-reconciliation.md` lays foundation |
| Mobile (Flutter) QA coverage | Planned | New workflow set required |
| Webhook / payment gateway QA | Ready (legacy) | `qa-workflows/14-payment-webhook-validation.md` |
| Multi-tenant isolation | Ready (legacy) | `qa-workflows/19-multi-tenant-isolation.md` |
