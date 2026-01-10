# Improved Board Generation System

## Overview

The board generation system has been completely redesigned to ensure:
1. **Category Diversity**: No single topic dominates the board
2. **Proper Difficulty Placement**: Clues maintain their original difficulty values
3. **Better Board Quality**: More balanced and engaging gameplay

## Key Features

### 1. Category Diversity Enforcement

The system tracks top-level categories (History, Geography, Science, Sports, Entertainment, Literature, Pop Culture, Food and Drink, Other) and ensures that no single category appears more than 2-3 times on a board.

**Example Bad Board (Before)**:
- 4 Geography categories
- 1 History category  
- 1 Science category

**Example Good Board (After)**:
- 2 Geography categories
- 1 History category
- 1 Science category
- 1 Entertainment category
- 1 Literature category

### 2. Difficulty Value Validation

Each clue is validated to ensure it appears in the correct dollar slot based on its original value from the real Jeopardy! game.

**Jeopardy Round**: $200, $400, $600, $800, $1000
**Double Jeopardy Round**: $400, $800, $1200, $1600, $2000

A clue that was originally worth $2000 in Double Jeopardy will never appear in the $400 slot.

## Architecture

### New Files

1. **`src/utils/boardGenerator.js`**: Core board generation logic
   - `getCategory()`: Gets a single validated category
   - `getCategoryWithDiversity()`: Gets a category with diversity constraints
   - `generateBoard()`: Generates a complete 6-category board
   - `validateCategoryDifficulty()`: Validates clue difficulty progression
   - `getCategoryDistribution()`: Analyzes board diversity

### Updated Files

1. **`src/utils/gameLogic.js`**: 
   - Now imports and uses improved algorithms
   - Maintains backward compatibility
   - Adds validation to category selection

2. **`src/Board.js`**:
   - Tracks both category names and top-level categories
   - Uses diversity-aware category selection
   - Logs board distribution for debugging

## How It Works

### Category Selection Flow

1. **Filter by Round**: Only select clues from the current round (Jeopardy or Double Jeopardy)

2. **Exclude Used Categories**: Don't repeat any category on the same board

3. **Check Diversity**: Count existing top-level categories and prefer underrepresented types

4. **Validate Difficulty**: Ensure the selected category has proper value progression (200→400→600→800→1000)

5. **Fallback Mechanism**: If strict diversity can't be met, relax constraints while still maintaining uniqueness

### Example Board Generation

```javascript
// The system will:
// 1. Select Category 1: "WORLD CAPITALS" (Geography) ✓
// 2. Select Category 2: "CIVIL WAR BATTLES" (History) ✓ (Different from Geography)
// 3. Select Category 3: "FAMOUS SCIENTISTS" (Science) ✓ (Different from previous)
// 4. Select Category 4: "RIVERS OF EUROPE" (Geography) ✓ (2nd Geography OK)
// 5. Select Category 5: "80s MOVIES" (Entertainment) ✓ (Different)
// 6. Try Category 6: "WORLD GEOGRAPHY" (Geography) ✗ (Would be 3rd Geography)
//    Retry with different category...
// 6. Select Category 6: "SHAKESPEARE" (Literature) ✓
```

## Console Output

When a board is generated, you'll see detailed logging:

```
========================================
Selecting category 1/6...
✓ Selected category "WORLD CAPITALS" from game 9156 (attempt 1)

Selecting category 2/6...
✗ Skipping "EUROPEAN GEOGRAPHY" - already have 1 Geography categories
✓ Selected diverse category: "CIVIL WAR" (History)
  Top-level distribution so far: { Geography: 1, History: 1 }

... (continues for all 6 categories)

========================================
Jeopardy Board Generated!
Top-Level Category Distribution: {
  Geography: 2,
  History: 1,
  Science: 1,
  Entertainment: 1,
  Literature: 1
}
Categories: [
  "WORLD CAPITALS",
  "CIVIL WAR",
  "FAMOUS SCIENTISTS",
  "RIVERS OF EUROPE",
  "80s MOVIES",
  "SHAKESPEARE"
]
========================================
```

## Validation

### Difficulty Validation

Each category is validated to ensure proper difficulty:

```javascript
validateCategoryDifficulty(categoryClues, 'Jeopardy')
// Returns: { valid: true, issues: [] }
// or
// Returns: { 
//   valid: false, 
//   issues: [
//     "Clue 2 has value 1000, expected 600",
//     "Clue 4 has value 400, expected 1000"
//   ]
// }
```

### Distribution Analysis

Check board diversity at any time:

```javascript
getCategoryDistribution([cat1, cat2, cat3, cat4, cat5, cat6])
// Returns: {
//   Geography: 2,
//   History: 1,
//   Science: 1,
//   Entertainment: 1,
//   Literature: 1
// }
```

## Configuration

### Diversity Settings

In `boardGenerator.js`, you can adjust the maximum allowed categories of the same type:

```javascript
const maxPerCategory = 2; // Allow up to 2 of the same top-level category
```

### Retry Settings

Adjust retry limits for category selection:

```javascript
getCategory(questions, round, usedCats, maxRetries = 50)
getCategoryWithDiversity(questions, round, usedCats, topLevel, maxRetries = 100)
```

## Benefits

1. **More Balanced Gameplay**: Players encounter a wider variety of topics
2. **Fair Difficulty**: No $200 clues that were originally $2000 questions
3. **Better Learning**: Diverse boards expose players to more subject areas
4. **Authentic Feel**: Respects original Jeopardy! difficulty progression
5. **Debugging Support**: Detailed logging helps identify any issues

## Testing

To test the new system:

1. Start a new game and check the console logs
2. Look for the board distribution output
3. Verify that:
   - No more than 2-3 categories of the same type
   - Each clue is in the correct dollar slot
   - All categories have exactly 5 clues

## Backward Compatibility

The system maintains full backward compatibility:
- Existing code continues to work
- New features are opt-in through function parameters
- Fallback mechanisms ensure games always load

## Future Enhancements

Potential improvements:
1. User preferences for category distribution
2. Difficulty balancing across categories
3. Theme-based board generation
4. Statistical tracking of board quality
5. A/B testing different diversity algorithms





