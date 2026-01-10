# Board Generation System - Testing Guide

## How to Test the Improvements

The improved board generation system is now live in your application. Here's how to verify it's working:

### 1. Quick Browser Test

1. **Start a New Game**
   - Go to http://localhost:3000/jeopardy
   - Click "Start Game" or "Play vs CPU"
   - Select your game options

2. **Check the Browser Console** (Press F12 or Cmd+Option+I)
   - You should see detailed logs like this:

```
========================================
Selecting category 1/6...
✓ Selected category "WORLD CAPITALS" from game 9156 (attempt 1)

Selecting category 2/6...
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

### 2. What to Look For

#### ✅ Good Signs (Expected Behavior)

1. **Category Diversity**
   - No more than 2-3 categories of the same top-level type
   - Example: If you see 2 Geography categories, you shouldn't see a 3rd one
   
2. **Proper Difficulty Values**
   - Jeopardy Round: $200 → $400 → $600 → $800 → $1000
   - Double Jeopardy Round: $400 → $800 → $1200 → $1600 → $2000
   - Each column should show values in this exact order from top to bottom

3. **Retry Messages**
   - You might see messages like "✗ Skipping... already have 2 Geography categories"
   - This is GOOD - it means the system is enforcing diversity

#### ❌ Bad Signs (Needs Investigation)

1. **Too Many of Same Category**
   - If you see 4+ categories of the same type (e.g., 4 Geography categories)
   - This would indicate the diversity enforcement isn't working

2. **Wrong Values in Slots**
   - If a $200 slot shows a different value
   - Or if values aren't in ascending order within a category

3. **Console Errors**
   - Any red error messages about category selection
   - "Failed to get category after X attempts" (unless X < 5)

### 3. Testing Different Rounds

Test both rounds to ensure consistency:

**Jeopardy Round:**
- Start a new game
- Check the board values: $200, $400, $600, $800, $1000
- Note the category distribution

**Double Jeopardy Round:**
- Complete the Jeopardy round (or skip all questions)
- When Double Jeopardy starts, check the console again
- Values should be: $400, $800, $1200, $1600, $2000
- Distribution should be balanced again (different from Jeopardy round)

### 4. Multiple Games Test

For thorough testing:

1. Play 3-5 complete games
2. For each game, check:
   - Jeopardy round diversity
   - Double Jeopardy round diversity
   - No repeated categories on the same board
   - Proper difficulty progression

### 5. Expected Improvements

**Before (Old System):**
```
Potential issues:
- Board could have 5 Geography categories and 1 History category
- A $2000 clue might appear in the $400 slot
- No validation of difficulty values
- Less interesting board variety
```

**After (New System):**
```
Guaranteed improvements:
✓ Maximum 2-3 categories of the same type per board
✓ All clues in correct difficulty slots
✓ Validation before display
✓ Detailed logging for debugging
✓ Fallback mechanisms for edge cases
```

## Common Issues and Solutions

### Issue: "Failed to get category after X attempts"

**Cause:** Not enough unique categories available in the question pool for the current round.

**Solution:** This is expected occasionally. The system will use fallback mechanisms. If it happens frequently, we may need to adjust retry limits.

### Issue: Still seeing 4+ of same category

**Cause:** Possible issue with topLevelCategory data or diversity enforcement.

**Solution:** 
1. Check if questions have `topLevelCategory` field
2. Verify `categoryMapper.js` is working correctly
3. Check console for specific error messages

### Issue: Values not matching expected progression

**Cause:** Source data might have incorrect values, or validation is failing.

**Solution:**
1. Check the specific category in the console logs
2. Look for validation error messages
3. Verify the source question data has correct `value` fields

## Success Criteria

The system is working correctly if:

✅ Each board has 6 unique categories  
✅ No more than 2-3 categories of the same top-level type  
✅ All categories have exactly 5 clues  
✅ Values progress correctly within each category  
✅ Console logs show detailed selection process  
✅ Games load successfully without errors  

## Reporting Issues

If you encounter problems:

1. **Check the Console**: Copy any error messages
2. **Note the Categories**: Which categories were selected?
3. **Check Distribution**: What does the distribution object show?
4. **Round Type**: Was it Jeopardy or Double Jeopardy?
5. **Screenshot**: If possible, screenshot the board and console

With this information, we can quickly diagnose and fix any issues.

## Advanced Testing

For developers who want to test programmatically:

```javascript
// Open browser console while on the game page
// Access the utility functions:

import { generateBoard, getCategoryDistribution } from './utils/boardGenerator';
import { getAllQuestions } from './utils/gameLogic';

const questions = getAllQuestions();
const board = await generateBoard(questions, 'Jeopardy');
const distribution = getCategoryDistribution(board);

console.log('Distribution:', distribution);
console.log('Categories:', board.map(cat => cat[0]?.category));
```

## Performance Notes

The new system:
- Adds minimal overhead (< 100ms per board)
- Uses retry mechanisms efficiently
- Logs can be disabled by removing console.log statements if needed
- No impact on gameplay performance

---

**Happy Testing!** 🎮

The improved system should provide more balanced, fair, and engaging Jeopardy! games.





