# Workflow: Bank Statement Import

## Business Objective

Validate bank account setup, CSV/Excel statement import, transaction staging, and handoff to reconciliation.

## Preconditions

- Banking module enabled
- Sample file: `qa/test-data/bank-statement-sample.csv`
- Routes: `/bank-accounts`, `/bank-import`

## Workflow Steps

### 1. Bank Accounts
- Navigate to `/bank-accounts`
- Create or select test account "QA Operating Account"
- Screenshot: bank accounts

### 2. Import Handoff
- From account, open Import → `/bank-import`
- Verify account prefilled
- Screenshot: import wizard

### 3. Upload Statement
- Upload `bank-statement-sample.csv`
- Map columns if required (date, description, amount)
- Complete import
- Track `bankImports` with transaction count
- Screenshot: import complete

### 4. Transaction Staging
- Verify imported rows visible with correct signs (debit/credit)
- No duplicate import without warning
- Screenshot: imported transactions

## Validation Rules

- Transaction count matches file rows (minus header)
- Dates parse correctly
- Running balance consistent if provided in file

## Bookkeeping Expectations

- Imported txs are **unreconciled** until matched
- No automatic GL posting without explicit rules

## Screenshots Required

- bank-accounts
- import-wizard
- import-complete

## Success Criteria

- Import completes without error
- Ready for `10-reconciliation`

## Test Data

- `bank-statement-sample.csv`
- `bank-statement-sample.xlsx`
