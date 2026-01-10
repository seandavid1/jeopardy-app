# Multi-Player Buzzer System Implementation

## Overview
Implemented a multi-player buzzer system that follows official Jeopardy rules: when a player misses a regular question (not Daily Double or Final Jeopardy), the other player gets a chance to buzz in and answer.

## Changes Made

### 1. State Management (Question.js)
- **Added `playersWhoAttempted` state**: Tracks which players have already attempted the current question
  - Stored as an array of player keys: `['playerOne']` or `['playerTwo']` or `['playerOne', 'playerTwo']`
  - Reset when question closes

### 2. Answer Submission Logic
- **Modified `handleSubmitAnswer()`**:
  - After evaluating an answer, marks the current player as having attempted
  - If answer is **incorrect** AND it's **not** a Daily Double or Final Jeopardy AND the other player **hasn't attempted**:
    - Shows the answer briefly but doesn't close the question
    - Returns early to prevent immediate closure
  - If answer is correct OR it's a Daily Double/Final Jeopardy OR both players have attempted:
    - Proceeds with normal answer display and closure

### 3. Continue Button Logic
- **Modified `handleContinueToBoard()`**:
  - Applies the score change for the current player
  - Checks if the other player can still attempt:
    - If answer was incorrect
    - AND not a Daily Double or Final Jeopardy
    - AND other player hasn't attempted yet
  - If conditions met:
    - Resets answer input state
    - Reactivates the buzzer for 5 seconds
    - Keeps the question open
  - Otherwise:
    - Closes the question and returns to board

### 4. UI Updates

#### Button Text Changes
- The "Continue to Board" button text changes dynamically:
  - Shows "Let [Player Name] Attempt" if the other player can still try
  - Shows "Continue to Board" if no more attempts are allowed

#### Already Attempted Indicator
- Added visual indicator showing which players have already attempted
- Appears at the top of the question display
- Only shows for regular questions (not Daily Doubles or Final Jeopardy)
- Displays: "Already Attempted: [Player Names]"

### 5. Buzzer Logic Updates

#### Keyboard Buzzer
- **Modified key press handler**:
  - Checks if the player has already attempted before allowing them to buzz in
  - Prevents players from buzzing in multiple times on the same question
  - Maintains all existing buzzer lockout logic

#### CPU Buzzer
- **Modified CPU buzzing logic**:
  - Added check to see if CPU has already attempted the question
  - Prevents CPU from buzzing in again if they already tried and missed
  - Maintains CPU difficulty-based buzzing behavior

### 6. Question Cleanup
- **Modified `closeQuestionBox()`**:
  - Resets `playersWhoAttempted` array to empty for the next question
  - Ensures clean state for each new question

## Rules Implementation

### When Multi-Attempt is ALLOWED:
✅ Regular Jeopardy questions
✅ Regular Double Jeopardy questions
✅ Both players can attempt once each
✅ 5-second timer for second player

### When Multi-Attempt is NOT ALLOWED:
❌ Daily Doubles (only the player with control can attempt)
❌ Final Jeopardy (each player has one attempt only)
❌ After both players have already attempted

## Game Flow Example

### Scenario 1: Player 1 Gets It Wrong
1. Player 1 buzzes in and submits wrong answer
2. System shows "✗ INCORRECT" with score change
3. Button shows "Let [Player 2 Name] Attempt"
4. Player 1 clicks button
5. Score is deducted from Player 1
6. Question remains open, buzzer reactivates
7. "Already Attempted: Player 1" appears at top
8. Player 2 has 5 seconds to buzz in

### Scenario 2: Player 2 Also Gets It Wrong
1. Player 2 buzzes in and submits wrong answer
2. System shows "✗ INCORRECT" with score change
3. Button shows "Continue to Board" (no more attempts)
4. Player 2 clicks button
5. Score is deducted from Player 2
6. Question closes, returns to board

### Scenario 3: Player 2 Gets It Right
1. Player 1 misses (as in Scenario 1)
2. Player 2 buzzes in and submits correct answer
3. System shows "✓ CORRECT!" with score change
4. Button shows "Continue to Board"
5. Player 2 clicks button
6. Score is added to Player 2
7. Player 2 gets control of the board
8. Question closes, returns to board

### Scenario 4: Neither Player Buzzes After First Miss
1. Player 1 misses
2. Button says "Let Player 2 Attempt"
3. Click button, buzzer reactivates
4. 5 seconds pass, neither player buzzes
5. "Time Is Up!" appears
6. "Show Answer" button appears
7. Question can be closed showing missed by both

## Technical Notes

### State Dependencies
The implementation properly tracks dependencies in useEffect hooks:
- Keyboard buzzer useEffect includes `playersWhoAttempted`
- CPU buzzer useEffect includes `playersWhoAttempted`
- Both check attempted status before allowing buzzer activation

### Score Application
- Scores are applied when the "Continue" button is clicked
- This happens after evaluation results are shown
- Each player's score change is applied independently
- Missed questions are tracked for both players if both miss

### Timer Management
- Uses existing `timeoutIdsRef` for proper cleanup
- 5-second timer for second player attempt
- All timers are cleared when question closes or component unmounts

## Testing Checklist

### Two-Player Mode
- [ ] Player 1 misses, Player 2 can buzz in
- [ ] Player 1 misses, Player 2 also misses
- [ ] Player 1 misses, Player 2 gets it right
- [ ] Player 1 gets it right immediately
- [ ] Neither player buzzes initially
- [ ] Time runs out on second attempt

### CPU Mode
- [ ] Human misses, CPU can buzz in
- [ ] CPU misses, human can buzz in
- [ ] Both miss the question
- [ ] CPU gets it right after human misses

### Daily Doubles
- [ ] Only one player can attempt (whoever has control)
- [ ] No second chance after a miss
- [ ] Button says "Continue to Board" immediately

### Final Jeopardy
- [ ] Each player attempts independently
- [ ] No cross-buzzing between players
- [ ] Results shown separately

## Files Modified
- `/src/Question.js` - Main implementation file

## Dependencies
- No new dependencies added
- Uses existing state management patterns
- Compatible with all existing game modes (two-player, CPU, practice)

