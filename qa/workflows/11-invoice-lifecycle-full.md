# Workflow: Full Invoice Lifecycle (Customer → Paid)

## Business Objective

End-to-end AR cycle: create customer, add taxed line items, draft → send → pay → verify balances, linked transactions, and PDF.

## Preconditions

- Clean run or dedicated QA tenant
- Test data: `invoice-scenarios.json` scenario `full-lifecycle`

## Workflow Steps

### 1. Customer Setup
- Create customer from scenario or reuse tracked customer
- Navigate `/customers` — confirm $0 outstanding
- Screenshot: customer-before-invoice

### 2. Create Invoice with Tax
- `/invoices/add` — select customer
- Line 1: catalog product qty 2 (note unit price & tax %)
- Line 2: "Consulting Fee" qty 1 rate 500.00, tax per org settings
- Verify: subtotal, CGST/SGST or GST total, grand total
- **Save as Draft**
- Record expected totals for validator
- Screenshot: invoice-draft-totals

### 3. Validate Draft Bookkeeping
- API or UI: capture `subtotal`, `total_tax`, `total_amount`
- Run: `npm run qa:validate -- invoice /path/to/captured.json`
- Confirm status **Draft**
- Screenshot: draft-status-badge

### 4. Edit & Recalculate
- Edit line 1 qty 2 → 3
- Verify total increased by (1 × unit price + tax)
- Save
- Screenshot: invoice-edited

### 5. Send Invoice
- Mark as Sent
- Customer outstanding increases by invoice total
- `balance-validator` on customer
- Screenshot: invoice-sent

### 6. Record Payment
- Payment amount = exact invoice total
- Method: Bank Transfer, date today
- Screenshot: payment-recorded

### 7. Verify Paid & Links
- Status **Paid**, balance $0
- Payment history shows allocation to this invoice
- Customer outstanding restored/reduced correctly
- Linked transactions visible on invoice detail
- Screenshot: invoice-paid-links

### 8. Dashboard & PDF
- `/dashboard` — revenue/paid metrics consistent
- Download/preview PDF — no 404
- Screenshot: dashboard + pdf

## Validation Rules

- `invoice-validator` at draft, sent, paid states
- `payment-validator` on payment record
- `balance-validator` before and after payment
- Status transitions: Draft → Sent → Paid only (no skip)

## Bookkeeping Expectations

| State | AR Outstanding | Cash |
|-------|----------------|------|
| Draft | No change (document actual) | — |
| Sent | +invoice total | — |
| Paid | Cleared | +payment (via bank recon later) |

- Tax amounts consistent with line tax rates
- Inventory qty reduced if goods invoiced (if configured on send)

## Screenshots Required

- customer-before
- draft-totals
- sent-outstanding
- payment
- paid-links
- dashboard-pdf

## Success Criteria

- All validators pass
- Customer balance $0 open AR for this invoice
- PDF generates

## Test Data

- `invoice-scenarios.json` → `full-lifecycle`
- `invoice-scenarios.xlsx`
