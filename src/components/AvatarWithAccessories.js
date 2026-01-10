import React from 'react';
import { Box, styled } from '@mui/material';
import { keyframes } from '@mui/system';

// Animation for legendary items
const glow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 5px gold);
  }
  50% {
    filter: drop-shadow(0 0 15px gold);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const AvatarContainer = styled(Box)({
  position: 'relative',
  display: 'inline-block',
  width: '100%',
  height: '100%',
});

const BaseAvatar = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
});

const Accessory = styled('img')(({ top, left, width, zIndex, isLegendary }) => ({
  position: 'absolute',
  top: top || '50%',
  left: left || '50%',
  transform: 'translate(-50%, -50%)',
  width: width || '60%',
  height: 'auto',
  zIndex: zIndex || 10,
  pointerEvents: 'none',
  ...(isLegendary && {
    animation: `${glow} 2s infinite ease-in-out`,
  }),
}));

const EffectBadge = styled(Box)(({ position, isAnimated }) => ({
  position: 'absolute',
  fontSize: '2rem',
  zIndex: 20,
  pointerEvents: 'none',
  ...(position === 'topLeft' && { top: -5, left: -5 }),
  ...(position === 'topRight' && { top: -5, right: -5 }),
  ...(position === 'topCenter' && { top: -10, left: '50%', transform: 'translateX(-50%)' }),
  ...(position === 'bottomRight' && { bottom: -5, right: -5 }),
  ...(isAnimated && {
    animation: `${pulse} 2s infinite ease-in-out`,
  }),
}));

const Frame = styled(Box)(({ frameType }) => ({
  position: 'absolute',
  inset: frameType === 'thick' ? -8 : -4,
  borderRadius: '50%',
  pointerEvents: 'none',
  zIndex: 5,
  ...(frameType === 'gold' && {
    border: '4px solid gold',
    boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
    animation: `${pulse} 3s infinite ease-in-out`,
  }),
  ...(frameType === 'platinum' && {
    border: '4px solid #E5E4E2',
    boxShadow: '0 0 20px rgba(229, 228, 226, 0.7)',
    animation: `${pulse} 3s infinite ease-in-out`,
  }),
  ...(frameType === 'masters' && {
    border: '5px solid transparent',
    background: 'linear-gradient(white, white) padding-box, linear-gradient(45deg, gold, silver, gold) border-box',
    animation: `${pulse} 3s infinite ease-in-out`,
  }),
  ...(frameType === 'lightning' && {
    border: '3px solid #FFD700',
    boxShadow: '0 0 30px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 215, 0, 0.3)',
  }),
}));

/**
 * Avatar with custom accessories and achievement effects
 * 
 * @param {Object} avatar - Base DiceBear avatar data
 * @param {Array} unlockedAccessories - Array of unlocked accessory IDs
 * @param {Array} achievements - Array of achievement IDs
 * @param {Number} size - Size of avatar (default: 200)
 */
function AvatarWithAccessories({ 
  avatar, 
  unlockedAccessories = [], 
  achievements = [],
  size = 200,
  showEffects = true 
}) {
  if (!avatar) return null;

  // Determine which frame to show based on achievements
  const getFrameType = () => {
    if (achievements.includes('masters-champion')) return 'masters';
    if (achievements.includes('tournament-champion')) return 'platinum';
    if (achievements.includes('beat-holzhauer')) return 'lightning';
    if (achievements.includes('10-day-champion')) return 'gold';
    return null;
  };

  // Get avatar source
  const avatarSrc = avatar.dataUrl || avatar.image || avatar.selectedImage;

  return (
    <AvatarContainer sx={{ width: size, height: size }}>
      {/* Special Frame (if earned) */}
      {showEffects && getFrameType() && (
        <Frame frameType={getFrameType()} />
      )}

      {/* Base DiceBear Avatar */}
      <BaseAvatar src={avatarSrc} alt="Avatar" />

      {/* Custom Overlay Accessories */}
      {unlockedAccessories.includes('heart-sunglasses') && (
        <Accessory
          src={`${process.env.PUBLIC_URL}/avatars/accessories/heart-sunglasses.png`}
          top="40%"
          width="58%"
          zIndex={15}
          alt="Heart Sunglasses"
        />
      )}

      {unlockedAccessories.includes('legendary-sunglasses') && (
        <Accessory
          src={`${process.env.PUBLIC_URL}/avatars/accessories/legendary-sunglasses.png`}
          top="40%"
          width="65%"
          zIndex={15}
          isLegendary
          alt="Legendary Sunglasses"
        />
      )}

      {unlockedAccessories.includes('champion-crown') && (
        <Accessory
          src={`${process.env.PUBLIC_URL}/avatars/accessories/champion-crown.png`}
          top="5%"
          width="75%"
          zIndex={15}
          alt="Champion Crown"
        />
      )}

      {unlockedAccessories.includes('goat-horns') && (
        <Accessory
          src={`${process.env.PUBLIC_URL}/avatars/accessories/goat-horns.png`}
          top="15%"
          width="80%"
          zIndex={15}
          isLegendary
          alt="GOAT Horns"
        />
      )}

      {unlockedAccessories.includes('masters-medal') && (
        <Accessory
          src={`${process.env.PUBLIC_URL}/avatars/accessories/masters-medal.png`}
          top="75%"
          width="40%"
          zIndex={15}
          alt="Masters Medal"
        />
      )}

      {/* Achievement Effect Badges */}
      {showEffects && (
        <>
          {achievements.includes('beat-holzhauer') && (
            <EffectBadge position="topRight" isAnimated>
              ⚡
            </EffectBadge>
          )}

          {achievements.includes('perfect-game') && (
            <EffectBadge position="topLeft" isAnimated>
              💎
            </EffectBadge>
          )}

          {achievements.includes('5-day-champion') && (
            <EffectBadge position="topCenter" isAnimated>
              👑
            </EffectBadge>
          )}

          {achievements.includes('beat-jennings') && (
            <EffectBadge position="bottomRight" isAnimated>
              🐐
            </EffectBadge>
          )}
        </>
      )}
    </AvatarContainer>
  );
}

export default AvatarWithAccessories;

