import questionSetSeason38Part1 from '../cluebase-questions/jeopardy-questions-season38-2021-09-12-to-2022-02-23-part1';
import questionSetSeason38Part2 from '../cluebase-questions/jeopardy-questions-season38-2022-02-23-to-2022-07-28-part2';
import questionSetSeason39Part1 from '../cluebase-questions/jeopardy-questions-season39-2022-09-11-to-2023-02-23-part1';
import questionSetSeason39Part2 from '../cluebase-questions/jeopardy-questions-season39-2023-02-23-to-2023-07-27-part2';
import questionSetSeason40Part1 from '../cluebase-questions/jeopardy-questions-season40-2023-09-10-to-2024-02-25-part1';
import questionSetSeason40Part2 from '../cluebase-questions/jeopardy-questions-season40-2024-02-25-to-2024-07-25-part2';
import questionSetSeason41Part1 from '../cluebase-questions/jeopardy-questions-season41-2024-09-08-to-2024-12-29-part1';
import questionSetSeason41Part2 from '../cluebase-questions/jeopardy-questions-season41-2024-12-29-to-2025-04-09-part2';
import {
  getCategory as getImprovedCategory,
  getCategoryWithDiversity,
  generateBoard,
  validateCategoryDifficulty,
  getCategoryDistribution,
  randomIntFromInterval
} from './boardGenerator';
import { filterQuestionsByDifficulty, DIFFICULTY_MODES } from './difficultyFilter';

// Re-export for backward compatibility
export { randomIntFromInterval };

// Get all questions combined
export function getAllQuestions(difficultyMode = DIFFICULTY_MODES.REGULAR) {
  const allQuestions = questionSetSeason38Part1.concat(
    questionSetSeason38Part2,
    questionSetSeason39Part1,
    questionSetSeason39Part2,
    questionSetSeason40Part1,
    questionSetSeason40Part2,
    questionSetSeason41Part1,
    questionSetSeason41Part2
  );
  
  // Filter by difficulty mode
  return filterQuestionsByDifficulty(allQuestions, difficultyMode);
}

/**
 * Legacy getCategory function - now uses improved algorithm
 * This maintains backward compatibility with existing code
 */
export const getCategory = async function (jeopardyRound, difficultyMode = DIFFICULTY_MODES.REGULAR) {
  const allQuestions = getAllQuestions(difficultyMode);
  return await getImprovedCategory(allQuestions, jeopardyRound, []);
}

export const getDailyDoubles = (jeopardyRound, setDailyDoubleCategory1, setDailyDoubleCategory2, setDailyDoubleValue1, setDailyDoubleValue2) => {
  const rndCatNum = randomIntFromInterval(6);
  const rndCatNum2 = randomIntFromInterval(6);
  if (rndCatNum === rndCatNum2) {
    getDailyDoubles(jeopardyRound, setDailyDoubleCategory1, setDailyDoubleCategory2, setDailyDoubleValue1, setDailyDoubleValue2);
  }
  else {
    setDailyDoubleCategory1(rndCatNum);
    if (jeopardyRound === 'DJ!') {
      setDailyDoubleCategory2(rndCatNum2);
    }
  }
  const rndNum3 = randomIntFromInterval(4);
  const rndNum4 = randomIntFromInterval(4);
  if (jeopardyRound === 'J!') {
    setDailyDoubleValue1((rndNum3 + 1) * 200);
    setDailyDoubleValue2((rndNum4 + 1) * 200);
  }
  if (jeopardyRound === 'DJ!') {
    setDailyDoubleValue1((rndNum3 + 1) * 400);
    setDailyDoubleValue2((rndNum4 + 1) * 400);
  }
}

export const getCategoryClues = async (
  getCategory, 
  setCategoryClues, 
  categoryName, 
  jeopardyRound, 
  retryCount = 0
) => {
  if (retryCount >= 10) {
    console.error(`Failed to get ${categoryName} after 10 attempts`);
    return;
  }
  let resultNew = await getCategory(jeopardyRound);
  if (resultNew.length >= 5) {
    // Validate the category before setting it
    const validation = validateCategoryDifficulty(resultNew, jeopardyRound);
    if (validation.valid) {
      setCategoryClues(resultNew);
      console.log(`${categoryName} results:`, resultNew);
    } else {
      console.log(`Category validation failed for ${categoryName}:`, validation.issues);
      console.log(`Retrying ${categoryName}, attempt ${retryCount + 1}`);
      getCategoryClues(getCategory, setCategoryClues, categoryName, jeopardyRound, retryCount + 1);
    }
  } else {
    console.log(`Retrying ${categoryName}, attempt ${retryCount + 1}`);
    getCategoryClues(getCategory, setCategoryClues, categoryName, jeopardyRound, retryCount + 1);
  }
}

/**
 * New function to generate all 6 categories at once with diversity enforcement
 * This is the recommended approach for new code
 */
export const generateFullBoard = async (jeopardyRound, difficultyMode = DIFFICULTY_MODES.REGULAR) => {
  const allQuestions = getAllQuestions(difficultyMode);
  console.log(`Generating board with ${difficultyMode} difficulty: ${allQuestions.length} questions available`);
  return await generateBoard(allQuestions, jeopardyRound);
}

/**
 * Helper to get category distribution for a set of categories
 */
export const getBoardDistribution = (categories) => {
  return getCategoryDistribution(categories);
} 