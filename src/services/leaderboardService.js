// Leaderboard service for tracking high scores
// Uses both localStorage (local) and Firebase (cloud sync)
import { 
  saveLeaderboardEntryToFirebase,
  getUserLeaderboardFromFirebase,
  deleteLeaderboardEntryFromFirebase,
  clearUserLeaderboardFromFirebase
} from './leaderboardDB';

const LEADERBOARD_KEY = 'jeopardy_leaderboard';
const MAX_ENTRIES = 50; // Keep top 50 scores

export const saveGameResult = async (winnerName, winnerScore, opponentName, opponentScore, gameMode, userId = null, difficultyMode = 'regular') => {
  try {
    // Save to localStorage
    const leaderboard = getLeaderboard();
    
    const entry = {
      id: Date.now(),
      winnerName,
      winnerScore,
      opponentName,
      opponentScore,
      gameMode,
      difficultyMode, // Add difficulty tracking
      date: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    // Add new entry
    leaderboard.push(entry);
    
    // Sort by winner score (descending)
    leaderboard.sort((a, b) => b.winnerScore - a.winnerScore);
    
    // Keep only top MAX_ENTRIES
    const trimmedLeaderboard = leaderboard.slice(0, MAX_ENTRIES);
    
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmedLeaderboard));
    
    console.log('Game result saved to localStorage:', entry);
    
    // Also save to Firebase if user is logged in
    if (userId) {
      try {
        await saveLeaderboardEntryToFirebase({
          userId,
          winnerName,
          winnerScore,
          opponentName,
          opponentScore,
          gameMode,
          difficultyMode, // Add difficulty to Firebase
          gameDate: new Date()
        });
      } catch (error) {
        console.warn('Failed to save to Firebase, but localStorage succeeded:', error);
      }
    }
    
    return entry;
  } catch (error) {
    console.error('Error saving game result:', error);
    return null;
  }
};

export const getLeaderboard = () => {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    return [];
  }
};

/**
 * Load leaderboard from Firebase and merge with localStorage
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Merged leaderboard entries
 */
export const loadLeaderboardWithSync = async (userId) => {
  try {
    // Get local entries
    const localEntries = getLeaderboard();
    
    if (!userId) {
      // Not logged in, return local only
      return localEntries;
    }
    
    // Get Firebase entries
    const firebaseEntries = await getUserLeaderboardFromFirebase(userId);
    
    // Merge and deduplicate (Firebase is source of truth)
    // Use a Map to avoid duplicates, keyed by a combination of winner, score, and date
    const entriesMap = new Map();
    
    // Add Firebase entries first (higher priority)
    firebaseEntries.forEach(entry => {
      const key = `${entry.winnerName}-${entry.winnerScore}-${new Date(entry.date).toDateString()}`;
      entriesMap.set(key, { ...entry, source: 'firebase' });
    });
    
    // Add local entries that aren't in Firebase
    localEntries.forEach(entry => {
      const key = `${entry.winnerName}-${entry.winnerScore}-${new Date(entry.date).toDateString()}`;
      if (!entriesMap.has(key)) {
        entriesMap.set(key, { ...entry, source: 'local' });
      }
    });
    
    // Convert back to array and sort
    const mergedEntries = Array.from(entriesMap.values())
      .sort((a, b) => b.winnerScore - a.winnerScore)
      .slice(0, MAX_ENTRIES);
    
    // Update localStorage with merged data
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(mergedEntries));
    
    console.log(`✅ Leaderboard synced: ${firebaseEntries.length} from cloud, ${localEntries.length} local, ${mergedEntries.length} total`);
    
    return mergedEntries;
  } catch (error) {
    console.error('Error syncing leaderboard:', error);
    return getLeaderboard(); // Fall back to local
  }
};

export const getTopScores = (limit = 10) => {
  const leaderboard = getLeaderboard();
  return leaderboard.slice(0, limit);
};

export const clearLeaderboard = async (userId = null) => {
  try {
    // Clear localStorage
    localStorage.removeItem(LEADERBOARD_KEY);
    console.log('Leaderboard cleared from localStorage');
    
    // Clear Firebase if user is logged in
    if (userId) {
      try {
        await clearUserLeaderboardFromFirebase(userId);
      } catch (error) {
        console.warn('Failed to clear Firebase leaderboard:', error);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
    return false;
  }
};

export const deleteLeaderboardEntry = async (entryId, isFirebaseId = false, userId = null) => {
  try {
    if (isFirebaseId && userId) {
      // Delete from Firebase
      await deleteLeaderboardEntryFromFirebase(entryId);
    } else {
      // Delete from localStorage
      const leaderboard = getLeaderboard();
      const filtered = leaderboard.filter(entry => entry.id !== entryId);
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(filtered));
      console.log('Leaderboard entry deleted from localStorage:', entryId);
    }
    return true;
  } catch (error) {
    console.error('Error deleting leaderboard entry:', error);
    return false;
  }
};

export const getPlayerStats = (playerName) => {
  const leaderboard = getLeaderboard();
  const playerGames = leaderboard.filter(entry => 
    entry.winnerName.toLowerCase() === playerName.toLowerCase()
  );
  
  if (playerGames.length === 0) {
    return null;
  }
  
  const totalGames = playerGames.length;
  const highScore = Math.max(...playerGames.map(g => g.winnerScore));
  const averageScore = playerGames.reduce((sum, g) => sum + g.winnerScore, 0) / totalGames;
  
  return {
    totalWins: totalGames,
    highScore,
    averageScore: Math.round(averageScore)
  };
};

export const isNewHighScore = (score) => {
  const leaderboard = getLeaderboard();
  if (leaderboard.length === 0) {
    return true; // First score is always a high score
  }
  
  // Check if this score would make it into the top 10
  const top10 = leaderboard.slice(0, 10);
  if (top10.length < 10) {
    return true; // Less than 10 entries, so it's a top 10 score
  }
  
  const lowestTop10 = top10[top10.length - 1].winnerScore;
  return score > lowestTop10;
};

