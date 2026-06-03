# Solidev Books — QA Operating System Setup

## Overview

This is a **workflow-driven QA operating system**, not a collection of test scripts.

```
Workflow Markdown Files  →  AI Agent  →  Browser Controller  →  Chrome Browser
        ↓                                        ↓
  Test Data (JSON/CSV/Excel)             Screenshots / Evidence
        ↓                                        ↓
  Bookkeeping Validators                  Bug Reports / Regression Assets
```

The stack lets a Cursor Agent (or any AI with Playwright MCP) execute real bookkeeping workflows, validate financial correctness, and produce structured evidence — without hardcoded UI scripts.

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18+ |
| Chrome | System Chrome (already installed) |
| `@playwright/test` | Installed (see `devDependencies`) |
| `csv-parse` | Installed |
| `dotenv` | Installed |

---

## First-time Setup

### 1. Create credentials file

```bash
cp qa/configs/env.qa.example .env.qa
# Edit .env.qa with real QA credentials (gitignored)
```

### 2. Verify engine works

```bash
npm run qa:list          # lists 11 workflows
npm run qa:parse -- 01-login   # prints workflow as JSON
npm run qa:regression    # plans all 10 core workflows
```

### 3. Verify browser control (app must NOT be running)

```bash
npm run qa:verify        # opens Chrome, screenshots home/fallback, closes
```

With the app running (`npm start`):

```bash
npm run qa:verify        # screenshots http://localhost:3000
```

### 4. Configure Cursor Playwright MCP

The file `.cursor/mcp.json` is already configured. In Cursor, the Playwright MCP server will launch headed Chrome automatically when Cursor Agent requests browser control.

---

## Folder Structure

```
smart-invoice-pro/
├── qa/
│   ├── configs/
│   │   ├── playwright.config.js      Playwright test runner config
│   │   ├── qa.default.json           Runtime config (paths, URLs)
│   │   ├── mcp.cursor.json           Reference MCP config
│   │   └── env.qa.example            Copy → .env.qa (gitignored)
│   ├── engine/
│   │   ├── index.js                  CLI entry point (all qa:* scripts)
│   │   ├── browser-controller.js     Playwright Chrome launcher + login
│   │   ├── workflow-parser.js        Markdown → structured workflow JSON
│   │   ├── test-data-loader.js       JSON / CSV / Excel loader + compare
│   │   ├── entity-tracker.js         Tracks created records across workflows
│   │   ├── screenshot-manager.js     Captures + indexes screenshots
│   │   ├── execution-context.js      Per-run context, step log, finalizer
│   │   ├── bug-reporter.js           Writes structured bug report markdown
│   │   ├── api-client.js             Optional API-level validation calls
│   │   ├── paths.js                  Config loader + path helpers
│   │   ├── verify-browser.spec.js    Playwright smoke spec
│   │   └── validators/
│   │       ├── index.js              Dispatch + runAllValidations
│   │       ├── invoice-validator.js  Line totals, tax, status checks
│   │       ├── payment-validator.js  Allocation, overpayment guard
│   │       ├── tax-validator.js      GST/CGST/SGST consistency
│   │       ├── balance-validator.js  Customer outstanding vs invoices
│   │       └── reconciliation-validator.js  Bank match amounts
│   ├── workflows/
│   │   ├── 00-agent-instructions.md
│   │   ├── 01-login.md … 11-invoice-lifecycle-full.md
│   ├── test-data/
│   │   ├── customers.json / .csv
│   │   ├── items.json
│   │   ├── invoice-scenarios.json
│   │   ├── payments.json
│   │   ├── vendors.json
│   │   └── bank-statement-sample.csv
│   ├── prompts/
│   │   └── cursor-agent.md           Agent instructions for Cursor
│   ├── templates/
│   │   └── bug-report.md             Bug report template
│   ├── scripts/
│   │   └── seed-excel.js             Generate .xlsx from JSON test data
│   ├── screenshots/                  (gitignored, .gitkeep)
│   ├── reports/                      (gitignored, .gitkeep)
│   ├── evidence/                     (gitignored, .gitkeep)
│   ├── bugs/                         (gitignored, .gitkeep)
│   └── regression-manifest.json     Defines core regression suite
├── qa-workflows/                     Legacy extended workflows (18 files)
├── .cursor/mcp.json                  Cursor Playwright MCP config
└── .env.qa                           Credentials (gitignored)
```

---

## npm Scripts Reference

| Script | What it does |
|--------|-------------|
| `npm run qa:list` | List all available workflow IDs |
| `npm run qa:parse -- <id>` | Output workflow as structured JSON |
| `npm run qa:run -- <id>` | Launch Chrome, login, open browser for agent |
| `npm run qa:login` | Open Chrome in a logged-in session |
| `npm run qa:regression` | Generate regression plan JSON for all 10 workflows |
| `npm run qa:verify` | Smoke-test Chrome browser control |
| `npm run qa:validate -- invoice <file.json>` | Validate invoice totals/tax/status |
| `npm run qa:validate -- payment <file.json>` | Validate payment allocation |
| `npm run qa:validate -- balance <file.json>` | Validate customer outstanding |
| `npm run qa:data -- customers.json` | Print test data to stdout |
| `npm run qa:bug -- --title "..." --severity High ...` | File a structured bug report |
| `npm run qa:compare -- <file.json>` | Compare expected vs actual fields |
| `npm run qa:seed-excel` | Generate .xlsx test data files |
| `npm run qa:playwright` | Run Playwright spec suite |

---

## Environment Variables (.env.qa)

```bash
QA_BASE_URL=http://localhost:3000
QA_API_URL=http://127.0.0.1:5001
QA_USERNAME=your-qa-user
QA_PASSWORD=your-qa-password
QA_HEADLESS=false          # set true for CI
```

---

## CI / Headless Mode

For GitHub Actions, set `QA_HEADLESS=true` as a repository secret and update `.cursor/mcp.json`:

```json
"args": ["@playwright/mcp@latest", "--browser", "chromium", "--headless", "--viewport-size", "1440,900"]
```
