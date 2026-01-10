import { db } from '../firebase-config';
import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ALL_TROPHIES, getTrophyById } from '../config/trophies';
import { checkDeckCompletionStatus, checkSpeedCompletion } from './flashcardCompletionsDB-firebase';

/**
 * Initialize user's trophy case (create document if doesn't exist)
 */
export const initializeTrophyCase = async (userId) => {
  if (!userId) return;

  try {
    const trophyCaseRef = doc(db, 'trophy_cases', userId);
    const trophyCaseSnap = await getDoc(trophyCaseRef);

    if (!trophyCaseSnap.exists()) {
      // Create initial trophy case with all trophies locked
      const initialTrophies = ALL_TROPHIES.map(trophy => ({
        trophyId: trophy.id,
        isUnlocked: false,
        unlockedAt: null,
        progress: 0
      }));

      await setDoc(trophyCaseRef, {
        userId,
        trophies: initialTrophies,
        totalUnlocked: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('Trophy case initialized for user:', userId);
    }
  } catch (error) {
    console.error('Error initializing trophy case:', error);
    throw error;
  }
};

/**
 * Get user's trophy case data
 */
export const getUserTrophyCase = async (userId) => {
  if (!userId) return null;

  try {
    const trophyCaseRef = doc(db, 'trophy_cases', userId);
    const trophyCaseSnap = await getDoc(trophyCaseRef);

    if (trophyCaseSnap.exists()) {
      const data = trophyCaseSnap.data();
      
      // Check if there are any new trophies that need to be added
      const existingTrophyIds = new Set(data.trophies.map(t => t.trophyId));
      const missingTrophies = ALL_TROPHIES.filter(trophy => !existingTrophyIds.has(trophy.id));
      
      if (missingTrophies.length > 0) {
        console.log(`🏆 Found ${missingTrophies.length} new trophies to add to user's trophy case`);
        
        // Add missing trophies
        const newTrophyEntries = missingTrophies.map(trophy => ({
          trophyId: trophy.id,
          isUnlocked: false,
          unlockedAt: null,
          progress: 0
        }));
        
        const updatedTrophies = [...data.trophies, ...newTrophyEntries];
        
        // Update in Firebase
        await updateDoc(trophyCaseRef, {
          trophies: updatedTrophies,
          updatedAt: serverTimestamp()
        });
        
        // Merge with trophy definitions to get full details
        const enrichedTrophies = updatedTrophies.map(userTrophy => {
          const trophyDef = getTrophyById(userTrophy.trophyId);
          return {
            ...trophyDef,
            ...userTrophy
          };
        });

        return {
          ...data,
          trophies: enrichedTrophies
        };
      }
      
      // Merge with trophy definitions to get full details
      const enrichedTrophies = data.trophies.map(userTrophy => {
        const trophyDef = getTrophyById(userTrophy.trophyId);
        return {
          ...trophyDef,
          ...userTrophy
        };
      });

      return {
        ...data,
        trophies: enrichedTrophies
      };
    } else {
      // Initialize if doesn't exist
      await initializeTrophyCase(userId);
      return await getUserTrophyCase(userId);
    }
  } catch (error) {
    console.error('Error getting trophy case:', error);
    throw error;
  }
};

/**
 * Unlock a trophy for a user
 */
export const unlockTrophy = async (userId, trophyId) => {
  if (!userId || !trophyId) return null;

  try {
    const trophyCaseRef = doc(db, 'trophy_cases', userId);
    const trophyCaseSnap = await getDoc(trophyCaseRef);

    if (!trophyCaseSnap.exists()) {
      await initializeTrophyCase(userId);
    }

    const trophyCase = trophyCaseSnap.data();
    const trophies = trophyCase.trophies || [];
    
    // Find the trophy
    const trophyIndex = trophies.findIndex(t => t.trophyId === trophyId);
    
    if (trophyIndex === -1) {
      console.error('Trophy not found:', trophyId);
      return null;
    }

    // Check if already unlocked
    if (trophies[trophyIndex].isUnlocked) {
      console.log('Trophy already unlocked:', trophyId);
      return null;
    }

    // Unlock the trophy
    trophies[trophyIndex].isUnlocked = true;
    trophies[trophyIndex].unlockedAt = new Date().toISOString();

    const totalUnlocked = trophies.filter(t => t.isUnlocked).length;

    await updateDoc(trophyCaseRef, {
      trophies,
      totalUnlocked,
      updatedAt: serverTimestamp()
    });

    console.log('Trophy unlocked:', trophyId);
    
    // Return the unlocked trophy with full details
    const trophyDef = getTrophyById(trophyId);
    return {
      ...trophyDef,
      ...trophies[trophyIndex]
    };
  } catch (error) {
    console.error('Error unlocking trophy:', error);
    throw error;
  }
};

/**
 * Check and unlock trophies based on conditions
 */
export const checkAndUnlockTrophies = async (userId, condition) => {
  if (!userId || !condition) {
    console.log('🏆 Trophy check skipped: missing userId or condition');
    return [];
  }

  console.log('🏆 checkAndUnlockTrophies called with:', { userId, condition });

  const unlockedTrophies = [];

  try {
    // Get user's trophy case
    const trophyCase = await getUserTrophyCase(userId);
    console.log('🏆 User trophy case loaded, total trophies:', trophyCase.trophies.length);
    
    // Find matching trophies that aren't unlocked yet
    const matchingTrophies = [];
    
    for (const trophy of ALL_TROPHIES) {
      // Check if trophy is already unlocked
      const userTrophy = trophyCase.trophies.find(t => t.trophyId === trophy.id);
      if (userTrophy?.isUnlocked) {
        console.log(`🏆 Trophy ${trophy.id} already unlocked, skipping`);
        continue;
      }

      // Match condition
      if (condition.type === 'flashcard_perfect' && trophy.condition.type === 'flashcard_perfect') {
        const matches = trophy.condition.deckId === condition.deckId;
        console.log(`🏆 Checking flashcard trophy ${trophy.id}: deckId ${trophy.condition.deckId} === ${condition.deckId}? ${matches}`);
        if (matches) {
          matchingTrophies.push(trophy);
        }
      } else if (condition.type === 'flashcard_perfect' && trophy.condition.type === 'flashcard_perfect_both') {
        // Check if this deck has been completed in both directions
        if (trophy.condition.deckId === condition.deckId) {
          console.log(`🏆 Checking "both directions" trophy ${trophy.id} for deck ${condition.deckId}`);
          const completionStatus = await checkDeckCompletionStatus(userId, condition.deckId);
          console.log(`🏆 Deck completion status:`, completionStatus);
          if (completionStatus.both) {
            console.log(`🏆 ✅ Deck ${condition.deckId} completed in both directions! Unlocking Silver trophy.`);
            matchingTrophies.push(trophy);
          } else {
            console.log(`🏆 ⏳ Deck ${condition.deckId} not yet completed in both directions (forward: ${completionStatus.forward}, reversed: ${completionStatus.reversed})`);
          }
        }
      } else if (condition.type === 'flashcard_perfect' && trophy.condition.type === 'flashcard_speed') {
        // Check if this deck has been completed under the speed requirement
        if (trophy.condition.deckId === condition.deckId) {
          console.log(`🏆 Checking speed trophy ${trophy.id} for deck ${condition.deckId} (max ${trophy.condition.maxSecondsPerCard}s per card)`);
          const meetsSpeed = await checkSpeedCompletion(userId, condition.deckId, trophy.condition.maxSecondsPerCard);
          if (meetsSpeed) {
            console.log(`🏆 ⚡ Deck ${condition.deckId} completed under time limit! Unlocking Gold trophy.`);
            matchingTrophies.push(trophy);
          } else {
            console.log(`🏆 ⏱️ Deck ${condition.deckId} not completed under time limit yet (required: ${trophy.condition.maxSecondsPerCard}s per card)`);
          }
        }
      } else if (condition.type === 'cpu_victory' && trophy.condition.type === 'cpu_victory') {
        const matches = trophy.condition.cpuId === condition.cpuId;
        console.log(`🏆 Checking CPU trophy ${trophy.id}: cpuId ${trophy.condition.cpuId} === ${condition.cpuId}? ${matches}`);
        if (matches) {
          matchingTrophies.push(trophy);
        }
      } else if (condition.type === trophy.condition.type) {
        console.log(`🏆 Trophy ${trophy.id} matches condition type ${condition.type}`);
        matchingTrophies.push(trophy);
      }
    }
    
    console.log('🏆 Found', matchingTrophies.length, 'matching trophies to unlock');

    // Unlock matching trophies
    for (const trophy of matchingTrophies) {
      const unlockedTrophy = await unlockTrophy(userId, trophy.id);
      if (unlockedTrophy) {
        unlockedTrophies.push(unlockedTrophy);
      }
    }

    // Check for meta-achievements (all flashcards, all CPUs, etc.)
    if (condition.type === 'flashcard_perfect') {
      await checkMetaAchievements(userId, 'flashcards');
    }
    if (condition.type === 'cpu_victory') {
      await checkMetaAchievements(userId, 'cpu');
    }

    return unlockedTrophies;
  } catch (error) {
    console.error('Error checking and unlocking trophies:', error);
    return [];
  }
};

/**
 * Check for meta-achievements (e.g., all flashcards perfect, all CPUs defeated)
 */
const checkMetaAchievements = async (userId, type) => {
  try {
    const trophyCase = await getUserTrophyCase(userId);
    
    if (type === 'flashcards') {
      // Check if all flashcard trophies are unlocked
      const flashcardTrophies = ALL_TROPHIES.filter(t => t.condition.type === 'flashcard_perfect');
      const allUnlocked = flashcardTrophies.every(trophy => {
        const userTrophy = trophyCase.trophies.find(t => t.trophyId === trophy.id);
        return userTrophy?.isUnlocked;
      });

      if (allUnlocked) {
        await unlockTrophy(userId, 'flashcard-master');
      }
    }

    if (type === 'cpu') {
      // Check if all CPU trophies are unlocked
      const cpuTrophies = ALL_TROPHIES.filter(t => t.condition.type === 'cpu_victory');
      const allUnlocked = cpuTrophies.every(trophy => {
        const userTrophy = trophyCase.trophies.find(t => t.trophyId === trophy.id);
        return userTrophy?.isUnlocked;
      });

      if (allUnlocked) {
        await unlockTrophy(userId, 'cpu-conqueror');
      }
    }
  } catch (error) {
    console.error('Error checking meta achievements:', error);
  }
};

/**
 * Get trophy statistics for user
 */
export const getTrophyStats = async (userId) => {
  if (!userId) return null;

  try {
    const trophyCase = await getUserTrophyCase(userId);
    
    const stats = {
      total: ALL_TROPHIES.length,
      unlocked: trophyCase.totalUnlocked || 0,
      locked: ALL_TROPHIES.length - (trophyCase.totalUnlocked || 0),
      byCategory: {},
      byTier: {}
    };

    // Count by category
    trophyCase.trophies.forEach(trophy => {
      const trophyDef = getTrophyById(trophy.trophyId);
      if (!trophyDef) return;

      if (!stats.byCategory[trophyDef.category]) {
        stats.byCategory[trophyDef.category] = { total: 0, unlocked: 0 };
      }
      stats.byCategory[trophyDef.category].total++;
      if (trophy.isUnlocked) {
        stats.byCategory[trophyDef.category].unlocked++;
      }

      if (!stats.byTier[trophyDef.tier]) {
        stats.byTier[trophyDef.tier] = { total: 0, unlocked: 0 };
      }
      stats.byTier[trophyDef.tier].total++;
      if (trophy.isUnlocked) {
        stats.byTier[trophyDef.tier].unlocked++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting trophy stats:', error);
    return null;
  }
};

