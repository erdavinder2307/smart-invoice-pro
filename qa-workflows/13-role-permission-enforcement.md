# Workflow 13: Role-Based Permission Enforcement

**Risk Level:** 🔴 P0 — Security — Unauthorized Access  
**Estimated Duration:** 60 minutes  
**Prerequisites:** Three user accounts: Admin, Manager, Viewer  

---

## Objective

Verify that the 10-module permission matrix is enforced at both the **UI level** (buttons hidden)
and the **API level** (403 returned). Test the three primary roles: Admin (full access), Manager
(create/edit, no delete/settings), Viewer (read-only).

**Permission modules (from `permissions_api.py`):**
`invoices`, `quotes`, `customers`, `products`, `vendors`, `purchase_orders`, `bills`, `expenses`,
`reports`, `settings`

---

## Setup

1. Log in as Super Admin or Admin
2. Navigate to **Settings → Users** — confirm three test users exist:
   - `admin_tester` — role: Admin
   - `manager_tester` — role: Manager
   - `viewer_tester` — role: Viewer
3. Note which modules each role has access to (Settings → Roles → view role permissions)

---

## Test Cases

### TC-13.1: Viewer Cannot Create an Invoice

**Steps:**
1. Log in as `viewer_tester`
2. Navigate to **Invoices**

**Expected (UI):**
- **+ New Invoice** button is absent or disabled
- Invoice list is visible (read access)

**Expected (API — manual test):**
```bash
curl -X POST http://localhost:5001/api/invoices \
  -H "Authorization: Bearer $VIEWER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Test","line_items":[]}'
```
- Response: HTTP 403 `{"error": "Insufficient permissions"}`

**Screenshot:** `TC-13-1-viewer-no-create-invoice.png`

---

### TC-13.2: Viewer Cannot Delete a Customer

**Steps:**
1. (As Viewer) Navigate to **Customers**
2. Open any customer record

**Expected:**
- No **Delete** button visible
- No **Archive** button visible (or disabled)
- Only view/read access

**Screenshot:** `TC-13-2-viewer-no-delete-customer.png`

---

### TC-13.3: Viewer Cannot Access Settings

**Steps:**
1. (As Viewer) Navigate to `/settings` or look for Settings in sidebar

**Expected:**
- Settings section is NOT visible in sidebar for Viewer role
- Direct URL `/settings` redirects to Dashboard or shows 403/Unauthorized page

**Screenshot:** `TC-13-3-viewer-no-settings.png`

---

### TC-13.4: Manager Can Create an Invoice

**Steps:**
1. Log in as `manager_tester`
2. Navigate to **Invoices** → Click **+ New Invoice**
3. Fill in required fields → Save as Draft

**Expected:**
- Invoice created successfully
- Manager has full CRUD on invoices (assuming standard Manager permissions)

**Screenshot:** `TC-13-4-manager-can-create-invoice.png`

---

### TC-13.5: Manager Cannot Manage Users (Settings Restricted)

**Steps:**
1. (As Manager) Navigate to **Settings → Users** or **Settings → Roles**

**Expected:**
- User management section not visible in Settings sidebar, OR
- Access denied when navigating directly to `/settings/users`

**Screenshot:** `TC-13-5-manager-no-user-management.png`

---

### TC-13.6: Admin Has Full Access

**Steps:**
1. Log in as `admin_tester`
2. Verify all 10 modules are accessible
3. Confirm Settings → Users is accessible
4. Confirm delete actions are visible on Invoices, Customers, Products

**Expected:**
- All modules visible in sidebar
- Create, Edit, Delete, Archive buttons visible across all modules
- Settings → Users, Roles, Permissions all accessible

**Screenshot:** `TC-13-6-admin-full-access.png`

---

### TC-13.7: API Enforces Permissions Independently of UI

**Steps:**
1. Obtain the Viewer's JWT token
2. Attempt all mutation endpoints via curl:

```bash
# Should all return 403
POST /api/invoices
PUT  /api/invoices/<id>
DELETE /api/invoices/<id>
POST /api/customers
DELETE /api/customers/<id>
POST /api/products
DELETE /api/products/<id>
```

**Expected:**
- All return HTTP 403 with error message
- No operation succeeds regardless of direct URL access

**Screenshot:** N/A (terminal output)

---

### TC-13.8: Role Change Takes Effect Immediately

**Steps:**
1. (As Admin) Navigate to Settings → Users → `viewer_tester`
2. Change role from Viewer to Manager
3. Without `viewer_tester` logging out, refresh their session
4. Check if new Manager permissions are applied

**Expected:**
- After role change, next request uses updated role from JWT re-issue
- Note: if roles are embedded in JWT, logout/login may be required — document the behavior

**Screenshot:** `TC-13-8-role-change-effect.png`

---

## Permission Matrix Reference

| Action | Admin | Manager | Viewer |
|--------|-------|---------|--------|
| View all modules | ✅ | ✅ | ✅ |
| Create invoices/quotes | ✅ | ✅ | ❌ |
| Edit invoices/quotes | ✅ | ✅ | ❌ |
| Delete/archive invoices | ✅ | ❓ verify | ❌ |
| Manage customers | ✅ | ✅ | ❌ create/edit |
| Manage products/stock | ✅ | ✅ | ❌ create/edit |
| View reports | ✅ | ✅ | ✅ |
| Export reports | ✅ | ✅ | ❓ verify |
| Access settings | ✅ | ❌ | ❌ |
| Manage users/roles | ✅ | ❌ | ❌ |
| Submit for approval | ✅ | ✅ | ✅ (submit own) |
| Approve / reject | ✅ | ✅ | ❌ |

> ❓ = verify actual behaviour during QA run

---

## Pass / Fail Criteria

| Check | Expected | FAIL Condition |
|-------|----------|----------------|
| Viewer create invoice (UI) | Button absent | Button visible |
| Viewer create invoice (API) | 403 | 200/201 |
| Viewer access settings | Blocked | Settings visible |
| Manager create invoice | 201 success | 403 or error |
| Manager access users | Blocked | Users page visible |
| Admin full access | All visible | Any module blocked |
| API rejects Viewer mutations | 403 all | Any 200/201 |
