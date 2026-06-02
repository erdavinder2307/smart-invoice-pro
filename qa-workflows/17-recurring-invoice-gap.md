# Workflow 17: Recurring Invoice Generation Gap (Bug-Critical-002)

**Risk Level:** 🔴 P1 — Missing Feature / Silent Automation Failure  
**Estimated Duration:** 30 minutes  
**Prerequisites:** Admin access; ability to wait or simulate a next_run_date in the past  

---

## Objective

Validate and document Bug-CRITICAL-002: Active recurring profiles never generate invoices because
there is no cron job, Azure Function, or any other automated process that reads `next_run_date`
and creates invoices.

> **Note:** This workflow is expected to **FAIL** (i.e., invoices are NOT generated). Its purpose
> is to produce a reproducible bug report and confirm the exact gap in the backend.

**Bug location:** No file — the feature simply does not exist.
- `cron_jobs.py`: only contains `check_low_stock()`, nothing for recurring generation
- `azure-functions/`: only contains `LowStockAlert/`
- `recurring_profiles_api.py`: has `calculate_next_run_date()` but no generation trigger

---

## Setup

1. Log in as Admin
2. Navigate to **Recurring Profiles** (or Sales → Recurring Invoices)
3. Create a new recurring profile:
   - Customer: any existing customer
   - Template: 1 line item × $100.00
   - Frequency: Monthly
   - Start date: today's date
   - Auto-send: ON
   - Status: Active
4. Note the profile ID and the `next_run_date` (should be today or a date in the past)

---

## Test Cases

### TC-17.1: Confirm Recurring Profile is Active

**Steps:**
1. Open the recurring profile just created
2. Confirm: Status = **Active**, `next_run_date` = today or past date

**Expected:**
- Profile shows as Active
- `next_run_date` is populated
- `auto_send` is ON

**Screenshot:** `TC-17-1-active-recurring-profile.png`

---

### TC-17.2: Wait and Check — No Invoice Generated

**Steps:**
1. Wait 5–10 minutes (or manually trigger the cron endpoint if accessible)
2. Navigate to **Invoices** and search for invoices from this customer
3. Navigate to **API endpoint:** `GET /api/cron/schedule-info` (if available) to see if any
   recurring generation is scheduled

**Expected (bug confirmed):**
- No new invoice is created for the recurring profile
- `GET /api/cron/schedule-info` shows no recurring generation schedule
- The `next_run_date` on the profile has NOT been updated

**Screenshot:** `TC-17-2-no-invoice-generated.png`

---

### TC-17.3: Manual Cron Trigger Does Not Generate Invoices

**Steps:**
1. Call: `POST /api/cron/check-low-stock` (the only cron endpoint)
2. Check if any recurring invoice generation is triggered

**Expected:**
- `/api/cron/check-low-stock` only runs the stock alert check — nothing else
- No recurring invoice endpoint exists at `/api/cron/generate-recurring`
- Response from `check-low-stock` mentions nothing about recurring invoices

```bash
curl -X POST http://localhost:5001/api/cron/check-low-stock \
  -H "Authorization: Bearer $TOKEN"
# Expected response: {"message": "Low stock check completed"} — no recurring mention
```

**Screenshot:** `TC-17-3-cron-endpoint-no-recurring.png`

---

### TC-17.4: Verify API Has No Recurring Generation Endpoint

**Steps:**
1. Check the full API route map for recurring generation:
   ```bash
   curl http://localhost:5001/api/ping  # Confirm API is running
   curl -H "Authorization: Bearer $TOKEN" http://localhost:5001/api/cron/generate-recurring
   # Expected: 404 Not Found
   ```

**Expected:**
- `GET /api/cron/generate-recurring` → 404
- `POST /api/cron/generate-recurring` → 404
- No endpoint exists to trigger generation

**Screenshot:** `TC-17-4-no-generate-endpoint.png`

---

### TC-17.5: Review Azure Functions for Missing Timer Trigger

**Steps:**
1. Check the Azure portal (or `azure-functions/` folder in codebase)
2. List all deployed Azure Functions

**Expected:**
- Only `LowStockAlert` function exists
- No `GenerateRecurringInvoices` or equivalent function deployed
- Timer trigger for recurring invoices is absent

---

## Bug Report Template (Complete After Running)

```
Bug ID: BUG-CRITICAL-002
Title: Recurring invoice profiles never generate invoices — generation engine missing

Reproduction Steps:
1. Create Active recurring profile with next_run_date = today
2. Wait 10+ minutes or call all /api/cron/* endpoints
3. Check Invoices list for customer

Actual: No invoice generated. next_run_date unchanged. No cron/function exists for generation.
Expected: Invoice auto-generated when next_run_date is reached. next_run_date advanced to next cycle.

Root Cause:
- cron_jobs.py only contains check_low_stock() — no recurring invoice logic
- azure-functions/ only has LowStockAlert/ — no GenerateRecurringInvoices function
- recurring_profiles_api.py stores next_run_date but nothing reads it to act

Impact: Silent failure — all recurring billing profiles are non-functional.
        Users believe automation is running. Revenue may be lost silently.

Required Fix:
1. Add Azure Function: GenerateRecurringInvoices (TimerTrigger, runs daily)
   - Query recurring_profiles WHERE status='Active' AND next_run_date <= today
   - For each: copy template → create Draft invoice → if auto_send: mark Issued + send email
   - Update next_run_date using calculate_next_run_date()
   - Log to audit_logs
2. OR: Add endpoint POST /api/cron/generate-recurring for scheduler-triggered generation

Severity: Critical — Silent failure in a core billing automation feature
```

---

## Pass / Fail Criteria

| Check | Expected | FAIL Condition (Bug Confirmed) |
|-------|----------|-------------------------------|
| Profile is Active | Status = Active | Cannot set Active |
| Invoice generated after next_run_date | New invoice appears | No invoice created ← EXPECTED |
| Cron endpoint mentions recurring | No mention | N/A |
| `/api/cron/generate-recurring` | 404 | 200 (would mean it exists) |
| Azure Functions list | No recurring function | N/A |

> All "FAIL Condition" items are expected to be confirmed — documenting this as a complete bug report.
