# Missed Questions Management Guide

## Overview

The Missed Questions page provides a comprehensive interface for managing questions you've answered incorrectly during gameplay. This guide covers archiving, restoring, and organizing your missed questions.

## Features

### 1. **Archive/Restore Toggle**
At the top of the Missed Questions page, you'll find two toggle buttons:
- **Active Questions (X)** - Shows questions in your active review deck
- **Archived (X)** - Shows questions you've mastered and archived

### 2. **Question Actions**

Each question card displays action buttons on the right side:

#### For Active Questions:
- **📦 Archive Button** (Orange)
  - Archives the question as "mastered"
  - Removes it from your flashcard review deck
  - Question remains viewable in the Archived section
  - Tooltip: "Archive question (mark as mastered)"

#### For Archived Questions:
- **🔄 Restore Button** (Green)
  - Unarchives the question
  - Returns it to your active flashcard review deck
  - Tooltip: "Restore from archive"

### 3. **Edit Category**
- **✏️ Edit Button** - Click to change the top-level category assignment
- Helps organize questions into the right study categories

### 4. **Search & Filter**
- **Search Box** - Find questions by keywords in clue, answer, or category
- **Category Filters** - Filter by specific categories or top-level categories
- Search and filters work in both Active and Archived views

## Workflows

### Archiving a Question

**When to Archive:**
- You've mastered the question and no longer need to review it
- You consistently answer it correctly
- You want to focus on more challenging questions

**How to Archive:**
1. Go to **Missed Questions** from the home screen
2. Ensure you're on the **"Active Questions"** tab
3. Find the question you want to archive
4. Click the **📦 orange archive button** on the right side
5. Question immediately moves to the Archived section

**Result:**
- Question removed from flashcard review deck
- Still accessible in the Archived view
- Can be restored at any time

### Restoring a Question

**When to Restore:**
- You want to review the question again
- You realized you haven't fully mastered it
- Periodic review of old material

**How to Restore:**
1. Go to **Missed Questions** from the home screen
2. Click the **"Archived"** toggle button at the top
3. Find the question you want to restore
4. Click the **🔄 green restore button** on the right side
5. Question immediately returns to Active Questions

**Result:**
- Question returns to your active flashcard review deck
- Will appear in your next practice session
- Removed from Archived view

### Organizing Questions

**Edit Top-Level Category:**
1. Find a question with an incorrect category
2. Click the **✏️ edit icon** next to the category chips
3. Select a new top-level category from the dropdown
4. Or create a custom category by typing it in
5. Click **Save** to apply the change

**Benefits:**
- Better organization in practice mode
- Easier filtering and search
- Personalized study structure

## Visual Indicators

### Question Cards Display:
1. **Question Text** - The Jeopardy clue
2. **Category Chips** - Shows category, top-level category, and value
3. **Archived Badge** - Orange "📦 Archived" chip on archived questions
4. **Action Buttons** - Archive/Restore button on the right

### Color Coding:
- 🟠 **Orange** - Archive actions (mastery)
- 🟢 **Green** - Restore actions (bring back)
- 🔵 **Blue** - Category and value chips
- ⚪ **White** - Question card backgrounds

## Best Practices

### Effective Archiving:
1. **Be Honest** - Only archive questions you truly know
2. **Review First** - Click to reveal the answer before archiving
3. **Don't Rush** - Archive after you've seen the question multiple times
4. **Periodic Review** - Occasionally restore old questions for long-term retention

### Organization Tips:
1. **Fix Categories First** - Ensure questions are properly categorized before archiving
2. **Use Search** - Find all questions on a topic before deciding what to archive
3. **Filter by Category** - Archive categories you've mastered completely
4. **Track Progress** - Watch the Active count decrease and Archived count increase

### Study Strategy:
1. **Focus on Active** - Spend most time reviewing active questions
2. **Occasional Archive Review** - Browse archived questions to confirm mastery
3. **Restore When Unsure** - Better to practice more than archive too early
4. **Combine with Flashcards** - Use both missed questions and standard flashcard decks

## Data Management

### Where Questions Come From:
- Automatically added when you answer incorrectly in gameplay
- Includes the clue, answer, category, value, and date
- Tied to your user account via Firebase

### Archive Storage:
- Archives stored separately in Firebase
- Syncs across all your devices
- Persists even if you close the browser
- Only you can see your archives

### Deleting Questions:
- Currently, there's no delete button (archive is preferred)
- Archives are non-destructive - you can always restore
- If you need to permanently delete questions, contact the developer
- Future update may add a permanent delete option with confirmation

## Keyboard Shortcuts

Currently, all actions are mouse/touch-based. Future updates may include:
- `A` - Archive selected question
- `R` - Restore selected question
- `E` - Edit category
- `/` - Focus search box

## Troubleshooting

### Question Won't Archive:
- Check your internet connection
- Ensure you're logged in
- Refresh the page and try again

### Restore Not Working:
- Verify you're in the Archived tab
- Check your network connection
- Look for error messages at the top of the page

### Question Appears in Wrong Section:
- Refresh the page to reload data
- Check if you have multiple browser tabs open
- Clear browser cache if issues persist

### Archive Count Incorrect:
- Refresh the page to update counts
- May take a moment to sync with Firebase
- Check if you're filtering questions

## Future Enhancements

Planned improvements:
1. **Bulk Actions** - Archive/restore multiple questions at once
2. **Undo Feature** - Quickly undo accidental archives
3. **Archive Statistics** - Charts showing your progress
4. **Smart Suggestions** - Auto-suggest questions ready for archiving
5. **Export/Import** - Backup and share your question collections
6. **Permanent Delete** - Option to remove questions entirely (with confirmation)

## Related Features

- **Practice Mode** - Review missed questions as flashcards
- **Flashcard Archive Button** - Archive directly from practice sessions
- **Category Override** - Customize categories for better organization
- **Search** - Find specific questions quickly

## Tips

1. **Start Small** - Archive a few questions at a time
2. **Review Regularly** - Check your archived questions monthly
3. **Trust Yourself** - If you know it, archive it
4. **Stay Organized** - Keep categories clean for easier management
5. **Use Both Views** - Active for studying, Archived for progress tracking

