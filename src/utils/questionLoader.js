// Question loader utility with dynamic imports
// This loads question sets on-demand rather than all at once

import { filterQuestionsByDifficulty, DIFFICULTY_MODES } from './difficultyFilter';

const QUESTION_SETS = {
  's35p1': {
    name: 'Season 35 Part 1',
    loader: () => import('../cluebase-questions/jeopardy-questions-season35-2018-09-09-to-2019-02-27-part1')
  },
  's35p2': {
    name: 'Season 35 Part 2',
    loader: () => import('../cluebase-questions/jeopardy-questions-season35-2019-02-27-to-2019-07-25-part2')
  },
  's36p1': {
    name: 'Season 36 Part 1',
    loader: () => import('../cluebase-questions/jeopardy-questions-season36-2019-09-08-to-2020-01-23-part1')
  },
  's36p2': {
    name: 'Season 36 Part 2',
    loader: () => import('../cluebase-questions/jeopardy-questions-season36-2020-01-23-to-2020-06-11-part2')
  },
  's37p1': {
    name: 'Season 37 Part 1',
    loader: () => import('../cluebase-questions/jeopardy-questions-season37-2020-09-13-to-2021-03-14-part1')
  },
  's37p2': {
    name: 'Season 37 Part 2',
    loader: () => import('../cluebase-questions/jeopardy-questions-season37-2021-03-14-to-2021-08-12-part2')
  },
  's38p1': {
    name: 'Season 38 Part 1',
    loader: () => import('../cluebase-questions/jeopardy-questions-season38-2021-09-12-to-2022-02-23-part1')
  },
  's38p2': {
    name: 'Season 38 Part 2',
    loader: () => import('../cluebase-questions/jeopardy-questions-season38-2022-02-23-to-2022-07-28-part2')
  },
  's39p1': {
    name: 'Season 39 Part 1',
    loader: () => import('../cluebase-questions/jeopardy-questions-season39-2022-09-11-to-2023-02-23-part1')
  },
  's39p2': {
    name: 'Season 39 Part 2',
    loader: () => import('../cluebase-questions/jeopardy-questions-season39-2023-02-23-to-2023-07-27-part2')
  },
  's40p1': {
    name: 'Season 40 Part 1',
    loader: () => import('../cluebase-questions/jeopardy-questions-season40-2023-09-10-to-2024-02-25-part1')
  },
  's40p2': {
    name: 'Season 40 Part 2',
    loader: () => import('../cluebase-questions/jeopardy-questions-season40-2024-02-25-to-2024-07-25-part2')
  },
  's41p1': {
    name: 'Season 41 Part 1',
    loader: () => import('../cluebase-questions/jeopardy-questions-season41-2024-09-08-to-2024-12-29-part1')
  },
  's41p2': {
    name: 'Season 41 Part 2',
    loader: () => import('../cluebase-questions/jeopardy-questions-season41-2024-12-29-to-2025-04-09-part2')
  },
  's42p1': {
    name: 'Season 42 Part 1',
    loader: () => import('../cluebase-questions/jeopardy-questions-season42-2025-09-07-to-2025-11-05-part1')
  },
  's42p2': {
    name: 'Season 42 Part 2',
    loader: () => import('../cluebase-questions/jeopardy-questions-season42-2025-11-05-to-2026-01-01-part2')
  },
};

/**
 * Load a random subset of question sets
 * @param {number} count - Number of sets to load (default: 3)
 * @param {string} difficultyMode - 'regular' or 'hard' (default: 'regular')
 * @returns {Promise<Array>} - Combined array of questions from loaded sets
 */
export async function loadRandomQuestionSets(count = 3, difficultyMode = DIFFICULTY_MODES.REGULAR) {
  const keys = Object.keys(QUESTION_SETS);
  
  // Shuffle and select random sets
  const shuffled = keys.sort(() => 0.5 - Math.random());
  const selectedKeys = shuffled.slice(0, Math.min(count, keys.length));
  
  console.log(`Loading ${selectedKeys.length} question sets (${difficultyMode} mode):`, 
    selectedKeys.map(key => QUESTION_SETS[key].name));
  
  try {
    // Load all selected sets in parallel
    const modules = await Promise.all(
      selectedKeys.map(key => QUESTION_SETS[key].loader())
    );
    
    // Combine all questions into one array
    let allQuestions = modules.flatMap(module => module.default);
    
    // Filter by difficulty
    allQuestions = filterQuestionsByDifficulty(allQuestions, difficultyMode);
    
    console.log(`Loaded ${allQuestions.length} total questions from ${selectedKeys.length} sets (${difficultyMode} mode)`);
    
    return allQuestions;
  } catch (error) {
    console.error('Error loading question sets:', error);
    throw error;
  }
}

/**
 * Load all question sets (for practice mode or when needed)
 * @param {string} difficultyMode - 'regular' or 'hard' (default: 'regular')
 * @returns {Promise<Array>} - All questions from all sets
 */
export async function loadAllQuestionSets(difficultyMode = DIFFICULTY_MODES.REGULAR) {
  const keys = Object.keys(QUESTION_SETS);
  
  console.log(`Loading all ${keys.length} question sets (${difficultyMode} mode)...`);
  
  try {
    const modules = await Promise.all(
      keys.map(key => QUESTION_SETS[key].loader())
    );
    
    let allQuestions = modules.flatMap(module => module.default);
    
    // Filter by difficulty
    allQuestions = filterQuestionsByDifficulty(allQuestions, difficultyMode);
    
    console.log(`Loaded ${allQuestions.length} total questions from all sets (${difficultyMode} mode)`);
    
    return allQuestions;
  } catch (error) {
    console.error('Error loading all question sets:', error);
    throw error;
  }
}

/**
 * Load specific question sets by keys
 * @param {Array<string>} keys - Array of set keys to load
 * @returns {Promise<Array>} - Combined questions from specified sets
 */
export async function loadSpecificQuestionSets(keys) {
  console.log(`Loading specific question sets:`, keys);
  
  try {
    const modules = await Promise.all(
      keys.map(key => {
        if (!QUESTION_SETS[key]) {
          throw new Error(`Question set "${key}" not found`);
        }
        return QUESTION_SETS[key].loader();
      })
    );
    
    const allQuestions = modules.flatMap(module => module.default);
    
    console.log(`Loaded ${allQuestions.length} questions from ${keys.length} specified sets`);
    
    return allQuestions;
  } catch (error) {
    console.error('Error loading specific question sets:', error);
    throw error;
  }
}

/**
 * Get list of available question sets
 * @returns {Array<Object>} - Array of available sets with their metadata
 */
export function getAvailableQuestionSets() {
  return Object.entries(QUESTION_SETS).map(([key, value]) => ({
    key,
    name: value.name
  }));
}

export default loadRandomQuestionSets;

