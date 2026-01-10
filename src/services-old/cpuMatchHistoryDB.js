// CPU Match History Database Service
// Stores and retrieves match results against CPU opponents

import { db } from '../firebase-config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  limit,
  Timestamp 
} from 'firebase/firestore';

/**
 * Save a CPU match result to Firebase
 * @param {Object} matchData - Match result data
 * @returns {Promise<string>} - Document ID of the saved match
 */
export const saveCPUMatchResult = async (matchData) => {
  try {
    if (!db) {
      console.error('Firebase not initialized. Cannot save match history.');
      return null;
    }

    const {
      userId,
      playerName,
      cpuOpponentId,
      cpuOpponentName,
      cpuDifficulty,
      playerScore,
      cpuScore,
      playerWon,
      gameDate = new Date(),
      gameDuration = null,
      totalQuestions = 0,
      correctAnswers = 0,
      accuracy = 0
    } = matchData;

    const matchRecord = {
      userId,
      playerName,
      cpuOpponentId,
      cpuOpponentName,
      cpuDifficulty,
      playerScore,
      cpuScore,
      playerWon,
      gameDate: Timestamp.fromDate(gameDate),
      gameDuration,
      totalQuestions,
      correctAnswers,
      accuracy,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'cpuMatchHistory'), matchRecord);
    console.log('Match result saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving CPU match result:', error);
    throw error;
  }
};

/**
 * Get all match history for a specific user
 * @param {string} userId - User ID
 * @param {number} limitCount - Number of records to retrieve
 * @returns {Promise<Array>} - Array of match records
 */
export const getUserMatchHistory = async (userId, limitCount = 50) => {
  try {
    if (!db) {
      console.error('Firebase not initialized. Cannot retrieve match history.');
      return [];
    }

    const q = query(
      collection(db, 'cpuMatchHistory'),
      where('userId', '==', userId),
      orderBy('gameDate', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const matches = [];
    
    querySnapshot.forEach((doc) => {
      matches.push({
        id: doc.id,
        ...doc.data(),
        gameDate: doc.data().gameDate?.toDate() // Convert Firestore Timestamp to Date
      });
    });

    return matches;
  } catch (error) {
    console.error('Error getting user match history:', error);
    throw error;
  }
};

/**
 * Get match history for a user against a specific CPU opponent
 * @param {string} userId - User ID
 * @param {string} cpuOpponentId - CPU opponent ID
 * @returns {Promise<Array>} - Array of match records
 */
export const getMatchHistoryVsOpponent = async (userId, cpuOpponentId) => {
  try {
    if (!db) {
      console.error('Firebase not initialized. Cannot retrieve match history.');
      return [];
    }

    const q = query(
      collection(db, 'cpuMatchHistory'),
      where('userId', '==', userId),
      where('cpuOpponentId', '==', cpuOpponentId),
      orderBy('gameDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const matches = [];
    
    querySnapshot.forEach((doc) => {
      matches.push({
        id: doc.id,
        ...doc.data(),
        gameDate: doc.data().gameDate?.toDate()
      });
    });

    return matches;
  } catch (error) {
    console.error('Error getting match history vs opponent:', error);
    throw error;
  }
};

/**
 * Get statistics summary for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Statistics summary
 */
export const getUserStatistics = async (userId) => {
  try {
    if (!db) {
      console.error('Firebase not initialized. Cannot retrieve statistics.');
      return getDefaultStatistics();
    }

    const matches = await getUserMatchHistory(userId, 1000); // Get all matches
    
    if (matches.length === 0) {
      return getDefaultStatistics();
    }

    // Calculate overall statistics
    const totalMatches = matches.length;
    const wins = matches.filter(m => m.playerWon).length;
    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
    
    // Total points scored
    const totalPoints = matches.reduce((sum, m) => sum + (m.playerScore || 0), 0);
    const avgScore = totalMatches > 0 ? Math.round(totalPoints / totalMatches) : 0;
    
    // Best score
    const bestScore = matches.length > 0 
      ? Math.max(...matches.map(m => m.playerScore || 0))
      : 0;
    
    // Calculate per-opponent statistics
    const opponentStats = {};
    matches.forEach(match => {
      if (!opponentStats[match.cpuOpponentId]) {
        opponentStats[match.cpuOpponentId] = {
          opponentName: match.cpuOpponentName,
          difficulty: match.cpuDifficulty,
          matches: 0,
          wins: 0,
          losses: 0,
          totalPlayerScore: 0,
          totalCpuScore: 0,
          bestScore: 0,
          lastPlayed: null
        };
      }
      
      const stats = opponentStats[match.cpuOpponentId];
      stats.matches++;
      if (match.playerWon) stats.wins++;
      else stats.losses++;
      stats.totalPlayerScore += match.playerScore || 0;
      stats.totalCpuScore += match.cpuScore || 0;
      stats.bestScore = Math.max(stats.bestScore, match.playerScore || 0);
      
      if (!stats.lastPlayed || match.gameDate > stats.lastPlayed) {
        stats.lastPlayed = match.gameDate;
      }
    });
    
    // Calculate win rates for each opponent
    Object.keys(opponentStats).forEach(opponentId => {
      const stats = opponentStats[opponentId];
      stats.winRate = stats.matches > 0 ? (stats.wins / stats.matches) * 100 : 0;
      stats.avgPlayerScore = stats.matches > 0 ? Math.round(stats.totalPlayerScore / stats.matches) : 0;
      stats.avgCpuScore = stats.matches > 0 ? Math.round(stats.totalCpuScore / stats.matches) : 0;
    });
    
    return {
      totalMatches,
      wins,
      losses,
      winRate,
      avgScore,
      bestScore,
      opponentStats,
      recentMatches: matches.slice(0, 10) // Last 10 matches
    };
  } catch (error) {
    console.error('Error calculating user statistics:', error);
    return getDefaultStatistics();
  }
};

/**
 * Get default statistics structure
 */
const getDefaultStatistics = () => ({
  totalMatches: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  avgScore: 0,
  bestScore: 0,
  opponentStats: {},
  recentMatches: []
});

export default {
  saveCPUMatchResult,
  getUserMatchHistory,
  getMatchHistoryVsOpponent,
  getUserStatistics
};

