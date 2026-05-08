import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { getMessaging, onMessage } from 'firebase/messaging';

/**
 * Firebase Configuration
 * Get these values from Firebase Console: Project Settings > General
 * 
 * Steps to configure:
 * 1. Go to https://console.firebase.google.com
 * 2. Select project "solidevbooks"
 * 3. Go to Project Settings (gear icon)
 * 4. Copy the config object
 * 5. Fill in the environment variables in .env file
 */

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app;
let analytics;
let messaging;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Analytics only if measurement ID is provided
  if (process.env.REACT_APP_FIREBASE_MEASUREMENT_ID) {
    analytics = getAnalytics(app);
  }
  
  // Initialize Cloud Messaging for push notifications
  if ('serviceWorker' in navigator) {
    try {
      messaging = getMessaging(app);
      
      // Handle foreground messages
      onMessage(messaging, (payload) => {
        console.log('Foreground message received: ', payload);
        // Handle notification in foreground if needed
      });
    } catch (error) {
      console.warn('Messaging initialization skipped:', error.message);
    }
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { app, analytics, messaging };
export { logEvent };
