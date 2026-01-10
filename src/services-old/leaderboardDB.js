// Leaderboard Database Service (Firebase)
// Stores and retrieves leaderboard entries in the cloud

import { db } from '../firebase-config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  deleteDoc,
  doc,
  limit,
  Timestamp 
} from 'firebase/firestore';

/**
 * Save a game result to Firebase leaderboard
 * @param {Object} gameData - Game result data
 * @returns {Promise<string>} - Document ID of the saved entry
 */
export const saveLeaderboardEntryToFirebase = async (gameData) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Leaderboard entry saved to localStorage only.');
      return null;
    }

    const {
      userId,
      winnerName,
      winnerScore,
      opponentName,
      opponentScore,
      gameMode,
      difficultyMode = 'regular', // Add difficulty mode
      gameDate = new Date()
    } = gameData;

    const leaderboardEntry = {
      userId,
      winnerName,
      winnerScore,
      opponentName,
      opponentScore,
      gameMode,
      difficultyMode, // Store difficulty mode
      createdAt: Timestamp.fromDate(gameDate),
      timestamp: Date.now()
    };

    const docRef = await addDoc(collection(db, 'leaderboard'), leaderboardEntry);
    console.log('✅ Leaderboard entry saved to Firebase:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving leaderboard entry to Firebase:', error);
    throw error;
  }
};

/**
 * Get user's leaderboard entries from Firebase
 * @param {string} userId - User ID
 * @param {number} limitCount - Number of entries to retrieve (default: 50)
 * @returns {Promise<Array>} - Array of leaderboard entries
 */
export const getUserLeaderboardFromFirebase = async (userId, limitCount = 50) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Using localStorage only.');
      return [];
    }

    const q = query(
      collection(db, 'leaderboard'),
      where('userId', '==', userId),
      orderBy('winnerScore', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const entries = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        winnerName: data.winnerName,
        winnerScore: data.winnerScore,
        opponentName: data.opponentName,
        opponentScore: data.opponentScore,
        gameMode: data.gameMode,
        difficultyMode: data.difficultyMode || 'regular', // Include difficulty mode
        date: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        timestamp: data.timestamp || Date.now()
      });
    });

    console.log(`✅ Loaded ${entries.length} leaderboard entries from Firebase`);
    return entries;
  } catch (error) {
    console.error('❌ Error loading leaderboard from Firebase:', error);
    return [];
  }
};

/**
 * Get global leaderboard (top scores from all users)
 * @param {number} limitCount - Number of entries to retrieve (default: 50)
 * @returns {Promise<Array>} - Array of top leaderboard entries
 */
export const getGlobalLeaderboardFromFirebase = async (limitCount = 50) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized.');
      return [];
    }

    const q = query(
      collection(db, 'leaderboard'),
      orderBy('winnerScore', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const entries = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        winnerName: data.winnerName,
        winnerScore: data.winnerScore,
        opponentName: data.opponentName,
        opponentScore: data.opponentScore,
        gameMode: data.gameMode,
        difficultyMode: data.difficultyMode || 'regular', // Include difficulty mode
        date: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        timestamp: data.timestamp || Date.now()
      });
    });

    console.log(`✅ Loaded ${entries.length} global leaderboard entries from Firebase`);
    return entries;
  } catch (error) {
    console.error('❌ Error loading global leaderboard from Firebase:', error);
    return [];
  }
};

/**
 * Delete a leaderboard entry from Firebase
 * @param {string} entryId - Document ID to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteLeaderboardEntryFromFirebase = async (entryId) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized.');
      return false;
    }

    await deleteDoc(doc(db, 'leaderboard', entryId));
    console.log('✅ Leaderboard entry deleted from Firebase:', entryId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting leaderboard entry from Firebase:', error);
    return false;
  }
};

/**
 * Clear all leaderboard entries for a user from Firebase
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of entries deleted
 */
export const clearUserLeaderboardFromFirebase = async (userId) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized.');
      return 0;
    }

    const q = query(
      collection(db, 'leaderboard'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = [];

    querySnapshot.forEach((document) => {
      deletePromises.push(deleteDoc(doc(db, 'leaderboard', document.id)));
    });

    await Promise.all(deletePromises);
    console.log(`✅ Cleared ${deletePromises.length} leaderboard entries from Firebase`);
    return deletePromises.length;
  } catch (error) {
    console.error('❌ Error clearing leaderboard from Firebase:', error);
    return 0;
  }
};


