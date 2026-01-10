# Firebase Setup Guide - Step by Step

## Step 1: Create Firebase Project

1. **Go to Firebase Console:**
   https://console.firebase.google.com/

2. **Click "Add project"**

3. **Enter project name:**
   - Name: `jeopardy-game` (or whatever you prefer)
   - Click "Continue"

4. **Google Analytics (Optional):**
   - You can disable this for now
   - Click "Create project"

5. **Wait for project creation**
   - Takes about 30 seconds
   - Click "Continue" when ready

## Step 2: Register Your Web App

1. **In your Firebase project dashboard:**
   - Click the **web icon** (</>) to add a web app

2. **Register app:**
   - App nickname: `Jeopardy Web App`
   - ✅ Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

3. **Copy the configuration:**
   You'll see something like this - **SAVE THIS!**

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "jeopardy-game.firebaseapp.com",
  projectId: "jeopardy-game",
  storageBucket: "jeopardy-game.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

   **Keep this window open** - we'll need these values!

4. **Click "Continue to console"**

## Step 3: Enable Authentication

1. **In Firebase Console, click "Authentication" in left sidebar**

2. **Click "Get started"**

3. **Click "Email/Password" under Sign-in method**

4. **Enable it:**
   - Toggle "Email/Password" to **Enabled**
   - Click "Save"

5. **(Optional) Add Google Sign-in:**
   - Click "Google"
   - Toggle to Enabled
   - Select your support email
   - Click "Save"

## Step 4: Set Up Firestore Database

1. **Click "Firestore Database" in left sidebar**

2. **Click "Create database"**

3. **Choose production mode:**
   - Select "Start in production mode"
   - Click "Next"

4. **Choose location:**
   - Select closest to your users (e.g., `us-east1` for US East Coast)
   - Click "Enable"

5. **Set up security rules:**
   - Once created, click "Rules" tab
   - Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Missed questions - user-specific
    match /missedQuestions/{questionId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Category overrides - user-specific
    match /categoryOverrides/{overrideId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Excluded questions - user-specific
    match /excludedQuestions/{excludedId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

6. **Click "Publish"**

## Step 5: Create .env File

In your project root, create a `.env.local` file (separate from AWS .env):

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=jeopardy-game.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=jeopardy-game
REACT_APP_FIREBASE_STORAGE_BUCKET=jeopardy-game.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abc123def456

# AWS Polly (keep existing)
REACT_APP_AWS_REGION=us-east-1
REACT_APP_AWS_ACCESS_KEY_ID=your_existing_key
REACT_APP_AWS_SECRET_ACCESS_KEY=your_existing_secret
```

**Replace the Firebase values with YOUR actual values from Step 2!**

---

## You're Ready!

Once you complete these steps, come back and we'll install the Firebase SDK and update your code.

**Checklist:**
- [ ] Firebase project created
- [ ] Web app registered
- [ ] Firebase config saved
- [ ] Email/Password authentication enabled
- [ ] Firestore database created
- [ ] Security rules set
- [ ] `.env.local` file created with your config

Let me know when you're done with these steps!

