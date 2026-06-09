# Workflow: Invoices (AR Documents)

## Business Objective

Validate invoice creation, draft/sent/paid lifecycle, tax calculations, and customer balance impact.

## Preconditions

- Customer + products available
- Optional: `invoice-scenarios.json`

## Workflow Steps

### 1. Create Invoice
- `/invoices/add` — select customer, add 2+ line items
- One from catalog product, one manual line (e.g. Consulting Fee $500)
- Verify GST/tax and subtotal
- Save as Draft
- Track `invoice` entity with id, number, totals
- Screenshot: draft invoice

### 2. Verify Draft State
- Status badge **Draft**
- Invoice number assigned
- `invoice-validator` on API payload if accessible
- Screenshot: draft detail

### 3. Edit & Recalculate
- Edit quantity on first line; confirm total updates
- Save
- Screenshot: edited invoice

### 4. Mark Sent
- Mark as Sent / Send
- Status **Sent**; Pay/Record Payment available
- Screenshot: sent invoice

### 5. Record Payment (full)
- Record payment = invoice total, method Bank Transfer, today
- Screenshot: payment modal

### 6. Verify Paid
- Status **Paid**, balance $0
- Customer outstanding decreased by invoice total
- Dashboard revenue reflects payment (if real-time)
- Screenshot: paid invoice + dashboard snippet

## Validation Rules

- `invoice-validator`: subtotal, tax, total consistency
- `payment-validator`: payment ≤ balance
- `balance-validator`: customer outstanding after payment

## Bookkeeping Expectations

- Draft: no AR recognition (or per org policy — document actual behaviour)
- Sent: AR outstanding increases by invoice total
- Paid: AR cleared; payment linked to invoice

## Screenshots Required

- invoice-draft
- invoice-sent
- invoice-payment
- invoice-paid

## Success Criteria

- Full lifecycle without arithmetic errors
- Status transitions match business rules

## Test Data

- `invoice-scenarios.json`
- `invoice-scenarios.xlsx`
