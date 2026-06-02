# Workflow 16: Customer Portal

**Risk Level:** 🟠 P1 — Customer-Facing Integrity  
**Estimated Duration:** 35 minutes  
**Prerequisites:** At least one customer with a portal account; at least 2 invoices (one Issued, one Paid)  

---

## Objective

Verify the customer-facing portal: separate login flow (isolated from main app auth), invoice list,
invoice detail view, invoice PDF download, payment link behaviour, and that customers only see their
own invoices (not invoices of other customers).

**Architecture note:** Customer portal uses **separate authentication** — `portal_customers` container,
not the main `users` container. Portal JWT tokens are distinct from business-user tokens.

---

## Setup

1. Log in as Admin
2. Navigate to **Customers** → select an existing customer (e.g., "Acme Corp")
3. Confirm the customer has portal access enabled (customer detail page → Portal Access)
4. Note the customer's portal email and any test password
5. Create 2 invoices for "Acme Corp": one Issued ($150.00), one Paid ($75.00)
6. Create 1 invoice for a DIFFERENT customer (to test isolation)
7. Open a private/incognito browser window for portal testing

---

## Test Cases

### TC-16.1: Customer Portal Login

**Steps:**
1. (Incognito window) Navigate to the customer portal URL (e.g., `/customer-portal/login`)
2. Enter Acme Corp's portal email and password
3. Click **Log In**

**Expected:**
- Successful login — redirected to portal dashboard
- No access to main application UI (sidebar, settings, etc.)
- Portal shows Acme Corp's name and/or company name
- URL stays within `/customer-portal/` namespace

**Screenshot:** `TC-16-1-portal-login.png`

---

### TC-16.2: Portal Shows Only This Customer's Invoices

**Steps:**
1. (Portal) View the invoice list / dashboard

**Expected:**
- 2 invoices visible: INV-xxxx (Issued, $150.00) and INV-yyyy (Paid, $75.00)
- NO invoices from other customers visible
- Each invoice shows: number, date, amount, status, due date

**Screenshot:** `TC-16-2-portal-invoice-list.png`

---

### TC-16.3: Invoice Detail View

**Steps:**
1. Click on the Issued invoice ($150.00)

**Expected:**
- Full invoice detail shown: line items, subtotal, tax, total
- Customer address / invoice date / due date visible
- Company branding (logo, colors from branding settings) applied
- **Pay Now** button visible (if online payments are enabled)
- **Download PDF** button visible

**Screenshot:** `TC-16-3-portal-invoice-detail.png`

---

### TC-16.4: PDF Download

**Steps:**
1. On the portal invoice detail, click **Download PDF**

**Expected:**
- PDF downloads successfully (no error)
- PDF contains invoice header, line items, totals, and company branding
- PDF filename matches invoice number (e.g., `INV-xxxx.pdf`)

**Screenshot:** `TC-16-4-portal-pdf-download.png`

---

### TC-16.5: Customer Cannot Access Admin Routes

**Steps:**
1. (Still in portal session) Try navigating to main app URLs:
   - `/invoices` (main app)
   - `/customers`
   - `/settings`
   - `/api/invoices` (direct API call)

**Expected:**
- Redirected to portal login OR shown 401/403
- Portal JWT is rejected by main app auth middleware
- Customer cannot read other tenants' or customers' data

**Screenshot:** `TC-16-5-portal-access-isolation.png`

---

### TC-16.6: Spending Summary / Dashboard

**Steps:**
1. (Portal) Return to dashboard
2. View spending overview / summary section

**Expected:**
- Total invoiced, total paid, outstanding balance shown for Acme Corp
- Figures match: $75.00 paid, $150.00 outstanding
- Chart (if present) reflects the correct data

**Screenshot:** `TC-16-6-portal-dashboard.png`

---

### TC-16.7: Invalid Login is Rejected

**Steps:**
1. (Incognito) Go to portal login with wrong password
2. Try logging in

**Expected:**
- Error message: "Invalid email or password" (or similar)
- No token issued
- Redirect stays on login page

**Screenshot:** `TC-16-7-portal-invalid-login.png`

---

## Pass / Fail Criteria

| Check | Expected | FAIL Condition |
|-------|----------|----------------|
| Portal login | Successful, redirected | 401 error or main app displayed |
| Invoice list isolation | Only Acme Corp's invoices | Other customers' invoices visible |
| Invoice detail | Full details with branding | Empty or broken layout |
| PDF download | Downloads cleanly | 404 or blank PDF |
| Admin route access | 401/403 blocked | Main app accessible via portal token |
| Spending summary | Matches known values | Wrong totals |
| Invalid login | Error message | Token issued or silent fail |
