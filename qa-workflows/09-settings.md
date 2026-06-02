# Workflow: Settings & Organisation Profile

## Scope
Organisation settings, branding, invoice preferences, GST configuration, and user management.

---

## Steps

### 1. Organisation Profile
- Navigate to `/settings` → Organisation Profile
- Verify company name, ABN, address fields are present and editable
- Update phone number — save
- Verify change persists after page refresh
- Screenshot: org profile

### 2. Invoice Preferences
- Navigate to Invoice Preferences settings
- Verify invoice number prefix is configurable
- Change default payment terms to 14 days — save
- Create a new invoice — verify default due date is now +14 days
- Screenshot: invoice preferences; screenshot: new invoice with correct due date

### 3. Branding / Logo
- Navigate to Branding settings
- Upload a test logo image (PNG, <1MB)
- Save
- Generate an invoice PDF — verify logo appears on PDF
- Screenshot: branding page; screenshot: PDF with logo

### 4. GST Configuration
- Navigate to GST / Tax settings
- Verify GST rate is set (default 10% for Australia)
- Verify GST registration number field is present
- Screenshot: GST config

### 5. User Management (if admin role)
- Navigate to `/settings` → Users
- Verify current user appears in user list
- Verify role assignment is visible
- Screenshot: user management

### 6. Notification / Reminder Settings
- Navigate to Reminder settings
- Verify invoice overdue reminder configuration exists
- Screenshot: reminder settings

---

## Expected Outcomes
- All settings persist after page refresh
- Invoice preferences flow through to new document creation
- Branding appears on PDFs
- GST rate affects invoice tax calculations

## Common Bugs to Watch For
- Settings save success toast showing without actual save (API error silently ignored)
- Logo upload silently failing for certain file types
- Invoice number prefix change not applying to next auto-generated number
- User with Viewer role able to access settings page (authorization bypass)
