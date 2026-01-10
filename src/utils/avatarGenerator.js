// Avatar generation utility using DiceBear
import { createAvatar } from '@dicebear/core';
import { initials, avataaars, pixelArt, lorelei, adventurer, bottts, funEmoji } from '@dicebear/collection';

/**
 * Generate an avatar URL for a player
 * @param {string} seed - Unique identifier for consistent avatar generation
 * @param {object} options - Avatar customization options
 * @returns {string} Data URL for the avatar SVG
 */
export const generateAvatar = (seed, options = {}) => {
  const {
    backgroundColor = '#e3f2fd',
    size = 100
  } = options;

  const avatar = createAvatar(initials, {
    seed: seed,
    backgroundColor: [backgroundColor],
    size: size,
  });

  // Convert SVG to data URI
  const svgString = avatar.toString();
  const encodedSvg = encodeURIComponent(svgString);
  return `data:image/svg+xml,${encodedSvg}`;
};

/**
 * Generate custom DiceBear avatar with detailed customizations
 * @param {string} style - Avatar style (avataaars, pixel-art, etc.)
 * @param {object} options - Customization options
 * @returns {string} Data URL for the avatar SVG
 */
export const generateCustomAvatar = (style, options = {}) => {
  const styleMap = {
    'avataaars': avataaars,
    'pixel-art': pixelArt,
    'lorelei': lorelei,
    'adventurer': adventurer,
    'bottts': bottts,
    'fun-emoji': funEmoji,
  };

  const selectedStyle = styleMap[style] || avataaars;
  
  // Build complete options object - DiceBear expects arrays for all feature options
  const avatarOptions = {
    size: 200,
  };

  // Background color
  if (options.backgroundColor) {
    avatarOptions.backgroundColor = [options.backgroundColor];
  }

  // Add ALL customization options as arrays
  if (style === 'avataaars') {
    if (options.hair) avatarOptions.top = [options.hair];
    if (options.hairColor) avatarOptions.hairColor = [options.hairColor];
    if (options.eyebrows) avatarOptions.eyebrows = [options.eyebrows];
    if (options.eyes) avatarOptions.eyes = [options.eyes];
    if (options.mouth) avatarOptions.mouth = [options.mouth];
    
    // Facial hair
    if (options.facialHair && options.facialHair !== 'none') {
      avatarOptions.facialHair = [options.facialHair];
      avatarOptions.facialHairProbability = 100; // Ensure facial hair always shows
      if (options.facialHairColor) {
        avatarOptions.facialHairColor = [options.facialHairColor];
      }
    }
    
    // Always set nose to default (required)
    avatarOptions.nose = ['default'];
    
    // Always set base to default (required)
    avatarOptions.base = ['default'];
    
    if (options.accessories && options.accessories !== 'none') {
      avatarOptions.accessories = [options.accessories];
      avatarOptions.accessoriesProbability = 100; // Ensure accessories always show
      if (options.accessoriesColor) {
        avatarOptions.accessoriesColor = [options.accessoriesColor];
      }
    }
    
    // Clothing options - use correct property names from schema
    if (options.clothing) avatarOptions.clothing = [options.clothing];
    if (options.clothingColor) avatarOptions.clothesColor = [options.clothingColor]; // Note: clothesColor not clothingColor
    
    // Skin color
    if (options.skinColor) avatarOptions.skinColor = [options.skinColor];
    
    // Clothing graphic (pattern on the shirt) - if we want to support this later
    // if (options.clothingGraphic) avatarOptions.clothingGraphic = [options.clothingGraphic];
  }

  const avatar = createAvatar(selectedStyle, avatarOptions);
  const svgString = avatar.toString();
  
  // Use percent encoding for data URI (works perfectly with Unicode)
  return `data:image/svg+xml,${encodeURIComponent(svgString)}`;
};

/**
 * Generate mystery avatar for locked secret bosses
 * Returns a gray circle with a white question mark
 */
export const generateMysteryAvatar = () => {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#616161"/>
      <text 
        x="50" 
        y="50" 
        font-size="60" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle" 
        dominant-baseline="central"
      >?</text>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svgString)}`;
};

/**
 * Generate avatar for CPU opponent
 * Supports custom images, secret bosses, or generated avatars
 */
export const generateCPUAvatar = (opponent) => {
  // Show mystery avatar for locked secret bosses
  if (opponent.isSecret && opponent.isLocked) {
    return generateMysteryAvatar();
  }
  
  // Check if opponent has a custom avatar image (for both 'custom' and 'secret' styles)
  if ((opponent.avatar.style === 'custom' || opponent.avatar.style === 'secret') && opponent.avatar.customImage) {
    return `${process.env.PUBLIC_URL}${opponent.avatar.customImage}`;
  }
  
  // Otherwise generate from seed
  return generateAvatar(opponent.avatar.seed, {
    backgroundColor: opponent.avatar.backgroundColor,
    size: 100
  });
};

/**
 * Generate random avatar for human player
 */
export const generateRandomAvatar = () => {
  const colors = [
    '#e3f2fd', // blue
    '#f3e5f5', // purple
    '#e8f5e9', // green
    '#fff3e0', // orange
    '#ffebee', // red
    '#fff9c4', // yellow
    '#f1f8e9', // light green
    '#fce4ec', // pink
    '#e0f2f1', // teal
    '#f3e5f5', // lavender
  ];

  const randomSeed = `user-${Math.random().toString(36).substring(7)}`;
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return {
    dataUrl: generateAvatar(randomSeed, { backgroundColor: randomColor }),
    seed: randomSeed,
    backgroundColor: randomColor
  };
};

/**
 * Get avatar from seed (for consistency across sessions)
 */
export const getAvatarFromSeed = (seed, backgroundColor = '#e3f2fd') => {
  return generateAvatar(seed, { backgroundColor });
};

export default {
  generateAvatar,
  generateCustomAvatar,
  generateCPUAvatar,
  generateMysteryAvatar,
  generateRandomAvatar,
  getAvatarFromSeed
};

