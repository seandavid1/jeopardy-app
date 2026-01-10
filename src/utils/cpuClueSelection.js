// CPU Clue Selection Strategies

/**
 * Select the next clue based on CPU's playing style
 * @param {Array} allClues - Array of all clues (6 categories x 5 clues each)
 * @param {Array} answeredIds - Array of already answered clue IDs
 * @param {Object} cpuOpponent - CPU opponent configuration
 * @param {String} jeopardyRound - 'Jeopardy' or 'Double Jeopardy'
 * @returns {Object|null} - Selected clue or null if no clues available
 */
export function selectNextClue(allClues, answeredIds, cpuOpponent, jeopardyRound) {
  // Filter out already answered clues
  const availableClues = allClues.filter(clue => !answeredIds.includes(clue.id));
  
  if (availableClues.length === 0) {
    return null;
  }

  const strategy = cpuOpponent.clueSelectionStrategy || 'top-to-bottom';

  switch (strategy) {
    case 'top-to-bottom':
      return selectTopToBottom(availableClues);
    
    case 'bottom-to-top':
      return selectBottomToTop(availableClues);
    
    case 'middle-out':
      return selectMiddleOut(availableClues);
    
    case 'strategic-dd-hunt':
      return selectStrategicDDHunt(availableClues, jeopardyRound);
    
    case 'holzhauer-special':
      return selectHolzhauerSpecial(availableClues, jeopardyRound);
    
    default:
      return selectTopToBottom(availableClues);
  }
}

/**
 * Top-to-bottom: Start with $200/$400, work down
 * Conservative strategy - easier questions first
 */
function selectTopToBottom(clues) {
  // Sort by value (ascending), then by category
  const sorted = clues.sort((a, b) => {
    const valueA = getClueValue(a);
    const valueB = getClueValue(b);
    if (valueA !== valueB) {
      return valueA - valueB;
    }
    return a.category.localeCompare(b.category);
  });
  return sorted[0];
}

/**
 * Bottom-to-top: Start with $1000/$2000, work up
 * Aggressive strategy - go for maximum points
 */
function selectBottomToTop(clues) {
  // Sort by value (descending), then by category
  const sorted = clues.sort((a, b) => {
    const valueA = getClueValue(a);
    const valueB = getClueValue(b);
    if (valueA !== valueB) {
      return valueB - valueA;
    }
    return a.category.localeCompare(b.category);
  });
  return sorted[0];
}

/**
 * Middle-out: Start with middle values ($600/$1200)
 * Balanced strategy
 */
function selectMiddleOut(clues) {
  // Group by value
  const byValue = {};
  clues.forEach(clue => {
    const value = getClueValue(clue);
    if (!byValue[value]) {
      byValue[value] = [];
    }
    byValue[value].push(clue);
  });

  // Priority order: middle values first
  const valuePriority = [600, 1200, 800, 1600, 400, 800, 1000, 2000, 200, 400];
  
  for (const value of valuePriority) {
    if (byValue[value] && byValue[value].length > 0) {
      return byValue[value][0];
    }
  }
  
  // Fallback
  return clues[0];
}

/**
 * Strategic DD Hunt: Focus on common Daily Double locations
 * Daily Doubles are typically in rows 2-5 (index 1-4)
 * Most common: rows 3-4 (index 2-3)
 */
function selectStrategicDDHunt(clues, jeopardyRound) {
  // Calculate clue positions (row index 0-4)
  const cluesWithPosition = clues.map(clue => ({
    ...clue,
    rowIndex: getRowIndex(clue, jeopardyRound)
  }));

  // Priority: rows 3-4 (index 2-3), then rows 2 and 5 (index 1,4), then row 1 (index 0)
  const priorityOrder = [2, 3, 1, 4, 0];
  
  for (const rowIdx of priorityOrder) {
    const cluesInRow = cluesWithPosition.filter(c => c.rowIndex === rowIdx);
    if (cluesInRow.length > 0) {
      // Within the row, prefer higher values
      cluesInRow.sort((a, b) => getClueValue(b) - getClueValue(a));
      return cluesInRow[0];
    }
  }
  
  return clues[0];
}

/**
 * Holzhauer Special: Bottom row, hunt aggressively for DDs
 * James's famous strategy: go straight to bottom row ($1000/$2000)
 * to build up money quickly and find Daily Doubles
 */
function selectHolzhauerSpecial(clues, jeopardyRound) {
  const cluesWithPosition = clues.map(clue => ({
    ...clue,
    rowIndex: getRowIndex(clue, jeopardyRound),
    value: getClueValue(clue)
  }));

  // Priority 1: Bottom row (highest value) - rows 4-5 (index 3-4)
  const bottomRows = cluesWithPosition.filter(c => c.rowIndex >= 3);
  if (bottomRows.length > 0) {
    // Prefer the highest values
    bottomRows.sort((a, b) => b.value - a.value);
    return bottomRows[0];
  }

  // Priority 2: Middle-high rows where DDs often are (row 3, index 2)
  const middleHighRows = cluesWithPosition.filter(c => c.rowIndex === 2);
  if (middleHighRows.length > 0) {
    middleHighRows.sort((a, b) => b.value - a.value);
    return middleHighRows[0];
  }

  // Priority 3: Any remaining high-value clues
  cluesWithPosition.sort((a, b) => b.value - a.value);
  return cluesWithPosition[0];
}

/**
 * Helper: Get the dollar value of a clue
 * Clues are structured with their position in the category (0-4)
 * Calculate value based on Jeopardy round and position
 */
function getClueValue(clue) {
  // If clue has explicit value, use it
  if (clue.value) {
    return parseInt(clue.value);
  }
  
  // Otherwise, try to infer from clue structure
  // This is a fallback - actual implementation depends on your clue structure
  return 0;
}

/**
 * Helper: Get the row index (0-4) of a clue based on its value
 * Row 0 = $200/$400, Row 1 = $400/$800, etc.
 */
function getRowIndex(clue, jeopardyRound) {
  const value = getClueValue(clue);
  
  // If we can't determine value, return 0
  if (value === 0) return 0;
  
  const baseValue = jeopardyRound === 'Jeopardy' ? 200 : 400;
  
  if (value >= baseValue && value < baseValue * 2) return 0;
  if (value >= baseValue * 2 && value < baseValue * 3) return 1;
  if (value >= baseValue * 3 && value < baseValue * 4) return 2;
  if (value >= baseValue * 4 && value < baseValue * 5) return 3;
  return 4; // $1000 or $2000
}

/**
 * Get all clues from the board in a flat array
 * @param {Object} categories - Object with cat1-cat6 arrays
 * @returns {Array} - Flat array of all clues
 */
export function getAllCluesFlat(categories) {
  const { cat1, cat2, cat3, cat4, cat5, cat6 } = categories;
  return [
    ...(cat1 || []),
    ...(cat2 || []),
    ...(cat3 || []),
    ...(cat4 || []),
    ...(cat5 || []),
    ...(cat6 || [])
  ].filter(clue => clue && clue.id); // Filter out null/undefined
}

