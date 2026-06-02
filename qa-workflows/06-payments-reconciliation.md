# Workflow: Payment Recording & Reconciliation

## Scope
Payment workflows including partial payments, overpayments, bank reconciliation matching, and payment history.

---

## Steps

### 1. Full Payment on Invoice
- Create a new invoice (total ~$500.00)
- Mark as Sent
- Click **Record Payment**
- Enter full amount: $500.00
- Method: Bank Transfer
- Submit
- Verify status → **Paid**, balance → $0.00
- Screenshot: fully paid invoice

### 2. Partial Payment
- Create a second invoice (total ~$1,000.00)
- Mark as Sent
- Record partial payment: $300.00
- Verify status → **Partial** or **Partially Paid**
- Verify outstanding balance shows $700.00
- Screenshot: partially paid invoice with balance

### 3. Second Partial Payment (Completing Balance)
- Record another payment of $700.00 on the same invoice
- Verify status → **Paid**, balance → $0.00
- Screenshot: fully paid after two partial payments

### 4. Payment History
- On a paid invoice, locate the Payment History section
- Verify both partial payments appear with correct amounts and dates
- Screenshot: payment history showing two entries

### 5. Bank Reconciliation (if feature exists)
- Navigate to `/reconciliation`
- Check if bank transactions are shown (or can be uploaded)
- Match a transaction to a recorded payment
- Verify reconciled status updates
- Screenshot: reconciliation screen

### 6. Payments Received Report
- Navigate to `/reports` → Payments Received
- Set date range to current month
- Verify the payments recorded in steps 1-3 appear
- Verify totals are accurate
- Screenshot: payments received report

### 7. Overpayment Handling (Edge Case)
- On a $200 invoice, attempt to record $250 payment
- Verify the system either:
  a) Warns about overpayment, or
  b) Records credit balance
- Screenshot: overpayment handling behaviour

---

## Expected Outcomes
- Partial payments update outstanding balance correctly
- Payment history is complete and accurate
- Reports include all recorded payments within the date range

## Common Bugs to Watch For
- Balance not updating after partial payment (shows $0 immediately)
- Two users recording payment simultaneously creates negative balance
- Reconciliation matching clearing the wrong invoice
- Date timezone issues causing payments to appear on wrong day
