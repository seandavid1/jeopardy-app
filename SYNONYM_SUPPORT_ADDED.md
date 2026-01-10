# Synonym Support Added to Answer Evaluation

## Date
January 3, 2026

## Issue
Synonyms being rejected as incorrect answers.

**Example**: "lawyer" marked wrong for "attorney"

## Problem
The evaluation system (both OpenAI and algorithm) wasn't recognizing that many correct answers have equivalent terms that mean the same thing.

## Solution
Added explicit synonym recognition to both OpenAI prompt and local algorithm.

## Changes

### 1. OpenAI Prompt - New Rule #1

```
1. SYNONYMS AND EQUIVALENT TERMS
   - Accept synonyms and equivalent terms as correct
   - "lawyer" = "attorney" (CORRECT - same profession)
   - "car" = "automobile" = "vehicle" (CORRECT - synonyms)
   - "doctor" = "physician" (CORRECT - same profession)
   - "couch" = "sofa" (CORRECT - same object)
   - "movie" = "film" (CORRECT - synonyms)
   - "ocean" = "sea" (CORRECT in most contexts)
   - Use common sense - if terms mean the same thing, accept them
```

**Position**: Made this Rule #1 (moved articles to #2) to emphasize its importance.

### 2. Algorithm - Synonym Pairs List

Added comprehensive list of common synonym pairs that are checked early in the evaluation:

```javascript
const synonymPairs = [
  ['lawyer', 'attorney'],
  ['car', 'automobile'],
  ['vehicle', 'car'],
  ['doctor', 'physician'],
  ['couch', 'sofa'],
  ['movie', 'film'],
  ['ocean', 'sea'],
  ['jail', 'prison'],
  ['cop', 'police'],
  ['officer', 'police'],
  ['boat', 'ship'],
  ['vessel', 'ship'],
  ['house', 'home'],
  ['street', 'road'],
  ['highway', 'road'],
  // ... (30+ pairs)
];
```

## Synonym Categories

### Professions
- lawyer ↔ attorney
- doctor ↔ physician
- cop ↔ police ↔ officer

### Vehicles
- car ↔ automobile ↔ vehicle
- boat ↔ ship ↔ vessel

### Locations
- ocean ↔ sea
- street ↔ road ↔ highway
- house ↔ home

### Objects
- couch ↔ sofa
- movie ↔ film ↔ picture
- jail ↔ prison

## Logic Flow

### For "lawyer" vs "attorney"

1. **Normalize**: "lawyer" → "lawyer", "attorney" → "attorney"
2. **Remove articles**: No articles to remove
3. **Exact match**: "lawyer" ≠ "attorney" ✗
4. **Check synonyms**: 
   - Found pair: ['lawyer', 'attorney']
   - Match found! ✓
5. **Result**: ✅ ACCEPT - "Answer is correct (accepted synonym)"

### For "car" vs "automobile"

1. **Normalize**: "car" → "car", "automobile" → "automobile"
2. **Exact match**: "car" ≠ "automobile" ✗
3. **Check synonyms**:
   - Found pair: ['car', 'automobile']
   - Match found! ✓
4. **Result**: ✅ ACCEPT - "Answer is correct (accepted synonym)"

## Algorithm Implementation

### File: `src/utils/answerEvaluator.js`

**Location**: Added immediately after article removal, before edit distance checks

```javascript
// Check for common synonyms (single word answers)
const synonymPairs = [ /* ... */ ];

for (const [word1, word2] of synonymPairs) {
  if ((playerWithoutLeadingArticle === word1 && correctWithoutLeadingArticle === word2) ||
      (playerWithoutLeadingArticle === word2 && correctWithoutLeadingArticle === word1)) {
    return {
      isCorrect: true,
      explanation: 'Answer is correct (accepted synonym)',
      confidence: 1.0
    };
  }
}
```

**Why early in the chain**: 
- Synonyms are exact equivalents (100% confidence)
- No need for fuzzy matching or partial answer logic
- Faster execution (avoids unnecessary checks)

## OpenAI Prompt Update

### Emphasis
Made synonyms Rule #1 to emphasize their importance. This signals to OpenAI that synonym matching is a top priority.

### Examples Added
```
✅ "lawyer" for "attorney" (synonyms)
✅ "car" for "automobile" (synonyms)
✅ "doctor" for "physician" (synonyms)
✅ "couch" for "sofa" (synonyms)
```

### Instruction
> "Use common sense - if terms mean the same thing, accept them"

This gives OpenAI flexibility to recognize synonyms not in our explicit list.

## Testing

### Test Cases

| Player Answer | Correct Answer | Expected | Explanation |
|---------------|----------------|----------|-------------|
| lawyer | attorney | ✅ ACCEPT | Same profession |
| attorney | lawyer | ✅ ACCEPT | Same profession (reversed) |
| car | automobile | ✅ ACCEPT | Synonyms |
| vehicle | car | ✅ ACCEPT | Synonym for car |
| doctor | physician | ✅ ACCEPT | Same profession |
| couch | sofa | ✅ ACCEPT | Same furniture |
| movie | film | ✅ ACCEPT | Synonyms |
| ocean | sea | ✅ ACCEPT | Same body of water |
| cop | police | ✅ ACCEPT | Same profession |
| jail | prison | ✅ ACCEPT | Same facility |

### Edge Cases

| Player Answer | Correct Answer | Expected | Notes |
|---------------|----------------|----------|-------|
| police officer | officer | ✅ ACCEPT | Partial match rules |
| blue car | automobile | ✅ ACCEPT | Partial + synonym |
| the lawyer | attorney | ✅ ACCEPT | Article + synonym |
| lawyers | attorney | ⚠️ DEPENDS | Plural handling (OpenAI better) |

## Extensibility

### Adding New Synonyms

To add more synonym pairs, simply update the `synonymPairs` array:

```javascript
const synonymPairs = [
  // ... existing pairs ...
  ['newword1', 'newword2'],  // Add new pair
  ['newword2', 'newword1'],  // Add reverse for bidirectional matching
];
```

### Common Synonyms to Consider Adding

**Science Terms**:
- scientist ↔ researcher
- experiment ↔ test
- hypothesis ↔ theory (context-dependent)

**Geography**:
- mountain ↔ peak (context-dependent)
- valley ↔ gorge
- lake ↔ pond (size-dependent)

**Food**:
- dinner ↔ supper
- soda ↔ pop
- cookie ↔ biscuit (regional)

**Sports**:
- soccer ↔ football (regional)
- game ↔ match (context-dependent)

**Note**: Some synonyms are context or region-dependent. OpenAI can handle these better than a static list.

## Benefits

### 1. More Accurate Evaluation
Players aren't penalized for using correct equivalent terms.

### 2. Fairer Gameplay
"Lawyer" and "Attorney" are exactly equivalent - rejecting one is unfair.

### 3. Regional Variations
Handles regional differences (soccer/football, soda/pop).

### 4. Professional Terms
Many professions have multiple correct names.

### 5. Better User Experience
Players don't need to guess which synonym the question writer used.

## Limitations

### Algorithm Limitations
- Static list (~30 pairs)
- Can't understand context
- Doesn't handle multi-word synonyms well
- Requires manual updates

### OpenAI Advantages
- Understands context
- Recognizes unlisted synonyms
- Handles regional variations
- Better with multi-word phrases

**Recommendation**: Keep algorithm for common synonyms (fast, free), rely on OpenAI for complex cases.

## Performance Impact

### Algorithm
- Added ~30 synonym checks before edit distance
- Each check is O(1) comparison
- Negligible performance impact (<1ms)

### OpenAI
- Added ~150 tokens to prompt (synonym examples)
- Cost increase: ~$0.000015 per evaluation
- Per game (40 evals): ~$0.0006 additional
- **Negligible cost increase**

## Examples in Action

### Profession Synonyms
```
Category: "Legal Professionals"
Correct: "attorney"
Player: "lawyer"
Result: ✅ "Answer is correct (accepted synonym)"
```

### Vehicle Synonyms
```
Category: "Transportation"
Correct: "automobile"
Player: "car"
Result: ✅ "Answer is correct (accepted synonym)"
```

### Location Synonyms
```
Category: "Bodies of Water"
Correct: "ocean"
Player: "sea"
Result: ✅ "Answer is correct (accepted synonym)"
```

## Summary

### Before
❌ "lawyer" rejected for "attorney"  
❌ "car" rejected for "automobile"  
❌ Equivalent terms treated as wrong  

### After
✅ "lawyer" accepted for "attorney"  
✅ "car" accepted for "automobile"  
✅ ~30 common synonym pairs recognized  
✅ OpenAI understands even more synonyms  
✅ Fairer evaluation for players  

### Statistics
- **Synonym pairs added**: 30+
- **New rule position**: #1 (highest priority)
- **Performance impact**: <1ms
- **Cost impact**: ~$0.0006 per game
- **Confidence level**: 1.0 (100% - exact equivalents)

**Result**: Much fairer and more accurate answer evaluation! 🎯





