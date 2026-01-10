# Challenge Ruling Feature

## Overview
Implemented a feature that allows any player to challenge an incorrect ruling and have OpenAI re-evaluate their answer according to Jeopardy! rules.

## Components Created/Modified

### 1. New Files Created

#### `/src/services/challengeRulingService.js`
- `evaluateChallenge()` - Evaluates a player's challenge using OpenAI GPT-4o-mini
- `logChallenge()` - Logs challenge details to console (can be expanded to Firebase)
- Uses strict Jeopardy! rules for evaluation
- Returns `{ shouldOverrule: boolean, explanation: string }`

### 2. Modified Files

#### `src/Question.js`
Added:
- **Challenge Button**: Orange "Challenge Ruling" button (visible to all players when answer is incorrect)
- **Challenge Modal**: Dialog for players to explain why they should receive credit
- **State Management**: 
  - `showChallengeModal` - Controls modal visibility
  - `challengeReason` - Player's explanation
  - `isEvaluatingChallenge` - Loading state during OpenAI evaluation
  - `challengeResult` - Stores OpenAI's decision
- **Functions**:
  - `handleOpenChallenge()` - Opens the challenge modal
  - `handleCloseChallenge()` - Closes the modal and resets state
  - `handleSubmitChallenge()` - Submits challenge to OpenAI for evaluation

## How It Works

### User Flow
1. **Player gets answer marked incorrect**
2. **Challenge button appears** below "Continue to Board" button (orange with gavel icon)
3. **Player clicks "Challenge Ruling"** - Modal opens
4. **Modal shows**:
   - The question
   - The correct answer
   - The player's answer
   - Text field to explain why they should get credit
5. **Player submits challenge** - OpenAI evaluates based on Jeopardy! rules
6. **Result displayed**:
   - ✓ **Challenge Upheld** (green) - Score automatically adjusted
   - ✗ **Challenge Denied** (red) - Score remains unchanged

### Score Adjustment
When a challenge is upheld:
- Original deducted points are added back
- Full points for the question are awarded
- Total adjustment: `pointValue * 2`
- Evaluation result is updated to show "Correct"
- Score change is reflected immediately

### OpenAI Evaluation
The challenge is evaluated using GPT-4o-mini with:
- **Jeopardy! Rules**: All standard leniency rules (synonyms, abbreviations, partial answers, etc.)
- **Challenge Context**: Player's explanation is considered
- **Fair Judgment**: Reasonable variations are accepted

**System Prompt Includes**:
- Accept reasonable variations and partial answers
- Accept synonyms and abbreviations
- Ignore articles
- Accept phonetic equivalents
- Accept shortened forms
- Consider if a reasonable Jeopardy! judge would overturn

## UI Layout

### Answer Screen (Incorrect Answer)
```
┌────────────────────────────────────┐
│  [Your Answer]                     │
│  [Correct Answer]                  │
│  [AI Explanation]                  │
│                                    │
│  [Continue to Board] (blue)        │
│                                    │
│  [Challenge Ruling] [Mark Flawed] │
│   (orange)          (red, admin)   │
└────────────────────────────────────┘
```

### Challenge Modal
```
┌─────────────────────────────────────┐
│ ⚖️  Challenge Ruling               │
├─────────────────────────────────────┤
│ Question: [question text]           │
│ Correct Answer: [correct answer]    │
│ Your Answer: [player answer]        │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Why should you receive credit?  ││
│ │ [text area for explanation]     ││
│ │                                 ││
│ └─────────────────────────────────┘│
│                                     │
│ [Result Box] (if evaluated)         │
│                                     │
│           [Cancel] [Submit Challenge]│
└─────────────────────────────────────┘
```

## Example Challenge Scenarios

### Successful Challenge
```
Question: "This hockey legend wore #99"
Correct Answer: Wayne Gretzky
Player Answer: Gretzky
Challenge Reason: "Surnames alone are accepted in Jeopardy!"
Result: ✓ Challenge Upheld - "Surname alone is acceptable for this answer."
```

### Denied Challenge
```
Question: "The capital of France"
Correct Answer: Paris
Player Answer: Lyon
Challenge Reason: "Lyon is a major French city"
Result: ✗ Challenge Denied - "Lyon is not the capital of France. The answer must be Paris."
```

### Successful Synonym Challenge
```
Question: "This professional defends clients in court"
Correct Answer: Attorney
Player Answer: Lawyer
Challenge Reason: "Lawyer and attorney are synonyms"
Result: ✓ Challenge Upheld - "Lawyer is an accepted synonym for attorney."
```

## Technical Details

### Challenge Data Logged
```javascript
{
  questionId: number,
  category: string,
  question: string,
  correctAnswer: string,
  playerAnswer: string,
  challengeReason: string,
  shouldOverrule: boolean,
  aiExplanation: string,
  playerName: string,
  timestamp: ISO date string
}
```

### OpenAI Configuration
- **Model**: gpt-4o-mini
- **Temperature**: 0.3 (consistent rulings)
- **Max Tokens**: 300
- **Response Format**: JSON with `shouldOverrule` and `explanation`

## Future Enhancements
- Save challenges to Firebase for analytics
- Admin dashboard to review challenges
- Appeal system for denied challenges
- Challenge history per player
- Success rate statistics
- Pattern detection for commonly challenged questions
- Auto-flagging questions with high challenge rates

## Benefits
1. **Fairness**: Players can dispute questionable rulings
2. **Transparency**: AI explains its reasoning
3. **Learning**: Players see why answers were right/wrong
4. **Engagement**: Adds strategic element to gameplay
5. **Quality**: Helps identify ambiguous questions





