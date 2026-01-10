# Daily Double Rules Fix

## Date
January 3, 2026

## Issue
Daily Double placement rules needed clarification and fixing to match actual Jeopardy! rules.

## Jeopardy! Rules for Daily Doubles

### Single Jeopardy Round
- **Quantity**: Exactly **1** Daily Double
- **Placement**: Can be in any of rows 2-5 ($400-$1000)
- **Restriction**: NOT in row 1 ($200)
- **Category**: Any of the 6 categories

### Double Jeopardy Round
- **Quantity**: Exactly **2** Daily Doubles
- **Placement**: Can be in any of rows 2-5 ($800-$2000)
- **Restrictions**: 
  1. NOT in row 1 ($400) - both Daily Doubles must avoid this row
  2. Must be in DIFFERENT categories (never same category)
  3. CAN be in the same row (as long as different categories)

## What Was Fixed

### Before (Incorrect)
```javascript
// Double Jeopardy
// Tried to force different rows AND different categories
// Allowed same category after 20 failed attempts
// Had confusing comments about "$400 row"
```

### After (Correct) ✅
```javascript
// Single Jeopardy
- 1 Daily Double only
- Rows 2-5 (indices 1-4): $400-$1000
- Never in row 1 (index 0): $200

// Double Jeopardy
- 2 Daily Doubles
- Both in rows 2-5 (indices 1-4): $800-$2000
- NEVER in row 1 (index 0): $400
- MUST be in different categories
- CAN be in same row (as long as different categories)
```

## Code Changes

### File: `src/Board.js`

**Function**: `generateDailyDoubles()`

#### Single Jeopardy (Unchanged)
```javascript
const category = Math.floor(Math.random() * 6) + 1; // Category 1-6
const location = Math.floor(Math.random() * 4) + 2; // Row 2-5 (skip $200)
```

#### Double Jeopardy (Fixed)
```javascript
// First Daily Double
const firstCategory = Math.floor(Math.random() * 6) + 1; // Category 1-6
const firstLocation = Math.floor(Math.random() * 4) + 2; // Row 2-5 (skip $400)

// Second Daily Double
let secondCategory;
do {
  secondCategory = Math.floor(Math.random() * 6) + 1;
} while (secondCategory === firstCategory); // Different category required

const secondLocation = Math.floor(Math.random() * 4) + 2; // Row 2-5 (skip $400)
// Note: Can be same row as first, that's OK!
```

## Key Changes

### 1. Removed "Different Row" Requirement
**Before**: Tried to force Daily Doubles into different rows  
**After**: Allows same row (which matches real Jeopardy!)

**Rationale**: In actual Jeopardy!, two Daily Doubles can be in the same row (e.g., both in $1600 row) as long as they're in different categories.

### 2. Stricter Category Enforcement
**Before**: Allowed same category after 20 attempts  
**After**: Never allows same category (will retry until different)

**Rationale**: This should never take more than a few attempts with 6 categories.

### 3. Better Validation Logging
Added error logging to catch rule violations:
```javascript
if (categories[0] === categories[1]) {
  console.error('❌ ERROR: Both Daily Doubles in same category!');
}
if (locations[0] === 1 || locations[1] === 1) {
  console.error('❌ ERROR: Daily Double in $400 row!');
}
```

## Row Index Mapping

### Single Jeopardy
| Row Index | Display Row | Value | Daily Double Allowed? |
|-----------|-------------|-------|----------------------|
| 0 | Row 1 | $200 | ❌ NO |
| 1 | Row 2 | $400 | ✅ YES |
| 2 | Row 3 | $600 | ✅ YES |
| 3 | Row 4 | $800 | ✅ YES |
| 4 | Row 5 | $1000 | ✅ YES |

### Double Jeopardy
| Row Index | Display Row | Value | Daily Double Allowed? |
|-----------|-------------|-------|----------------------|
| 0 | Row 1 | $400 | ❌ NO |
| 1 | Row 2 | $800 | ✅ YES |
| 2 | Row 3 | $1200 | ✅ YES |
| 3 | Row 4 | $1600 | ✅ YES |
| 4 | Row 5 | $2000 | ✅ YES |

## Examples

### Valid Daily Double Placements

#### Single Jeopardy ✅
```
Category 3, Row 4 ($800)
```

#### Double Jeopardy ✅
```
DD1: Category 2, Row 3 ($1200)
DD2: Category 5, Row 3 ($1200)  ← Same row, different category = OK!
```

```
DD1: Category 1, Row 2 ($800)
DD2: Category 4, Row 5 ($2000)  ← Different row, different category = OK!
```

### Invalid Daily Double Placements

#### Single Jeopardy ❌
```
Category 2, Row 1 ($200)  ← NO! Must avoid $200 row
```

#### Double Jeopardy ❌
```
DD1: Category 3, Row 1 ($400)  ← NO! Must avoid $400 row
DD2: Category 5, Row 4 ($1600)
```

```
DD1: Category 2, Row 3 ($1200)
DD2: Category 2, Row 5 ($2000)  ← NO! Same category not allowed
```

## Testing

### Check Console Logs
When starting a game, you'll see:
```
🎲 Generating Daily Doubles for Jeopardy round...
  Daily Double #1: Category 4, Row 3 ($600)
✓ Daily Doubles generated for Jeopardy
```

```
🎲 Generating Daily Doubles for Double Jeopardy round...
  Daily Double #1: Category 2, Row 4 ($1600)
  Daily Double #2: Category 5, Row 3 ($1200)
✓ Daily Doubles generated for Double Jeopardy
```

### Error Detection
If rules are violated (shouldn't happen), you'll see:
```
❌ ERROR: Both Daily Doubles in same category!
❌ ERROR: Daily Double in $400 row (row index 1)!
```

## Summary

✅ **Single Jeopardy**: 1 Daily Double, rows 2-5 ($400-$1000)  
✅ **Double Jeopardy**: 2 Daily Doubles, rows 2-5 ($800-$2000)  
✅ **Different categories**: Always enforced  
✅ **Avoid lowest value**: $200 in Single, $400 in Double  
✅ **Same row OK**: As long as different categories  

Daily Double placement now matches authentic Jeopardy! rules! 🎯





