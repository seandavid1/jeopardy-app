# Admin Flawed Questions Feature

## Overview
Implemented an admin-only feature to mark questions as flawed and remove them from the pool of available questions for all players.

## Components Created/Modified

### 1. New Files Created

#### `/src/services/flawedQuestionsDB.js`
- `markQuestionAsFlawed()` - Mark a question as flawed (admin only)
- `getFlawedQuestionIds()` - Get all flawed question IDs
- `isQuestionFlawed()` - Check if a specific question is flawed
- `getAllFlawedQuestions()` - Get all flawed questions with details (admin view)

#### `/src/utils/adminCheck.js`
- `isAdmin(user)` - Check if a user is an admin
- `isAdminEmail(email)` - Check if an email is an admin email
- Currently configured admin: `seandavid1@gmail.com`

### 2. Modified Files

#### `firestore.rules`
Added rules for the `flawed_questions` collection:
```javascript
match /flawed_questions/{questionId} {
  // Anyone can read flawed questions (needed for board generation)
  allow read: if true;
  
  // Only admin can write flawed questions
  allow write: if isAuthenticated() && request.auth.token.email == 'seandavid1@gmail.com';
}
```

#### `src/Question.js`
- Added imports for admin utilities and flawed questions service
- Added `useAuth()` hook to get current user
- Added `userIsAdmin` check
- Added `handleMarkAsFlawed()` function
- Added "Mark Question as Flawed" button below "Continue to Board" button
  - Only visible to admin users
  - Red outlined button with warning icon
  - Includes tooltip explaining the action
  - Confirmation dialog before marking

#### `src/utils/boardGenerator.js`
- Added import for `getFlawedQuestionIds()`
- Added caching mechanism for flawed questions (5-minute cache)
- Added `getFlawedQuestionsSet()` helper function
- Modified `getCategory()` to filter out flawed questions when building the board
- Flawed questions are excluded from both round filtering and category selection

## How It Works

### For Admin Users (seandavid1@gmail.com)
1. When viewing a question's answer screen, a red "Mark Question as Flawed" button appears below the "Continue to Board" button
2. Clicking the button shows a confirmation dialog with the question details
3. Upon confirmation, the question is:
   - Saved to Firebase `flawed_questions` collection
   - Logged with admin email and timestamp
   - Immediately available for filtering in the board generator

### For Board Generation
1. When `getCategory()` is called, it first fetches flawed question IDs
2. Flawed questions are cached for 5 minutes to reduce Firebase calls
3. All questions matching flawed IDs are filtered out before category selection
4. This ensures flawed questions never appear in any future games for any player

### Firebase Structure
```
flawed_questions/
  {questionId}/
    questionId: number
    category: string
    question: string
    answer: string
    value: number
    markedBy: string (admin email)
    reason: string
    markedAt: Timestamp
    timestamp: number
```

## Security
- Only users with email `seandavid1@gmail.com` can mark questions as flawed
- Firebase rules enforce this at the database level
- Client-side UI only shows button to admin users
- All write attempts are validated server-side

## Future Enhancements
- Admin dashboard to view/manage all flawed questions
- Ability to unmark questions as flawed
- Bulk import/export of flawed questions
- Analytics on flawed question patterns
- Multiple admin users (add to ADMIN_EMAILS array)





