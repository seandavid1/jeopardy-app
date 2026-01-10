// CPU Game Logic Helper Functions

/**
 * Calculate accuracy modifier based on clue difficulty (value)
 * Lower values = easier questions, higher accuracy
 * Higher values = harder questions, lower accuracy
 * 
 * @param {number} clueValue - The dollar value of the clue (200-1000 or 400-2000)
 * @param {number} baseAccuracy - CPU's base accuracy rating (0-1)
 * @param {string} jeopardyRound - Either 'Jeopardy' or 'Double Jeopardy'
 * @returns {number} - Modified accuracy (0-1)
 */
export const calculateDifficultyModifiedAccuracy = (clueValue, baseAccuracy, jeopardyRound = 'Jeopardy') => {
  // Determine the value range for normalization
  const minValue = jeopardyRound === 'Jeopardy' ? 200 : 400;
  const maxValue = jeopardyRound === 'Jeopardy' ? 1000 : 2000;
  
  // Normalize clue value to 0-1 scale (0 = easiest, 1 = hardest)
  const normalizedDifficulty = (clueValue - minValue) / (maxValue - minValue);
  
  // Calculate degradation factor based on CPU skill level
  // Elite players (90%+): Very small degradation (0.05 = 5% max drop)
  // Strong players (75-89%): Moderate degradation (0.15 = 15% max drop)
  // Average players (60-74%): Significant degradation (0.25 = 25% max drop)
  // Weak players (<60%): Large degradation (0.35 = 35% max drop)
  
  let maxDegradation;
  if (baseAccuracy >= 0.90) {
    // Elite tier: Ken, James, Brad, etc.
    maxDegradation = 0.05; // Only 5% drop from easiest to hardest
  } else if (baseAccuracy >= 0.75) {
    // Strong tier: Amy, Buzzy, Matt, Victoria, etc.
    maxDegradation = 0.15; // 15% drop
  } else if (baseAccuracy >= 0.60) {
    // Average tier: College/Teacher champs
    maxDegradation = 0.25; // 25% drop
  } else {
    // Beginner tier: Fred, Casey, 5-Day
    maxDegradation = 0.35; // 35% drop
  }
  
  // Calculate the accuracy degradation for this specific clue
  // Easiest clue (200/400): no degradation
  // Hardest clue (1000/2000): full maxDegradation
  const degradation = normalizedDifficulty * maxDegradation;
  
  // Apply degradation to base accuracy
  // Also add a small boost for easiest questions
  const easyBoost = (1 - normalizedDifficulty) * 0.05; // Up to 5% boost on easiest
  
  const modifiedAccuracy = baseAccuracy - degradation + easyBoost;
  
  // Clamp between 0 and 1 (with a reasonable floor of 0.15)
  return Math.max(0.15, Math.min(0.98, modifiedAccuracy));
};

/**
 * Determine if CPU should answer correctly based on opponent difficulty, category, and clue value
 * @param {Object} cpuOpponent - CPU opponent configuration
 * @param {string} category - Question category (optional)
 * @param {number} clueValue - Dollar value of the clue (optional, for difficulty-based accuracy)
 * @param {string} jeopardyRound - 'Jeopardy' or 'Double Jeopardy' (optional)
 * @param {string} topLevelCategory - Top-level category grouping (optional, for broader category matching)
 * @returns {boolean} - Whether CPU answers correctly
 */
export const cpuShouldAnswerCorrectly = (cpuOpponent, category = null, clueValue = null, jeopardyRound = 'Jeopardy', topLevelCategory = null) => {
  let baseAccuracy = cpuOpponent.accuracy;
  
  // Apply category-specific adjustments if available
  // Try exact category match first
  if (category && cpuOpponent.categoryStrengths && cpuOpponent.categoryStrengths[category]) {
    baseAccuracy = cpuOpponent.categoryStrengths[category];
  }
  // If no exact match, try matching against topLevelCategory or category keywords
  else if (cpuOpponent.categoryStrengths) {
    const normalizedCategory = category ? category.toUpperCase() : '';
    const normalizedTopLevel = topLevelCategory ? topLevelCategory.toUpperCase() : '';
    
    // Check if any of the configured category strengths match
    for (const [configCategory, accuracy] of Object.entries(cpuOpponent.categoryStrengths)) {
      const normalizedConfig = configCategory.toUpperCase();
      
      // Check for partial matches (e.g., "ENTERTAINMENT" matches "ENTERTAINMENT ADD A LETTER")
      if (normalizedCategory.includes(normalizedConfig) || 
          normalizedConfig.includes(normalizedCategory) ||
          normalizedTopLevel === normalizedConfig) {
        baseAccuracy = accuracy;
        break;
      }
    }
  }
  
  // Apply difficulty-based accuracy modification if clue value is provided
  let finalAccuracy = baseAccuracy;
  if (clueValue !== null && clueValue !== undefined) {
    finalAccuracy = calculateDifficultyModifiedAccuracy(clueValue, baseAccuracy, jeopardyRound);
  }
  
  return Math.random() < finalAccuracy;
};

/**
 * Calculate CPU response delay based on difficulty
 */
export const getCPUResponseDelay = (cpuOpponent) => {
  const { min, max } = cpuOpponent.responseTime;
  return Math.random() * (max - min) + min;
};

/**
 * Calculate CPU Daily Double bet
 */
export const calculateCPUDailyDoubleBet = (cpuOpponent, currentScore, clueValue) => {
  const { minBet, maxBet, riskTolerance } = cpuOpponent.dailyDoubleStrategy;
  
  // James Holzhauer special case - always goes all in
  if (maxBet === 'ALL_IN') {
    return Math.max(currentScore, 1000); // At least $1000
  }
  
  // Calculate bet based on risk tolerance and current score
  let bet;
  
  if (currentScore <= 0) {
    // If losing or at zero, bet minimum or clue value
    bet = Math.max(minBet, clueValue);
  } else {
    // Scale bet based on risk tolerance
    const potentialBet = currentScore * riskTolerance;
    bet = Math.max(minBet, Math.min(potentialBet, maxBet));
  }
  
  // Round to nearest 100
  return Math.round(bet / 100) * 100;
};

/**
 * Calculate CPU Final Jeopardy bet
 */
export const calculateCPUFinalJeopardyBet = (cpuOpponent, cpuScore, opponentScore) => {
  const { leadingBet, trailingBet, closeGameBet } = cpuOpponent.finalJeopardyStrategy;
  
  const scoreDiff = cpuScore - opponentScore;
  const isLeading = scoreDiff > 0;
  const isClose = Math.abs(scoreDiff) < 5000; // Within $5000 is "close"
  
  let betPercentage;
  
  if (cpuScore <= 0) {
    // If at zero or negative, bet nothing
    return 0;
  }
  
  if (isClose) {
    // Close game - use close game strategy
    betPercentage = closeGameBet;
  } else if (isLeading) {
    // Leading - more conservative
    betPercentage = leadingBet;
  } else {
    // Trailing - more aggressive
    betPercentage = trailingBet;
  }
  
  let bet = Math.floor(cpuScore * betPercentage);
  
  // Special logic for trailing: need to bet enough to potentially win
  if (!isLeading && opponentScore > 0) {
    // Calculate what's needed to beat opponent if they bet everything and get it wrong
    const neededToBeat = (opponentScore * 2) - cpuScore + 1;
    if (neededToBeat > 0 && neededToBeat <= cpuScore) {
      bet = Math.max(bet, neededToBeat);
    }
  }
  
  // Don't bet more than you have
  bet = Math.min(bet, cpuScore);
  
  // Round to nearest 100
  return Math.round(bet / 100) * 100;
};

/**
 * Determine if CPU should attempt to answer (buzz in)
 * Returns delay in ms, or null if CPU doesn't attempt
 * 
 * This uses a RING-IN threshold, separate from correctness probability.
 * CPUs are willing to attempt questions even if they're not 100% confident.
 * 
 * @param {Object} cpuOpponent - CPU opponent configuration
 * @param {string} category - Question category (optional)
 * @param {number} clueValue - Dollar value of the clue (optional)
 * @param {string} jeopardyRound - 'Jeopardy' or 'Double Jeopardy' (optional)
 * @param {string} topLevelCategory - Top-level category grouping (optional)
 * @returns {number|null} - Delay in ms, or null if not attempting
 */
export const cpuShouldAttemptAnswer = (cpuOpponent, category = null, clueValue = null, jeopardyRound = 'Jeopardy', topLevelCategory = null) => {
  // Calculate base accuracy for this question (with category and difficulty modifiers)
  let baseAccuracy = cpuOpponent.accuracy;
  
  // Apply category-specific adjustments if available
  if (category && cpuOpponent.categoryStrengths && cpuOpponent.categoryStrengths[category]) {
    baseAccuracy = cpuOpponent.categoryStrengths[category];
  }
  // If no exact match, try matching against topLevelCategory or category keywords
  else if (cpuOpponent.categoryStrengths) {
    const normalizedCategory = category ? category.toUpperCase() : '';
    const normalizedTopLevel = topLevelCategory ? topLevelCategory.toUpperCase() : '';
    
    for (const [configCategory, accuracy] of Object.entries(cpuOpponent.categoryStrengths)) {
      const normalizedConfig = configCategory.toUpperCase();
      
      if (normalizedCategory.includes(normalizedConfig) || 
          normalizedConfig.includes(normalizedCategory) ||
          normalizedTopLevel === normalizedConfig) {
        baseAccuracy = accuracy;
        break;
      }
    }
  }
  
  // Apply difficulty-based accuracy modification if clue value is provided
  let estimatedAccuracy = baseAccuracy;
  if (clueValue !== null && clueValue !== undefined) {
    estimatedAccuracy = calculateDifficultyModifiedAccuracy(clueValue, baseAccuracy, jeopardyRound);
  }
  
  // Ring-in threshold is HIGHER than accuracy (CPUs are willing to try even when unsure)
  // Better players are more selective, weaker players buzz in more often relative to their ability
  let confidenceBoost;
  if (baseAccuracy >= 0.85) {
    // Elite players: +12% (very confident in their knowledge)
    confidenceBoost = 0.12;
  } else if (baseAccuracy >= 0.70) {
    // Strong players: +18% (confident)
    confidenceBoost = 0.18;
  } else if (baseAccuracy >= 0.60) {
    // Average players: +22% (moderately overconfident)
    confidenceBoost = 0.22;
  } else {
    // Weaker players: +28% (often guess/overconfident)
    confidenceBoost = 0.28;
  }
  
  const ringInThreshold = Math.min(0.95, estimatedAccuracy + confidenceBoost);
  
  // Decide whether to buzz in based on ring-in threshold
  if (Math.random() < ringInThreshold) {
    return getCPUResponseDelay(cpuOpponent);
  }
  
  return null;
};

/**
 * James Holzhauer special ability: Prefers high-value clues and hunts Daily Doubles
 */
export const cpuSelectNextClue = (cpuOpponent, availableClues) => {
  // For James Holzhauer, prefer bottom row (high value) clues
  if (cpuOpponent.id === 'james-holzhauer' && cpuOpponent.specialAbility) {
    // Filter for high-value clues ($800-$1000 in Jeopardy, $1600-$2000 in Double)
    const highValueClues = availableClues.filter(clue => {
      const value = parseInt(clue.value) || 0;
      return value >= 800;
    });
    
    if (highValueClues.length > 0) {
      // Pick random high-value clue
      return highValueClues[Math.floor(Math.random() * highValueClues.length)];
    }
  }
  
  // Default: pick random available clue
  return availableClues[Math.floor(Math.random() * availableClues.length)];
};

export default {
  calculateDifficultyModifiedAccuracy,
  cpuShouldAnswerCorrectly,
  getCPUResponseDelay,
  calculateCPUDailyDoubleBet,
  calculateCPUFinalJeopardyBet,
  cpuShouldAttemptAnswer,
  cpuSelectNextClue
};

