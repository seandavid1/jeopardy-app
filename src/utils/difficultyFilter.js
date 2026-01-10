/**
 * Difficulty Filter Utility
 * 
 * Handles filtering questions based on difficulty mode:
 * - Regular Mode: All standard game questions
 * - Hard Mode: Only tournament questions (ToC, Masters, Champions, etc.)
 * 
 * Tournament game detection is based on game_id patterns and date ranges
 * that correspond to known tournament periods.
 */

/**
 * Known tournament game_id ranges and patterns
 * These are approximate ranges based on J-Archive tournament schedules
 */
const TOURNAMENT_PATTERNS = {
  // Season 38 (2021-2022)
  season38: {
    toc2021: { start: '7900', end: '7914' }, // Tournament of Champions
    college2022: { start: '7860', end: '7874' }, // College Championship
    national_college: { start: '7830', end: '7844' }, // National College Championship
    professors: { start: '7950', end: '7964' }, // Professors Tournament
  },
  // Season 39 (2022-2023)
  season39: {
    toc2022: { start: '8350', end: '8364' }, // Tournament of Champions
    college2023: { start: '8310', end: '8324' }, // College Championship
    second_chance: { start: '8400', end: '8414' }, // Second Chance
    masters2023: { start: '8500', end: '8519' }, // Jeopardy! Masters
  },
  // Season 40 (2023-2024)
  season40: {
    toc2023: { start: '8800', end: '8814' }, // Tournament of Champions
    college2024: { start: '8760', end: '8774' }, // College Championship
    champions_wildcard: { start: '8850', end: '8864' }, // Champions Wildcard
    invitational: { start: '8900', end: '8914' }, // Invitational Tournament
    masters2024: { start: '9000', end: '9019' }, // Jeopardy! Masters
  },
  // Season 41 (2024-2025)
  season41: {
    second_chance: { start: '9200', end: '9214' }, // Second Chance
    toc2024: { start: '9350', end: '9364' }, // Tournament of Champions
    college2025: { start: '9310', end: '9324' }, // College Championship (projected)
  }
};

/**
 * Category keywords that suggest tournament-level difficulty
 */
const ADVANCED_CATEGORY_KEYWORDS = [
  'MASTERS',
  'TOURNAMENT',
  'CHAMPIONSHIP',
  'CHAMPION',
  'COLLEGE',
  'PROFESSORS',
  'INVITATIONAL',
  'EXPERT',
  'ADVANCED'
];

/**
 * Check if a game_id falls within any tournament range
 */
function isGameIdInTournamentRange(gameId) {
  const id = parseInt(gameId, 10);
  if (isNaN(id)) return false;
  
  for (const season of Object.values(TOURNAMENT_PATTERNS)) {
    for (const tournament of Object.values(season)) {
      const start = parseInt(tournament.start, 10);
      const end = parseInt(tournament.end, 10);
      if (id >= start && id <= end) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check if a category name suggests tournament-level difficulty
 */
function isCategoryAdvanced(category) {
  if (!category) return false;
  const upperCategory = category.toUpperCase();
  return ADVANCED_CATEGORY_KEYWORDS.some(keyword => upperCategory.includes(keyword));
}

/**
 * Check if a question is from a tournament game
 * Uses multiple heuristics:
 * 1. Game ID in known tournament ranges
 * 2. Category name suggests tournament
 * 3. High clue values ($2000+) with complex wording
 */
export function isTournamentQuestion(question) {
  // Check game_id patterns
  if (isGameIdInTournamentRange(question.game_id)) {
    return true;
  }
  
  // Check category name
  if (isCategoryAdvanced(question.category)) {
    return true;
  }
  
  // For now, we'll primarily rely on game_id and category patterns
  // Additional heuristics can be added here if needed
  
  return false;
}

/**
 * Filter questions by difficulty mode
 * @param {Array} questions - All questions
 * @param {String} difficultyMode - 'regular' or 'tournament'
 * @returns {Array} Filtered questions
 */
export function filterQuestionsByDifficulty(questions, difficultyMode) {
  if (!questions || !Array.isArray(questions)) {
    console.error('Invalid questions array provided to filterQuestionsByDifficulty');
    return [];
  }
  
  // First, filter out empty placeholder clues (these are structural placeholders only)
  const nonEmptyQuestions = questions.filter(q => !q.isEmpty);
  const emptyCount = questions.length - nonEmptyQuestions.length;
  
  if (emptyCount > 0) {
    console.log(`Filtered out ${emptyCount} empty placeholder clues`);
  }
  
  // Tournament mode: Coming soon
  // For now, both modes use all non-empty questions
  if (difficultyMode === 'tournament') {
    console.log(`Tournament mode selected - using ${nonEmptyQuestions.length} questions (tournament filtering coming soon)`);
  } else {
    console.log(`Regular mode selected - using ${nonEmptyQuestions.length} questions`);
  }
  
  // Both modes return all non-empty questions for now
  return nonEmptyQuestions;
}

/**
 * Get statistics about tournament questions in the dataset
 * Useful for debugging and validation
 */
export function getTournamentStatistics(questions) {
  if (!questions || !Array.isArray(questions)) {
    return {
      total: 0,
      tournament: 0,
      percentage: 0,
      byRound: {},
      bySeason: {}
    };
  }
  
  const total = questions.length;
  const tournamentQuestions = questions.filter(q => isTournamentQuestion(q));
  const tournament = tournamentQuestions.length;
  
  const byRound = {};
  const bySeason = {};
  
  tournamentQuestions.forEach(q => {
    // By round
    byRound[q.round] = (byRound[q.round] || 0) + 1;
    
    // By season
    bySeason[q.season] = (bySeason[q.season] || 0) + 1;
  });
  
  return {
    total,
    tournament,
    percentage: total > 0 ? ((tournament / total) * 100).toFixed(2) : 0,
    byRound,
    bySeason
  };
}

/**
 * Difficulty mode configuration
 */
export const DIFFICULTY_MODES = {
  REGULAR: 'regular',
  TOURNAMENT: 'tournament'
};

export const DIFFICULTY_LABELS = {
  [DIFFICULTY_MODES.REGULAR]: 'Regular',
  [DIFFICULTY_MODES.TOURNAMENT]: 'Tournament'
};

export const DIFFICULTY_DESCRIPTIONS = {
  [DIFFICULTY_MODES.REGULAR]: 'All available Jeopardy! questions from regular season games',
  [DIFFICULTY_MODES.TOURNAMENT]: 'Tournament mode - Coming soon! Will feature championship-level questions.'
};

