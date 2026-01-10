import { CPU_OPPONENTS } from './cpuOpponents';

// Trophy Categories
export const TROPHY_CATEGORIES = {
  FLASHCARDS: 'flashcards',
  CPU_VICTORIES: 'cpu_victories',
  SPECIAL: 'special'
};

// Trophy Tiers (for visual styling)
export const TROPHY_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  LEGENDARY: 'legendary'
};

// Generate flashcard trophies for all available decks
const FLASHCARD_DECKS = [
  // Geography
  { id: 'world-capitals', name: 'World Capitals', supportsReverse: true },
  { id: 'europe-capitals', name: 'Europe Capitals', supportsReverse: true },
  { id: 'asia-capitals', name: 'Asia Capitals', supportsReverse: true },
  { id: 'africa-capitals', name: 'Africa Capitals', supportsReverse: true },
  { id: 'south-america-capitals', name: 'South America Capitals', supportsReverse: true },
  { id: 'us-states-capitals', name: 'US States Capitals', supportsReverse: true },
  { id: 'us-states-facts', name: 'US States Facts', supportsReverse: false },
  { id: 'countries-flags', name: 'Countries & Flags', supportsReverse: false },
  { id: 'rivers-bodies-water', name: 'Rivers & Bodies of Water', supportsReverse: false },
  
  // History
  { id: 'us-presidents', name: 'US Presidents', supportsReverse: false },
  { id: 'historic-events', name: 'Historic Events', supportsReverse: false },
  { id: 'us-amendments', name: 'US Amendments', supportsReverse: false },
  { id: 'supreme-court-cases', name: 'Supreme Court Cases', supportsReverse: false },
  { id: 'nobel-prize-winners', name: 'Nobel Prize Winners', supportsReverse: true },
  { id: 'world-monarchs', name: 'World Monarchs', supportsReverse: true },
  { id: 'famous-explorers', name: 'Famous Explorers', supportsReverse: false },
  
  // Science
  { id: 'chemical-elements', name: 'Chemical Elements', supportsReverse: true },
  { id: 'astronomy', name: 'Astronomy', supportsReverse: false },
  { id: 'solar-system', name: 'Solar System', supportsReverse: false },
  { id: 'animals-biology', name: 'Animals & Biology', supportsReverse: false },
  { id: 'human-anatomy', name: 'Human Anatomy', supportsReverse: false },
  { id: 'scientific-discoveries', name: 'Scientific Discoveries', supportsReverse: false },
  
  // Arts & Culture
  { id: 'famous-operas', name: 'Famous Operas', supportsReverse: true },
  { id: 'classical-composers', name: 'Classical Composers', supportsReverse: true },
  { id: 'famous-novels', name: 'Famous Novels', supportsReverse: true },
  { id: 'books-black-authors', name: 'Books by Black Authors', supportsReverse: true },
  { id: 'books-women-authors', name: 'Books by Women Authors', supportsReverse: true },
  { id: 'nobel-prize-literature', name: 'Nobel Prize Literature', supportsReverse: true },
  { id: 'poets-poetry', name: 'Poets & Poetry', supportsReverse: true },
  { id: 'shakespeare', name: 'Shakespeare', supportsReverse: true },
  { id: 'bible', name: 'Bible', supportsReverse: false },
  { id: 'mythology', name: 'Mythology', supportsReverse: false },
  { id: 'world-religions', name: 'World Religions', supportsReverse: false },
  { id: 'art-artists', name: 'Art & Artists', supportsReverse: true },
  { id: 'oscar-winners', name: 'Oscar Winners', supportsReverse: true },
  { id: 'music-awards', name: 'Music Awards', supportsReverse: true },
  { id: 'sports-olympics', name: 'Sports & Olympics', supportsReverse: false },
  { id: 'latin-greek-roots', name: 'Latin & Greek Roots', supportsReverse: true },
  { id: 'languages-etymology', name: 'Languages & Etymology', supportsReverse: false },
  { id: 'architecture', name: 'Architecture', supportsReverse: false },
  { id: 'food-cuisine', name: 'Food & Cuisine', supportsReverse: false },
];

// Generate flashcard trophies - Bronze (perfect score), Silver (forward+backward), Gold (time challenge)
const flashcardTrophies = [];

FLASHCARD_DECKS.forEach(deck => {
  // Bronze: Perfect score
  flashcardTrophies.push({
    id: `flashcard-perfect-${deck.id}`,
    name: `${deck.name} Bronze`,
    description: `Achieve a perfect score on the ${deck.name} flashcard deck`,
    icon: '🏆',
    tier: TROPHY_TIERS.BRONZE,
    category: TROPHY_CATEGORIES.FLASHCARDS,
    condition: {
      type: 'flashcard_perfect',
      deckId: deck.id
    }
  });

  // Silver: Perfect score both ways (only for decks that support it)
  if (deck.supportsReverse) {
    flashcardTrophies.push({
      id: `flashcard-perfect-both-${deck.id}`,
      name: `${deck.name} Silver`,
      description: `Perfect score on ${deck.name} both forwards and backwards`,
      icon: '🥈',
      tier: TROPHY_TIERS.SILVER,
      category: TROPHY_CATEGORIES.FLASHCARDS,
      condition: {
        type: 'flashcard_perfect_both',
        deckId: deck.id
      }
    });
  }

  // Gold: Perfect score with time limit
  flashcardTrophies.push({
    id: `flashcard-speed-${deck.id}`,
    name: `${deck.name} Gold`,
    description: `Perfect score on ${deck.name} under time limit (2.0s per card)`,
    icon: '🥇',
    tier: TROPHY_TIERS.GOLD,
    category: TROPHY_CATEGORIES.FLASHCARDS,
    condition: {
      type: 'flashcard_speed',
      deckId: deck.id,
      maxSecondsPerCard: 2.0
    }
  });
});

// Generate CPU victory trophies
const cpuTrophies = CPU_OPPONENTS.map(cpu => {
  // Determine tier based on CPU tier
  let tier;
  switch (cpu.tier) {
    case 'Champion':
      tier = TROPHY_TIERS.BRONZE;
      break;
    case 'All-Star':
      tier = TROPHY_TIERS.SILVER;
      break;
    case 'Legend':
      tier = TROPHY_TIERS.GOLD;
      break;
    case 'Master':
      tier = TROPHY_TIERS.PLATINUM;
      break;
    default:
      tier = TROPHY_TIERS.BRONZE;
  }

  return {
    id: `cpu-victory-${cpu.id}`,
    name: `Defeated ${cpu.name}`,
    description: `Victory over ${cpu.name}`,
    icon: '🥇',
    tier: tier,
    category: TROPHY_CATEGORIES.CPU_VICTORIES,
    isSecret: cpu.isSecret,
    condition: {
      type: 'cpu_victory',
      cpuId: cpu.id
    }
  };
});

// Special achievement trophies
const specialTrophies = [
  {
    id: 'first-win',
    name: 'First Victory',
    description: 'Win your first game',
    icon: '🌟',
    tier: TROPHY_TIERS.BRONZE,
    category: TROPHY_CATEGORIES.SPECIAL,
    condition: {
      type: 'first_win'
    }
  },
  {
    id: 'flashcard-master',
    name: 'Flashcard Master',
    description: 'Achieve perfect scores on all flashcard decks',
    icon: '📚',
    tier: TROPHY_TIERS.LEGENDARY,
    category: TROPHY_CATEGORIES.SPECIAL,
    condition: {
      type: 'all_flashcards_perfect'
    }
  },
  {
    id: 'cpu-conqueror',
    name: 'CPU Conqueror',
    description: 'Defeat all CPU opponents',
    icon: '👑',
    tier: TROPHY_TIERS.LEGENDARY,
    category: TROPHY_CATEGORIES.SPECIAL,
    condition: {
      type: 'all_cpus_defeated'
    }
  },
  {
    id: 'perfect-game',
    name: 'Flawless',
    description: 'Complete a full game with 100% accuracy',
    icon: '💎',
    tier: TROPHY_TIERS.PLATINUM,
    category: TROPHY_CATEGORIES.SPECIAL,
    condition: {
      type: 'perfect_game'
    }
  },
  {
    id: 'comeback-king',
    name: 'Comeback King',
    description: 'Win a game after being behind by $10,000 or more',
    icon: '🔥',
    tier: TROPHY_TIERS.GOLD,
    category: TROPHY_CATEGORIES.SPECIAL,
    condition: {
      type: 'comeback_victory'
    }
  }
];

// Combine all trophies
export const ALL_TROPHIES = [
  ...specialTrophies,
  ...cpuTrophies,
  ...flashcardTrophies
];

// Helper function to get trophy by ID
export const getTrophyById = (id) => {
  return ALL_TROPHIES.find(trophy => trophy.id === id);
};

// Helper function to get trophies by category
export const getTrophiesByCategory = (category) => {
  return ALL_TROPHIES.filter(trophy => trophy.category === category);
};

// Helper function to get trophy color by tier
export const getTrophyColor = (tier) => {
  switch (tier) {
    case TROPHY_TIERS.BRONZE:
      return '#cd7f32';
    case TROPHY_TIERS.SILVER:
      return '#c0c0c0';
    case TROPHY_TIERS.GOLD:
      return '#ffd700';
    case TROPHY_TIERS.PLATINUM:
      return '#e5e4e2';
    case TROPHY_TIERS.LEGENDARY:
      return '#ff6b35';
    default:
      return '#cd7f32';
  }
};

