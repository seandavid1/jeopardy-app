/**
 * Board Generation Utility
 * 
 * This module handles intelligent selection of categories and clues for game boards.
 * Key features:
 * - Ensures category diversity (no single topic dominates)
 * - Respects original difficulty values when placing clues
 * - Provides fallback mechanisms for edge cases
 * - Filters out flawed questions marked by admins
 */

import { getFlawedQuestionIds } from '../services/flawedQuestionsDB';

// Cache for flawed question IDs (refreshed periodically)
let flawedQuestionsCache = new Set();
let lastFlawedQuestionsUpdate = 0;
const FLAWED_QUESTIONS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get flawed question IDs with caching
 * @returns {Promise<Set>} - Set of flawed question IDs
 */
async function getFlawedQuestionsSet() {
  const now = Date.now();
  if (now - lastFlawedQuestionsUpdate > FLAWED_QUESTIONS_CACHE_DURATION) {
    try {
      flawedQuestionsCache = await getFlawedQuestionIds();
      lastFlawedQuestionsUpdate = now;
      console.log(`✅ Loaded ${flawedQuestionsCache.size} flawed questions for filtering`);
    } catch (error) {
      console.error('Error loading flawed questions:', error);
    }
  }
  return flawedQuestionsCache;
}

export function randomIntFromInterval(limit) {
  const num = Math.floor(Math.random() * (limit - 1 + 1) + 1);
  return num;
}

/**
 * Get category distribution statistics for debugging/validation
 */
export function getCategoryDistribution(categories) {
  const distribution = {};
  
  categories.forEach(cat => {
    cat.forEach(clue => {
      const topLevel = clue.topLevelCategory || 'Unknown';
      distribution[topLevel] = (distribution[topLevel] || 0) + 1;
    });
  });
  
  return distribution;
}

/**
 * Validate that a clue's original value matches the slot it's being placed in
 * Returns true if the clue is appropriate for the slot
 */
export function isClueAppropriateForSlot(clue, slotIndex, jeopardyRound) {
  // slotIndex: 0-4 (representing positions in the category column)
  // Jeopardy round: 200, 400, 600, 800, 1000
  // Double Jeopardy round: 400, 800, 1200, 1600, 2000
  
  const expectedValue = jeopardyRound === 'Jeopardy' 
    ? (slotIndex + 1) * 200 
    : (slotIndex + 1) * 400;
  
  // Check if the clue's original value matches the expected slot value
  return clue.value === expectedValue;
}

/**
 * Validate that a full category (5 clues) has proper difficulty progression
 * Returns { valid: boolean, issues: string[] }
 */
export function validateCategoryDifficulty(categoryClues, jeopardyRound) {
  const issues = [];
  
  if (categoryClues.length !== 5) {
    issues.push(`Category has ${categoryClues.length} clues instead of 5`);
    return { valid: false, issues };
  }
  
  // Check each clue's value
  const baseValue = jeopardyRound === 'Jeopardy' ? 200 : 400;
  categoryClues.forEach((clue, index) => {
    const expectedValue = (index + 1) * baseValue;
    if (clue.value !== expectedValue) {
      issues.push(`Clue ${index} has value ${clue.value}, expected ${expectedValue}`);
    }
  });
  
  return { 
    valid: issues.length === 0, 
    issues 
  };
}

/**
 * Get a category - SIMPLIFIED VERSION without strict validation
 * Just needs 5 clues from the same category/game
 * Filters out flawed questions marked by admins
 */
export async function getCategory(questionsToUse, jeopardyRound, usedCategories = [], maxRetries = 50) {
  if (!questionsToUse || questionsToUse.length === 0) {
    console.error('No questions loaded');
    return [];
  }
  
  // Get flawed questions to filter out
  const flawedQuestions = await getFlawedQuestionsSet();
  
  let attempts = 0;
  
  while (attempts < maxRetries) {
    attempts++;
    
    // Filter by round and exclude flawed questions and empty clues
    const currentQuestionSet = questionsToUse.filter((item) => {
      return item.round === jeopardyRound && 
             !flawedQuestions.has(item.id) && 
             !item.isEmpty;  // Exclude empty placeholder clues
    });
    
    if (currentQuestionSet.length === 0) {
      console.error('No questions for round:', jeopardyRound);
      return [];
    }
    
    // Filter out already used categories
    const availableQuestions = currentQuestionSet.filter((item) => {
      return !usedCategories.includes(item.category);
    });
    
    if (availableQuestions.length === 0) {
      console.error('No more unique categories available');
      return [];
    }
    
    // Pick a random question to get category and game_id
    const randomIndex = randomIntFromInterval(availableQuestions.length) - 1;
    const selectedQuestion = availableQuestions[randomIndex];
    const cat = selectedQuestion.category;
    const game_id = selectedQuestion.game_id;
    
    // Get all clues from this category and game
    const fullResult = currentQuestionSet.filter((item) => {
      return item.category === cat && item.game_id === game_id;
    });
    
    // CRITICAL: Deduplicate by ID to prevent duplicate keys in React
    // Sometimes the source data has duplicate clues with the same ID
    const deduplicatedResult = Array.from(
      new Map(fullResult.map(item => [item.id, item])).values()
    );
    
    // Sort by value to ensure proper difficulty progression
    deduplicatedResult.sort((a, b) => a.value - b.value);
    
    // Take the first 5 clues (or whatever we have)
    const result = deduplicatedResult.slice(0, 5);
    
    // Simply check if we have 5 clues - that's all we need!
    if (result.length === 5) {
      return result;
    }
  }
  
  // If we exhausted retries, return empty and let the caller handle it
  console.error(`Failed to get valid category after ${maxRetries} attempts`);
  return [];
}

/**
 * Get category with diversity enforcement - SIMPLIFIED
 * This ensures the board doesn't have too many categories of the same top-level type
 */
export async function getCategoryWithDiversity(
  questionsToUse, 
  jeopardyRound, 
  usedCategories = [], 
  existingTopLevelCategories = [],
  maxRetries = 30 // Reduced retries since we're less strict
) {
  if (!questionsToUse || questionsToUse.length === 0) {
    console.error('No questions loaded');
    return [];
  }
  
  // Count existing top-level categories
  const topLevelCounts = {};
  existingTopLevelCategories.forEach(cat => {
    topLevelCounts[cat] = (topLevelCounts[cat] || 0) + 1;
  });
  
  // Determine maximum allowed for any single category (for 6 categories, max should be 3)
  const maxPerCategory = 3;
  
  let attempts = 0;
  let fallbackCategory = null;
  
  while (attempts < maxRetries) {
    attempts++;
    
    const category = await getCategory(questionsToUse, jeopardyRound, usedCategories, 5); // Only 5 retries per attempt
    
    if (category.length === 0) {
      continue; // Try again
    }
    
    // Store first valid category as fallback
    if (!fallbackCategory) {
      fallbackCategory = category;
    }
    
    const topLevelCategory = category[0]?.topLevelCategory || 'Other';
    const currentCount = topLevelCounts[topLevelCategory] || 0;
    
    // If we're within diversity limits, use this category
    if (currentCount < maxPerCategory) {
      return category;
    }
  }
  
  // If we couldn't find a diverse category, use the fallback
  // console.log('Using fallback category for diversity');
  return fallbackCategory || [];
}

/**
 * Generate a complete board (6 categories) with diversity enforcement
 */
export async function generateBoard(questionsToUse, jeopardyRound) {
  const categories = [];
  const usedCategories = [];
  const existingTopLevelCategories = [];
  
  console.log(`\n========================================`);
  console.log(`Generating board for ${jeopardyRound} round`);
  console.log(`========================================\n`);
  
  for (let i = 0; i < 6; i++) {
    console.log(`\nSelecting category ${i + 1}/6...`);
    
    const category = await getCategoryWithDiversity(
      questionsToUse,
      jeopardyRound,
      usedCategories,
      existingTopLevelCategories
    );
    
    if (category.length === 0) {
      console.error(`Failed to get category ${i + 1}`);
      // Try without diversity constraints as last resort
      const fallback = await getCategory(questionsToUse, jeopardyRound, usedCategories);
      if (fallback.length > 0) {
        categories.push(fallback);
        usedCategories.push(fallback[0].category);
        existingTopLevelCategories.push(fallback[0]?.topLevelCategory || 'Other');
      }
    } else {
      categories.push(category);
      usedCategories.push(category[0].category);
      existingTopLevelCategories.push(category[0]?.topLevelCategory || 'Other');
    }
  }
  
  // Log final distribution
  const distribution = {};
  existingTopLevelCategories.forEach(cat => {
    distribution[cat] = (distribution[cat] || 0) + 1;
  });
  
  console.log(`\n========================================`);
  console.log(`Board generation complete!`);
  console.log(`Top-level category distribution:`, distribution);
  console.log(`Categories selected:`, categories.map(c => c[0]?.category));
  console.log(`========================================\n`);
  
  return categories;
}

/**
 * Helper function for backward compatibility with existing code
 * This wraps the new system in the old interface
 */
export async function getCategoryClues(
  getCategory, 
  setCategoryClues, 
  categoryName, 
  jeopardyRound, 
  retryCount = 0
) {
  if (retryCount >= 10) {
    console.error(`Failed to get ${categoryName} after 10 attempts`);
    return;
  }
  
  let resultNew = await getCategory(jeopardyRound);
  
  if (resultNew.length >= 5) {
    setCategoryClues(resultNew);
    console.log(`${categoryName} results:`, resultNew);
  } else {
    console.log(`Retrying ${categoryName}, attempt ${retryCount + 1}`);
    getCategoryClues(getCategory, setCategoryClues, categoryName, jeopardyRound, retryCount + 1);
  }
}

/**
 * SIMPLIFIED: Generate a complete board (6 categories) efficiently
 * This is a streamlined version that reduces memory overhead
 */
export async function generateBoardSimplified(questionsToUse, jeopardyRound) {
  if (!questionsToUse || questionsToUse.length === 0) {
    console.error('No questions loaded for board generation');
    return null;
  }
  
  console.log(`\n🎲 Generating ${jeopardyRound} board...`);
  
  const categories = [];
  const usedCategories = [];
  const existingTopLevelCategories = [];
  
  // Generate 6 categories with reduced retry logic
  for (let i = 0; i < 6; i++) {
    let category = null;
    let attempts = 0;
    const maxAttempts = 10; // Reduced from 20
    
    while (!category && attempts < maxAttempts) {
      attempts++;
      
      // Try to get a diverse category
      category = await getCategoryWithDiversity(
        questionsToUse,
        jeopardyRound,
        usedCategories,
        existingTopLevelCategories,
        5 // Only 5 retries for diversity check
      );
      
      // If we got a category, use it
      if (category && category.length === 5) {
        categories.push(category);
        usedCategories.push(category[0].category);
        existingTopLevelCategories.push(category[0]?.topLevelCategory || 'Other');
        console.log(`✅ Category ${i + 1}/6: ${category[0].category}`);
        break;
      }
    }
    
    // If we failed to get this category after max attempts, fail the whole board
    if (!category || category.length !== 5) {
      console.error(`❌ Failed to generate category ${i + 1}/6`);
      return null;
    }
  }
  
  // Validate we got all 6 categories
  if (categories.length !== 6) {
    console.error(`❌ Board generation incomplete: only ${categories.length}/6 categories`);
    return null;
  }
  
  // Log final distribution
  const distribution = getCategoryDistribution(categories);
  console.log('\n✅ Board Generated Successfully!');
  console.log('Distribution:', distribution);
  console.log('Categories:', categories.map(c => c[0]?.category));
  console.log('');
  
  return categories;
}
