# Organization Context Review
**Solidev Books — Enterprise Architecture Assessment**
**Reviewed:** 2026-06-25 · **Reviewer:** Principal SaaS Architect

---

## Executive Summary

Solidev Books has a solid multi-context provider tree but lacks a dedicated first-class
Organization Context. Organization data is currently fragmented across four providers.
The application does not surface the current organization visibly enough for enterprise users
who may eventually operate across multiple tenants.

This review documents the current state, identifies gaps, and prescribes the recommended
architecture for full enterprise multi-tenant readiness.

---

## 1. Current Implementation

### 1.1 Provider Tree (as of 2026-06-25)

```
AuthProvider
  └── BrandingProvider
        └── SidebarProvider
              └── MeProvider
                    └── InvoicePreferencesProvider
                          └── OrgGstProvider
                                └── PermissionProvider
                                      └── SubscriptionProvider
                                            └── NotificationProvider
                                                  └── KeyboardShortcutsProvider
                                                        └── DashboardFilterProvider
                                                              └── App
```

### 1.2 Where Organization Data Lives

| Data Point | Provider | API Endpoint | Availability |
|---|---|---|---|
| Organization name | `MeContext` | `/api/me` | `me.organization_name` |
| Organization logo URL | `BrandingContext` | `/api/settings/branding` | `branding.logo_url` |
| GST mode, GSTIN, seller state | `OrgGstContext` | `/api/settings/gst-config` | Separate fetch |
| Subscription plan / trial status | `SubscriptionContext` | `/api/subscriptions/current` | `subscription`, `plan` |
| Tenant ID | Not exposed to frontend | Backend JWT claim only | Not accessible |
| Organization ID | Not exposed to frontend | Backend JWT claim only | Not accessible |

### 1.3 Authentication Model

- `AuthContext` stores the user object from `localStorage.getItem('user')`.
- The user object contains: `id`, `username`, `role`, `name`, `email`, `display_name`.
- **No `organization_id` or `tenant_id` is exposed to the React layer.**
- The backend enforces tenant isolation via JWT claims on every API call.

### 1.4 RBAC Model

- `PermissionContext` fetches `/api/settings/permissions` → `{ is_admin, permissions: { module: { action: bool } } }`
- `PermissionRoute` wraps routes — admins bypass, non-admins are checked against `permissions`
- `renderNavItem` / `renderExpandableSection` in `Sidebar.jsx` filter nav items by permission

### 1.5 Sidebar — Before This Review

The sidebar user card showed:
- User avatar (initials)
- User display name

**No org name, no role badge, no subscription status.**

### 1.6 Header — Before This Review

`TopUtilityBar.jsx` reads `me.organization_name` (line 82) and exposes it only inside the
user dropdown popover. The top bar itself showed no organization identity.

---

## 2. Missing Pieces

### 2.1 No Dedicated OrgContext

There is no `OrgContext` provider. Org data is split:
- Name → `MeContext`
- Branding / Logo → `BrandingContext`
- GST registration → `OrgGstContext`
- Subscription → `SubscriptionContext`

This is acceptable for a single-org product but will require refactoring for true
multi-org support (see Section 5).

### 2.2 Organization ID Not Exposed

The frontend has no access to `organization_id` or `tenant_id`. These are JWT claims
validated server-side. For the current single-org model this is fine. For org switching,
the frontend will need a scoped token or an explicit org ID in the API session response.

### 2.3 No Multi-Org Support

The codebase is single-tenant at the frontend layer. The `TopUtilityBar` and `Sidebar`
both have "Switch Organisation — Coming Soon" stubs, indicating deliberate future intent.
The backend may already be multi-tenant aware (Cosmos DB with tenant partitioning), but
the frontend session model is entirely single-org.

---

## 3. UX Gaps (Before This Review)

| Gap | Impact | Resolution |
|---|---|---|
| No org name in sidebar | Users cannot confirm which org they're in | ✅ Fixed — org card added to sidebar |
| No role badge in sidebar | Role only visible in top-bar dropdown | ✅ Fixed — `SidebarRoleChip` added |
| No subscription status in sidebar | Trial countdown only in top banner | ✅ Fixed — trial days in org card |
| No org name in header bar | Must open dropdown to see org | ✅ Fixed — org pill added to header |
| Org switcher not accessible | No discoverable entry point | ✅ Fixed — stub popover on org card click |

---

## 4. Security Risks (Before This Review)

| Risk | Severity | Location | Resolution |
|---|---|---|---|
| `/settings/billing` unprotected | 🔴 High | `routes.js:248` | ✅ Fixed — PermissionRoute added |
| `/settings/billing/upgrade` unprotected | 🔴 High | `routes.js:249` | ✅ Fixed — PermissionRoute added |
| Billing nav item has no permission | 🔴 High | `navConfig.js:111` | ✅ Fixed — `billing.view` added |
| `billing` module missing from PERMISSION_MODULES | 🔴 High | `PermissionContext.js` | ✅ Fixed — module registered |
| No backend permission check for billing (assumption) | 🟡 Medium | Backend API | Requires backend verification |

---

## 5. Recommended Architecture for Multi-Org

When multi-org support is introduced, the following changes should be made:

### 5.1 Introduce a Dedicated OrgContext

```javascript
// src/context/OrgContext.js
// Fetches /api/organizations/current
// Exposes: org_id, org_name, org_logo_url, plan, subscription, gstin
// Updates on org switch
```

### 5.2 Session Token Scoped to Org

The login response should include the active `org_id`. The JWT should contain this claim.
On org switch, either:
- Re-issue a scoped token for the selected org, **or**
- Pass `X-Org-ID` on every API request after switching

### 5.3 MeContext Depends on OrgContext

```
AuthProvider → OrgContext → MeContext → PermissionProvider → ...
```

### 5.4 Org Switching Flow

```
1. User clicks org card in sidebar
2. OrgSwitcherPopover opens — lists all orgs from /api/organizations
3. User selects org
4. App calls /api/auth/switch-org → receives new scoped token
5. All providers refresh (MeContext, PermissionContext, SubscriptionContext)
6. User lands on /dashboard of selected org
```

### 5.5 Prevent Cross-Tenant Leakage

- Every API endpoint must validate `tenant_id` from JWT against the resource's `tenant_id`
- Frontend providers should clear and refetch all org-scoped data on org switch
- Route guards should prevent navigation to org-scoped URLs without a valid org session

---

## 6. Multi-Tenant Readiness Assessment

| Dimension | Current State | Gap | Priority |
|---|---|---|---|
| Backend tenant isolation | Strong (Cosmos DB partition per tenant) | None — already implemented | — |
| Frontend org identity | Weak — org name only in `me` response | Need dedicated OrgContext | Phase 5 |
| Session model | Single-org JWT | Need org-scoped token or header | Phase 5 |
| Org switching UI | "Coming Soon" stub | Need full switcher + API | Phase 5 |
| Permission refresh on switch | Not implemented | Must clear + refetch on switch | Phase 5 |
| Cross-tenant URL guard | Not implemented | Frontend can craft cross-org URLs | Phase 5 |

---

## 7. Implemented Changes (2026-06-25)

The following changes were implemented as part of this review:

### Sidebar
- Added `SidebarRoleChip` component with role-aware colour coding
- Replaced minimal user card with a two-section org context card:
  - **Org card**: org logo/icon, org name, plan name, trial countdown
  - **User row**: user avatar, display name, role chip
- Clicking org card opens "Coming Soon" org switcher popover (Phase 5 readiness)
- Collapsed sidebar gracefully shows avatar only

### Header (TopUtilityBar)
- Added compact org name pill to the right section (md+ screens only)
- Hidden on mobile to preserve header space
- Shows building icon + org name with tooltip "Current Organisation"

### Imports
- `Sidebar.jsx` now imports `useSubscription` and `useBranding` (already in provider tree)
- No new providers introduced — extends existing data flow

---

## 8. Related Documents

- [BILLING_PERMISSION_REVIEW.md](./BILLING_PERMISSION_REVIEW.md)
- [ROADMAP.md](./ROADMAP.md)
- [USER_ROLES_IMPLEMENTATION.md](../USER_ROLES_IMPLEMENTATION.md)
