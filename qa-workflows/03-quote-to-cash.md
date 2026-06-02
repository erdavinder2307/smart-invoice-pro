# Workflow: Quote-to-Cash Conversion

## Scope
Full sales lifecycle: quote creation → approval → conversion to sales order → conversion to invoice → payment.

---

## Steps

### 1. Create Quote
- Navigate to `/quotes`
- Click **New Quote**
- Select customer
- Add 2 line items with quantities and rates
- Set valid-until date to 30 days from today
- Save as Draft
- Screenshot: quote in draft

### 2. Send Quote
- Mark quote as **Sent**
- Confirm status updates
- Confirm quote number assigned (format: QTE-XXXX)
- Screenshot: sent quote

### 3. Convert Quote to Invoice
- On the sent quote, click **Convert to Invoice**
- Verify a new invoice is created with all line items pre-filled
- Verify customer is pre-filled
- Verify a reference to the source quote is visible on the invoice
- Screenshot: converted invoice showing quote reference

### 4. Verify Quote Status After Conversion
- Navigate back to the quote
- Confirm quote status updated to **Converted** or **Accepted**
- Screenshot: converted quote status

### 5. Complete Invoice Payment
- On the converted invoice, record a full payment
- Verify invoice status becomes **Paid**
- Screenshot: paid invoice

### 6. Verify Quote-to-Cash Audit Trail
- Confirm the full trail is traceable: Quote → Invoice → Payment
- Check the invoice references the source quote number
- Screenshot: audit trail or related documents section

---

## Expected Outcomes
- Quote line items carry over to invoice exactly (no data loss)
- Quote status changes on conversion (cannot convert twice)
- Invoice inherits customer and dates from quote

## Common Bugs to Watch For
- Line item discounts not carrying over to invoice
- Quote can be converted multiple times (creates duplicate invoices)
- Quote status not updating after conversion
- Quote PDF still showing "Draft" after being sent
