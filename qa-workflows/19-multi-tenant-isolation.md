# Workflow 19: Multi-Tenant Data Isolation

**Risk Level:** 🔴 P1 — Data Security  
**Estimated Duration:** 40 minutes  
**Prerequisites:** Two separate tenant accounts (Tenant A and Tenant B); each with their own users  

---

## Objective

Verify that the `tenant_id` isolation enforced by the auth middleware prevents any cross-tenant
data access. Tenant A's invoices, customers, products, and settings must be completely invisible
and inaccessible to Tenant B — both via the UI and directly via the API.

**Architecture note:** Auth middleware sets `request.tenant_id` from the JWT payload on every
request. All Cosmos DB queries append `AND c.tenant_id = '<tenant_id>'`.

---

## Setup

1. Tenant A: log in with Tenant A admin credentials; create:
   - 1 Customer: "Acme Corp (Tenant A)"
   - 1 Invoice for $500.00 (Issued)
   - Note the invoice ID: `INV-A-001`

2. Tenant B: log in with Tenant B admin credentials (separate browser/incognito) — verify no data

3. Obtain both JWTs for direct API testing:
   ```bash
   # Generate Tenant A token
   TOKEN_A=$(python3 -c "import jwt, time; ...")
   
   # Generate Tenant B token
   TOKEN_B=$(python3 -c "import jwt, time; ...")
   ```

---

## Test Cases

### TC-19.1: Tenant B Cannot See Tenant A's Invoices via UI

**Steps:**
1. Log in as Tenant B user
2. Navigate to **Invoices**

**Expected:**
- Invoice list is empty (or shows only Tenant B's own invoices)
- "Acme Corp (Tenant A)" invoice NOT visible
- No mention of Tenant A data anywhere

**Screenshot:** `TC-19-1-tenant-b-empty-invoices.png`

---

### TC-19.2: Tenant B Cannot Read Tenant A's Invoice via API

**Steps:**
1. Note the exact Cosmos DB ID of Tenant A's invoice (`INV-A-001`)
2. Use Tenant B's JWT to query:
   ```bash
   curl -H "Authorization: Bearer $TOKEN_B" \
     http://localhost:5001/api/invoices/INV-A-001
   ```

**Expected:**
- HTTP 404 (invoice not found for Tenant B's context)
- NOT 200 with Tenant A's invoice data
- NOT 403 revealing the invoice exists

**Screenshot:** N/A (terminal output)

---

### TC-19.3: Tenant B Cannot List Tenant A's Customers

**Steps:**
1. (As Tenant B) Navigate to **Customers**
2. Via API:
   ```bash
   curl -H "Authorization: Bearer $TOKEN_B" \
     http://localhost:5001/api/customers
   ```

**Expected:**
- UI: Only Tenant B's customers shown (empty if none exist)
- API: Returns `[]` or Tenant B's own customers only
- "Acme Corp (Tenant A)" NOT in list

**Screenshot:** `TC-19-3-tenant-b-customers.png`

---

### TC-19.4: Tenant B Cannot Modify Tenant A's Invoice

**Steps:**
1. Using Tenant B's JWT, attempt to update Tenant A's invoice:
   ```bash
   curl -X PUT \
     -H "Authorization: Bearer $TOKEN_B" \
     -H "Content-Type: application/json" \
     -d '{"notes": "HACKED"}' \
     http://localhost:5001/api/invoices/INV-A-001
   ```

**Expected:**
- HTTP 404 (resource not found for Tenant B)
- Tenant A's invoice is unchanged
- No audit log entry for this attempted modification

**Screenshot:** N/A (terminal output)

---

### TC-19.5: Tenant B Cannot Delete Tenant A's Data

**Steps:**
1. Using Tenant B's JWT, attempt to delete:
   ```bash
   curl -X DELETE \
     -H "Authorization: Bearer $TOKEN_B" \
     http://localhost:5001/api/invoices/INV-A-001
   ```

**Expected:**
- HTTP 404 — resource not found for Tenant B
- Invoice still exists when accessed with Tenant A's JWT

**Screenshot:** N/A (terminal output)

---

### TC-19.6: Tenant B Cannot Access Tenant A's Settings

**Steps:**
1. (As Tenant B) Navigate to Settings → Organization Profile
2. Via API:
   ```bash
   curl -H "Authorization: Bearer $TOKEN_B" \
     http://localhost:5001/api/settings/organization-profile
   ```

**Expected:**
- API returns Tenant B's own settings (empty/default if not set)
- NOT Tenant A's organization name, logo, or GST number

**Screenshot:** `TC-19-6-tenant-b-settings.png`

---

### TC-19.7: Tenant A Data Confirmed Unchanged After Tenant B Attempts

**Steps:**
1. After all Tenant B attempts above, log in as Tenant A
2. Open invoice `INV-A-001`
3. Check: notes, status, amount_paid, all fields

**Expected:**
- Invoice is completely unchanged
- No "HACKED" note or any modification
- `updated_at` timestamp unchanged
- Audit log shows NO entries from Tenant B's user

**Screenshot:** `TC-19-7-tenant-a-data-intact.png`

---

### TC-19.8: JWT Manipulation Does Not Grant Cross-Tenant Access

**Steps:**
1. Decode Tenant B's JWT (base64 decode the payload)
2. Identify `tenant_id` field
3. Create a modified token with Tenant A's `tenant_id` but Tenant B's secret — this will have
   an invalid signature and should be rejected

```bash
# This MUST fail at the API layer
curl -H "Authorization: Bearer $FORGED_TOKEN" \
  http://localhost:5001/api/invoices
```

**Expected:**
- HTTP 401 (invalid token signature)
- The auth middleware correctly rejects tokens with invalid signatures

**Screenshot:** N/A (terminal output)

---

## Pass / Fail Criteria

| Check | Expected | FAIL Condition |
|-------|----------|----------------|
| Tenant B UI invoice list | Empty / own invoices only | Tenant A's invoices visible |
| Tenant B GET /api/invoices/<tenant-a-id> | 404 | 200 with invoice data |
| Tenant B PUT on Tenant A invoice | 404 | 200 or 204 (data modified) |
| Tenant B DELETE on Tenant A invoice | 404 | 200 or 204 |
| Tenant A data after Tenant B attempts | Unchanged | Any field modified |
| Forged JWT with wrong signature | 401 | 200 (auth bypass) |

> **If any FAIL condition is observed:** This is a Critical security vulnerability. Stop testing
> immediately, document the exact reproduction steps, and escalate to the development team.
