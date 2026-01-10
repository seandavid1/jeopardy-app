# Archive Missed Questions Feature

## Overview

The archive feature allows players to mark missed questions as "mastered" and remove them from future review sessions. This is particularly useful for questions you've studied and no longer need to practice.

## How It Works

### In Flashcard Review Mode

When reviewing the **❌ Missed Questions** deck in Practice Mode, each flashcard includes three action buttons:

1. **❌ Mark as Missed** (Red) - Left side
   - Marks the question as missed in the current session
   - Does NOT archive the question
   - Question will still appear in future reviews

2. **📦 Archive** (Orange) - Right side (middle)
   - Marks the question as mastered
   - Also marks it as correct in the current session
   - **Permanently removes** the question from future Missed Questions reviews
   - Stored in Firebase for persistence across devices

3. **✓ Mark as Correct** (Green) - Right side (rightmost)
   - Marks the question as correct in the current session only
   - Does NOT archive the question
   - Question will still appear in future reviews

### Visual Indicators

- **Archive Button**: 📦 Orange background
- **Tooltip**: "Archive (Mark as mastered & remove from deck)"
- **Active State**: Highlighted with darker orange when clicked

## When to Use Archive

✅ **Use Archive when:**
- You've mastered the question and answer
- You consistently get the question correct
- You want to focus on other challenging questions
- You've studied the topic thoroughly

❌ **Don't Archive when:**
- You just got lucky on one attempt
- You're still learning the material
- You want more practice with the question

## Technical Implementation

### Database Structure

Archived questions are stored in a separate Firebase collection (`archivedMissedQuestions`) with:
- `userId`: The user who archived the question
- `questionId`: The ID of the archived missed question
- `archivedAt`: Timestamp of when it was archived

### Filtering Process

1. When loading the Missed Questions deck, the app fetches:
   - All missed questions for the user
   - All archived question IDs for the user

2. Archived questions are filtered out before creating the flashcard deck

3. Only "active" (non-archived) questions appear in the review deck

### Session Tracking

During a flashcard study session:
- Archive status is tracked locally in the `archivedCardIds` Set
- When you archive a question, it's immediately saved to Firebase
- The app automatically advances to the next card

## Managing Archived Questions

### Viewing Archived Questions

To view your archived questions:

1. From the home screen, click **"❌ Missed Questions"**
2. At the top of the page, you'll see two toggle buttons:
   - **Active Questions (X)** - Shows questions still in your review deck
   - **Archived (X)** - Shows questions you've mastered
3. Click **"Archived"** to view all archived questions
4. Archived questions display an orange **"📦 Archived"** badge

### Unarchiving Questions

To restore an archived question back to your active review deck:

1. Go to **Missed Questions** from the home screen
2. Click the **"Archived"** toggle button at the top
3. Find the question you want to restore
4. Click the orange **🔄 Restore** icon button on the right side of the question
5. The question will immediately return to your active review deck

**Note**: Restored questions will appear in your next flashcard review session.

### Clearing All Archives

To reset and review all missed questions again:
1. View your archived questions
2. Use the restore button to unarchive individual questions
3. Or contact your developer to add a "Clear All Archives" feature in Settings

**Future Feature**: A bulk unarchive option may be added to restore all archived questions at once.

## Benefits

1. **Focus on Weaknesses**: Spend time on questions you still struggle with
2. **Progress Tracking**: Clear indicator of mastery as your review deck shrinks
3. **Motivation**: Visual progress as you archive more questions
4. **Efficiency**: Don't waste time reviewing what you already know
5. **Persistent**: Archives sync across devices through Firebase

## Database Services

### Available Functions

From `archivedMissedQuestionsDB-firebase.js`:

```javascript
// Archive a missed question
await archiveMissedQuestion(questionId);

// Get all archived question IDs
const archivedIds = await getArchivedMissedQuestionIds();

// Unarchive a question
await unarchiveMissedQuestion(questionId);

// Clear all archives
await clearAllArchivedMissedQuestions();
```

## Future Enhancements

Potential improvements to the archive feature:

1. **Archive Statistics**: Show how many questions you've archived over time
2. **Bulk Operations**: Archive/unarchive multiple questions at once
3. **Smart Suggestions**: Suggest archiving questions you've gotten correct multiple times
4. **Temporary Archive**: Option to hide questions for a specific time period (e.g., 30 days)
5. **Archive Categories**: View archived questions by category or difficulty
6. **Export Archives**: Download a list of mastered questions as CSV or PDF
7. **Archive Analytics**: Charts showing your progress and mastery over time
8. **Auto-Archive**: Automatically archive questions after N correct answers in a row

## Tips for Effective Use

1. **Be Honest**: Only archive questions you truly know
2. **Review Periodically**: Consider unarchiving old questions occasionally for long-term retention
3. **Combine with Flashcards**: Use both missed questions and regular flashcards for comprehensive study
4. **Track Progress**: Watch your missed questions deck shrink as you improve
5. **Don't Rush**: Take time to truly understand before archiving

## Troubleshooting

### Question Didn't Archive
- Check your internet connection (archives save to Firebase)
- Refresh the page and try again
- Check browser console for errors

### Archived Question Still Appears in Flashcards
- Refresh the browser to reload the deck
- The question may appear in the current session but will be gone when you restart practice mode
- Check the Missed Questions page to verify it's archived (orange badge)

### Restore Button Not Working
- Ensure you're connected to the internet
- Try refreshing the page
- Check if you're still logged in

### Can't Find Archived Questions
- Click the **"Archived"** toggle at the top of the Missed Questions page
- Use the search field to find specific archived questions by keyword
- Check the count in the toggle button - if it shows 0, you have no archived questions

### Want to Unarchive Multiple Questions
- Currently requires individual restoration using the restore button
- This is intentional to prevent accidental bulk unarchiving
- Future update may add bulk operations with confirmation dialogs

## Privacy & Data

- Archives are stored per-user in Firebase
- Only you can see your archived questions
- Archives persist across devices when logged in
- Deleting your account will remove all archives

