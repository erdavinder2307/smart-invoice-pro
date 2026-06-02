# Workflow: Invoice Lifecycle (Quote → Invoice → Payment)

## Scope
Full end-to-end invoice lifecycle: creation, editing, sending, payment recording, and closure.

## Preconditions
- Logged in as a valid tenant user
- At least one customer exists
- At least one product exists

---

## Steps

### 1. Create New Invoice
- Navigate to `/invoices`
- Click **New Invoice** button
- Select customer from dropdown (first available)
- Set invoice date to today
- Set due date to 30 days from today
- Add line item: select first product, quantity 2
- Add second line item: description "Consulting Fee", quantity 1, rate 500.00
- Verify subtotal and GST/tax auto-calculate correctly
- Click **Save as Draft**
- Screenshot: invoice in draft state

### 2. Verify Draft State
- Confirm status badge shows **Draft**
- Confirm invoice number was auto-assigned (format: INV-XXXX)
- Confirm customer name is shown correctly
- Confirm line item totals are arithmetically correct
- Screenshot: invoice detail view

### 3. Edit Invoice
- Click **Edit** button
- Change quantity of first line item from 2 to 3
- Verify total updates automatically
- Save changes
- Screenshot: updated invoice

### 4. Mark as Sent
- Click **Mark as Sent** (or Send)
- Confirm status changes to **Sent**
- Confirm action buttons update (Pay Now should appear; Edit may be restricted)
- Screenshot: sent invoice

### 5. Record Payment
- Click **Record Payment** / **Pay Now**
- Enter payment amount equal to invoice total
- Select payment method: Bank Transfer
- Set payment date to today
- Submit
- Screenshot: payment confirmation dialog/modal

### 6. Verify Paid State
- Confirm status badge changes to **Paid**
- Confirm outstanding balance shows $0.00
- Confirm payment appears in payment history section
- Navigate to `/dashboard` and verify revenue stats updated
- Screenshot: paid invoice; screenshot: dashboard

### 7. Generate PDF
- Return to the paid invoice
- Click **Download PDF** or **Preview PDF**
- Verify PDF loads/downloads without error
- Screenshot: PDF preview (if available in browser)

---

## Expected Outcomes

| Step | Expected Status | Expected Behaviour |
|------|----------------|-------------------|
| After save | Draft | Invoice number assigned |
| After send | Sent | Edit restricted or warned |
| After payment | Paid | Balance = $0.00 |
| PDF download | — | No 404 or error |

## Common Bugs to Watch For
- Total not recalculating when line item changes
- Status badge not updating without page refresh
- Invoice number duplicating
- GST calculation rounding error (off by $0.01)
- PDF download failing for invoices with special characters in customer name
