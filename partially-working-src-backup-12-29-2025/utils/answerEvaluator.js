import OpenAI from 'openai';

// Initialize OpenAI only if API key is available
const openai = process.env.REACT_APP_OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
}) : null;

// Local comparison function
const localComparison = (playerAnswer, correctAnswer) => {
  const normalize = (str) => {
    return str.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Remove punctuation
      .replace(/\s{2,}/g, ' ') // Remove extra spaces
      .replace(/^(what|who|where|when|why|how)\s+is\s+/i, '') // Remove question words
      .replace(/^(a|an|the)\s+/i, '') // Remove articles
      .trim();
  };

  const getWords = (str) => {
    return str.split(/\s+/).filter(word => word.length > 0);
  };

  const calculateSimilarity = (str1, str2) => {
    const words1 = getWords(normalize(str1));
    const words2 = getWords(normalize(str2));
    
    // Count matching words
    const matches = words1.filter(word => 
      words2.some(correctWord => 
        correctWord.includes(word) || word.includes(correctWord)
      )
    ).length;

    // Calculate similarity percentage
    const maxWords = Math.max(words1.length, words2.length);
    return matches / maxWords;
  };

  const similarity = calculateSimilarity(playerAnswer, correctAnswer);
  return {
    isCorrect: similarity >= 0.7,
    explanation: `Answer is ${similarity >= 0.7 ? 'correct' : 'incorrect'} (${Math.round(similarity * 100)}% match)`
  };
};

export async function evaluateAnswer(playerAnswer, correctAnswer, category) {
  // If no OpenAI API key is available, use local comparison
  if (!openai) {
    return localComparison(playerAnswer, correctAnswer);
  }

  try {
    const prompt = `You are a Jeopardy! game show judge. Evaluate if the player's answer would be considered correct according to Jeopardy! rules.
    
    Category: ${category}
    Correct Answer: ${correctAnswer}
    Player's Answer: ${playerAnswer}

    Rules for evaluation:
    1. The answer must be essentially the same as the correct answer
    2. Minor spelling errors are acceptable if the pronunciation would be the same
    3. Articles (a, an, the) can be omitted
    4. The answer can be in the form of a question or a statement
    5. The answer must contain the key information from the correct answer

    Return a JSON object with the following structure:
    {
      "isCorrect": boolean,
      "explanation": "Brief explanation of why the answer is correct or incorrect"
    }`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(completion.choices[0].message.content);
    return response;
  } catch (error) {
    console.error('Error evaluating answer with OpenAI:', error);
    // Fall back to local comparison if API call fails
    return localComparison(playerAnswer, correctAnswer);
  }
} 