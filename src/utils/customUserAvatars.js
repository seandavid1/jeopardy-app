// Custom User Avatar Manager
// Place custom avatar images in /public/avatars/users/

/**
 * Custom user avatars
 * Add your own avatar images to /public/avatars/users/ folder
 * Then add entries here to make them selectable
 */
export const customUserAvatars = [
  {
    id: 'custom-courtney',
    name: 'Courtney',
    image: '/avatars/users/courtney.png',
    femaleImage: '/avatars/users/courtney.png', // Same for both
    color: '#FF6B9D',
    isCustom: true,
  },
  {
    id: 'custom-sdr',
    name: 'SDR',
    image: '/avatars/users/sdr.png',
    femaleImage: '/avatars/users/sdr.png', // Same for both
    color: '#4A90E2',
    isCustom: true,
  },
  // Add more custom avatars here
];

/**
 * Check if an avatar is a custom avatar (has a path instead of emoji)
 */
export const isCustomAvatar = (avatar) => {
  return avatar && avatar.isCustom === true;
};

/**
 * Get the full URL for a custom avatar
 */
export const getCustomAvatarUrl = (avatarPath) => {
  return `${process.env.PUBLIC_URL}${avatarPath}`;
};

/**
 * Load all available custom user avatars
 * Returns only custom avatars (courtney and sdr)
 */
export const getAllUserAvatars = (defaultAvatars) => {
  // Only return custom avatars, not the default emoji avatars
  return [...customUserAvatars];
};

export default {
  customUserAvatars,
  isCustomAvatar,
  getCustomAvatarUrl,
  getAllUserAvatars
};

