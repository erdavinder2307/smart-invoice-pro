# Browser-Controlled QA Agent Setup

Solidev Books uses GitHub Copilot Agent Mode with `@playwright/mcp` to execute autonomous, browser-controlled QA testing without writing test scripts manually.

## How It Works

```
Copilot Agent Mode (Claude Sonnet)
        ↓
  @playwright/mcp (MCP server)
        ↓
   Real Chrome browser
        ↓
  Solidev Books UI
        ↓
  Screenshots + Bug Report
```

The agent reads workflow definitions from `qa-workflows/`, controls a live Chrome browser, captures screenshots at each step, and produces structured bug reports — all from a single Copilot Chat prompt.

## Requirements

| Requirement | Version |
|-------------|---------|
| VS Code | Latest |
| GitHub Copilot (Agent Mode) | Active subscription |
| Node.js | 18+ |
| `@playwright/mcp` | Auto-installed via npx |
| Chrome browser | System Chrome or Playwright-managed |

## Global MCP Configuration

`@playwright/mcp` is registered in VS Code's global MCP config at:

```
~/Library/Application Support/Code/User/mcp.json
```

```json
{
  "servers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--browser", "chrome", "--headed", "--viewport-size", "1440,900"]
    }
  }
}
```

`--headed` launches a visible Chrome window during QA runs. Use `--headless` for CI.

## Quick Start

### 1. Start the application

```bash
# Terminal 1 — Frontend
cd smart-invoice-pro && npm start

# Terminal 2 — Backend
cd smart-invoice-pro-api-2 && source venv/bin/activate && python main.py
```

### 2. Open Copilot Chat in Agent Mode

In VS Code, open Copilot Chat and ensure Agent Mode is active.

### 3. Run a workflow

```
Run the invoice lifecycle QA workflow from qa-workflows/01-invoice-lifecycle.md
against http://localhost:3000
```

The agent will:
1. Navigate to the app and log in
2. Execute every step in the workflow file
3. Take screenshots at each state change (saved to `qa-screenshots/`)
4. Write a bug report at the end

## Workflow Files

| File | Workflow |
|------|----------|
| [00-agent-instructions.md](qa-workflows/00-agent-instructions.md) | Agent behaviour rules & conventions |
| [01-invoice-lifecycle.md](qa-workflows/01-invoice-lifecycle.md) | Create → Send → Pay → PDF |
| [02-customer-crud.md](qa-workflows/02-customer-crud.md) | Customer management & archive/restore |
| [03-quote-to-cash.md](qa-workflows/03-quote-to-cash.md) | Quote → Invoice → Payment |
| [04-archive-restore.md](qa-workflows/04-archive-restore.md) | Archive/restore across all document types |
| [05-inventory-stock.md](qa-workflows/05-inventory-stock.md) | Stock adjustments & low-stock alerts |
| [06-payments-reconciliation.md](qa-workflows/06-payments-reconciliation.md) | Partial payments & bank reconciliation |
| [07-expenses-bills.md](qa-workflows/07-expenses-bills.md) | Vendor bills & expense recording |
| [08-dashboard-reports.md](qa-workflows/08-dashboard-reports.md) | Dashboard accuracy & financial reports |
| [09-settings.md](qa-workflows/09-settings.md) | Org settings, branding, GST config |
| [99-bug-report-template.md](qa-workflows/99-bug-report-template.md) | Structured bug report template |

## Example Prompts

**Single workflow:**
```
Run qa-workflows/01-invoice-lifecycle.md against http://localhost:3000.
Log in as davinder. Save screenshots to qa-screenshots/invoice-lifecycle/.
```

**Targeted feature check:**
```
Test that archiving a customer in Solidev Books removes them from the 
invoice customer dropdown. Use qa-workflows/04-archive-restore.md steps 2 and 5.
```

**Exploratory bug hunt:**
```
Navigate through the invoices, quotes, and expenses sections of http://localhost:3000.
Look for any broken UI, wrong totals, or error messages. Report what you find.
```

**Full regression pass:**
```
Execute workflows 01 through 08 in qa-workflows/ sequentially against 
http://localhost:3000. Produce one combined bug report at the end.
```

## Screenshot Output Structure

```
qa-screenshots/
  01-invoice-lifecycle/
    step-01-draft-invoice.png
    step-02-sent-invoice.png
    step-03-payment-dialog.png
    step-04-paid-status.png
    bug-report.md
  02-customer-crud/
    step-01-new-customer.png
    ...
```

## CI / Headless Mode

For automated pipeline runs, change `--headed` to `--headless` in `mcp.json`:

```json
"args": ["@playwright/mcp@latest", "--browser", "chromium", "--headless", "--viewport-size", "1440,900"]
```

Then trigger via a Copilot API call or GitHub Actions step that invokes the agent.

## Updating Workflows

Workflow files are plain Markdown — no code required. To add a new QA scenario:

1. Create `qa-workflows/NN-feature-name.md`
2. Describe steps in plain English
3. Include expected outcomes and known bugs to watch for
4. Run it: `Execute qa-workflows/NN-feature-name.md against http://localhost:3000`
