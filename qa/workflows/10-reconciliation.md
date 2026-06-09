# Workflow: Bank Reconciliation (Foundation)

## Business Objective

Prepare and validate reconciliation readiness: matching bank lines to invoices/payments, unmatch behaviour, and reconciliation status reporting.

## Preconditions

- Completed `09-bank-imports`
- At least one bank transaction and one book transaction (payment or expense)
- Route: `/bank-reconciliation`

## Workflow Steps

### 1. Open Reconciliation
- Navigate to `/bank-reconciliation`
- Select QA bank account
- Screenshot: reconciliation workspace

### 2. Match Transaction
- Match imported bank line to recorded payment or invoice receipt
- Verify matched pair shows equal amounts
- Run `reconciliation-validator` on pair
- Screenshot: matched transaction

### 3. Unmatch
- Unmatch previously matched pair
- Verify returns to unmatched state
- Screenshot: unmatched

### 4. Reconciliation Summary
- Verify unmatched count decreases after match
- Verify matched items excluded from action queue
- Screenshot: reconciliation summary

## Validation Rules

- `reconciliation-validator`: bank amount = book amount on match
- Cannot match same bank line twice

## Bookkeeping Expectations

- Matched = reconciled for period close readiness
- Unmatched items appear on exception report
- AI-assisted matching (future) must not auto-post without review

## Screenshots Required

- reconciliation-home
- transaction-matched
- transaction-unmatched
- reconciliation-summary

## Success Criteria

- Match/unmatch cycle works
- Architecture ready for AI-assisted bookkeeping validation

## Future Roadmap

- OFX/QIF import formats
- Bulk auto-match rules
- Period lock after reconciliation
