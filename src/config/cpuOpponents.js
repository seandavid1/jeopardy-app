// CPU Opponent Configurations for Jeopardy Game

export const CPU_OPPONENTS = [
  // Tier 1: Beginner (60-68% accuracy)
  {
    id: 'first-timer',
    name: 'First-Timer Fred',
    difficulty: 1,
    tier: 'Beginner',
    isLocked: false, // Always unlocked - starter opponent
    accuracy: 0.60,
    responseTime: { min: 2500, max: 3500 }, // 2.5-3.5 seconds
    dailyDoubleStrategy: {
      minBet: 200,
      maxBet: 1000,
      riskTolerance: 0.1 // Very conservative
    },
    finalJeopardyStrategy: {
      leadingBet: 0.3, // Bet 30% when ahead
      trailingBet: 0.8, // Bet 80% when behind
      closeGameBet: 0.5
    },
    clueSelectionStrategy: 'top-to-bottom', // Starts with easier questions
    categoryStrengths: {}, // All categories equal
    avatar: {
      seed: 'first-timer-fred',
      style: 'custom',
      customImage: '/avatars/cpu/first-timer-fred.png',
      backgroundColor: '#e3f2fd'
    },
    bio: 'A nervous newcomer just happy to be here!'
  },
  {
    id: 'celebrity',
    name: 'Celebrity Casey',
    difficulty: 2,
    tier: 'Beginner',
    isLocked: true, // Unlock by beating First-Timer Fred
    accuracy: 0.68,
    responseTime: { min: 2300, max: 3300 }, // 2.3-3.3 seconds
    dailyDoubleStrategy: {
      minBet: 300,
      maxBet: 1500,
      riskTolerance: 0.15
    },
    finalJeopardyStrategy: {
      leadingBet: 0.4,
      trailingBet: 0.9,
      closeGameBet: 0.6
    },
    clueSelectionStrategy: 'top-to-bottom', // Plays it safe
    categoryStrengths: {
      'POP CULTURE': 0.65,
      'ENTERTAINMENT': 0.65
    },
    avatar: {
      seed: 'celebrity-casey',
      style: 'custom',
      customImage: '/avatars/cpu/celebrity-casey.png',
      backgroundColor: '#fff3e0'
    },
    bio: 'Famous face, but not for Jeopardy prowess!'
  },

  // Tier 2: Intermediate (65-73% accuracy)
  {
    id: '5-day-champ',
    name: '5-Day Champion',
    difficulty: 3,
    tier: 'Intermediate',
    isLocked: true, // Unlock by beating First-Timer Fred
    accuracy: 0.65,
    responseTime: { min: 2100, max: 3100 }, // 2.1-3.1 seconds
    dailyDoubleStrategy: {
      minBet: 500,
      maxBet: 2000,
      riskTolerance: 0.25
    },
    finalJeopardyStrategy: {
      leadingBet: 0.5,
      trailingBet: 0.95,
      closeGameBet: 0.7
    },
    clueSelectionStrategy: 'top-to-bottom', // Methodical approach
    categoryStrengths: {},
    avatar: {
      seed: '5-day-champion',
      style: 'custom',
      customImage: '/avatars/cpu/five-time-champion.png',
      backgroundColor: '#e8f5e9'
    },
    bio: 'Solid winner with a proven track record.'
  },
  {
    id: 'college-champ',
    name: 'College Champion',
    difficulty: 4,
    tier: 'Intermediate',
    isLocked: true, // Unlock by beating First-Timer Fred
    accuracy: 0.69,
    responseTime: { min: 1900, max: 2900 }, // 1.9-2.9 seconds
    dailyDoubleStrategy: {
      minBet: 600,
      maxBet: 2500,
      riskTolerance: 0.3
    },
    finalJeopardyStrategy: {
      leadingBet: 0.5,
      trailingBet: 1.0,
      closeGameBet: 0.75
    },
    clueSelectionStrategy: 'middle-out', // Balanced strategy
    categoryStrengths: {
      'SCIENCE': 0.70,
      'LITERATURE': 0.70
    },
    avatar: {
      seed: 'college-champion',
      style: 'custom',
      customImage: '/avatars/cpu/college-champion.png',
      backgroundColor: '#f3e5f5'
    },
    bio: 'Young, eager, and academically sharp!'
  },
  {
    id: 'teacher-champ',
    name: 'Teacher Champion',
    difficulty: 5,
    tier: 'Intermediate',
    isLocked: true, // Unlock by beating First-Timer Fred
    accuracy: 0.73,
    responseTime: { min: 1700, max: 2700 }, // 1.7-2.7 seconds
    dailyDoubleStrategy: {
      minBet: 800,
      maxBet: 3000,
      riskTolerance: 0.35
    },
    finalJeopardyStrategy: {
      leadingBet: 0.55,
      trailingBet: 1.0,
      closeGameBet: 0.8
    },
    clueSelectionStrategy: 'top-to-bottom', // Systematic educator approach
    categoryStrengths: {
      'HISTORY': 0.75,
      'LITERATURE': 0.75,
      'SCIENCE': 0.70
    },
    avatar: {
      seed: 'teacher-champion',
      style: 'custom',
      customImage: '/avatars/cpu/teacher-champion.png',
      backgroundColor: '#fff9c4'
    },
    bio: 'Methodical educator with broad knowledge.'
  },

  // Tier 3: Advanced (75-82% accuracy)
  {
    id: 'sam-buttrey',
    name: 'Sam Buttrey',
    difficulty: 6,
    tier: 'Advanced',
    isLocked: true, // Unlock by beating First-Timer Fred
    accuracy: 0.75,
    responseTime: { min: 1600, max: 2400 }, // 1.6-2.4 seconds
    dailyDoubleStrategy: {
      minBet: 1000,
      maxBet: 3500,
      riskTolerance: 0.4
    },
    finalJeopardyStrategy: {
      leadingBet: 0.58,
      trailingBet: 0.95,
      closeGameBet: 0.82
    },
    clueSelectionStrategy: 'bottom-to-top', // Goes for higher values
    categoryStrengths: {
      'SCIENCE': 0.78,
      'MATH': 0.80,
      'HISTORY': 0.72
    },
    avatar: {
      seed: 'sam-buttrey',
      style: 'custom',
      customImage: '/avatars/cpu/sam-buttrey.png',
      backgroundColor: '#b3e5fc'
    },
    bio: '5-day champion and professor with methodical precision!'
  },
  {
    id: 'austin-rogers',
    name: 'Austin Rogers',
    difficulty: 7,
    tier: 'Advanced',
    isLocked: true, // Unlock by beating First-Timer Fred
    accuracy: 0.78,
    responseTime: { min: 1400, max: 2200 }, // 1.4-2.2 seconds
    dailyDoubleStrategy: {
      minBet: 1000,
      maxBet: 4000,
      riskTolerance: 0.45
    },
    finalJeopardyStrategy: {
      leadingBet: 0.6,
      trailingBet: 1.0,
      closeGameBet: 0.85
    },
    clueSelectionStrategy: 'middle-out', // Unpredictable style
    categoryStrengths: {
      'GEOGRAPHY': 0.80,
      'HISTORY': 0.75
    },
    avatar: {
      seed: 'austin-rogers',
      style: 'custom',
      customImage: '/avatars/cpu/austin-rogers.png',
      backgroundColor: '#ffccbc'
    },
    bio: '12-day champion with quick wit and quirky style!'
  },
  {
    id: 'matt-amodio',
    name: 'Matt Amodio',
    difficulty: 8,
    tier: 'Advanced',
    isLocked: true, // Unlock by beating First-Timer Fred
    accuracy: 0.82,
    responseTime: { min: 1200, max: 2000 }, // 1.2-2.0 seconds
    dailyDoubleStrategy: {
      minBet: 1200,
      maxBet: 5000,
      riskTolerance: 0.5
    },
    finalJeopardyStrategy: {
      leadingBet: 0.65,
      trailingBet: 1.0,
      closeGameBet: 0.9
    },
    clueSelectionStrategy: 'bottom-to-top', // Analytical, goes for high values
    categoryStrengths: {
      'SCIENCE': 0.85,
      'MATH': 0.85,
      'COMPUTERS': 0.90
    },
    avatar: {
      seed: 'matt-amodio',
      style: 'custom',
      customImage: '/avatars/cpu/matt-amodio.png',
      backgroundColor: '#c5cae9'
    },
    bio: '38-game winner with analytical precision!'
  },

  // Tier 4: Expert (82-86% accuracy)
  {
    id: 'buzzy-cohen',
    name: 'Buzzy Cohen',
    difficulty: 9,
    tier: 'Expert',
    isLocked: true, // Unlock by beating First-Timer Fred
    accuracy: 0.82,
    responseTime: { min: 1100, max: 1700 }, // 1.1-1.7 seconds
    dailyDoubleStrategy: {
      minBet: 1500,
      maxBet: 6000,
      riskTolerance: 0.55
    },
    finalJeopardyStrategy: {
      leadingBet: 0.65,
      trailingBet: 1.0,
      closeGameBet: 0.92
    },
    clueSelectionStrategy: 'strategic-dd-hunt', // Hunts for Daily Doubles
    categoryStrengths: {
      'MUSIC': 0.85,
      'POP CULTURE': 0.82,
      'BUSINESS': 0.82
    },
    avatar: {
      seed: 'buzzy-cohen',
      style: 'custom',
      customImage: '/avatars/cpu/buzzy-cohen.png',
      backgroundColor: '#f8bbd0'
    },
    bio: 'Tournament of Champions winner with strategic mastery!'
  },
  {
    id: 'amy-schneider',
    name: 'Amy Schneider',
    difficulty: 10,
    tier: 'Expert',
    isLocked: true, // Unlock by beating First-Timer Fred
    accuracy: 0.84,
    responseTime: { min: 900, max: 1500 }, // 0.9-1.5 seconds
    dailyDoubleStrategy: {
      minBet: 1800,
      maxBet: 7000,
      riskTolerance: 0.6
    },
    finalJeopardyStrategy: {
      leadingBet: 0.68,
      trailingBet: 1.0,
      closeGameBet: 0.93
    },
    clueSelectionStrategy: 'bottom-to-top', // Strategic, high-value focus
    categoryStrengths: {
      'SCIENCE': 0.88,
      'ENGINEERING': 0.90,
      'HISTORY': 0.85
    },
    avatar: {
      seed: 'amy-schneider',
      style: 'custom',
      customImage: '/avatars/cpu/amy-schneider.png',
      backgroundColor: '#b2dfdb'
    },
    bio: '40-game streak with exceptional broad knowledge!'
  },
  {
    id: 'victoria-groce',
    name: 'Victoria Groce',
    difficulty: 11,
    tier: 'Expert',
    isLocked: true, // Unlock by beating First-Timer Fred
    accuracy: 0.86,
    responseTime: { min: 700, max: 1300 }, // 0.7-1.3 seconds
    dailyDoubleStrategy: {
      minBet: 2000,
      maxBet: 8000,
      riskTolerance: 0.65
    },
    finalJeopardyStrategy: {
      leadingBet: 0.7,
      trailingBet: 1.0,
      closeGameBet: 0.95
    },
    clueSelectionStrategy: 'bottom-to-top', // Confident, goes big
    categoryStrengths: {
      'LITERATURE': 0.88,
      'HISTORY': 0.85,
      'WORDPLAY': 0.86,
      'SCIENCE': 0.82
    },
    avatar: {
      seed: 'victoria-groce',
      style: 'custom',
      customImage: '/avatars/cpu/victoria-groce.png',
      backgroundColor: '#e1bee7'
    },
    bio: '9-day champion with lightning-fast buzzer and broad expertise!'
  },

  // Tier 5: Master (85-88% accuracy)
  {
    id: 'brad-rutter',
    name: 'Brad Rutter',
    difficulty: 12,
    tier: 'Master',
    isLocked: true, // Unlock by beating First-Timer Fred
    accuracy: 0.85,
    responseTime: { min: 550, max: 1050 }, // 0.55-1.05 seconds
    dailyDoubleStrategy: {
      minBet: 2500,
      maxBet: 10000,
      riskTolerance: 0.7
    },
    finalJeopardyStrategy: {
      leadingBet: 0.75,
      trailingBet: 1.0,
      closeGameBet: 0.98
    },
    clueSelectionStrategy: 'strategic-dd-hunt', // Expert Daily Double hunter
    categoryStrengths: {
      'ENTERTAINMENT': 0.90,
      'SPORTS': 0.88,
      'GEOGRAPHY': 0.88
    },
    avatar: {
      seed: 'brad-rutter',
      style: 'custom',
      customImage: '/avatars/cpu/brad-rutter.png',
      backgroundColor: '#dcedc8'
    },
    bio: 'Never lost to a human opponent. Strategic gambling expert!'
  },
  {
    id: 'ken-jennings',
    name: 'Ken Jennings',
    difficulty: 13,
    tier: 'Master',
    isLocked: true, // Unlock by beating First-Timer Fred
    accuracy: 0.88,
    responseTime: { min: 350, max: 850 }, // 0.35-0.85 seconds
    dailyDoubleStrategy: {
      minBet: 3000,
      maxBet: 12000,
      riskTolerance: 0.75
    },
    finalJeopardyStrategy: {
      leadingBet: 0.8,
      trailingBet: 1.0,
      closeGameBet: 0.99
    },
    clueSelectionStrategy: 'bottom-to-top', // Efficient, high-value approach
    categoryStrengths: {
      // Ken is strong across ALL categories - balanced excellence
      'HISTORY': 0.92,
      'LITERATURE': 0.92,
      'SCIENCE': 0.92,
      'GEOGRAPHY': 0.92,
      'POP CULTURE': 0.90
    },
    avatar: {
      seed: 'ken-jennings',
      style: 'custom',
      customImage: '/avatars/cpu/ken-jennings.png',
      backgroundColor: '#ffe0b2'
    },
    bio: '74-game legend with encyclopedic knowledge!'
  },

  // Tier 6: GOAT (90-95% accuracy)
  {
    id: 'james-holzhauer',
    name: 'James Holzhauer',
    displayName: '???', // Hidden until unlocked
    difficulty: 14,
    tier: 'GOAT',
    isSecret: true, // James is now a hidden boss!
    isLocked: true, // Unlock by beating First-Timer Fred
    accuracy: 0.92,
    responseTime: { min: 300, max: 500 }, // 0.3-0.5 seconds - LIGHTNING FAST!
    dailyDoubleStrategy: {
      minBet: 5000,
      maxBet: 'ALL_IN', // Will bet entire score on Daily Doubles
      riskTolerance: 1.0 // Maximum aggression
    },
    finalJeopardyStrategy: {
      leadingBet: 0.9, // Aggressive even when winning
      trailingBet: 1.0,
      closeGameBet: 1.0
    },
    clueSelectionStrategy: 'holzhauer-special', // Bottom row, hunt for DDs aggressively
    categoryStrengths: {
      'SCIENCE': 0.96,
      'MATH': 0.98,
      'SPORTS': 0.95,
      'GEOGRAPHY': 0.94,
      'HISTORY': 0.93
    },
    avatar: {
      seed: 'james-holzhauer',
      style: 'custom',
      customImage: '/avatars/cpu/james-holzhauer.png', // Custom avatar path
      backgroundColor: '#ffcdd2'
    },
    bio: 'Lightning fast with aggressive betting. The ultimate challenge!',
    specialAbility: 'Hunts for Daily Doubles strategically, prefers bottom-row high-value clues'
  },

  // Tier 7: LEGENDARY (Secret Bosses - 93-97% accuracy)
  {
    id: 'arthur-chu',
    name: 'Arthur Chu',
    displayName: '???',
    difficulty: 15,
    tier: 'LEGENDARY',
    isSecret: true, // James is now a hidden boss!
    isLocked: true, // Unlock by beating First-Timer Fred
    accuracy: 0.93,
    responseTime: { min: 250, max: 450 }, // 0.25-0.45 seconds
    dailyDoubleStrategy: {
      minBet: 5000,
      maxBet: 'ALL_IN',
      riskTolerance: 0.95
    },
    finalJeopardyStrategy: {
      leadingBet: 0.92,
      trailingBet: 1.0,
      closeGameBet: 1.0
    },
    clueSelectionStrategy: 'forager', // Jumps around board strategically
    categoryStrengths: {
      'HISTORY': 0.96,
      'GEOGRAPHY': 0.95,
      'POP CULTURE': 0.94,
      'SCIENCE': 0.93,
      'LITERATURE': 0.93
    },
    avatar: {
      seed: 'arthur-chu',
      style: 'secret',
      customImage: '/avatars/cpu/arthur-chu.png',
      backgroundColor: '#616161',
      secretIcon: '❓'
    },
    bio: 'Unconventional strategist who rewrote the playbook. Unlock to reveal!',
    specialAbility: 'Strategic board control and aggressive Daily Double hunting',
    unlockRequirement: 'Beat Ken Jennings in career mode'
  },
  {
    id: 'roger-craig',
    name: 'Roger Craig',
    displayName: '???',
    difficulty: 16,
    tier: 'LEGENDARY',
    isSecret: true, // James is now a hidden boss!
    isLocked: true, // Unlock by beating First-Timer Fred
    accuracy: 0.95,
    responseTime: { min: 200, max: 400 }, // 0.2-0.4 seconds
    dailyDoubleStrategy: {
      minBet: 6000,
      maxBet: 'ALL_IN',
      riskTolerance: 1.0
    },
    finalJeopardyStrategy: {
      leadingBet: 0.95,
      trailingBet: 1.0,
      closeGameBet: 1.0
    },
    clueSelectionStrategy: 'holzhauer-special', // Data-driven approach
    categoryStrengths: {
      'SCIENCE': 0.98,
      'MATH': 0.97,
      'COMPUTERS': 0.98,
      'HISTORY': 0.95,
      'LITERATURE': 0.94
    },
    avatar: {
      seed: 'roger-craig',
      style: 'secret',
      customImage: '/avatars/cpu/roger-craig.png',
      backgroundColor: '#616161',
      secretIcon: '❓'
    },
    bio: 'Data scientist with record single-day winnings. Unlock to reveal!',
    specialAbility: 'Statistical optimization and pattern recognition',
    unlockRequirement: 'Win 10 consecutive games in career mode'
  },
  {
    id: 'mark-labbett',
    name: 'The Beast',
    displayName: '???',
    difficulty: 17,
    tier: 'LEGENDARY',
    isSecret: true, // James is now a hidden boss!
    isLocked: true, // Unlock by beating First-Timer Fred
    accuracy: 0.96,
    responseTime: { min: 150, max: 350 }, // 0.15-0.35 seconds
    dailyDoubleStrategy: {
      minBet: 7000,
      maxBet: 'ALL_IN',
      riskTolerance: 1.0
    },
    finalJeopardyStrategy: {
      leadingBet: 0.97,
      trailingBet: 1.0,
      closeGameBet: 1.0
    },
    clueSelectionStrategy: 'bottom-to-top', // Aggressive, ruthless
    categoryStrengths: {
      'HISTORY': 0.98,
      'GEOGRAPHY': 0.98,
      'SCIENCE': 0.97,
      'SPORTS': 0.96,
      'LITERATURE': 0.96,
      'POP CULTURE': 0.95
    },
    avatar: {
      seed: 'mark-labbett',
      style: 'secret',
      customImage: '/avatars/cpu/mark-labbett.png',
      backgroundColor: '#616161',
      secretIcon: '❓'
    },
    bio: 'Mark Labbett from "The Chase" - intimidating presence and vast knowledge. Unlock to reveal!',
    specialAbility: 'Overwhelming breadth of knowledge across all categories',
    unlockRequirement: 'Achieve a perfect game (100% accuracy) in career mode'
  },
  {
    id: 'alex-trebek',
    name: 'Alex Trebek',
    displayName: '???',
    difficulty: 18,
    tier: 'LEGENDARY',
    isSecret: true, // James is now a hidden boss!
    isLocked: true, // Unlock by beating First-Timer Fred
    accuracy: 0.97,
    responseTime: { min: 100, max: 300 }, // 0.1-0.3 seconds - GODLIKE
    dailyDoubleStrategy: {
      minBet: 10000,
      maxBet: 'ALL_IN',
      riskTolerance: 1.0
    },
    finalJeopardyStrategy: {
      leadingBet: 1.0,
      trailingBet: 1.0,
      closeGameBet: 1.0
    },
    clueSelectionStrategy: 'strategic-dd-hunt', // Knows where the Daily Doubles are
    categoryStrengths: {
      'HISTORY': 0.99,
      'GEOGRAPHY': 0.99,
      'LITERATURE': 0.99,
      'SCIENCE': 0.98,
      'WORDPLAY': 0.99,
      'POP CULTURE': 0.97,
      'ARTS': 0.98,
      'SPORTS': 0.96
    },
    avatar: {
      seed: 'alex-trebek',
      style: 'secret',
      customImage: '/avatars/cpu/alex-trebek.png',
      backgroundColor: '#616161',
      secretIcon: '❓'
    },
    bio: 'The legendary host who knew all the answers. The ultimate boss. Unlock to reveal!',
    specialAbility: 'Perfect knowledge and intuition. He wrote the questions.',
    unlockRequirement: 'Beat all other legendary opponents',
    tribute: 'In loving memory of the greatest game show host of all time'
  }
];

// Helper functions
export const getCPUOpponentById = (id) => {
  return CPU_OPPONENTS.find(opponent => opponent.id === id);
};

export const getCPUOpponentsByTier = (tier) => {
  return CPU_OPPONENTS.filter(opponent => opponent.tier === tier);
};

export const getCPUOpponentsByDifficulty = (minDiff, maxDiff) => {
  return CPU_OPPONENTS.filter(
    opponent => opponent.difficulty >= minDiff && opponent.difficulty <= maxDiff
  );
};

export const getNextOpponent = (currentDifficulty) => {
  return CPU_OPPONENTS.find(opponent => opponent.difficulty === currentDifficulty + 1);
};

export default CPU_OPPONENTS;

