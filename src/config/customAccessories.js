/**
 * Custom Accessories Configuration
 * 
 * These are special accessories that can be unlocked through achievements
 * and overlaid on top of DiceBear avatars
 */

export const CUSTOM_ACCESSORIES = {
  // Legendary Sunglasses - Beat James Holzhauer
  'legendary-sunglasses': {
    id: 'legendary-sunglasses',
    name: 'Lightning Shades',
    description: 'Legendary sunglasses worn by the fastest buzzer in Jeopardy history',
    imagePath: '/avatars/accessories/legendary-sunglasses.png',
    position: { top: '40%', left: '50%', width: '65%' },
    zIndex: 15,
    rarity: 'legendary',
    requiredAchievement: 'beat-holzhauer',
    unlockMessage: 'You earned Lightning Shades by defeating James Holzhauer!',
  },

  // Champion Crown - 5 Day Winner
  'champion-crown': {
    id: 'champion-crown',
    name: 'Champion Crown',
    description: 'A golden crown for true Jeopardy champions',
    imagePath: '/avatars/accessories/champion-crown.png',
    position: { top: '5%', left: '50%', width: '75%' },
    zIndex: 15,
    rarity: 'epic',
    requiredAchievement: '5-day-champion',
    unlockMessage: 'You earned the Champion Crown by winning 5 consecutive games!',
  },

  // GOAT Horns - Beat Ken Jennings
  'goat-horns': {
    id: 'goat-horns',
    name: 'GOAT Horns',
    description: 'For defeating the Greatest Of All Time',
    imagePath: '/avatars/accessories/goat-horns.png',
    position: { top: '15%', left: '50%', width: '80%' },
    zIndex: 15,
    rarity: 'legendary',
    requiredAchievement: 'beat-jennings',
    unlockMessage: 'You earned GOAT Horns by defeating Ken Jennings himself!',
  },

  // Masters Medal - Win Masters Tournament
  'masters-medal': {
    id: 'masters-medal',
    name: 'Masters Medal',
    description: 'The ultimate honor for Jeopardy mastery',
    imagePath: '/avatars/accessories/masters-medal.png',
    position: { top: '75%', left: '50%', width: '40%' },
    zIndex: 15,
    rarity: 'legendary',
    requiredAchievement: 'masters-champion',
    unlockMessage: 'You earned the Masters Medal by winning the Masters Tournament!',
  },

  // Perfect Game Halo
  'perfect-halo': {
    id: 'perfect-halo',
    name: 'Perfect Halo',
    description: 'A glowing halo for achieving perfection',
    imagePath: '/avatars/accessories/perfect-halo.png',
    position: { top: '8%', left: '50%', width: '90%' },
    zIndex: 14,
    rarity: 'epic',
    requiredAchievement: 'perfect-game',
    unlockMessage: 'You earned the Perfect Halo by achieving a perfect game!',
  },

  // Money Bag - High Score Achievement
  'money-bag': {
    id: 'money-bag',
    name: 'Big Money Bag',
    description: 'For raking in the cash',
    imagePath: '/avatars/accessories/money-bag.png',
    position: { top: '10%', left: '75%', width: '35%' },
    zIndex: 12,
    rarity: 'rare',
    requiredAchievement: 'score-50k',
    unlockMessage: 'You earned the Money Bag by scoring over $50,000!',
  },

  // Scholar Cap - Category Mastery
  'scholar-cap': {
    id: 'scholar-cap',
    name: 'Scholar Cap',
    description: 'For true category expertise',
    imagePath: '/avatars/accessories/scholar-cap.png',
    position: { top: '12%', left: '50%', width: '70%' },
    zIndex: 13,
    rarity: 'rare',
    requiredAchievement: 'category-master',
    unlockMessage: 'You earned the Scholar Cap through category mastery!',
  },

  // Lightning Bolt Badge - Daily Double Master
  'lightning-badge': {
    id: 'lightning-badge',
    name: 'Lightning Badge',
    description: 'Master of the Daily Double',
    imagePath: '/avatars/accessories/lightning-badge.png',
    position: { top: '75%', left: '80%', width: '30%' },
    zIndex: 12,
    rarity: 'rare',
    requiredAchievement: 'daily-double-sweep',
    unlockMessage: 'You earned the Lightning Badge by sweeping all Daily Doubles!',
  },

  // Phoenix Wings - Comeback Kid
  'phoenix-wings': {
    id: 'phoenix-wings',
    name: 'Phoenix Wings',
    description: 'Rise from the ashes of defeat',
    imagePath: '/avatars/accessories/phoenix-wings.png',
    position: { top: '50%', left: '50%', width: '120%' },
    zIndex: 5, // Behind avatar
    rarity: 'epic',
    requiredAchievement: 'comeback-kid',
    unlockMessage: 'You earned Phoenix Wings with an epic comeback!',
  },

  // Tournament Trophy Hat
  'trophy-hat': {
    id: 'trophy-hat',
    name: 'Trophy Hat',
    description: 'Tournament champion headwear',
    imagePath: '/avatars/accessories/trophy-hat.png',
    position: { top: '8%', left: '50%', width: '68%' },
    zIndex: 15,
    rarity: 'legendary',
    requiredAchievement: 'tournament-champion',
    unlockMessage: 'You earned the Trophy Hat by winning the Tournament of Champions!',
  },

  // Heart Sunglasses - First Win / Starter Achievement
  'heart-sunglasses': {
    id: 'heart-sunglasses',
    name: 'Heart Sunglasses',
    description: 'Show your love for the game with these stylish shades',
    imagePath: '/avatars/accessories/heart-sunglasses.png',
    position: { top: '40%', left: '50%', width: '58%' },
    zIndex: 15,
    rarity: 'common',
    requiredAchievement: 'first-win',
    unlockMessage: 'You earned Heart Sunglasses by winning your first game!',
  },
};

// Helper functions
export const getAccessoryById = (id) => {
  return CUSTOM_ACCESSORIES[id];
};

export const getAccessoriesByRarity = (rarity) => {
  return Object.values(CUSTOM_ACCESSORIES).filter(
    accessory => accessory.rarity === rarity
  );
};

export const getAccessoryByAchievement = (achievementId) => {
  return Object.values(CUSTOM_ACCESSORIES).find(
    accessory => accessory.requiredAchievement === achievementId
  );
};

export const isAccessoryUnlocked = (accessoryId, userAchievements = []) => {
  const accessory = CUSTOM_ACCESSORIES[accessoryId];
  if (!accessory) return false;
  return userAchievements.includes(accessory.requiredAchievement);
};

export default CUSTOM_ACCESSORIES;

