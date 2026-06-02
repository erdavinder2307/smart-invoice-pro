# Workflow: Customer CRUD & Overview

## Scope
Customer creation, editing, overview page validation, and soft-delete (archive) behaviour.

---

## Steps

### 1. Create Customer
- Navigate to `/customers`
- Click **New Customer** / **Add Customer**
- Fill in:
  - Name: QA Test Customer [timestamp]
  - Email: qa-test@solidevbooks.com
  - Phone: 0400 000 000
  - ABN: 12 345 678 901 (if field exists)
  - Billing address: 1 Test Street, Melbourne VIC 3000
- Save
- Screenshot: new customer record

### 2. Verify Customer List
- Confirm new customer appears in the list
- Confirm search field filters correctly (search by name)
- Screenshot: customer list with search active

### 3. Customer Overview / Detail
- Click into the customer record
- Verify overview tab shows: contact details, invoices count, total billed, outstanding balance
- Verify invoices tab shows invoice history (or empty state if new)
- Screenshot: customer overview

### 4. Edit Customer
- Click **Edit**
- Change phone number to 0411 111 111
- Save
- Verify change is reflected immediately
- Screenshot: updated record

### 5. Create Invoice from Customer Page
- From customer detail, click **New Invoice** (if shortcut exists)
- Verify customer is pre-filled on the invoice form
- Cancel / navigate back (do not save)

### 6. Archive Customer
- Click **Archive** or **Delete** (soft delete)
- Confirm archive dialog appears
- Confirm archive
- Verify customer no longer appears in the default list
- Verify customer appears under **Archived** filter
- Screenshot: archived state

### 7. Restore Customer
- Navigate to Archived filter
- Click **Restore**
- Verify customer reappears in active list
- Screenshot: restored customer in active list

---

## Expected Outcomes
- Customer persists across page refresh
- Archived customer is hidden from default views
- Restored customer is fully functional
- Invoice count on overview updates when invoices are created

## Common Bugs to Watch For
- Duplicate customers created on double-click of Save
- Archive not filtering correctly (customer still shows in active list)
- Customer overview showing wrong totals after invoice payment
- Phone/email validation too strict or too permissive
