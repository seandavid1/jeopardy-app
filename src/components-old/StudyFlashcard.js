import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArchiveIcon from '@mui/icons-material/Archive';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';

const flip = keyframes`
  from {
    transform: rotateY(0deg);
  }
  to {
    transform: rotateY(180deg);
  }
`;

const FlashcardContainer = styled(Box)(({ theme }) => ({
  perspective: '1000px',
  height: '400px',
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    height: '300px',
  }
}));

const FlashcardInner = styled(Box)(({ theme, isFlipped, enableTransition }) => ({
  position: 'relative',
  width: '100%',
  height: '400px',
  textAlign: 'center',
  transition: enableTransition ? 'transform 0.6s' : 'none',
  transformStyle: 'preserve-3d',
  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  [theme.breakpoints.down('sm')]: {
    height: '300px',
  }
}));

const FlashcardFace = styled(Card)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '400px',
  backfaceVisibility: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  backgroundColor: '#f5f5f5',
  border: '4px solid #0f258f',
  borderRadius: '16px',
  cursor: 'pointer',
  transition: 'box-shadow 0.2s',
  overflow: 'auto',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
  },
  [theme.breakpoints.down('sm')]: {
    height: '300px',
    padding: theme.spacing(3),
    border: '3px solid #0f258f',
    borderRadius: '12px',
  }
}));

const FlashcardBack = styled(FlashcardFace)(({ theme }) => ({
  backgroundColor: '#e8f4f8',
  transform: 'rotateY(180deg)',
}));

function StudyFlashcard({ card, currentIndex, totalCards, onNext, onPrevious, onShuffle, isShuffleMode, isReversed, onMarkCorrect, onMarkMissed, isMarkedCorrect, isMarkedMissed, onSkipToStart, onSkipToEnd, allowArchive, onArchive, isArchived }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [enableTransition, setEnableTransition] = useState(true);

  // Reset card state when the card changes - instantly show front of new card
  useEffect(() => {
    setEnableTransition(false); // Disable animation for card change
    setIsFlipped(false);
    // Re-enable animation after a brief moment for manual flips
    const timer = setTimeout(() => {
      setEnableTransition(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [card.id]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <Box>
      <FlashcardContainer>
        <FlashcardInner isFlipped={isFlipped} enableTransition={enableTransition}>
          {/* Front of card */}
          <FlashcardFace elevation={3} onClick={handleFlip}>
            <CardContent sx={{ width: '100%' }}>
              {card.difficulty && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Chip 
                    label={card.difficulty.toUpperCase()}
                    sx={{ 
                      backgroundColor: 
                        card.difficulty === 'easy' ? '#4caf50' : 
                        card.difficulty === 'medium' ? '#ff9800' : 
                        '#f44336',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }} 
                  />
                </Box>
              )}
              <Typography 
                variant="h3" 
                component="div" 
                sx={{ 
                  color: '#0f258f',
                  fontWeight: 600,
                  lineHeight: 1.5,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                }}
              >
                {isReversed ? card.answer : card.question}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 4,
                  color: '#666',
                  fontStyle: 'italic',
                  userSelect: 'none'
                }}
              >
                👆 Click card to flip
              </Typography>
            </CardContent>
          </FlashcardFace>

          {/* Back of card */}
          <FlashcardBack elevation={3} onClick={handleFlip}>
            <CardContent sx={{ width: '100%', position: 'relative' }}>
              {/* Marking Buttons on Answer Side */}
              <Box sx={{ 
                position: 'absolute',
                top: 16,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'space-between',
                px: 2,
                zIndex: 10
              }}>
                <Tooltip title="Mark as Missed">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(false);
                      setTimeout(() => {
                        onMarkMissed();
                      }, 100);
                    }}
                    sx={{
                      backgroundColor: isMarkedMissed ? '#f44336' : 'rgba(244, 67, 54, 0.15)',
                      color: isMarkedMissed ? '#fff' : '#f44336',
                      width: 67,
                      height: 67,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      '&:hover': {
                        backgroundColor: isMarkedMissed ? '#d32f2f' : 'rgba(244, 67, 54, 0.3)',
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease',
                      transform: isMarkedMissed ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    <CancelIcon sx={{ fontSize: 39 }} />
                  </IconButton>
                </Tooltip>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {allowArchive && (
                    <Tooltip title="Archive (Mark as mastered & remove from deck)">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFlipped(false);
                          setTimeout(() => {
                            onArchive();
                          }, 100);
                        }}
                        sx={{
                          backgroundColor: isArchived ? '#ff9800' : 'rgba(255, 152, 0, 0.15)',
                          color: isArchived ? '#fff' : '#ff9800',
                          width: 67,
                          height: 67,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          '&:hover': {
                            backgroundColor: isArchived ? '#f57c00' : 'rgba(255, 152, 0, 0.3)',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                          transform: isArchived ? 'scale(1.1)' : 'scale(1)',
                        }}
                      >
                        <ArchiveIcon sx={{ fontSize: 39 }} />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title="Mark as Correct">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(false);
                        setTimeout(() => {
                          onMarkCorrect();
                        }, 100);
                      }}
                      sx={{
                        backgroundColor: isMarkedCorrect ? '#4caf50' : 'rgba(76, 175, 80, 0.15)',
                        color: isMarkedCorrect ? '#fff' : '#4caf50',
                        width: 67,
                        height: 67,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        '&:hover': {
                          backgroundColor: isMarkedCorrect ? '#45a049' : 'rgba(76, 175, 80, 0.3)',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s ease',
                        transform: isMarkedCorrect ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 39 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {card.difficulty && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, mt: 6 }}>
                  <Chip 
                    label={card.difficulty.toUpperCase()}
                    sx={{ 
                      backgroundColor: 
                        card.difficulty === 'easy' ? '#4caf50' : 
                        card.difficulty === 'medium' ? '#ff9800' : 
                        '#f44336',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }} 
                  />
                </Box>
              )}
              <Typography 
                variant="h3" 
                component="div" 
                sx={{ 
                  color: '#2e7d32',
                  fontWeight: 600,
                  lineHeight: 1.5,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                }}
              >
                {isReversed ? card.question : card.answer}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 4,
                  color: '#666',
                  fontStyle: 'italic',
                  userSelect: 'none'
                }}
              >
                👆 Click card to flip back
              </Typography>
            </CardContent>
          </FlashcardBack>
        </FlashcardInner>
      </FlashcardContainer>

      {/* Navigation Buttons */}
      <Box sx={{ 
        mt: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        px: { xs: 2, sm: 0 },
        gap: 2,
        flexWrap: 'wrap'
      }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Skip to first card">
            <span>
              <IconButton
                onClick={() => {
                  setIsFlipped(false);
                  onSkipToStart();
                }}
                disabled={currentIndex === 0}
                sx={{
                  color: '#0f258f',
                  border: '1px solid',
                  borderColor: currentIndex === 0 ? 'rgba(0, 0, 0, 0.12)' : '#0f258f',
                  '&:hover': {
                    backgroundColor: '#e8f4f8',
                  },
                  '&.Mui-disabled': {
                    color: 'rgba(0, 0, 0, 0.26)',
                  }
                }}
              >
                <FirstPageIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              setIsFlipped(false);
              onPrevious();
            }}
            disabled={currentIndex === 0}
            sx={{
              color: '#0f258f',
              borderColor: '#0f258f',
              backgroundColor: '#fff',
              fontSize: { xs: '1.26rem', sm: '1.4rem' },
              px: { xs: 2.8, sm: 4.2 },
              py: { xs: 1.4, sm: 1.75 },
              minHeight: '62px',
              '&:hover': {
                borderColor: '#0f258f',
                backgroundColor: '#e8f4f8',
              },
              '&.Mui-disabled': {
                borderColor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
                backgroundColor: '#fff',
              }
            }}
          >
            Previous
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#666',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              fontWeight: 500
            }}
          >
            {currentIndex + 1} / {totalCards}
          </Typography>
          {isShuffleMode && (
            <Tooltip title="Re-shuffle deck">
              <IconButton
                onClick={onShuffle}
                sx={{
                  color: '#0f258f',
                  '&:hover': {
                    backgroundColor: 'rgba(15, 37, 143, 0.05)',
                  }
                }}
              >
                <ShuffleIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            onClick={() => {
              setIsFlipped(false);
              onNext();
            }}
            disabled={currentIndex === totalCards - 1}
            sx={{
              color: '#0f258f',
              borderColor: '#0f258f',
              backgroundColor: '#fff',
              fontSize: { xs: '1.26rem', sm: '1.4rem' },
              px: { xs: 2.8, sm: 4.2 },
              py: { xs: 1.4, sm: 1.75 },
              minHeight: '62px',
              '&:hover': {
                borderColor: '#0f258f',
                backgroundColor: '#e8f4f8',
              },
              '&.Mui-disabled': {
                borderColor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
                backgroundColor: '#fff',
              }
            }}
          >
            Next
          </Button>
          <Tooltip title="Skip to last card">
            <span>
              <IconButton
                onClick={() => {
                  setIsFlipped(false);
                  onSkipToEnd();
                }}
                disabled={currentIndex === totalCards - 1}
                sx={{
                  color: '#0f258f',
                  border: '1px solid',
                  borderColor: currentIndex === totalCards - 1 ? 'rgba(0, 0, 0, 0.12)' : '#0f258f',
                  '&:hover': {
                    backgroundColor: '#e8f4f8',
                  },
                  '&.Mui-disabled': {
                    color: 'rgba(0, 0, 0, 0.26)',
                  }
                }}
              >
                <LastPageIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}

export default StudyFlashcard;

