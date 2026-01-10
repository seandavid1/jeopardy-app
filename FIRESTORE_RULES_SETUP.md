# Firestore Security Rules Deployment Guide

## Problem

If you're seeing errors like:
- "Failed to archive question"
- "Permission denied"
- "Missing or insufficient permissions"

This means your Firestore security rules need to be updated to allow the `archivedMissedQuestions` collection.

## Solution

You need to deploy the updated Firestore security rules to your Firebase project.

### Option 1: Firebase Console (Easiest)

1. **Go to Firebase Console**
   - Visit https://console.firebase.google.com
   - Select your project

2. **Navigate to Firestore Rules**
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab at the top

3. **Copy and Paste Rules**
   - Open the `firestore.rules` file in this project
   - Copy all the contents
   - Paste into the Firebase Console rules editor
   - **IMPORTANT**: Make sure you replace ALL existing rules

4. **Publish Rules**
   - Click the "Publish" button
   - Wait for confirmation message
   - Rules are now live!

5. **Test**
   - Refresh your Jeopardy app
   - Try archiving a missed question
   - Should work now!

### Option 2: Firebase CLI (For Developers)

If you have Firebase CLI installed:

```bash
# 1. Make sure you're logged in
firebase login

# 2. Initialize Firebase in your project (if not already done)
firebase init firestore
# Select your project when prompted
# Use existing firestore.rules file

# 3. Deploy the rules
firebase deploy --only firestore:rules

# 4. Confirm deployment
# You should see: "✔  firestore: rules file firestore.rules compiled successfully"
```

### Option 3: Manual Copy from Console

If the file upload doesn't work:

1. Go to Firebase Console → Firestore Database → Rules
2. Click "Edit rules"
3. Delete all existing rules
4. Copy this text and paste it:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    match /missedQuestions/{questionId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    match /archivedMissedQuestions/{archiveId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    match /categoryOverrides/{overrideId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    match /excludedQuestions/{excludedId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    match /userPreferences/{userId} {
      allow read: if isAuthenticated() && userId == request.auth.uid;
      allow write: if isAuthenticated() && userId == request.auth.uid;
    }
    
    match /scoreboards/{scoreId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

5. Click "Publish"

## What These Rules Do

The new rules add support for the `archivedMissedQuestions` collection:

```javascript
match /archivedMissedQuestions/{archiveId} {
  // Users can read their own archived questions
  allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
  
  // Users can create their own archived questions
  allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
  
  // Users can delete their own archived questions (for unarchiving)
  allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
}
```

**Key Points:**
- ✅ Users can only access their own archived questions
- ✅ Authentication is required for all operations
- ✅ Each user's data is isolated (userId check)
- ✅ Create and delete operations are allowed (for archive/unarchive)
- ❌ No update operation (archives are immutable - just create/delete)

## Verification

After deploying the rules:

1. **Check Rules Status**
   - Go to Firebase Console → Firestore Database → Rules
   - You should see your new rules with a timestamp

2. **Test in App**
   - Open your Jeopardy app
   - Go to Missed Questions
   - Try archiving a question
   - Should work without errors!

3. **Check Browser Console**
   - Open Developer Tools (F12)
   - Go to Console tab
   - You should see:
     ```
     archiveMissedQuestion called with: [question-id]
     User ID: [your-user-id]
     Attempting to add document to Firestore...
     Missed question archived successfully. Document ID: [doc-id]
     ```

## Troubleshooting

### Still Getting Permission Denied?

1. **Check Authentication**
   - Are you logged in?
   - Check: `firebase.auth().currentUser` in browser console
   - Should return a user object

2. **Check Rules Deployment**
   - Firebase Console → Firestore → Rules tab
   - Verify the `archivedMissedQuestions` section exists
   - Check the timestamp to confirm rules were updated

3. **Clear Cache**
   - Refresh your browser with Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely

4. **Wait a Moment**
   - Rules deployment can take 30-60 seconds to propagate
   - Wait a minute and try again

### Rules Not Saving?

- Make sure you clicked "Publish" (not just "Cancel")
- Check for syntax errors (red underlines in editor)
- Try copying the rules again

### Can't Access Firebase Console?

- Make sure you have Owner or Editor permissions on the Firebase project
- Contact the project owner to update rules
- Share this guide with them

## Security Notes

These rules are secure because:
- ✅ All operations require authentication
- ✅ Users can only access their own data
- ✅ The `userId` field is checked on all operations
- ✅ No public read/write access
- ✅ Default deny rule at the end catches everything else

## Future Maintenance

When adding new collections, remember to:
1. Add rules to `firestore.rules` file
2. Deploy using Firebase Console or CLI
3. Test thoroughly
4. Document the changes

## Quick Reference

**Deploy Command:**
```bash
firebase deploy --only firestore:rules
```

**Test Rules:**
```bash
firebase emulators:start --only firestore
```

**View Current Rules:**
```bash
firebase firestore:rules get
```

