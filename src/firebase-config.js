// Firebase Configuration and Initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validate Firebase configuration
const validateConfig = () => {
  const requiredKeys = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID'
  ];

  const missing = requiredKeys.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('Missing Firebase configuration variables:', missing);
    console.error('Please check your .env.local file');
    return false;
  }

  return true;
};

// Initialize Firebase
let app;
let auth;
let db;

try {
  if (validateConfig()) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  } else {
    console.error('Firebase configuration incomplete. App will run in offline mode.');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export { app, auth, db };
export default app;

