# 🐛 Troubleshooting "Failed to create account" Error

## ✅ Configuration Check Passed

Your `.env.local` file is set up correctly with all Firebase credentials!

---

## 🔍 Most Likely Issue: Email/Password Not Enabled

The error "Failed to create account" usually means **Email/Password authentication is not enabled** in Firebase.

### Fix This Now:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **Authentication** in left sidebar
4. Click the **Sign-in method** tab
5. Find **Email/Password** in the list
6. Click on it
7. **Enable** the toggle switch
8. Click **Save**

**Screenshot location in Firebase Console:**
```
🏠 Project Overview
├── 🔐 Authentication  ← Click here
    ├── Users
    ├── Sign-in method  ← Click this tab
        ├── Email/Password  ← Enable this
        ├── Google
        └── ...
```

---

## 🔍 Other Possible Issues

### Issue 2: Firestore Database Not Created

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **Firestore Database** in left sidebar
4. If you see "Create database", click it
5. Choose **Start in production mode**
6. Select a location (closest to you)
7. Click **Enable**

### Issue 3: Wrong Security Rules

After creating Firestore, set up the security rules:

1. In Firestore Database, click the **Rules** tab
2. Replace with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /missedQuestions/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /categoryOverrides/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /excludedQuestions/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Click **Publish**

### Issue 4: Browser Console Error

Open the browser console (F12 or Cmd+Option+J) and look for the actual error. Common ones:

- `auth/operation-not-allowed` → Email/Password not enabled (see Issue 1)
- `auth/invalid-api-key` → Wrong API key in `.env.local`
- `auth/configuration-not-found` → Project ID wrong in `.env.local`
- Network errors → Check internet connection

---

## 🔄 After Fixing

1. **Restart your dev server** (Ctrl+C and `npm start`)
2. Hard refresh the browser (Cmd+Shift+R or Ctrl+Shift+R)
3. Try signing up again

---

## 🆘 Still Not Working?

Check the **browser console** (F12) for the exact error message. Look for lines that say:

```
Signup error: FirebaseError: ...
```

The error code after `FirebaseError:` will tell us exactly what's wrong!

**Common error codes and fixes:**

| Error Code | Fix |
|------------|-----|
| `auth/operation-not-allowed` | Enable Email/Password in Authentication |
| `auth/invalid-api-key` | Check `REACT_APP_FIREBASE_API_KEY` in `.env.local` |
| `auth/network-request-failed` | Check internet connection |
| `auth/too-many-requests` | Wait a few minutes, Firebase rate limit hit |
| `auth/email-already-in-use` | That email is already registered, try logging in |

---

## ✅ Quick Checklist

- [ ] Email/Password enabled in Firebase Console → Authentication → Sign-in method
- [ ] Firestore Database created in Firebase Console
- [ ] Security rules published in Firestore
- [ ] Dev server restarted after creating `.env.local`
- [ ] Browser hard-refreshed

Once you enable Email/Password authentication, it should work! 🎉

