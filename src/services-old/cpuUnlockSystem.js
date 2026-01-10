import { db } from '../firebase-config';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs 
} from 'firebase/firestore';

/**
 * CPU Unlock System
 * 
 * Manages unlocking CPU opponents based on player performance and achievements
 */

// Collection name
const UNLOCKS_COLLECTION = 'cpu_unlocks';

/**
 * Default unlock state - only First-Timer Fred is unlocked initially
 */
const getDefaultUnlockState = () => {
  return {
    'first-timer': true,  // Always unlocked
    'celebrity': false,
    '5-day-champ': false,
    'college-champ': false,
    'teacher-champ': false,
    'sam-buttrey': false,
    'austin-rogers': false,
    'matt-amodio': false,
    'buzzy-cohen': false,
    'amy-schneider': false,
    'victoria-groce': false,
    'brad-rutter': false,
    'ken-jennings': false,
    'james-holzhauer': false,
    // Secret bosses - always locked initially
    'arthur-chu': false,
    'roger-craig': false,
    'mark-labbett': false,
    'alex-trebek': false
  };
};

/**
 * Unlock requirements for each opponent
 * 
 * Regular opponents: Sequential progression (beat previous to unlock next)
 * Secret bosses: Special criteria + Ken Jennings must be beaten to see them
 */
export const UNLOCK_REQUIREMENTS = {
  'first-timer': {
    requirement: 'none',
    description: 'Always available'
  },
  'celebrity': {
    requirement: 'beat',
    beatOpponent: 'first-timer',
    description: 'Beat First-Timer Fred'
  },
  '5-day-champ': {
    requirement: 'beat',
    beatOpponent: 'celebrity',
    description: 'Beat Celebrity Casey'
  },
  'college-champ': {
    requirement: 'beat',
    beatOpponent: '5-day-champ',
    description: 'Beat 5-Day Champion'
  },
  'teacher-champ': {
    requirement: 'beat',
    beatOpponent: 'college-champ',
    description: 'Beat College Champion'
  },
  'sam-buttrey': {
    requirement: 'beat',
    beatOpponent: 'teacher-champ',
    description: 'Beat Teacher Champion'
  },
  'austin-rogers': {
    requirement: 'beat',
    beatOpponent: 'sam-buttrey',
    description: 'Beat Sam Buttrey'
  },
  'matt-amodio': {
    requirement: 'beat',
    beatOpponent: 'austin-rogers',
    description: 'Beat Austin Rogers'
  },
  'buzzy-cohen': {
    requirement: 'beat',
    beatOpponent: 'matt-amodio',
    description: 'Beat Matt Amodio'
  },
  'amy-schneider': {
    requirement: 'beat',
    beatOpponent: 'buzzy-cohen',
    description: 'Beat Buzzy Cohen'
  },
  'victoria-groce': {
    requirement: 'beat',
    beatOpponent: 'amy-schneider',
    description: 'Beat Amy Schneider'
  },
  'brad-rutter': {
    requirement: 'beat',
    beatOpponent: 'victoria-groce',
    description: 'Beat Victoria Groce'
  },
  'ken-jennings': {
    requirement: 'beat',
    beatOpponent: 'brad-rutter',
    description: 'Beat Brad Rutter'
  },
  'james-holzhauer': {
    requirement: 'special',
    isSecret: true, // James is now a hidden boss!
    visibleAfterBeating: 'ken-jennings', // Becomes visible after beating Ken
    criteria: {
      type: 'high_score',
      minScore: 50000 // Must score $50,000+ in any game (James's average)
    },
    description: "Score $50,000 or more in a single game (James's average)",
    shortDescription: "Score $50K+ in one game"
  },
  
  // ═══════════════════════════════════════════════════════════
  // SECRET BOSSES - Visible only after beating Ken Jennings
  // Require special criteria to unlock
  // ═══════════════════════════════════════════════════════════
  
  'arthur-chu': {
    requirement: 'special',
    isSecret: true,
    visibleAfterBeating: 'ken-jennings', // Becomes visible after beating Ken
    criteria: {
      type: 'beat_opponent_with_score',
      beatOpponent: 'james-holzhauer',
      minScore: 30000 // Must beat James with at least $30,000
    },
    description: 'Beat James Holzhauer with a score of $30,000 or more',
    shortDescription: 'High-scoring victory vs James'
  },
  'roger-craig': {
    requirement: 'special',
    isSecret: true,
    visibleAfterBeating: 'ken-jennings',
    criteria: {
      type: 'consecutive_wins',
      count: 5, // Win 5 games in a row
      minDifficulty: 10 // Against difficulty 10+ opponents
    },
    description: 'Win 5 consecutive games against Expert-tier opponents (difficulty 10+)',
    shortDescription: '5-win streak vs Experts'
  },
  'mark-labbett': {
    requirement: 'special',
    isSecret: true,
    visibleAfterBeating: 'ken-jennings',
    criteria: {
      type: 'perfect_game',
      minDifficulty: 12 // Perfect game against Master tier or higher
    },
    description: 'Achieve a perfect game (100% accuracy) against Brad Rutter or higher',
    shortDescription: 'Perfect game vs Master+'
  },
  'alex-trebek': {
    requirement: 'special',
    isSecret: true,
    visibleAfterBeating: 'ken-jennings',
    criteria: {
      type: 'beat_all_secret',
      requiredOpponents: ['arthur-chu', 'roger-craig', 'mark-labbett']
    },
    description: 'Beat all other Legendary opponents (Arthur Chu, Roger Craig, and The Beast)',
    shortDescription: 'Beat all Legendary bosses'
  }
};

/**
 * Get user's unlock state from Firebase
 */
export async function getUserUnlockState(userId) {
  if (!userId) {
    console.log('No user ID provided, using default unlock state');
    return getDefaultUnlockState();
  }

  try {
    const unlockDoc = doc(db, UNLOCKS_COLLECTION, userId);
    const docSnap = await getDoc(unlockDoc);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('Loaded unlock state from Firebase:', data.unlocks);
      return data.unlocks || getDefaultUnlockState();
    } else {
      // Initialize with default state
      console.log('No unlock state found, initializing defaults');
      const defaultState = getDefaultUnlockState();
      await setDoc(unlockDoc, {
        unlocks: defaultState,
        lastUpdated: new Date().toISOString()
      });
      return defaultState;
    }
  } catch (error) {
    console.error('Error getting unlock state:', error);
    return getDefaultUnlockState();
  }
}

/**
 * Update unlock state in Firebase
 */
export async function updateUnlockState(userId, opponentId, unlocked = true) {
  if (!userId) {
    console.warn('Cannot update unlock state: no user ID');
    return false;
  }

  try {
    const unlockDoc = doc(db, UNLOCKS_COLLECTION, userId);
    const docSnap = await getDoc(unlockDoc);

    let currentState;
    if (docSnap.exists()) {
      currentState = docSnap.data().unlocks || getDefaultUnlockState();
    } else {
      currentState = getDefaultUnlockState();
    }

    // Update the specific opponent
    currentState[opponentId] = unlocked;

    await setDoc(unlockDoc, {
      unlocks: currentState,
      lastUpdated: new Date().toISOString()
    }, { merge: true });

    console.log(`✓ Unlocked ${opponentId} for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error updating unlock state:', error);
    return false;
  }
}

/**
 * Check if user has achieved a high score in any game
 */
export async function hasHighScore(userId, minScore) {
  if (!userId) {
    return false;
  }

  try {
    const matchesRef = collection(db, 'cpu_match_history');
    const q = query(
      matchesRef,
      where('userId', '==', userId),
      where('playerScore', '>=', minScore)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking high score:', error);
    return false;
  }
}

/**
 * Check if user has beaten an opponent with a specific score
 */
export async function hasBeatenOpponentWithScore(userId, opponentId, minScore) {
  if (!userId) {
    return false;
  }

  try {
    const matchesRef = collection(db, 'cpu_match_history');
    const q = query(
      matchesRef,
      where('userId', '==', userId),
      where('opponentId', '==', opponentId),
      where('won', '==', true),
      where('playerScore', '>=', minScore)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking score-based victory:', error);
    return false;
  }
}

/**
 * Check if user has consecutive wins against difficulty tier
 */
export async function hasConsecutiveWins(userId, count, minDifficulty) {
  if (!userId) {
    return false;
  }

  try {
    const matchesRef = collection(db, 'cpu_match_history');
    const q = query(
      matchesRef,
      where('userId', '==', userId),
      where('difficulty', '>=', minDifficulty),
      where('won', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const matches = [];
    querySnapshot.forEach((doc) => {
      matches.push({ ...doc.data(), id: doc.id });
    });

    // Sort by timestamp
    matches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Check for consecutive wins
    let consecutiveCount = 0;
    for (const match of matches) {
      if (match.won) {
        consecutiveCount++;
        if (consecutiveCount >= count) {
          return true;
        }
      } else {
        consecutiveCount = 0; // Reset on loss
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking consecutive wins:', error);
    return false;
  }
}

/**
 * Check if user has achieved a perfect game against difficulty tier
 */
export async function hasPerfectGame(userId, minDifficulty) {
  if (!userId) {
    return false;
  }

  try {
    const matchesRef = collection(db, 'cpu_match_history');
    const q = query(
      matchesRef,
      where('userId', '==', userId),
      where('difficulty', '>=', minDifficulty),
      where('won', '==', true),
      where('accuracy', '==', 1.0) // 100% accuracy
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking perfect game:', error);
    return false;
  }
}

/**
 * Check if user has beaten all required secret bosses
 */
export async function hasBeatenAllSecretBosses(userId, requiredOpponents) {
  if (!userId || !requiredOpponents) {
    return false;
  }

  for (const opponentId of requiredOpponents) {
    const beaten = await hasBeatenOpponent(userId, opponentId);
    if (!beaten) {
      return false;
    }
  }

  return true;
}

/**
 * Check special criteria for secret boss unlocks
 */
export async function checkSpecialCriteria(userId, criteria) {
  if (!userId || !criteria) {
    return false;
  }

  switch (criteria.type) {
    case 'high_score':
      return await hasHighScore(userId, criteria.minScore);

    case 'beat_opponent_with_score':
      return await hasBeatenOpponentWithScore(
        userId,
        criteria.beatOpponent,
        criteria.minScore
      );

    case 'consecutive_wins':
      return await hasConsecutiveWins(
        userId,
        criteria.count,
        criteria.minDifficulty
      );

    case 'perfect_game':
      return await hasPerfectGame(userId, criteria.minDifficulty);

    case 'beat_all_secret':
      return await hasBeatenAllSecretBosses(userId, criteria.requiredOpponents);

    default:
      console.warn(`Unknown criteria type: ${criteria.type}`);
      return false;
  }
}

/**
 * Check if user has beaten an opponent
 */
export async function hasBeatenOpponent(userId, opponentId) {
  if (!userId) {
    console.log('❌ hasBeatenOpponent: No userId provided');
    return false;
  }

  console.log(`🔍 Checking if user ${userId} has beaten: ${opponentId}`);

  try {
    // Query the cpuMatchHistory collection
    const matchesRef = collection(db, 'cpuMatchHistory');
    const q = query(
      matchesRef,
      where('userId', '==', userId),
      where('cpuOpponentId', '==', opponentId),
      where('playerWon', '==', true)
    );

    console.log(`  → Querying cpuMatchHistory for userId=${userId}, cpuOpponentId=${opponentId}, playerWon=true`);
    const querySnapshot = await getDocs(q);
    const hasWon = !querySnapshot.empty;
    console.log(`  → Found ${querySnapshot.size} winning matches. Result: ${hasWon ? 'BEATEN' : 'NOT BEATEN'}`);
    
    return hasWon;
  } catch (error) {
    console.error('❌ Error checking if opponent beaten:', error);
    return false;
  }
}

/**
 * Check unlock conditions and unlock opponents
 * Returns array of newly unlocked opponent IDs
 */
export async function checkAndUnlockOpponents(userId) {
  if (!userId) {
    console.log('❌ No userId provided to checkAndUnlockOpponents');
    return [];
  }

  console.log('🔍 Checking unlock conditions for user:', userId);

  try {
    const currentUnlocks = await getUserUnlockState(userId);
    console.log('📋 Current unlock state:', currentUnlocks);
    const newlyUnlocked = [];

    // Check each locked opponent
    for (const [opponentId, requirement] of Object.entries(UNLOCK_REQUIREMENTS)) {
      // Skip if already unlocked
      if (currentUnlocks[opponentId]) {
        console.log(`✓ ${opponentId} already unlocked, skipping`);
        continue;
      }

      console.log(`🔒 Checking ${opponentId}:`, requirement);

      // Check if requirement is met
      if (requirement.requirement === 'none') {
        console.log(`  → ${opponentId} requires nothing (starter)`);
        continue; // First-timer is always unlocked
      }

      if (requirement.requirement === 'beat') {
        // Regular progression: beat previous opponent
        console.log(`  → Checking if user has beaten: ${requirement.beatOpponent}`);
        const hasBeaten = await hasBeatenOpponent(userId, requirement.beatOpponent);
        console.log(`  → Result: ${hasBeaten ? 'YES' : 'NO'}`);
        
        if (hasBeaten) {
          console.log(`  → 🎉 Unlocking ${opponentId}!`);
          await updateUnlockState(userId, opponentId, true);
          newlyUnlocked.push(opponentId);
          console.log(`🎉 Unlocked new opponent: ${opponentId}`);
        }
      }
      
      if (requirement.requirement === 'special') {
        // Secret bosses: check special criteria
        // Note: They also need Ken Jennings beaten to be visible
        const criteriaMet = await checkSpecialCriteria(userId, requirement.criteria);
        if (criteriaMet) {
          await updateUnlockState(userId, opponentId, true);
          newlyUnlocked.push(opponentId);
          console.log(`🎉 Unlocked secret boss: ${opponentId}`);
        }
      }
    }

    console.log('✅ Unlock check complete. Newly unlocked:', newlyUnlocked);
    return newlyUnlocked;
  } catch (error) {
    console.error('❌ Error checking unlock conditions:', error);
    return [];
  }
}

/**
 * Get list of unlocked opponents
 */
export async function getUnlockedOpponents(userId) {
  const unlockState = await getUserUnlockState(userId);
  return Object.entries(unlockState)
    .filter(([id, unlocked]) => unlocked)
    .map(([id]) => id);
}

/**
 * Get list of locked opponents
 */
export async function getLockedOpponents(userId) {
  const unlockState = await getUserUnlockState(userId);
  return Object.entries(unlockState)
    .filter(([id, unlocked]) => !unlocked)
    .map(([id]) => id);
}

/**
 * Check if secret bosses should be visible to the user
 * Secret bosses become visible after beating Ken Jennings
 */
export async function areSecretBossesVisible(userId) {
  if (!userId) {
    return false;
  }
  
  // Check if user has beaten Ken Jennings
  return await hasBeatenOpponent(userId, 'ken-jennings');
}

/**
 * Check if a specific opponent is unlocked
 */
export async function isOpponentUnlocked(userId, opponentId) {
  const unlockState = await getUserUnlockState(userId);
  return unlockState[opponentId] || false;
}

/**
 * Get next opponent to unlock
 */
export async function getNextOpponentToUnlock(userId) {
  const unlockState = await getUserUnlockState(userId);
  
  // Find the first locked opponent in order
  const orderedOpponents = [
    'first-timer',
    'celebrity',
    '5-day-champ',
    'college-champ',
    'teacher-champ',
    'sam-buttrey',
    'austin-rogers',
    'matt-amodio',
    'buzzy-cohen',
    'amy-schneider',
    'victoria-groce',
    'brad-rutter',
    'ken-jennings',
    'james-holzhauer',
    'arthur-chu',
    'roger-craig',
    'mark-labbett',
    'alex-trebek'
  ];

  for (const opponentId of orderedOpponents) {
    if (!unlockState[opponentId]) {
      return {
        opponentId,
        requirement: UNLOCK_REQUIREMENTS[opponentId]
      };
    }
  }

  return null; // All opponents unlocked!
}

/**
 * Reset all unlocks (for testing/debugging)
 */
export async function resetUnlocks(userId) {
  if (!userId) {
    return false;
  }

  try {
    const unlockDoc = doc(db, UNLOCKS_COLLECTION, userId);
    await setDoc(unlockDoc, {
      unlocks: getDefaultUnlockState(),
      lastUpdated: new Date().toISOString()
    });
    console.log('Reset unlocks to default state');
    return true;
  } catch (error) {
    console.error('Error resetting unlocks:', error);
    return false;
  }
}

/**
 * Unlock all opponents (for testing)
 */
export async function unlockAllOpponents(userId) {
  if (!userId) {
    return false;
  }

  try {
    const unlockDoc = doc(db, UNLOCKS_COLLECTION, userId);
    const allUnlocked = {};
    
    Object.keys(UNLOCK_REQUIREMENTS).forEach(opponentId => {
      allUnlocked[opponentId] = true;
    });

    await setDoc(unlockDoc, {
      unlocks: allUnlocked,
      lastUpdated: new Date().toISOString()
    });
    
    console.log('Unlocked all opponents');
    return true;
  } catch (error) {
    console.error('Error unlocking all opponents:', error);
    return false;
  }
}

