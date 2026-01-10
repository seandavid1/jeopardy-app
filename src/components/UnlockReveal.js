import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Modal } from '@mui/material';
import { keyframes } from '@mui/system';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CloseIcon from '@mui/icons-material/Close';
import { CPU_OPPONENTS } from '../config/cpuOpponents';

// Animation keyframes
const fadeInScale = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const slideInFromTop = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-50px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4);
  }
`;

const UnlockReveal = ({ unlockedOpponentId, onContinue }) => {
  const [showContent, setShowContent] = useState(false);
  const unlockedOpponent = CPU_OPPONENTS.find(opp => opp.id === unlockedOpponentId);

  useEffect(() => {
    // Delay content reveal for dramatic effect
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 2000); // 2 second delay before showing
    return () => clearTimeout(timer);
  }, []);

  if (!unlockedOpponent) {
    console.error('Unlocked opponent not found:', unlockedOpponentId);
    return null;
  }

  // Get the correct avatar path
  const avatarPath = unlockedOpponent.avatar?.customImage 
    ? `${process.env.PUBLIC_URL}${unlockedOpponent.avatar.customImage}`
    : `${process.env.PUBLIC_URL}/avatars/cpu/default.png`;

  return (
    <Modal
      open={true}
      onClose={onContinue}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          padding: 4,
          borderRadius: '20px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          outline: 'none',
          boxShadow: '0 0 50px rgba(255, 215, 0, 0.5)',
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onContinue}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: '#FFD700',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
            zIndex: 10,
          }}
        >
          <CloseIcon sx={{ fontSize: '2rem' }} />
        </IconButton>

        {/* Banner Headline with Icon */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          mb: 6,
          animation: `${slideInFromTop} 0.8s ease-out`,
        }}
      >
        <LockOpenIcon
          sx={{
            fontSize: '80px',
            color: '#FFD700',
            filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))',
          }}
        />
        <Typography
          variant="h2"
          sx={{
            fontFamily: 'ITC Korinna, serif',
            fontWeight: 'bold',
            fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
            color: '#FFD700',
            textAlign: 'center',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
            letterSpacing: '0.05em',
          }}
        >
          YOU'VE UNLOCKED A NEW OPPONENT!
        </Typography>
      </Box>

      {/* CPU Opponent Card */}
      {showContent && (
        <Box
          sx={{
            animation: `${fadeInScale} 0.6s ease-out`,
            mb: 4,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: 4,
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
              backdropFilter: 'blur(10px)',
              border: '3px solid #FFD700',
              borderRadius: '16px',
              animation: `${pulseGlow} 2s ease-in-out infinite`,
              minWidth: { xs: '280px', sm: '400px' },
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            {/* Avatar */}
            <Box
              component="img"
              src={avatarPath}
              alt={unlockedOpponent.name}
              sx={{
                width: { xs: 120, sm: 150 },
                height: { xs: 120, sm: 150 },
                borderRadius: '50%',
                border: '4px solid #FFD700',
                boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
                objectFit: 'cover',
              }}
            />

            {/* Name */}
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'ITC Korinna, serif',
                fontWeight: 'bold',
                fontSize: { xs: '1.75rem', sm: '2.5rem' },
                color: '#FFFFFF',
                textAlign: 'center',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              }}
            >
              {unlockedOpponent.name}
            </Typography>

            {/* Description */}
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', sm: '1.1rem' },
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                fontStyle: 'italic',
                maxWidth: '350px',
              }}
            >
              {unlockedOpponent.bio}
            </Typography>

            {/* Tier Badge */}
            {unlockedOpponent.tier && (
              <Box
                sx={{
                  mt: 1,
                  px: 3,
                  py: 1,
                  background: getTierGradient(unlockedOpponent.tier),
                  borderRadius: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {unlockedOpponent.tier}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
      </Box>
    </Modal>
  );
};

// Helper function to get tier gradient
const getTierGradient = (tier) => {
  // Handle both string tier names and numeric tiers
  const tierName = typeof tier === 'string' ? tier.toLowerCase() : tier;
  
  switch (tierName) {
    case 'beginner':
    case 1:
      return 'linear-gradient(145deg, #4CAF50, #45a049)'; // Green
    case 'intermediate':
    case 2:
      return 'linear-gradient(145deg, #2196F3, #1976D2)'; // Blue
    case 'advanced':
    case 3:
      return 'linear-gradient(145deg, #9C27B0, #7B1FA2)'; // Purple
    case 'expert':
    case 4:
      return 'linear-gradient(145deg, #FF5722, #E64A19)'; // Red-Orange
    case 'legendary':
    case 5:
      return 'linear-gradient(145deg, #FF0000, #CC0000)'; // Red
    default:
      return 'linear-gradient(145deg, #757575, #616161)'; // Gray
  }
};

export default UnlockReveal;

