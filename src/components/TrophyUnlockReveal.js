import React from 'react';
import { Box, Button, Typography, Card, styled, keyframes } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { getTrophyColor } from '../config/trophies';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const shine = keyframes`
  0% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4);
  }
  100% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const Container = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, rgba(15, 37, 143, 0.98) 0%, rgba(88, 28, 135, 0.98) 100%)',
  zIndex: 9999,
  animation: `${fadeIn} 0.5s ease-out`,
});

const TrophyCard = styled(Card)(({ tier }) => ({
  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  padding: '60px 80px',
  borderRadius: '24px',
  border: `6px solid ${getTrophyColor(tier)}`,
  boxShadow: `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px ${getTrophyColor(tier)}40`,
  animation: `${shine} 2s ease-in-out infinite`,
  maxWidth: '600px',
  textAlign: 'center',
  position: 'relative',
  overflow: 'visible',
}));

const TrophyIcon = styled(Box)(({ tier }) => ({
  fontSize: '8rem',
  marginBottom: '20px',
  filter: `drop-shadow(0 0 20px ${getTrophyColor(tier)})`,
  animation: `${float} 3s ease-in-out infinite`,
}));

const TierBadge = styled(Box)(({ tier }) => ({
  display: 'inline-block',
  padding: '8px 24px',
  backgroundColor: getTrophyColor(tier),
  color: '#fff',
  borderRadius: '20px',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  textTransform: 'uppercase',
  marginBottom: '20px',
  boxShadow: `0 4px 12px ${getTrophyColor(tier)}60`,
}));

const Confetti = styled(Box)({
  position: 'absolute',
  width: '10px',
  height: '10px',
  backgroundColor: '#ffd700',
  opacity: 0,
  animation: 'confettiFall 3s ease-out forwards',
  '@keyframes confettiFall': {
    '0%': {
      opacity: 1,
      transform: 'translateY(0) rotate(0deg)',
    },
    '100%': {
      opacity: 0,
      transform: 'translateY(600px) rotate(720deg)',
    },
  },
});

function TrophyUnlockReveal({ trophies, onContinue }) {
  if (!trophies || trophies.length === 0) {
    return null;
  }

  // Show first trophy (or we could cycle through multiple)
  const trophy = trophies[0];
  const isMultiple = trophies.length > 1;

  return (
    <Container>
      {/* Confetti effect */}
      {[...Array(20)].map((_, i) => (
        <Confetti
          key={i}
          sx={{
            left: `${Math.random() * 100}%`,
            top: '-20px',
            animationDelay: `${Math.random() * 0.5}s`,
            backgroundColor: i % 3 === 0 ? '#ffd700' : i % 3 === 1 ? '#ff6b35' : '#4169e1',
          }}
        />
      ))}

      <TrophyCard tier={trophy.tier}>
        <Typography
          variant="h3"
          sx={{
            color: '#ffd700',
            fontWeight: 'bold',
            marginBottom: 3,
            textShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          🎉 Trophy Unlocked! 🎉
        </Typography>

        <TierBadge tier={trophy.tier}>
          {trophy.tier}
        </TierBadge>

        <TrophyIcon tier={trophy.tier}>
          {trophy.icon || '🏆'}
        </TrophyIcon>

        <Typography
          variant="h4"
          sx={{
            color: '#fff',
            fontWeight: 'bold',
            marginBottom: 2,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
          }}
        >
          {trophy.name}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: 4,
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
          }}
        >
          {trophy.description}
        </Typography>

        {isMultiple && (
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: 3,
              fontStyle: 'italic'
            }}
          >
            +{trophies.length - 1} more {trophies.length - 1 === 1 ? 'trophy' : 'trophies'} unlocked!
          </Typography>
        )}

        <Button
          variant="contained"
          size="large"
          onClick={onContinue}
          startIcon={<EmojiEventsIcon />}
          sx={{
            backgroundColor: getTrophyColor(trophy.tier),
            color: '#fff',
            fontSize: '1.1rem',
            padding: '12px 48px',
            fontWeight: 'bold',
            boxShadow: `0 8px 24px ${getTrophyColor(trophy.tier)}60`,
            '&:hover': {
              backgroundColor: getTrophyColor(trophy.tier),
              filter: 'brightness(1.2)',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Continue
        </Button>
      </TrophyCard>
    </Container>
  );
}

export default TrophyUnlockReveal;




