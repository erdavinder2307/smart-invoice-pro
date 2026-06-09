# Workflow: Payments & AR Allocation

## Business Objective

Validate partial and full payments, allocation integrity, payments received reporting, and customer balance updates.

## Preconditions

- At least one **Sent** invoice with outstanding balance
- Routes: invoice detail payment UI; `/reports/payments-received`

## Workflow Steps

### 1. Partial Payment
- Open sent invoice with total > $200
- Record payment 50% of total
- Verify status Partially Paid / Sent with balance
- Track `payment` entity
- Screenshot: partial payment

### 2. Remaining Balance Payment
- Record second payment for remainder
- Verify status **Paid**
- Screenshot: fully paid

### 3. Payments Received Report
- Navigate to `/reports/payments-received`
- Filter date range including test payments
- Verify both payments listed with correct amounts
- Screenshot: payments report

### 4. Overpayment Guard (edge)
- Attempt payment exceeding balance on new sent invoice
- Expect validation error (UI or API)
- Screenshot: overpayment blocked

## Validation Rules

- `payment-validator` for each payment record
- Sum(allocations) = payment amount
- Report totals match sum of payments in period

## Bookkeeping Expectations

- Partial payments reduce outstanding incrementally
- No double-counting on customer balance
- Paid invoice cannot accept payment > $0 without warning

## Screenshots Required

- partial-payment
- final-payment-paid
- payments-received-report

## Success Criteria

- Partial → Paid path correct
- Report figures reconcile with invoice payments

## Test Data

- `payments.json`
