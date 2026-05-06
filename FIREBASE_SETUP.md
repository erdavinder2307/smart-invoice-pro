# Firebase Analytics Setup Guide

This document provides step-by-step instructions to configure Firebase Analytics for the Smart Invoice Pro web and mobile applications.

## Prerequisites

- A Google account
- Firebase CLI installed (`npm install -g firebase-tools`)
- Admin access to the Firebase project

## Step 1: Create/Access Firebase Project

### Option A: Create New Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project"
3. Enter project name: **solidevbooks**
4. Follow the setup wizard
5. Select your region (preferably closest to your users)

### Option B: Use Existing Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select the "solidevbooks" project from the list

## Step 2: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon ⚙️)
2. Click the "General" tab
3. Scroll down to "Your apps" section
4. Look for web app (marked with `</>` icon)
   - If not present, click "Add app" → Select "Web" → Register
5. Copy the Firebase config object:
```javascript
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "solidevbooks.firebaseapp.com",
  "projectId": "solidevbooks",
  "storageBucket": "solidevbooks.appspot.com",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
  "appId": "YOUR_APP_ID",
  "measurementId": "YOUR_MEASUREMENT_ID"
}
```

## Step 3: Enable Google Analytics (if not already enabled)

1. In Firebase Console, go to **Project Settings**
2. Look for Google Analytics section
3. If not enabled, click "Link Google Analytics property"
4. Create new property or link existing one
5. Accept terms and enable

## Step 4: Add Configuration to Environment Variables

### Development Environment (`.env`)

```bash
REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=solidevbooks.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=solidevbooks
REACT_APP_FIREBASE_STORAGE_BUCKET=solidevbooks.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
REACT_APP_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
```

### Production Environment (`.env.production`)

```bash
REACT_APP_FIREBASE_API_KEY=YOUR_PROD_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=solidevbooks.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=solidevbooks
REACT_APP_FIREBASE_STORAGE_BUCKET=solidevbooks.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_PROD_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_PROD_APP_ID
REACT_APP_FIREBASE_MEASUREMENT_ID=YOUR_PROD_MEASUREMENT_ID
```

## Step 5: Verify Installation

```bash
cd /Users/davinderpal/Development/invoicing/smart-invoice-pro
npm install  # Already done, but ensures dependencies are installed
npm start    # Start development server
```

Check browser console:
- Should NOT show Firebase initialization errors
- Page views should start appearing in Firebase Analytics (may take 5-10 minutes)

## Step 6: View Analytics Data

1. Go to Firebase Console → **Analytics** tab
2. Select "Realtime" to see live user activity
3. View tracked events:
   - `page_view` — Page navigation tracking
   - `login` — User login events
   - `logout` — User logout events
   - `sign_up` — New user signup
   - `invoice_created` — Invoice creation
   - `payment_recorded` — Payment tracking
   - `exception` — Error tracking

## Automated Event Tracking

The following events are automatically tracked:

| Event | Triggered By | Data Captured |
|-------|--------------|---------------|
| `page_view` | Route change | Page path, title |
| `login` | User login | Username, method |
| `logout` | User logout | Username |
| `sign_up` | User registration | Username |
| `invoice_created` | Invoice creation | Invoice ID, amount, currency |
| `invoice_updated` | Invoice status change | Invoice ID, status |
| `invoice_sent` | Invoice sent to customer | Invoice ID, email |
| `payment_recorded` | Payment entry | Invoice ID, amount, method |
| `customer_created` | New customer added | Customer ID |
| `product_created` | New product added | Product ID, price |
| `exception` | App errors | Error name, message, severity |

## Manual Event Tracking

For custom events, use `analyticsService`:

```javascript
import analyticsService from '../services/analyticsService';

// Track custom event
analyticsService.trackEvent('custom_action', {
  action_type: 'user_interaction',
  section: 'dashboard',
  metadata: 'additional_info'
});

// Or use specific trackers
analyticsService.trackInvoiceCreated('INV-001', 5000, 'INR');
analyticsService.trackPaymentRecorded('INV-001', 5000, 'bank_transfer');
analyticsService.trackReportGenerated('profit_loss');
analyticsService.trackExport('pdf', 'invoice');
```

## Mobile App Integration

For the mobile app (Flutter):

1. Go to Firebase Console → Project Settings
2. Add iOS app:
   - Register iOS app
   - Download `GoogleService-Info.plist`
   - Add to `ios/Runner` directory
   - Follow Firebase iOS integration guide

3. Add Android app:
   - Register Android app
   - Download `google-services.json`
   - Add to `android/app` directory
   - Follow Firebase Android integration guide

4. Install Firebase plugins in `pubspec.yaml`:
```yaml
firebase_core: ^2.25.0
firebase_analytics: ^10.8.0
firebase_messaging: ^14.8.0
```

## Privacy & Data Retention

### GDPR Compliance
- User IP anonymization enabled by default
- Data retention: 2 months default (adjustable in settings)
- Privacy policy: [/privacy](/privacy)

### Settings in Firebase Console
1. Go to **Data Protection** tab
2. Set data retention period (default: 2 months)
3. Enable GDPR compliance features if needed

## Troubleshooting

### Analytics Not Showing Data
- **Wait 5-10 minutes** — Firebase delays data by ~30 seconds to a few minutes
- Check **Realtime** view first (updates instantly)
- Verify `.env` variables are set correctly
- Check browser console for Firebase errors
- Ensure JavaScript is enabled

### Firebase Initialization Error
```
Firebase initialization error: [Error] apiKey not provided
```
**Solution**: Ensure all required `.env` variables are set and app is restarted

### Missing Measurement ID
```
Firebase initialization error: measurementId is required
```
**Solution**: Enable Google Analytics in Firebase project settings

## Testing Analytics Locally

1. Start dev server: `npm start`
2. Open browser DevTools → Console
3. Watch for Firebase events logged
4. Navigate app, create invoices, etc.
5. Go to Firebase Console → **Realtime** tab
6. See events appear in real-time

## Performance Impact

- Firebase SDK: ~50KB gzipped
- Analytics: Minimal overhead (~1-2ms per event)
- No blocking operations
- Events sent asynchronously

## Next Steps

1. ✅ Firebase SDK installed
2. ✅ Analytics service created
3. ✅ Automatic page/auth event tracking configured
4. 🔄 **Get Firebase config from Firebase Console** (YOUR ACTION)
5. 🔄 **Add config to .env files** (YOUR ACTION)
6. 🔄 **Test analytics with `npm start`** (YOUR ACTION)
7. ⏳ Set up Cloud Messaging for push notifications (future)
8. ⏳ Set up Firestore for shared data (future)

---

**Questions?** Check Firebase documentation: https://firebase.google.com/docs/analytics
