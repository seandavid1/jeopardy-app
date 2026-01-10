import { db } from '../firebase-config';
import { collection, doc, setDoc, getDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

/**
 * Record a perfect flashcard deck completion
 * @param {string} userId - User ID
 * @param {string} deckId - Deck ID
 * @param {boolean} isReversed - Whether the deck was completed in reverse mode
 * @param {number} averageSecondsPerCard - Average time per card (optional, for speed tracking)
 * @param {number} totalCards - Total number of cards (optional, for speed tracking)
 */
export const recordFlashcardCompletion = async (userId, deckId, isReversed, averageSecondsPerCard = null, totalCards = null) => {
  if (!userId || !deckId) {
    console.error('Missing userId or deckId for flashcard completion');
    return;
  }

  try {
    const completionId = `${userId}_${deckId}`;
    const completionRef = doc(db, 'flashcard_completions', completionId);
    
    // Get existing completion record
    const completionSnap = await getDoc(completionRef);
    
    const now = new Date().toISOString();
    
    if (completionSnap.exists()) {
      // Update existing record
      const data = completionSnap.data();
      const updatedData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      if (isReversed) {
        updatedData.reversedCompletedAt = now;
        updatedData.reversedCount = (data.reversedCount || 0) + 1;
        
        // Track speed if provided and it's the best time
        if (averageSecondsPerCard !== null) {
          if (!data.bestReversedSecondsPerCard || averageSecondsPerCard < data.bestReversedSecondsPerCard) {
            updatedData.bestReversedSecondsPerCard = averageSecondsPerCard;
            updatedData.bestReversedCompletedAt = now;
          }
        }
      } else {
        updatedData.forwardCompletedAt = now;
        updatedData.forwardCount = (data.forwardCount || 0) + 1;
        
        // Track speed if provided and it's the best time
        if (averageSecondsPerCard !== null) {
          if (!data.bestForwardSecondsPerCard || averageSecondsPerCard < data.bestForwardSecondsPerCard) {
            updatedData.bestForwardSecondsPerCard = averageSecondsPerCard;
            updatedData.bestForwardCompletedAt = now;
          }
        }
      }
      
      await setDoc(completionRef, updatedData, { merge: true });
      console.log(`🎯 Updated flashcard completion: ${deckId} (${isReversed ? 'reversed' : 'forward'})${averageSecondsPerCard ? ` - ${averageSecondsPerCard.toFixed(2)}s/card` : ''}`);
    } else {
      // Create new record
      const newData = {
        userId,
        deckId,
        forwardCompletedAt: isReversed ? null : now,
        reversedCompletedAt: isReversed ? now : null,
        forwardCount: isReversed ? 0 : 1,
        reversedCount: isReversed ? 1 : 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add speed tracking if provided
      if (averageSecondsPerCard !== null) {
        if (isReversed) {
          newData.bestReversedSecondsPerCard = averageSecondsPerCard;
          newData.bestReversedCompletedAt = now;
        } else {
          newData.bestForwardSecondsPerCard = averageSecondsPerCard;
          newData.bestForwardCompletedAt = now;
        }
      }
      
      await setDoc(completionRef, newData);
      console.log(`🎯 Created flashcard completion: ${deckId} (${isReversed ? 'reversed' : 'forward'})${averageSecondsPerCard ? ` - ${averageSecondsPerCard.toFixed(2)}s/card` : ''}`);
    }
  } catch (error) {
    console.error('Error recording flashcard completion:', error);
  }
};

/**
 * Check if a deck has been completed in both directions
 * @param {string} userId - User ID
 * @param {string} deckId - Deck ID
 * @returns {Object} - { forward: boolean, reversed: boolean, both: boolean }
 */
export const checkDeckCompletionStatus = async (userId, deckId) => {
  if (!userId || !deckId) {
    return { forward: false, reversed: false, both: false };
  }

  try {
    const completionId = `${userId}_${deckId}`;
    const completionRef = doc(db, 'flashcard_completions', completionId);
    const completionSnap = await getDoc(completionRef);
    
    if (!completionSnap.exists()) {
      return { forward: false, reversed: false, both: false };
    }
    
    const data = completionSnap.data();
    const forward = !!data.forwardCompletedAt;
    const reversed = !!data.reversedCompletedAt;
    const both = forward && reversed;
    
    return { forward, reversed, both };
  } catch (error) {
    console.error('Error checking deck completion status:', error);
    return { forward: false, reversed: false, both: false };
  }
};

/**
 * Check if a deck has been completed under the speed requirement
 * @param {string} userId - User ID
 * @param {string} deckId - Deck ID
 * @param {number} maxSecondsPerCard - Maximum allowed seconds per card
 * @returns {boolean} - true if speed requirement met in either direction
 */
export const checkSpeedCompletion = async (userId, deckId, maxSecondsPerCard) => {
  if (!userId || !deckId || !maxSecondsPerCard) {
    return false;
  }

  try {
    const completionId = `${userId}_${deckId}`;
    const completionRef = doc(db, 'flashcard_completions', completionId);
    const completionSnap = await getDoc(completionRef);
    
    if (!completionSnap.exists()) {
      return false;
    }
    
    const data = completionSnap.data();
    
    // Check if either forward or reversed best time meets the requirement
    const forwardMeetsRequirement = data.bestForwardSecondsPerCard && data.bestForwardSecondsPerCard <= maxSecondsPerCard;
    const reversedMeetsRequirement = data.bestReversedSecondsPerCard && data.bestReversedSecondsPerCard <= maxSecondsPerCard;
    
    const meetsRequirement = forwardMeetsRequirement || reversedMeetsRequirement;
    
    console.log(`⏱️ Speed check for ${deckId}: forward=${data.bestForwardSecondsPerCard?.toFixed(2)}s, reversed=${data.bestReversedSecondsPerCard?.toFixed(2)}s, required=${maxSecondsPerCard}s, meets=${meetsRequirement}`);
    
    return meetsRequirement;
  } catch (error) {
    console.error('Error checking speed completion:', error);
    return false;
  }
};

/**
 * Get all flashcard completions for a user
 * @param {string} userId - User ID
 * @returns {Array} - Array of completion records
 */
export const getUserFlashcardCompletions = async (userId) => {
  if (!userId) {
    return [];
  }

  try {
    const q = query(
      collection(db, 'flashcard_completions'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const completions = [];
    
    querySnapshot.forEach((doc) => {
      completions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`📊 Retrieved ${completions.length} flashcard completions for user`);
    return completions;
  } catch (error) {
    console.error('Error getting user flashcard completions:', error);
    return [];
  }
};

