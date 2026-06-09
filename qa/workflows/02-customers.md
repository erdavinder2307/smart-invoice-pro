# Workflow: Customers (AR Master Data)

## Business Objective

Validate customer lifecycle: create, search, edit, outstanding balance visibility, and archive behavior affecting invoice eligibility.

## Preconditions

- Completed `01-login`
- Test data available: `customers.csv` or `customers.json`

## Workflow Steps

### 1. List Customers
- Navigate to `/customers`
- Verify list loads with search/filter
- Screenshot: customer list

### 2. Create Customer (from test data)
- Load row from `customers.json` or `customers.csv`
- Click New Customer → `/customers/add`
- Enter name, email, phone, billing address from data file
- Save
- Track entity: `customer` with id, name, email
- Screenshot: customer created

### 3. Verify Customer Detail
- Open customer detail `/customers/:id`
- Confirm contact fields match input
- Verify outstanding balance section exists (may be $0)
- Screenshot: customer detail

### 4. Edit Customer
- Change phone or billing address
- Save and confirm persistence
- Screenshot: updated customer

### 5. Archive Customer (if supported)
- Archive customer with no open invoices
- Verify customer hidden from default list
- Verify archived customer excluded from invoice customer dropdown
- Screenshot: archive confirmation

## Validation Rules

- Customer name required; email format validated
- Search returns matching customer by name
- `balance-validator`: reported outstanding matches sum of open invoices

## Bookkeeping Expectations

- New customer available immediately in quote/invoice customer selectors
- Archived customer must not appear on new sales documents
- Customer balance reflects unpaid invoice totals only

## Screenshots Required

- customer-list
- customer-create
- customer-detail
- customer-archive (if tested)

## Success Criteria

- Customer CRUD without API errors
- Created customer reusable in `05-invoices` workflow
- Entity tracked in `qa/evidence/<runId>/entities.json`

## Test Data

- `customers.json`
- `customers.csv`
- `customers.xlsx` (optional Excel import scenarios)
