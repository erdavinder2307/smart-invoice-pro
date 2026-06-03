# QA Test Data

Reusable datasets for workflow-driven QA. Load via:

```bash
npm run qa:data -- customers.json
```

## Files

| File | Format | Used by |
|------|--------|---------|
| `customers.json` / `.csv` | JSON, CSV | `02-customers` |
| `items.json` | JSON | `03-items` |
| `invoice-scenarios.json` | JSON | `05-invoices`, `11-invoice-lifecycle-full` |
| `payments.json` | JSON | `06-payments` |
| `vendors.json` | JSON | `07-vendors` |
| `bank-statement-sample.csv` | CSV | `09-bank-imports` |
| `*.xlsx` | Excel | Same schemas (generate with `npm run qa:seed-excel`) |

## Entity tracking

Created records are stored in `qa/evidence/<runId>/entities.json` during execution.
