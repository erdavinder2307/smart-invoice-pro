# Workflow: Quotes (Sales Pipeline)

## Business Objective

Validate quote creation, totals/tax, conversion to invoice, and status transitions in the quote-to-cash path.

## Preconditions

- Customer and product from prior workflows (or test data)
- Routes: `/quotes`, `/quotes/add`

## Workflow Steps

### 1. Create Quote
- Navigate to `/quotes/add`
- Select customer from tracked entities or test data
- Add line items from `items.json` (qty × rate)
- Verify subtotal, tax, total auto-calculate
- Save as draft/open per product behaviour
- Track entity `quote`
- Screenshot: quote with line totals

### 2. Verify Quote Arithmetic
- Run `invoice-validator` logic on captured totals vs line items
- Confirm quote number assigned (e.g. QT-XXXX)
- Screenshot: quote detail

### 3. Send / Accept Quote (if applicable)
- Mark quote sent or accepted per UI
- Screenshot: sent quote status

### 4. Convert to Invoice
- Use Convert to Invoice action → `/quotes/convert/:id/:type`
- Verify invoice created with same line quantities and amounts
- Track linked `invoice` entity
- Screenshot: converted invoice

## Validation Rules

- Quote total = sum(line base) + tax
- Converted invoice customer matches quote customer
- Quote status reflects conversion (won/converted)

## Bookkeeping Expectations

- Quote does not affect AR balance until invoiced
- Conversion preserves commercial terms (rates, tax, discounts)
- No duplicate invoice numbers on conversion

## Screenshots Required

- quote-create
- quote-totals
- quote-convert-invoice

## Success Criteria

- Quote → Invoice without manual re-entry of line items
- Totals match within $0.02

## Test Data

- `quote-scenarios.json`
