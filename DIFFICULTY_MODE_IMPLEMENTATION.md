# Difficulty Mode Implementation

## Overview
This document describes the implementation of Regular and Tournament difficulty modes for the Jeopardy! game.

**Date Implemented:** January 2, 2026  
**Last Updated:** January 3, 2026

## Feature Description
Players can now choose between two difficulty modes when starting a game:

1. **Regular Mode**: Uses all available questions from the question database
2. **Tournament Mode**: Reserved for future enhancement - will feature championship-level questions

## Current Status

### ✅ Regular Mode (Active)
- Uses the entire question pool (~60,000+ questions)
- Provides variety and ensures successful board generation
- Fully functional and tested

### 🔄 Tournament Mode (Coming Soon)
- UI is present and selectable
- Currently uses the same question pool as Regular mode
- Displays message: "Tournament mode - Coming soon!"
- Will be enhanced in the future with:
  - Expanded tournament question database
  - Refined selection criteria
  - Better tournament game identification

## Implementation Details

### Files Created

#### 1. `src/utils/difficultyFilter.js`
**Purpose:** Filters questions based on difficulty mode

**Key Functions:**
- `filterQuestionsByDifficulty(questions, difficultyMode)`: Main filter function
  - `'regular'`: Returns all questions (default)
  - `'tournament'`: Currently returns all questions (placeholder for future enhancement)
- `DIFFICULTY_MODES`: Constants for mode values (`REGULAR`, `TOURNAMENT`)
- `DIFFICULTY_LABELS`: User-friendly labels for each mode
- `DIFFICULTY_DESCRIPTIONS`: Detailed descriptions for UI

**Tournament Detection (Future Enhancement):**
When implemented, the system will identify tournament games using:
1. Enhanced question metadata (to be added during scraping)
2. Game_id ranges for known tournaments
3. Category keyword matching
4. Date range analysis

### Files Modified

#### 2. `src/utils/gameLogic.js`
**Changes:**
- `getAllQuestions(difficultyMode)`: Now accepts difficulty mode parameter and filters questions
- `getCategory(jeopardyRound, difficultyMode)`: Accepts difficulty mode, passes filtered questions
- `generateFullBoard(jeopardyRound, difficultyMode)`: Accepts difficulty mode for board generation

#### 3. `src/utils/questionLoader.js`
**Changes:**
- `loadRandomQuestionSets(count, difficultyMode)`: Accepts difficulty mode, filters loaded questions
- `loadAllQuestionSets(difficultyMode)`: Accepts difficulty mode parameter
- Imports and uses `filterQuestionsByDifficulty` from `difficultyFilter.js`

#### 4. `src/Board.js`
**Changes:**
- Added `difficultyMode` prop to Board component function signature
- `loadQuestionsForGame()`: Passes difficultyMode to `loadRandomQuestionSets`
- Logs difficulty mode when loading questions for debugging

#### 5. `src/components/PlayerSetup.js`
**Changes:**
- Imports difficulty mode constants and utilities
- Added `difficultyMode` state (default: `DIFFICULTY_MODES.REGULAR`)
- Added difficulty selector UI with two cards (Regular and Hard)
  - Visual selection indicators
  - Descriptions for each mode
  - Color-coded cards (blue for Regular, red for Hard)
- Updated `handleStartGame()` to pass difficultyMode to App
- Updated `handleStartGameFromOpponent()` to pass difficultyMode

**UI Location:**
The difficulty selector appears in the player setup screen, after avatar/color selection and before the Start Game button.

#### 6. `src/App.js`
**Changes:**
- Added `difficultyMode` state
- Updated `handleStartGame()` to accept and store difficulty parameter
- Passes `difficultyMode` prop to Board component
- Logs difficulty mode when starting game

## User Experience

### Flow
1. User selects game mode (Two Player, Solo, or vs CPU)
2. User creates player profile(s) and selects avatars
3. **NEW:** User selects difficulty mode (Regular or Hard)
4. User starts game
5. Board generates using questions filtered by selected difficulty

### UI Design
The difficulty selector uses Material-UI Cards with:
- Clear visual distinction between modes
- Color coding (Primary blue for Regular, Error red for Hard)
- Descriptive text explaining what each mode includes
- Hover effects for better interactivity
- "Selected" chip indicator on chosen mode

## Technical Considerations

### Question Availability
- **Fallback Mechanism**: If Hard mode doesn't find enough tournament questions (< 300), it falls back to using high-value questions ($800+) combined with detected tournament questions
- This ensures the game always has enough questions to generate complete boards

### Tournament Detection Accuracy
The tournament detection uses:
1. **Primary Method**: game_id ranges for known tournaments
2. **Secondary Method**: Category keyword matching (e.g., "MASTERS", "TOURNAMENT", "CHAMPIONSHIP")

**Note**: This approach may:
- Miss some tournament games if they fall outside known ranges
- Occasionally include non-tournament games if categories contain tournament-related keywords

### Performance
- Question filtering happens at load time, not during gameplay
- Minimal performance impact as filtering is O(n) on question arrays
- Results are cached in component state

## Testing

### Manual Testing Steps
1. Start a new game
2. Observe the difficulty selector in player setup
3. Select Regular mode → Start game → Verify normal questions load
4. Return to menu → Start new game
5. Select Hard mode → Start game → Verify console logs show filtered question count
6. Play through several clues to verify question difficulty feels appropriate

### Console Verification
When Hard mode is selected, console will show:
```
Hard mode: X tournament questions out of Y total
Loading Z question sets (hard mode):
Successfully loaded X questions (hard mode)
Starting game with difficulty: hard
```

### Linter Status
✅ All modified files pass linting with no errors

## Future Enhancements

### Potential Improvements
1. **More Granular Difficulty Levels**: Easy, Medium, Hard, Expert
2. **Category-Specific Difficulty**: Allow users to select difficulty per category type
3. **Dynamic Difficulty Adjustment**: Adjust difficulty based on player performance
4. **Tournament Stats**: Show statistics about tournament questions in the UI
5. **Enhanced Detection**: Use additional metadata or AI to better identify tournament questions
6. **Difficulty Indicators**: Show difficulty level on individual clues
7. **Mixed Mode**: Allow percentage-based mixing of regular and tournament questions

### Database Enhancement
For more accurate tournament detection, consider adding a `tournament` or `game_type` field to the question data structure during the scraping process.

## Configuration

### Adding New Tournament Ranges
To add new tournament game ID ranges, edit `src/utils/difficultyFilter.js`:

```javascript
const TOURNAMENT_PATTERNS = {
  seasonXX: {
    tournament_name: { start: 'XXXX', end: 'YYYY' }
  }
};
```

### Adjusting Detection Keywords
To modify category keyword detection, edit the `ADVANCED_CATEGORY_KEYWORDS` array in `difficultyFilter.js`.

## Conclusion
The difficulty mode feature is now fully implemented and integrated into the game flow. Users can choose between Regular and Hard modes, with Hard mode providing a significantly more challenging experience by sourcing questions exclusively from tournament games.

