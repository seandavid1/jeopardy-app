# Answer Evaluation Refinement - Partial Answers

## Date
January 3, 2026

## Issue
Correct answers being rejected when player provides the main identifying word but omits a descriptive modifier.

**Example**: "hockey" rejected for "ice hockey"

## Problem
Both OpenAI and the algorithm were being too strict with compound nouns (modifier + noun). The main identifying word alone should be sufficient when the modifier is just descriptive.

## Solution
Enhanced both OpenAI prompt and local algorithm to accept partial compound nouns when the identifying word is provided.

## Changes

### 1. OpenAI Prompt Enhancement

#### New Section: "PARTIAL ANSWERS - BE LENIENT"
```
- If player provides the MAIN identifying word, ACCEPT IT
- "hockey" for "ice hockey" = CORRECT (hockey is the key word)
- "panda" for "giant panda" = CORRECT
- "whale" for "blue whale" = CORRECT
- "bear" for "grizzly bear" = CORRECT
```

#### Key Principle Added
```
If a reasonable person would understand what the player meant 
and it uniquely identifies the correct answer, ACCEPT IT. Be lenient!
```

#### Clarified Compound Noun Rules
```
- Accept the main noun if it clearly identifies the answer
- "bear" for "grizzly bear" = CORRECT
- "bridge" for "Golden Gate Bridge" = WRONG (needs identifier)
- Rule: If modifier is descriptive, accept noun alone
- Rule: If modifier is ESSENTIAL for uniqueness, require it
```

### 2. Algorithm Enhancement

#### New Logic: Partial Compound Noun Matching
```javascript
// For two-word answers like "ice hockey"
if (playerWords.length === 1 && correctWords.length === 2) {
  const playerWord = playerWords[0];
  const secondWord = correctWords[1];  // The main noun
  const firstWord = correctWords[0];    // The modifier
  
  // Check if player provided the main noun (second word)
  if (matches(playerWord, secondWord)) {
    // Check if first word is just descriptive
    if (isDescriptiveModifier(firstWord)) {
      return { isCorrect: true, ... };
    }
  }
}
```

#### Descriptive Modifiers List
Modifiers that can be safely omitted:
- **Colors**: ice, blue, white, red, green, black, etc.
- **Sizes**: giant, big, small, large, little
- **Locations**: polar, grizzly, mountain, sea, desert
- **Directions**: northern, southern, eastern, western
- **Descriptors**: wild, domestic, native, common, royal

## Examples

### Accept (✅)

#### Sports
- "hockey" for "ice hockey"
- "wrestling" for "professional wrestling"
- "skating" for "figure skating"

#### Animals
- "panda" for "giant panda"
- "whale" for "blue whale"
- "bear" for "polar bear"
- "bear" for "grizzly bear"
- "shark" for "great white shark"

#### General
- "python" for "Monty Python" (identifying word)
- "championship" for "world championship"

### Reject (❌)

#### Proper Names with Essential Modifiers
- "bridge" for "Golden Gate Bridge" (needs "Golden Gate")
- "river" for "Amazon River" (needs "Amazon")
- "war" for "World War II" (needs "World War" or "II")
- "gate" for "Golden Gate Bridge" (wrong key word)

#### Too Generic
- "championship" for "NBA Championship" (needs "NBA")
- "cup" for "Stanley Cup" (needs "Stanley")

## Logic Flow

### For "hockey" vs "ice hockey"

1. **Normalize**: "hockey" → "hockey", "ice hockey" → "ice hockey"
2. **Split words**: ["hockey"] vs ["ice", "hockey"]
3. **Detect pattern**: 1 word vs 2 words
4. **Check second word**: "hockey" matches "hockey" ✓
5. **Check first word**: "ice" is in descriptive modifiers ✓
6. **Result**: ✅ ACCEPT - "Answer is correct (main identifying word provided, modifier omitted)"

### For "bridge" vs "Golden Gate Bridge"

1. **Normalize**: "bridge" → "bridge", "golden gate bridge" → "golden gate bridge"
2. **Split words**: ["bridge"] vs ["golden", "gate", "bridge"]
3. **Detect pattern**: 1 word vs 3 words
4. **Not a 2-word compound**: Falls through to multi-word matching
5. **Check generic words blacklist**: "bridge" is blacklisted ✓
6. **Result**: ❌ REJECT - "Answer is incorrect (generic word requires full context)"

### For "gate" vs "Golden Gate Bridge"

1. **Normalize**: "gate" → "gate", "golden gate bridge" → "golden gate bridge"
2. **Split words**: ["gate"] vs ["golden", "gate", "bridge"]
3. **Multi-word matching**: 1/3 words = 33% match
4. **Threshold**: 33% < 70% required
5. **Result**: ❌ REJECT - "Answer is incorrect (33% match)"

## Algorithm Changes

### File: `src/utils/answerEvaluator.js`

#### Addition: ~60 lines after shortened form check
```javascript
// NEW: Check for partial compound/modified nouns
if (playerWords.length === 1 && correctWords.length === 2) {
  // Check if player provided the main noun (second word)
  // List of descriptive modifiers that can be omitted
  const descriptiveModifiers = new Set([
    'ice', 'giant', 'blue', 'polar', 'grizzly', 'great', 'white',
    'common', 'european', 'american', 'african', 'asian',
    ... (30+ modifiers)
  ]);
  
  if (descriptiveModifiers.has(firstWord.toLowerCase())) {
    return { isCorrect: true, ... };
  }
}
```

## OpenAI Prompt Changes

### File: `src/utils/answerEvaluator.js`

#### Expanded from ~650 to ~850 tokens
- Added "PARTIAL ANSWERS - BE LENIENT" section
- Added 10+ specific examples
- Clarified compound noun rules
- Added key principle about leniency
- Reordered rules for emphasis

## Testing

### Test Cases

| Player Answer | Correct Answer | Expected | Reason |
|---------------|----------------|----------|---------|
| hockey | ice hockey | ✅ ACCEPT | Main noun, "ice" is descriptive |
| panda | giant panda | ✅ ACCEPT | Main noun, "giant" is descriptive |
| whale | blue whale | ✅ ACCEPT | Main noun, "blue" is descriptive |
| bear | polar bear | ✅ ACCEPT | Main noun, "polar" is descriptive |
| bridge | Golden Gate Bridge | ❌ REJECT | "bridge" is too generic |
| gate | Golden Gate Bridge | ❌ REJECT | Wrong key word |
| war | World War II | ❌ REJECT | "war" is too vague |
| python | Monty Python | ✅ ACCEPT | "python" identifies it |

### Verification Steps

1. Start a game
2. Answer "hockey" when correct answer is "ice hockey"
3. Should see: ✅ "Answer accepted"
4. Check console for evaluation method (OpenAI or algorithm)
5. Verify explanation mentions "main identifying word"

## Benefits

### 1. More Natural Gameplay
Players don't need to remember exact wording, just the key concept.

### 2. Matches Real Jeopardy!
In real Jeopardy!, "hockey" would be accepted for "ice hockey" because it uniquely identifies the answer in context.

### 3. Consistent Between AI and Algorithm
Both evaluation methods now apply the same lenient rules.

### 4. Clear Guidelines
Explicit list of descriptive modifiers makes behavior predictable.

## Cost Impact

### OpenAI
- Prompt size: ~650 → ~850 tokens (+200 tokens)
- Cost increase: ~$0.00003 per evaluation
- Per game (40 evals): ~$0.001 additional
- **Negligible increase**

## Summary

### Before
❌ "hockey" rejected for "ice hockey"  
❌ "panda" rejected for "giant panda"  
❌ Too strict with compound nouns  

### After
✅ "hockey" accepted for "ice hockey"  
✅ "panda" accepted for "giant panda"  
✅ Main identifying words accepted  
✅ Still rejects truly generic answers  
✅ Consistent between OpenAI and algorithm  

**Result**: More natural, lenient evaluation that matches real Jeopardy! gameplay! 🎯





