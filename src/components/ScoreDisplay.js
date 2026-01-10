import React from 'react';
import { Typography, Box } from '@mui/material';
import { ScoreWrapper } from '../styles/BoardStyles';
import { styled } from '@mui/material/styles';
import AvatarWithAccessories from './AvatarWithAccessories';

const PodiumContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 0,
  position: 'relative',
}));

const AvatarBox = styled(Box)(({ theme, color }) => ({
  width: '100px',
  height: '100px',
  backgroundColor: '#1a1a2e',
  border: 'none',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  marginBottom: '-10px',
  zIndex: 1,
  overflow: 'hidden',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    width: '70px',
    height: '70px',
    border: 'none',
  },
}));

const AvatarContent = styled(Box)({
  fontSize: '3rem',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const AvatarImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const Podium = styled(Box)(({ theme }) => ({
  minWidth: '160px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
  position: 'relative',
  zIndex: 1,
  [theme.breakpoints.down('sm')]: {
    minWidth: '120px',
  },
}));

const PodiumTopTier = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #0f258f 0%, #1a3bb5 100%)',
  borderTop: '4px solid #8B4513',
  borderLeft: '8px solid #8B4513',
  borderRight: '8px solid #8B4513',
  borderRadius: '8px 8px 0 0',
  padding: theme.spacing(0.84, 2.5),
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.56, 1.5),
    borderLeft: '6px solid #8B4513',
    borderRight: '6px solid #8B4513',
  },
}));

const PodiumBottomTier = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4a6fa5 0%, #5a7fb5 100%)',
  borderLeft: '8px solid #7a9fc5',
  borderRight: '8px solid #7a9fc5',
  padding: theme.spacing(1, 2.5),
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.75, 1.5),
    borderLeft: '6px solid #7a9fc5',
    borderRight: '6px solid #7a9fc5',
  },
}));

const PodiumBaseTier = styled(Box)(({ theme }) => ({
  background: '#7a9fc5',
  borderTop: '5px solid #7a9fc5',
  borderLeft: '8px solid #7a9fc5',
  borderRight: '8px solid #7a9fc5',
  borderBottom: '5px solid #7a9fc5',
  borderRadius: '0 0 8px 8px',
  height: '20px',
  width: '100%',
  boxShadow: 'inset 0 0 15px rgba(255, 255, 255, 0.4)',
  [theme.breakpoints.down('sm')]: {
    height: '15px',
    borderLeft: '6px solid #7a9fc5',
    borderRight: '6px solid #7a9fc5',
    boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.4)',
  },
}));

const ScoreText = styled(Typography)(({ theme }) => ({
  color: '#FFFFFF',
  fontWeight: 'bold',
  fontSize: '1.6rem',
  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  fontFamily: 'monospace',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.2rem',
  },
}));

const PlayerNameText = styled(Typography)(({ theme }) => ({
  color: '#FFFFFF',
  fontWeight: '400',
  fontSize: '2rem',
  fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.4rem',
  },
}));

const PodiumsWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  width: '100%',
  padding: '0 200px',
  gap: theme.spacing(2),
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0, 1),
    gap: theme.spacing(1),
  },
}));

function ScoreDisplay({ 
  playerOneName, 
  playerTwoName, 
  playerOneScore, 
  playerTwoScore, 
  hasControlOfBoard,
  playerOneAvatar,
  playerTwoAvatar
}) {
  // Helper to check if avatar is a custom image (URL/path) or emoji
  const isCustomImage = (avatar) => {
    return avatar && (
      avatar.isCustom ||
      avatar.isDicebear ||
      avatar.dataUrl || 
      (avatar.selectedImage && (
        avatar.selectedImage.startsWith('http') || 
        avatar.selectedImage.startsWith('/') ||
        avatar.selectedImage.startsWith('data:')
      ))
    );
  };

  const renderAvatar = (avatar, playerName) => {
    if (!avatar) return null;
    
    // Check if avatar has custom accessories
    if (avatar.customAccessories && avatar.customAccessories.length > 0) {
      // Use AvatarWithAccessories component
      return (
        <Box sx={{ width: '100%', height: '100%' }}>
          <AvatarWithAccessories
            avatar={avatar}
            unlockedAccessories={avatar.customAccessories}
            achievements={[]}
            size={80}
            showEffects={false}
          />
        </Box>
      );
    }
    
    if (isCustomImage(avatar)) {
      // For custom avatars with isCustom flag, construct the path
      let imageSrc = avatar.dataUrl || avatar.selectedImage;
      
      // Handle DiceBear avatars (data URLs)
      if (avatar.isDicebear) {
        imageSrc = avatar.image || avatar.selectedImage;
      }
      // Handle custom file-based avatars
      else if (avatar.isCustom) {
        // Use the image path
        imageSrc = `${process.env.PUBLIC_URL}${avatar.image}`;
      }
      
      return (
        <AvatarImage 
          src={imageSrc} 
          alt={playerName}
        />
      );
    }
    
    return (
      <AvatarContent>
        {avatar.selectedImage || avatar.image}
      </AvatarContent>
    );
  };

  return (
    <PodiumsWrapper>
      {/* Player 1 Podium */}
      <PodiumContainer>
        <AvatarBox color={playerOneAvatar?.color}>
          {renderAvatar(playerOneAvatar, playerOneName)}
        </AvatarBox>
        <Podium>
          <PodiumTopTier>
            <ScoreText>
              {playerOneScore >= 0 ? '$' : '-$'}{Math.abs(playerOneScore).toLocaleString()}
            </ScoreText>
          </PodiumTopTier>
          <PodiumBottomTier>
            <PlayerNameText>
              {playerOneName}
            </PlayerNameText>
          </PodiumBottomTier>
          <PodiumBaseTier />
        </Podium>
      </PodiumContainer>

      {/* Player 2 Podium */}
        {playerTwoName && (
          <PodiumContainer>
            <AvatarBox color={playerTwoAvatar?.color}>
              {renderAvatar(playerTwoAvatar, playerTwoName)}
            </AvatarBox>
          <Podium>
            <PodiumTopTier>
              <ScoreText>
                {playerTwoScore >= 0 ? '$' : '-$'}{Math.abs(playerTwoScore).toLocaleString()}
              </ScoreText>
            </PodiumTopTier>
            <PodiumBottomTier>
              <PlayerNameText>
                {playerTwoName}
              </PlayerNameText>
            </PodiumBottomTier>
            <PodiumBaseTier />
          </Podium>
        </PodiumContainer>
      )}
    </PodiumsWrapper>
  );
}

export default ScoreDisplay; 