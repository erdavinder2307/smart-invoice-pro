# Workflow: Archive & Restore Lifecycle

## Scope
Validates archive/restore behaviour across all major document types: Invoices, Quotes, Customers, Products, Vendors.

---

## Archive Rules to Validate
- Archived items must NOT appear in default list views
- Archived items MUST appear when "Archived" filter is active
- Archived items must NOT be selectable in dropdowns (e.g., when creating invoices)
- Restoring must return item to fully operational state

---

## Steps

### 1. Archive an Invoice
- Navigate to `/invoices`
- Select a **Draft** invoice
- Archive it (via action menu or button)
- Verify it disappears from default list
- Apply Archived filter — verify it appears
- Screenshot: archived filter showing the invoice

### 2. Archive an Active Customer
- Navigate to `/customers`
- Archive an existing customer
- Create a new invoice — verify archived customer does NOT appear in customer dropdown
- Screenshot: customer dropdown without archived customer

### 3. Archive a Product
- Navigate to `/products`
- Archive a product
- Create a new invoice line item — verify archived product does NOT appear in product search
- Screenshot: product search without archived product

### 4. Restore Invoice
- Navigate to archived invoices
- Restore the archived draft invoice
- Verify it reappears in the active invoice list
- Verify it is fully editable
- Screenshot: restored invoice in active list

### 5. Restore Customer
- Navigate to archived customers
- Restore the customer
- Verify they appear in the active customer list
- Verify they appear in the customer dropdown when creating an invoice
- Screenshot: customer dropdown with restored customer

### 6. Restore Product
- Restore the archived product
- Verify it appears in product search on invoice form
- Screenshot: product appearing in search

### 7. Bulk Archive (if supported)
- Select multiple items in a list
- Use bulk archive action
- Verify all selected items are archived
- Screenshot: list after bulk archive

---

## Expected Outcomes
- Archive is non-destructive (data preserved, just hidden)
- Archived items filtered from all operational dropdowns
- Restore is immediate and complete
- Bulk operations work consistently

## Common Bugs to Watch For
- Archived customer still appears in invoice dropdown
- Archived invoice still included in dashboard revenue totals
- Restore button missing from archived filter view
- Archiving a customer with outstanding invoices — should warn, not silently proceed
