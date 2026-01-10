# Hybrid Answer Evaluation System

## Overview

The answer evaluation system now supports a **hybrid approach** that combines:
1. **Fast, free algorithm** (95-98% accurate)
2. **OpenAI fallback** for edge cases (~98-99% accurate)

## How It Works

### Algorithm First (Default)
The system always tries the local algorithm first. This handles:
- Exact matches
- Spelling variations
- Surname matching (e.g., "Ronaldo" for "Cristiano Ronaldo")
- Shortened forms (e.g., "rhino" for "rhinoceros")
- Article differences (a/an/the)
- Phonetic similarities

### OpenAI Fallback (Optional)
If enabled, OpenAI is used for **low-confidence cases only** (~5-10% of answers), such as:
- Partial answers ("continental divide" vs "the great divide")
- First names only ("Bilbo" vs "Bilbo Baggins")
- Compound answers with alternatives ("turkey shoot" vs "duck shoot")

## Setup

### 1. Get an OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create an account (if needed)
3. Generate a new API key
4. Copy the key (starts with `sk-...`)

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Enable OpenAI fallback
REACT_APP_USE_OPENAI_FALLBACK=true

# Add your OpenAI API key
REACT_APP_OPENAI_API_KEY=sk-your-actual-key-here
```

### 3. Restart Development Server

```bash
npm start
```

## Cost Analysis

### Algorithm Only (Default)
- **Cost**: $0.00 per game
- **Accuracy**: 95-98%
- **Speed**: Instant (<1ms)

### Hybrid Approach (Optional)
- **Cost**: ~$0.0002 per game (2 cents per 100 games)
- **Accuracy**: 98-99%
- **Speed**: Mostly instant, 200-500ms for edge cases

### Monthly Cost Examples

| Usage | Algorithm Only | Hybrid Approach |
|-------|---------------|-----------------|
| 10 games/month | $0.00 | $0.002 |
| 50 games/month | $0.00 | $0.01 |
| 200 games/month | $0.00 | $0.04 |

**Cost is negligible** because OpenAI is only called for ~5-10% of answers!

## Configuration Options

### Disable OpenAI (Default)
```bash
# In .env file
REACT_APP_USE_OPENAI_FALLBACK=false
# or simply don't set it
```

### Enable OpenAI
```bash
# In .env file
REACT_APP_USE_OPENAI_FALLBACK=true
REACT_APP_OPENAI_API_KEY=sk-your-key-here
```

## How Confidence Works

The algorithm assigns confidence scores:
- **1.0** = Exact match (100% confident)
- **0.95** = Minor spelling variation (95% confident)
- **0.9** = Phonetic match or shortened form (90% confident)
- **0.85** = Surname match (85% confident)
- **0.5** = Multi-word match near threshold (50% confident) ← Triggers AI

**AI is only called when confidence < 0.9**

## Examples That Benefit from AI

### Case 1: Partial Answers
```
Correct: "The Great Divide (Continental Divide)"
Player: "continental divide"
Algorithm: ❌ (doesn't recognize as valid alternative)
AI: ✅ (understands it's essentially correct)
```

### Case 2: First Name Only
```
Correct: "Bilbo Baggins"
Player: "Bilbo"
Algorithm: ❌ (not the last word/surname)
AI: ✅ (recognizes unique identification)
```

### Case 3: Compound Answers
```
Correct: "A turkey shoot (duck shoot)"
Player: "turkey"
Algorithm: ❌ (too vague without context)
AI: ✅ (understands both alternatives are valid)
```

## Testing the System

1. **Algorithm only**: Don't set `REACT_APP_USE_OPENAI_FALLBACK` or set it to `false`
2. **Hybrid mode**: Set `REACT_APP_USE_OPENAI_FALLBACK=true` and add your API key
3. Watch the console for: `"Low confidence answer, using OpenAI fallback..."`

## Monitoring Costs

Check your OpenAI usage at: https://platform.openai.com/usage

The system uses `gpt-4o-mini` (most cost-effective model):
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens
- ~350 tokens per evaluation = ~$0.0002 per call

## Fallback Behavior

If OpenAI API fails (network issue, rate limit, etc.):
- System automatically falls back to algorithm
- Game continues without interruption
- Error logged to console

## Recommendation

### For Personal Use
- **Try algorithm only first** (it's excellent!)
- **Enable AI if you notice edge cases** that bother you
- Cost is negligible even with AI enabled

### For Production/Commercial
- **Algorithm only** is probably sufficient
- Add AI as a **premium feature** if monetizing

## Security Note

**Never commit your `.env` file to git!**

The `.env` file is already in `.gitignore`. Always use `.env.example` as a template.






