// OpenAI API evaluation for edge cases
const openAIEvaluation = async (playerAnswer, correctAnswer, category = '', clueText = '') => {
  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  
  // Log what we're sending to OpenAI
  console.log('📤 Sending to OpenAI:', {
    playerAnswer,
    correctAnswer,
    category,
    clueText
  });
  
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not found, falling back to algorithm');
    return {
      ...localComparison(playerAnswer, correctAnswer),
      usedAI: false
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Most cost-effective model
        messages: [
          {
            role: 'system',
            content: `You are a Jeopardy! answer evaluator. Your job is to determine if a player's answer should be accepted as correct. BE LENIENT - if the player provides the key identifying information, accept it.

CRITICAL RULES - ALWAYS APPLY:

1. ABBREVIATIONS
   - ALWAYS accept abbreviations and their expanded forms as equivalent
   - "St. Moritz" = "Saint Moritz" (CORRECT - same place)
   - "Dr. Smith" = "Doctor Smith" (CORRECT - same person)
   - "Mt. Everest" = "Mount Everest" (CORRECT - same mountain)
   - "St. Louis" = "Saint Louis" (CORRECT - same city)
   - "Ave" = "Avenue", "St" = "Street", "Rd" = "Road" (CORRECT)
   - "US" = "United States", "UK" = "United Kingdom" (CORRECT)
   - "Jr" = "Junior", "Sr" = "Senior" (CORRECT)
   - Accept with or without periods (St. = St = Saint)

2. SYNONYMS AND EQUIVALENT TERMS
   - Accept synonyms and equivalent terms as correct
   - "lawyer" = "attorney" (CORRECT - same profession)
   - "car" = "automobile" = "vehicle" (CORRECT - synonyms)
   - "doctor" = "physician" (CORRECT - same profession)
   - "couch" = "sofa" (CORRECT - same object)
   - "movie" = "film" (CORRECT - synonyms)
   - "ocean" = "sea" (CORRECT in most contexts)
   - Use common sense - if terms mean the same thing, accept them

3. ARTICLES (a/an/the)
   - ALWAYS IGNORE article differences
   - "narwhal" = "a narwhal" = "the narwhal" (ALL CORRECT)
   - "United States" = "The United States" (CORRECT)
   - Articles are NEVER a reason to reject an answer

4. PARTIAL ANSWERS - BE LENIENT
   - If player provides the MAIN identifying word, ACCEPT IT
   - "hockey" for "ice hockey" = CORRECT (hockey is the key word)
   - "panda" for "giant panda" = CORRECT (panda is the key word)
   - "python" for "Monty Python" = CORRECT (python identifies it)
   - "Shakespeare" for "William Shakespeare" = CORRECT
   - "whale" for "blue whale" = CORRECT (whale is the key word)
   - "championship" for "world championship" = CORRECT
   - Only reject if the missing word is ESSENTIAL to uniqueness
   
5. COMPOUND/MODIFIED NOUNS
   - Accept the main noun if it clearly identifies the answer
   - "bear" for "grizzly bear" = CORRECT
   - "bridge" for "Golden Gate Bridge" = WRONG (bridge is too generic, needs identifier)
   - "war" for "World War II" = WRONG (war is too vague, needs identifier)
   - Rule: If the modifier is just descriptive (giant, ice, blue), accept the noun alone
   - Rule: If the modifier is ESSENTIAL for uniqueness (Golden Gate, World War), require it

6. SPELLING VARIATIONS
   - Accept minor spelling mistakes (1-2 character differences)
   - Accept phonetic spellings (e.g., "farmacy" for "pharmacy")
   - Accept C/K equivalence at word start (e.g., "Catniss" for "Katniss" = CORRECT)
   - Accept C/K/G/J equivalence when they make the same sound
   - **CRITICAL: Accept phonetically identical answers** (e.g., "man" for "Mann" = CORRECT)
   - Accept proper name variations if they sound the same (e.g., "Smith" = "Smythe", "Jon" = "John")
   - For short words (≤4 chars), be lenient with spelling if phonetically identical
   - For longer words, be more lenient (2-3 char differences OK)

7. SURNAMES ALONE
   - Accept last names alone for people (e.g., "Ronaldo" for "Cristiano Ronaldo")
   - Accept first names for very famous single-name people (e.g., "Madonna")
   - Reject generic words as standalone answers (e.g., "bridge" alone is too vague)

8. SHORTENED FORMS
   - Accept common abbreviations and nicknames (e.g., "rhino" for "rhinoceros")
   - Accept if shortened form is at least 40% of full word and clearly identifies it
   - "hippo" for "hippopotamus" = CORRECT
   - "croc" for "crocodile" = CORRECT

9. QUESTION WORDS
   - Ignore "what/who/where/when/why/how is/are/was/were"
   - "what is a narwhal" = "narwhal" (CORRECT)

10. PUNCTUATION & FORMATTING
   - Ignore all punctuation differences
   - Ignore capitalization differences
   - Ignore extra spaces

11. MULTI-WORD ANSWERS
    - If player provides 70%+ of the key words, accept it
    - If player provides the ESSENTIAL identifying words, accept it
    - "continental divide" for "the great divide" = CORRECT (identifies it)
    - "Statue Liberty" for "Statue of Liberty" = CORRECT (has key words)

12. CONTEXT MATTERS
    - Consider the category when evaluating
    - In "Winter Sports", "hockey" clearly means ice hockey
    - In "African Animals", "lion" is enough (don't need "African lion")
    - In "U.S. Presidents", "Washington" is enough

13. CLUE PROVIDES CONTEXT - CRITICAL JEOPARDY RULE
    - **If the clue itself contains part of the answer, that part is INFERRED**
    - Player does NOT need to repeat what's already in the clue
    - Examples:
      * Clue: "This kind of house..." Answer: "Gingerbread House" → "Gingerbread" = CORRECT (house is in clue)
      * Clue: "This type of whale..." Answer: "Blue Whale" → "Blue" = CORRECT (whale is in clue)
      * Clue: "This Shakespeare play..." Answer: "Macbeth" → "Macbeth" = CORRECT (play is implied)
      * Clue: "This U.S. President..." Answer: "George Washington" → "Washington" = CORRECT (President in clue)
    - Rule: Player only needs to provide NEW information not already stated in clue
    - This is a FUNDAMENTAL Jeopardy! rule - clues provide context

14. REJECT ONLY IF:
    - Answer is too vague to uniquely identify (e.g., "bridge" alone, "war" alone)
    - Answer could refer to multiple different things without context
    - Answer contradicts the correct answer
    - Answer is completely unrelated

KEY PRINCIPLE: 
If a reasonable person would understand what the player meant and it uniquely identifies the correct answer, ACCEPT IT. Be lenient!

EXAMPLES - ACCEPT THESE:
✅ "Saint Moritz" for "St. Moritz" (abbreviation expanded)
✅ "St. Moritz" for "Saint Moritz" (abbreviation)
✅ "Doctor Smith" for "Dr. Smith" (abbreviation expanded)
✅ "Mount Everest" for "Mt. Everest" (abbreviation expanded)
✅ "lawyer" for "attorney" (synonyms)
✅ "car" for "automobile" (synonyms)
✅ "doctor" for "physician" (synonyms)
✅ "couch" for "sofa" (synonyms)
✅ "hockey" for "ice hockey" (hockey is the identifying word)
✅ "panda" for "giant panda" (panda identifies it)
✅ "narwhal" for "the narwhal" (ignore articles)
✅ "whale" for "blue whale" (whale is identifying word)
✅ "bear" for "polar bear" (bear is identifying word)
✅ "python" for "Monty Python" (python identifies it)
✅ "rhino" for "rhinoceros" (shortened form)
✅ "Da Vinci" for "Leonardo da Vinci" (surname)
✅ "Einstein" for "Albert Einstein" (surname)
✅ "farmacy" for "pharmacy" (spelling)
✅ "championship" for "world championship" (key word)
✅ "man" for "Mann" (phonetically identical - proper name)
✅ "Jon" for "John" (phonetically identical - name variation)
✅ "Smith" for "Smythe" (phonetically identical)
✅ "Gingerbread" for "Gingerbread House" when clue says "This kind of house" (house in clue)
✅ "Blue" for "Blue Whale" when clue says "This type of whale" (whale in clue)
✅ "Macbeth" for "Macbeth (play)" when clue mentions Shakespeare play (play implied)

EXAMPLES - REJECT THESE:
❌ "bridge" for "Golden Gate Bridge" (bridge alone is too generic - needs "Golden Gate")
❌ "river" for "Amazon River" (river alone is too generic - needs "Amazon")
❌ "war" for "World War II" (war alone is too vague - needs "World War" or "II")
❌ "gate" for "Golden Gate Bridge" (wrong key word)

Respond with ONLY a JSON object in this exact format:
{"isCorrect": true/false, "explanation": "brief explanation"}`
          },
          {
            role: 'user',
            content: `Category: ${category}
${clueText ? `Clue: "${clueText}"\n` : ''}Player's Answer: "${playerAnswer}"
Correct Answer: "${correctAnswer}"

Should this be accepted?`
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    console.log('✅ OpenAI raw response:', content);
    
    // Parse the JSON response
    const result = JSON.parse(content);
    
    console.log('✅ OpenAI parsed result:', result);
    
    return {
      isCorrect: result.isCorrect,
      explanation: `${result.explanation} (AI-evaluated)`,
      confidence: 1.0,
      usedAI: true
    };
  } catch (error) {
    console.error('❌ OpenAI evaluation failed:', error);
    console.log('Falling back to local algorithm');
    // Fall back to algorithm and mark that AI was not used
    return {
      ...localComparison(playerAnswer, correctAnswer),
      usedAI: false
    };
  }
};

// Local comparison function - no external API calls required
const localComparison = (playerAnswer, correctAnswer) => {
  // Add debug logging
  console.log('🔍 Local comparison:', { playerAnswer, correctAnswer });
  
  const normalize = (str) => {
    return str.toLowerCase()
      .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, '') // Remove punctuation (including ?)
      .replace(/\s{2,}/g, ' ') // Remove extra spaces
      .replace(/^(what|who|where|when|why|how)(\s+is|\s+are|\s+was|\s+were|'s|'re)?\s*/i, '') // Remove question words
      .trim();
  };
  
  // Expand common abbreviations for better matching
  const expandAbbreviations = (str) => {
    let expanded = str;
    // Common title abbreviations
    expanded = expanded.replace(/\bst\b/gi, 'saint');
    expanded = expanded.replace(/\bdr\b/gi, 'doctor');
    expanded = expanded.replace(/\bmt\b/gi, 'mount');
    expanded = expanded.replace(/\bmr\b/gi, 'mister');
    expanded = expanded.replace(/\bmrs\b/gi, 'missus');
    expanded = expanded.replace(/\bms\b/gi, 'miss');
    expanded = expanded.replace(/\bjr\b/gi, 'junior');
    expanded = expanded.replace(/\bsr\b/gi, 'senior');
    // Location abbreviations
    expanded = expanded.replace(/\bave\b/gi, 'avenue');
    expanded = expanded.replace(/\bst\b/gi, 'street'); // Note: This will also catch "st" from saint, but that's ok
    expanded = expanded.replace(/\brd\b/gi, 'road');
    expanded = expanded.replace(/\bblvd\b/gi, 'boulevard');
    expanded = expanded.replace(/\bln\b/gi, 'lane');
    expanded = expanded.replace(/\bdr\b/gi, 'drive'); // Note: overlaps with doctor
    expanded = expanded.replace(/\bct\b/gi, 'court');
    expanded = expanded.replace(/\bpkwy\b/gi, 'parkway');
    // Country/Region abbreviations
    expanded = expanded.replace(/\bus\b/gi, 'united states');
    expanded = expanded.replace(/\busa\b/gi, 'united states');
    expanded = expanded.replace(/\buk\b/gi, 'united kingdom');
    expanded = expanded.replace(/\bussr\b/gi, 'soviet union');
    // Other common abbreviations
    expanded = expanded.replace(/\bft\b/gi, 'fort');
    expanded = expanded.replace(/\bpt\b/gi, 'point');
    expanded = expanded.replace(/\bisland\b/gi, 'isle');
    return expanded;
  };
  
  // Remove ONLY leading articles per Jeopardy rules
  // Articles are always ignored, even if they're different
  // This allows "a cat" to match "the cat", "A Catcher in the Rye" to match "The Catcher in the Rye", etc.
  const removeLeadingArticle = (str) => {
    return str.replace(/^(a|an|the)\s+/i, '').trim();
  };

  // Calculate edit distance (Levenshtein distance) for spelling tolerance
  const editDistance = (str1, str2) => {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j - 1] + 1, // substitution
            dp[i - 1][j] + 1,     // deletion
            dp[i][j - 1] + 1      // insertion
          );
        }
      }
    }
    return dp[m][n];
  };

  // Improved phonetic normalization for better spelling tolerance
  // Handles common phonetic equivalences in English
  const phoneticNormalize = (str) => {
    return str.toLowerCase()
      // Convert similar consonants
      .replace(/ph/g, 'f')
      .replace(/ck/g, 'k')
      .replace(/qu/g, 'kw')
      .replace(/x/g, 'ks')
      // Handle C/K equivalence (Catniss = Katniss)
      .replace(/c/g, 'k')
      // Handle y/i equivalence BEFORE vowel normalization
      .replace(/y/g, 'i')
      // Normalize vowel sounds that are commonly confused
      // Handle common vowel confusions in names (e/i, a/e, o/u)
      .replace(/[ei]/g, 'e')  // e and i sound similar
      .replace(/[aeiou]+/g, (match) => {
        // Keep the first vowel as representative of the sound
        return match[0];
      })
      // Normalize similar sounding consonants
      .replace(/[sz]/g, 's')
      .replace(/[gj]/g, 'k')  // g and j -> k (already normalized c->k above)
      .replace(/[dt]/g, 't')
      .replace(/[bp]/g, 'p')
      // Remove duplicate letters
      .replace(/(.)\1+/g, '$1');
  };

  const getWords = (str) => {
    return str.split(/\s+/).filter(word => word.length > 0);
  };

  const normalizedPlayer = normalize(playerAnswer);
  const normalizedCorrect = normalize(correctAnswer);
  
  // Expand abbreviations in both answers for comparison
  const expandedPlayer = expandAbbreviations(normalizedPlayer);
  const expandedCorrect = expandAbbreviations(normalizedCorrect);
  
  // Remove leading articles for comparison
  // Always ignore articles, even if they're different (per user request)
  const playerWithoutLeadingArticle = removeLeadingArticle(expandedPlayer);
  const correctWithoutLeadingArticle = removeLeadingArticle(expandedCorrect);

  // Exact match after normalization
  if (normalizedPlayer === normalizedCorrect) {
    return {
      isCorrect: true,
      explanation: 'Answer is correct (exact match)',
      confidence: 1.0
    };
  }
  
  // Check expanded versions (handles abbreviations)
  if (expandedPlayer === expandedCorrect) {
    return {
      isCorrect: true,
      explanation: 'Answer is correct (abbreviation accepted)',
      confidence: 1.0
    };
  }
  
  // Check if the rest matches after removing articles
  // Accept any match regardless of article differences
  if (playerWithoutLeadingArticle === correctWithoutLeadingArticle) {
    return {
      isCorrect: true,
      explanation: 'Answer is correct (exact match)',
      confidence: 1.0
    };
  }

  // Check for common synonyms (single word answers)
  // This catches cases like "lawyer" for "attorney", "car" for "automobile"
  const synonymPairs = [
    ['lawyer', 'attorney'],
    ['attorney', 'lawyer'],
    ['car', 'automobile'],
    ['automobile', 'car'],
    ['vehicle', 'car'],
    ['car', 'vehicle'],
    ['doctor', 'physician'],
    ['physician', 'doctor'],
    ['couch', 'sofa'],
    ['sofa', 'couch'],
    ['movie', 'film'],
    ['film', 'movie'],
    ['picture', 'movie'],
    ['movie', 'picture'],
    ['ocean', 'sea'],
    ['sea', 'ocean'],
    ['jail', 'prison'],
    ['prison', 'jail'],
    ['cop', 'police'],
    ['police', 'cop'],
    ['officer', 'police'],
    ['police', 'officer'],
    ['boat', 'ship'],
    ['ship', 'boat'],
    ['vessel', 'ship'],
    ['ship', 'vessel'],
    ['house', 'home'],
    ['home', 'house'],
    ['street', 'road'],
    ['road', 'street'],
    ['highway', 'road'],
    ['road', 'highway']
  ];
  
  // Check if player and correct answers are synonyms
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

  // Check if single word answers with edit distance (spelling tolerance)
  const playerWords = getWords(playerWithoutLeadingArticle);
  const correctWords = getWords(correctWithoutLeadingArticle);

  if (playerWords.length === 1 && correctWords.length === 1) {
    const distance = editDistance(playerWords[0], correctWords[0]);
    const maxLen = Math.max(playerWords[0].length, correctWords[0].length);
    const similarity = 1 - (distance / maxLen);
    
    // For very short words (≤4 chars), require exact match or very close similarity
    // This prevents "air" from matching "hair", "an" from matching "ban", etc.
    if (maxLen <= 4) {
      // Short words: only allow 1 character difference if similarity is very high
      // AND the edit is a substitution (not insertion/deletion which changes word structure)
      if (distance === 0) {
        return {
          isCorrect: true,
          explanation: `Answer is correct (exact match)`,
          confidence: 1.0
        };
      }
      if (distance === 1 && playerWords[0].length === correctWords[0].length && similarity >= 0.85) {
        // Only accept if same length (substitution only, not insertion/deletion)
        return {
          isCorrect: true,
          explanation: `Answer is correct (minor spelling variation accepted per Jeopardy rules)`,
          confidence: 0.95
        };
      }
    } else {
      // Longer words: more lenient with spelling - allow up to 2-3 character differences
      if (distance <= 2 || similarity >= 0.75) {
        return {
          isCorrect: true,
          explanation: `Answer is correct (minor spelling variation accepted per Jeopardy rules)`,
          confidence: 0.95
        };
      }
    }

    // Check phonetic similarity for spelling mistakes
    // Now also check for short words (3-4 chars) to handle cases like "man" vs "Mann"
    if (maxLen >= 3) {
      const phoneticPlayer = phoneticNormalize(playerWords[0]);
      const phoneticCorrect = phoneticNormalize(correctWords[0]);
      
      // For very short words (3-4 chars), only accept exact phonetic match
      // For longer words (5+ chars), be more lenient
      if (maxLen <= 4) {
        // Short words: require exact phonetic match after normalization
        if (phoneticPlayer === phoneticCorrect) {
          return {
            isCorrect: true,
            explanation: 'Answer is correct (phonetically identical, spelling differences allowed per Jeopardy rules)',
            confidence: 0.95
          };
        }
      } else {
        // Longer words: allow small phonetic distance
        const phoneticDistance = editDistance(phoneticPlayer, phoneticCorrect);
        const phoneticMaxLen = Math.max(phoneticPlayer.length, phoneticCorrect.length);
        
        if (phoneticDistance <= 1 || (phoneticMaxLen > 0 && phoneticDistance / phoneticMaxLen <= 0.25)) {
          return {
            isCorrect: true,
            explanation: 'Answer is correct (phonetically similar, spelling differences allowed per Jeopardy rules)',
            confidence: 0.9
          };
        }
      }
    }

  // Check for shortened/colloquial forms (e.g., "rhino" for "rhinoceros")
  // Accept if one word is a substantial prefix of the other
  const shorterWord = playerWords[0].length < correctWords[0].length ? playerWords[0] : correctWords[0];
  const longerWord = playerWords[0].length < correctWords[0].length ? correctWords[0] : playerWords[0];
  
  // Only check if the longer word is significantly longer (at least 7+ chars)
  // and the shorter word is at least 4 characters (to avoid "cat" matching "category")
  if (longerWord.length >= 7 && shorterWord.length >= 4) {
    // Check if shorter word is a prefix of the longer word
    if (longerWord.startsWith(shorterWord)) {
      // Accept if the shorter word is at least 40% of the longer word
      // This allows "croc" (44%), "hippo" (42%), "rhino" (55%), etc.
      const percentageMatch = shorterWord.length / longerWord.length;
      if (percentageMatch >= 0.40) {
        return {
          isCorrect: true,
          explanation: 'Answer is correct (accepted shortened form per Jeopardy rules)',
          confidence: 0.9
        };
      }
    }
  }
}

// NEW: Check for partial compound/modified nouns (e.g., "hockey" for "ice hockey")
// This handles cases where the player gives the main noun without the modifier
if (playerWords.length === 1 && correctWords.length === 2) {
  const playerWord = playerWords[0];
  
  // Check if player's word matches either word in the two-word answer
  // Common pattern: [modifier] [noun] where noun is the key identifier
  // Examples: "ice hockey", "giant panda", "blue whale", "grizzly bear"
  
  // Check if it matches the second word (usually the main noun)
  const secondWord = correctWords[1];
  const firstWord = correctWords[0];
  
  // Check against second word (the main noun)
  const distance = editDistance(playerWord, secondWord);
  const maxLen = Math.max(playerWord.length, secondWord.length);
  const similarity = 1 - (distance / maxLen);
  
  if (distance === 0 || (distance <= 2 && similarity >= 0.75)) {
    // Player provided the main noun (second word)
    // This is acceptable unless the first word is essential for uniqueness
    
    // List of modifiers that are just descriptive (can be omitted)
    const descriptiveModifiers = new Set([
      'ice', 'giant', 'blue', 'polar', 'grizzly', 'great', 'white',
      'common', 'european', 'american', 'african', 'asian',
      'red', 'green', 'black', 'yellow', 'brown', 'gray', 'grey',
      'big', 'small', 'little', 'large', 'short', 'long', 'tall',
      'wild', 'domestic', 'native', 'sea', 'mountain', 'desert',
      'northern', 'southern', 'eastern', 'western', 'central',
      'royal', 'imperial', 'national', 'world', 'international'
    ]);
    
    // If the first word is just descriptive, accept the noun alone
    if (descriptiveModifiers.has(firstWord.toLowerCase())) {
      return {
        isCorrect: true,
        explanation: 'Answer is correct (main identifying word provided, modifier omitted)',
        confidence: 0.9
      };
    }
    
    // Check if first word matches (in case they provided modifier instead of noun)
    const distanceFirst = editDistance(playerWord, firstWord);
    const maxLenFirst = Math.max(playerWord.length, firstWord.length);
    const similarityFirst = 1 - (distanceFirst / maxLenFirst);
    
    // If they match the first word and it's substantial (not just "the"), could be acceptable
    if ((distanceFirst === 0 || (distanceFirst <= 2 && similarityFirst >= 0.75)) && firstWord.length >= 4) {
      // They provided the modifier - this might be acceptable in some contexts
      // but generally the noun is more important
      // Let this fall through to multi-word matching
    }
  }
}

// Check for surname/partial name matches (e.g., "Ronaldo" for "Cristiano Ronaldo")
  // Accept if player provided a single word that matches the LAST word of a multi-word answer
  // This is common in Jeopardy where surnames are often sufficient
  // We only check the last word to avoid accepting generic words
  if (playerWords.length === 1 && correctWords.length > 1) {
    const playerWord = playerWords[0];
    const lastCorrectWord = correctWords[correctWords.length - 1];
    
    // Blacklist of common generic words that should NOT be accepted as standalone answers
    // These are typically part of titles, places, or things (not people's surnames)
    const genericWords = new Set([
      'street', 'avenue', 'road', 'boulevard', 'lane', 'drive', 'way', 'court',
      'house', 'building', 'tower', 'center', 'centre', 'hall', 'palace',
      'bridge', 'tunnel', 'gate', 'park', 'square', 'plaza',
      'river', 'lake', 'mountain', 'hill', 'valley', 'ocean', 'sea',
      'city', 'town', 'state', 'country', 'island', 'continent',
      'north', 'south', 'east', 'west', 'central',
      'show', 'series', 'movie', 'film', 'book', 'song', 'album',
      'company', 'corporation', 'inc', 'ltd', 'group',
      'day', 'night', 'morning', 'evening', 'year', 'month', 'week',
      'war', 'battle', 'treaty', 'act', 'law'
    ]);
    
    // Reject if the word is in our generic word blacklist
    if (genericWords.has(playerWord.toLowerCase())) {
      // Don't accept generic words as standalone answers
      return {
        isCorrect: false,
        explanation: 'Answer is incorrect (generic word requires full context)',
        confidence: 1.0
      };
    }
    
    // Check if the player's word matches the last word of the correct answer
    const distance = editDistance(playerWord, lastCorrectWord);
    const maxLen = Math.max(playerWord.length, lastCorrectWord.length);
    const similarity = 1 - (distance / maxLen);
    
    // Check if it matches (exact or with minor spelling variation)
    const matchesLastWord = distance === 0 || (maxLen >= 4 && (distance <= 2 || similarity >= 0.75));
    
    // Only accept if:
    // 1. The word matches the last word of the correct answer
    // 2. The word is at least 4 characters (surnames are typically longer)
    // 3. The last word in correct answer is substantial (4+ chars)
    // 4. The word is not in the generic words blacklist
    if (matchesLastWord && playerWord.length >= 4 && lastCorrectWord.length >= 4) {
      return {
        isCorrect: true,
        explanation: 'Answer is correct (surname or partial name accepted per Jeopardy rules)',
        confidence: 0.85
      };
    }
  }

  // For multi-word answers, check word matching with spelling tolerance
  const matchedWords = playerWords.filter(playerWord => 
    correctWords.some(correctWord => {
      const distance = editDistance(playerWord, correctWord);
      const maxLen = Math.max(playerWord.length, correctWord.length);
      const similarity = 1 - (distance / maxLen);
      
      // Exact match
      if (distance === 0) return true;
      
      // For short words (≤4 chars), be very strict
      // This prevents "air" from matching "hair", "can" from matching "scan", etc.
      if (maxLen <= 4) {
        // Only accept if edit distance is 1 AND similarity is very high (85%+)
        return distance === 1 && similarity >= 0.85;
      }
      
      // For longer words, allow more spelling tolerance
      // Allow 1-2 character differences for words > 4 characters
      return distance <= 2 || (maxLen > 3 && similarity >= 0.75);
    })
  );

  // Calculate similarity percentage based on matched words
  const similarity = matchedWords.length / Math.max(playerWords.length, correctWords.length);
  
  // Low confidence cases (close to threshold)
  const confidence = Math.abs(similarity - 0.7) > 0.15 ? 1.0 : 0.5; // Low confidence if close to 70% threshold
  
  return {
    isCorrect: similarity >= 0.7,
    explanation: `Answer is ${similarity >= 0.7 ? 'correct' : 'incorrect'} (${Math.round(similarity * 100)}% match)`,
    confidence
  };
};

export async function evaluateAnswer(playerAnswer, correctAnswer, category, clueText = '') {
  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  
  // Try OpenAI first if API key is available
  if (OPENAI_API_KEY) {
    try {
      console.log('Using OpenAI for answer evaluation...');
      const aiResult = await openAIEvaluation(playerAnswer, correctAnswer, category, clueText);
      
      // If OpenAI evaluation succeeded (has usedAI flag), return it
      if (aiResult.usedAI) {
        return aiResult;
      }
      
      // OpenAI failed, fall through to algorithm
      console.log('OpenAI evaluation failed, falling back to algorithm...');
    } catch (error) {
      console.error('OpenAI evaluation error, falling back to algorithm:', error);
    }
  } else {
    console.log('No OpenAI API key found, using local algorithm...');
  }
  
  // Fallback to algorithm if OpenAI is unavailable or failed
  return localComparison(playerAnswer, correctAnswer);
} 