// Quick script to check if Firebase env variables are loaded
// Run with: node check-firebase-config.js

require('dotenv').config({ path: '.env.local' });

const requiredKeys = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

console.log('\n🔍 Checking Firebase Configuration...\n');

let allGood = true;

requiredKeys.forEach(key => {
  const value = process.env[key];
  if (value) {
    // Show first/last 4 chars only for security
    const display = value.length > 8 
      ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
      : '****';
    console.log(`✅ ${key}: ${display}`);
  } else {
    console.log(`❌ ${key}: MISSING`);
    allGood = false;
  }
});

console.log('\n');

if (allGood) {
  console.log('✅ All Firebase configuration variables are present!\n');
  console.log('If you\'re still getting errors, check:');
  console.log('1. Firebase Console → Authentication → Sign-in method');
  console.log('   Make sure "Email/Password" is ENABLED');
  console.log('2. Firebase Console → Firestore Database');
  console.log('   Make sure database is created');
  console.log('3. Check browser console for specific error messages\n');
} else {
  console.log('❌ Some Firebase configuration variables are missing!');
  console.log('\nMake sure you have a .env.local file in your project root with:');
  console.log('REACT_APP_FIREBASE_API_KEY=...');
  console.log('REACT_APP_FIREBASE_AUTH_DOMAIN=...');
  console.log('REACT_APP_FIREBASE_PROJECT_ID=...');
  console.log('REACT_APP_FIREBASE_STORAGE_BUCKET=...');
  console.log('REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...');
  console.log('REACT_APP_FIREBASE_APP_ID=...\n');
}

// Check if .env.local exists
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  console.log('📄 .env.local file found');
  console.log('⚠️  Remember to restart your dev server after creating/editing .env.local\n');
} else {
  console.log('❌ .env.local file NOT FOUND');
  console.log('👉 Create this file in your project root with your Firebase config\n');
}

