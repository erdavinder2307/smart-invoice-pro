# Workflow: Vendors (AP Master Data)

## Business Objective

Validate vendor master data for purchase orders, bills, and AP aging accuracy.

## Preconditions

- Logged in as user with purchase permissions
- Test data: `vendors.json`

## Workflow Steps

### 1. Vendor List
- Navigate to `/vendors`
- Screenshot: vendor list

### 2. Create Vendor
- `/vendors/add` — data from `vendors.json`
- Include name, email, ABN/tax id if applicable
- Track `vendor` entity
- Screenshot: vendor created

### 3. Vendor Detail & Edit
- Open vendor detail, verify fields
- Edit payment terms or contact
- Screenshot: vendor updated

### 4. PO / Bill Readiness
- Start `/purchase-orders/add` — vendor appears in dropdown
- Screenshot: vendor on PO form

## Validation Rules

- Vendor name unique per tenant (or warning shown)
- Archived vendor excluded from new POs

## Bookkeeping Expectations

- Vendor outstanding reflects unpaid bills
- Vendor links to AP reports (`/reports/ap-aging`)

## Screenshots Required

- vendors-list
- vendor-create
- vendor-on-po

## Success Criteria

- Vendor available for `08-purchase-orders`

## Test Data

- `vendors.json`
- `vendors.csv`
