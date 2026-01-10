// Challenge Ruling Service
// Allows players to challenge incorrect rulings and have them re-evaluated by OpenAI

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

/**
 * Evaluate a challenge using OpenAI
 * @param {string} playerAnswer - The player's original answer
 * @param {string} correctAnswer - The correct answer
 * @param {string} category - The question category
 * @param {string} challengeReason - Player's explanation of why they should get credit
 * @returns {Promise<Object>} - { shouldOverrule: boolean, explanation: string }
 */
export const evaluateChallenge = async (playerAnswer, correctAnswer, category, challengeReason) => {
  try {
    console.log('🔍 Evaluating challenge with OpenAI...', {
      playerAnswer,
      correctAnswer,
      category,
      challengeReason
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a Jeopardy! judge evaluating a player's challenge to an incorrect ruling. 

JEOPARDY! SCORING RULES (be lenient and fair):
- Accept reasonable variations, abbreviations, and partial answers
- Accept surnames alone for people
- Accept shortened forms (e.g., "Hockey" for "Ice Hockey")
- Ignore articles (a/an/the)
- Accept minor spelling variations
- Accept phonetic equivalents (e.g., "Katniss" = "Catniss")
- Accept synonyms (e.g., "Attorney" = "Lawyer")
- Accept abbreviations (e.g., "St. Moritz" = "Saint Moritz")
- Accept partial answers if they capture the essential meaning
- Accept either part of compound answers

EVALUATION CRITERIA:
1. Was the player's answer essentially correct according to Jeopardy! rules?
2. Does the player's explanation provide valid reasoning?
3. Would a reasonable Jeopardy! judge overturn the ruling?

Respond with ONLY a JSON object:
{"shouldOverrule": true/false, "explanation": "brief explanation of your decision"}`
        },
        {
          role: 'user',
          content: `Category: ${category}
Correct Answer: ${correctAnswer}
Player's Answer: ${playerAnswer}
Player's Challenge Reason: ${challengeReason}

Should this ruling be overturned and the player awarded points?`
        }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    const rawResponse = response.choices[0].message.content.trim();
    console.log('✅ OpenAI challenge evaluation raw response:', rawResponse);

    // Parse the JSON response
    const result = JSON.parse(rawResponse);
    
    console.log('✅ Challenge evaluation result:', result);
    return {
      shouldOverrule: result.shouldOverrule,
      explanation: result.explanation
    };

  } catch (error) {
    console.error('❌ Error evaluating challenge:', error);
    
    // Return a safe default if OpenAI fails
    return {
      shouldOverrule: false,
      explanation: 'Unable to evaluate challenge. Please try again or contact support.'
    };
  }
};

/**
 * Log a challenge to console (could be expanded to save to Firebase)
 * @param {Object} challengeData - Challenge details
 */
export const logChallenge = (challengeData) => {
  console.log('📋 Challenge logged:', {
    timestamp: new Date().toISOString(),
    ...challengeData
  });
  
  // Future: Save to Firebase for analytics/audit trail
  // await saveChallengeToFirebase(challengeData);
};





