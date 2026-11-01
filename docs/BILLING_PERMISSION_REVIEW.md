# Billing & Subscription Permission Review
**Solidev Books — Security Audit**
**Reviewed:** 2026-06-25 · **Reviewer:** Security Architect + Principal SaaS Architect

---

## Executive Summary

The Billing & Subscription module was accessible to every authenticated user prior to this
review. This is a critical security gap: any employee, demo user, or low-privilege sales
role could view subscription status, request trial extensions, trigger upgrade flows, and
access billing invoice history.

This document records the vulnerability, the fix applied, and the recommended RBAC model
going forward.

---

## 1. Vulnerability Report

### 1.1 Affected Routes

| Route | Protection Before | Risk |
|---|---|---|
| `GET /settings/billing` | ❌ None | Any authenticated user |
| `GET /settings/billing/upgrade` | ❌ None | Any authenticated user |

**Source evidence:**
```javascript
// routes.js (before fix) — lines 247–250
{/* ── Billing — accessible to all authenticated users ───── */}
<Route path="/settings/billing" element={<Billing />} />
<Route path="/settings/billing/upgrade" element={<BillingUpgrade />} />
```

### 1.2 Affected Navigation

| Nav Item | Permission Before | Risk |
|---|---|---|
| Settings → Billing | ❌ No permission field | Always visible to every role |

**Source evidence:**
```javascript
// navConfig.js (before fix) — line 111
{ id: "billing", label: "Billing", ..., path: "/settings/billing" }
// Missing: permission: { module: 'billing', action: 'view' }
```

### 1.3 Root Cause

The `billing` module was not registered in `PERMISSION_MODULES` in `PermissionContext.js`.
Because it did not exist in the permission system, no permission check could ever be wired
to it. The nav item lacked a `permission` property, and the routes were not wrapped in
`PermissionRoute`.

---

## 2. Fix Applied (2026-06-25)

### 2.1 PermissionContext.js — Register `billing` Module

```javascript
// PERMISSION_MODULES — billing added
billing: ['view', 'manage'],

// MODULE_LABELS — billing added  
billing: 'Billing & Subscription',
```

### 2.2 navConfig.js — Add Permission to Billing Nav Item

```javascript
{
  id: "billing",
  label: "Billing",
  path: "/settings/billing",
  permission: { module: "billing", action: "view" }  // ← Added
}
```

The existing `renderNavItem` logic in `Sidebar.jsx` already checks permissions:
```javascript
if (config.permission && permissionsLoaded && !effectiveIsAdmin &&
    !can(config.permission.module, config.permission.action)) return null;
```

This means admins bypass (existing design) and non-admins must have `billing.view`.

### 2.3 routes.js — Wrap Billing Routes with PermissionRoute

```javascript
// After fix — routes.js
<Route element={<PermissionRoute module="billing" action="view" />}>
  <Route path="/settings/billing" element={<Billing />} />
  <Route path="/settings/billing/upgrade" element={<BillingUpgrade />} />
</Route>
<Route path="/trial-expired" element={<TrialExpired />} />
```

Direct URL access to `/settings/billing` by an unauthorized user now redirects to
`/forbidden` via the existing `PermissionRoute` component.

Note: `/trial-expired` is kept **outside** the PermissionRoute intentionally — it is a
system state page that informs users their subscription has expired, and must remain
accessible even without billing.view permission so they can understand their account status.

---

## 3. Recommended RBAC Model for Billing

### 3.1 Suggested Permission Matrix

| Role | `billing.view` | `billing.manage` | Notes |
|---|:---:|:---:|---|
| Owner | ✅ | ✅ | Full billing control |
| Admin | ✅ | ✅ | Equivalent to owner for billing |
| Finance Admin | ✅ | ✅ | Optional — if this role exists |
| Accountant | ✅ | ❌ | View only — can see invoices but not upgrade |
| Manager | ❌ | ❌ | No billing access |
| Sales | ❌ | ❌ | No billing access |
| Purchase | ❌ | ❌ | No billing access |
| Employee | ❌ | ❌ | No billing access |
| Demo User | ❌ | ❌ | Demo environment must not expose billing |

> **Important:** The backend `/api/subscriptions/current`, `/api/subscriptions/billing-invoices`,
> and `/api/subscriptions/request-extension` endpoints must also enforce this permission
> server-side. Frontend-only protection is insufficient — a determined user with a valid
> JWT can still call the API directly.

### 3.2 Admin Fallback

`PermissionRoute` and the sidebar's `renderNavItem` both already implement an `isAdmin`
bypass (`effectiveIsAdmin = isAdmin || permIsAdmin`). Admins will always have billing
access regardless of explicit permissions. This is the correct behavior.

### 3.3 Trial Extension Granularity (Future)

If trial extension requests should be controlled separately, introduce:

```javascript
billing: ['view', 'manage', 'request_trial_extension'],
```

This allows Accountant-level roles to request extensions without being able to manage
full subscription upgrades.

---

## 4. Backend Verification Checklist

The following backend endpoints should be verified to enforce `billing.view` server-side:

- [ ] `GET /api/subscriptions/current` — require `billing.view` or admin
- [ ] `GET /api/subscriptions/billing-invoices` — require `billing.view` or admin
- [ ] `POST /api/subscriptions/request-extension` — require `billing.view` or admin
- [ ] `GET /api/subscriptions/plans` — require `billing.view` or admin
- [ ] Any `/api/subscriptions/*` endpoint — audit for missing auth checks

Until the backend enforces this, the frontend protection is the only guard. This is
technically a defense-in-depth gap: a user with a valid JWT but no `billing.view` could
craft direct API calls to access billing data.

---

## 5. Demo Environment

Demo users must not have `billing.view` permission. The demo login flow (`authService.demoLogin`)
sets up a demo session, and the backend `is_demo` flag should ensure demo roles never
receive billing permissions.

The `demoSettingsBlockedPrefixes` utility in `utils/demoMode.js` can optionally be extended
to also block `/settings/billing` for demo sessions, providing an additional layer of
defense for the demo environment.

---

## 6. Compliance Notes

Exposing billing and subscription data (plan names, billing history, payment amounts) to
unauthorized roles could constitute a data exposure violation depending on the organization's
internal data classification policy. This fix brings the application into alignment with
the principle of least privilege.

---

## 7. Verification

To verify this fix is working correctly:

1. **As Admin**: Navigate to `/settings/billing` → should render normally.
2. **As Sales role** (without billing.view): Navigate to `/settings/billing` → should
   redirect to `/forbidden`.
3. **As Sales role**: Check sidebar Settings section → Billing item should not appear.
4. **Direct URL test**: Paste `/settings/billing` into address bar while logged in as
   Sales → should redirect to `/forbidden`.
5. **Demo mode**: Log in as demo user → Billing menu item should not appear.

---

## 8. Related Documents

- [ORGANIZATION_CONTEXT_REVIEW.md](./ORGANIZATION_CONTEXT_REVIEW.md)
- [ROADMAP.md](./ROADMAP.md)
- [USER_ROLES_IMPLEMENTATION.md](../USER_ROLES_IMPLEMENTATION.md)
