# Missed Questions Flashcard Integration

## Overview
Missed questions from gameplay are now automatically available as a dynamic flashcard deck in Practice Mode! This makes reviewing your mistakes seamless and integrated into your study routine.

## ✅ What's New

### Dynamic Missed Questions Deck
- **Automatic Creation**: When you miss questions during gameplay, they're saved to Firebase
- **Flashcard Format**: Missed questions automatically appear as a special flashcard deck
- **Real-Time Updates**: The deck updates as you play more games and miss more questions
- **Special Styling**: The Missed Questions deck has a distinctive orange/red appearance to stand out

### Integration with Practice Mode
1. **Navigate to Practice Mode** from the main menu
2. **Choose Study Flashcards**
3. **See "❌ Missed Questions" deck** at the top (if you have any missed questions)
4. **Click to start reviewing** your mistakes just like any other flashcard deck

### Features
- **Question → Answer Format**: Front shows the clue, back shows the correct response
- **Shuffle & Reverse**: All standard flashcard features work
- **Mark Progress**: Mark cards as correct/missed during review
- **Category Info**: See the category and value of each missed question
- **Review Category**: Missed Questions appear in a special "Review" category

## How It Works

### Backend
1. During gameplay, when you answer incorrectly, the question is saved to Firebase
2. On Practice Mode load, all your missed questions are fetched
3. They're converted to flashcard format with:
   - `question`: The clue/question text
   - `answer`: The correct response
   - Additional metadata (category, value, date, player name)

### Frontend
- The deck appears with special styling (orange background, red border)
- Located at the top of the deck grid for easy access
- Filtered by the "Review" category tag
- Counts toward total deck count in "All Categories"

## User Experience

### Before Starting a Session
```
Practice Mode
├── Choose Practice Type
│   ├── Jeopardy! Practice (questions by category)
│   └── Study Flashcards
│       ├── ❌ Missed Questions (NEW!)
│       ├── U.S. Presidents
│       ├── World Capitals
│       └── ... more decks
```

### During Review
- Flip cards to reveal answers
- Mark cards as correct (✓) or missed (✗)
- Navigate through your missed questions
- Get a summary at the end showing your performance

### After Review
- Questions you marked correct: Great job!
- Questions still missed: They remain in your deck for next time
- Perfect score: Celebrate your improvement! 🎉

## Benefits

1. **Seamless Learning**: No need to navigate to a separate "Missed Questions" screen
2. **Consistent Interface**: Uses the familiar flashcard UI you already know
3. **Study Features**: Shuffle, reverse, and progress tracking all work
4. **Always Available**: Your missed questions are always ready when you want to review

## Technical Details

### Data Flow
```
Gameplay → Miss Question → Firebase Storage
                              ↓
                        Practice Mode Load
                              ↓
                    Convert to Flashcard Format
                              ↓
                    Display as Dynamic Deck
```

### Deck Structure
```javascript
{
  id: 'missed-questions',
  name: '❌ Missed Questions',
  description: 'Review X questions you missed during gameplay',
  category: 'Review',
  cards: [
    {
      id: 'missed-{firebaseId}',
      question: 'The clue text',
      answer: 'The correct response',
      category: 'HISTORY',
      topLevelCategory: 'History',
      value: 400,
      playerName: 'Player Name',
      date: '2025-01-01T12:00:00.000Z'
    },
    // ... more cards
  ],
  isDynamic: true
}
```

### Loading State
- Shows loading indicator while fetching missed questions
- Gracefully handles empty state (no missed questions)
- Only appears if you have at least one missed question

## Future Enhancements

Potential improvements:
- Filter missed questions by category
- Sort by most recent or most frequently missed
- Remove individual questions from the deck
- Difficulty indicators based on question value
- Progress tracking over time
- Export missed questions for study

## Tips for Users

1. **Review Regularly**: Check your missed questions deck after each game session
2. **Mark Honestly**: Use the correct/missed markers to track your real progress
3. **Shuffle Mode**: Use shuffle to test yourself without pattern recognition
4. **Reverse Mode**: Sometimes seeing answer→question helps reinforce learning
5. **Clear After Mastery**: Delete individual missed questions once you've mastered them (coming soon!)

Happy studying! 📚✨

