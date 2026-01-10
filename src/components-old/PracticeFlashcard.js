import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import { addMissedQuestion } from '../services/missedQuestionsDB-firebase';
import { saveCategoryOverride } from '../services/categoryOverridesDB-firebase';
import { excludeQuestion } from '../services/excludedQuestionsDB-firebase';
import { useAuth } from '../contexts/AuthContext';

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

const FlashcardInner = styled(Box)(({ isFlipped, enableTransition }) => ({
  position: 'relative',
  width: '100%',
  height: '400px',
  textAlign: 'center',
  transition: enableTransition ? 'transform 0.6s' : 'none',
  transformStyle: 'preserve-3d',
  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  '@media (max-width: 600px)': {
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
  overflow: 'auto',
  [theme.breakpoints.down('sm')]: {
    height: '300px',
    padding: theme.spacing(3),
    border: '3px solid #0f258f',
    borderRadius: '12px',
  }
}));

const FlashcardBack = styled(FlashcardFace)(({ theme }) => ({
  transform: 'rotateY(180deg)',
  backgroundColor: '#e8f5e9',
}));

function PracticeFlashcard({ clue, onAnswer, onNext, onPrevious, currentIndex, totalQuestions, availableCategories, onCategoryOverride, onSkipToStart, onSkipToEnd }) {
  const { user } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showReclassifyDialog, setShowReclassifyDialog] = useState(false);
  const [showExcludeDialog, setShowExcludeDialog] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [enableTransition, setEnableTransition] = useState(true);

  // Reset card state when the clue changes - instantly show front of new card
  useEffect(() => {
    setEnableTransition(false); // Disable animation for card change
    setIsFlipped(false);
    setHasAnswered(false);
    // Re-enable animation after a brief moment for manual flips
    const timer = setTimeout(() => {
      setEnableTransition(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [clue.id]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleCorrect = () => {
    setHasAnswered(true);
    onAnswer(true);
  };

  const handleIncorrect = async () => {
    setHasAnswered(true);
    onAnswer(false);
    
    // Add to missed questions database
    try {
      await addMissedQuestion(clue, user?.uid);
    } catch (error) {
      console.error('Error saving missed question:', error);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setHasAnswered(false);
    onNext();
  };

  const handleOpenReclassifyDialog = () => {
    setNewCategory(clue.topLevelCategory);
    setShowReclassifyDialog(true);
  };

  const handleCloseReclassifyDialog = () => {
    setShowReclassifyDialog(false);
    setNewCategory('');
  };

  const handleSaveReclassify = async () => {
    try {
      await saveCategoryOverride(clue.id, clue.topLevelCategory, newCategory, user?.uid);
      console.log(`Reclassified clue ${clue.id} from ${clue.topLevelCategory} to ${newCategory}`);
      setShowReclassifyDialog(false);
      
      // Call the callback to reload questions
      if (onCategoryOverride) {
        await onCategoryOverride();
      }
    } catch (error) {
      console.error('Error saving category override:', error);
      alert('Failed to save category override. Please try again.');
    }
  };

  const handleOpenExcludeDialog = () => {
    setShowExcludeDialog(true);
  };

  const handleCloseExcludeDialog = () => {
    setShowExcludeDialog(false);
  };

  const handleConfirmExclude = async () => {
    try {
      await excludeQuestion(clue.id, 'Visual clue without image', user?.uid);
      console.log(`Excluded clue ${clue.id}`);
      setShowExcludeDialog(false);
      
      // Call the callback to reload questions and move to next
      if (onCategoryOverride) {
        await onCategoryOverride();
      }
      
      // Automatically move to next question
      handleNext();
    } catch (error) {
      console.error('Error excluding question:', error);
      alert('Failed to exclude question. Please try again.');
    }
  };

  return (
    <Box>
      <FlashcardContainer>
        <FlashcardInner isFlipped={isFlipped} enableTransition={enableTransition}>
          {/* Front of card - Question */}
          <FlashcardFace elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip 
                    label={clue.topLevelCategory}
                    sx={{ 
                      backgroundColor: clue.hasOverride ? '#ff9800' : '#0f258f',
                      color: '#f5f5f5',
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }} 
                  />
                  {clue.difficulty && (
                    <Chip 
                      label={clue.difficulty.toUpperCase()}
                      size="small"
                      sx={{ 
                        backgroundColor: 
                          clue.difficulty === 'easy' ? '#4caf50' : 
                          clue.difficulty === 'medium' ? '#ff9800' : 
                          '#f44336',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }} 
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={handleOpenReclassifyDialog}
                    sx={{
                      color: '#0f258f',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(15, 37, 143, 0.1)',
                      }
                    }}
                  >
                    Reclassify
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={handleOpenExcludeDialog}
                    sx={{
                      color: '#d32f2f',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                      }
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              </Box>
              <Chip 
                label={clue.category} 
                sx={{ 
                  mb: 3, 
                  backgroundColor: '#666', 
                  color: '#f5f5f5',
                  fontSize: '0.9rem',
                }} 
              />
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  color: '#0f258f',
                  fontWeight: 500,
                  lineHeight: 1.5,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}
              >
                {clue.clue}
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Chip 
                  label={`$${clue.value}`} 
                  sx={{ 
                    backgroundColor: '#0f258f', 
                    color: '#f5f5f5',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    px: 2,
                    py: 3
                  }} 
                />
              </Box>
              {clue.hasOverride && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    mt: 2, 
                    color: '#ff9800',
                    fontStyle: 'italic'
                  }}
                >
                  Originally: {clue.originalTopLevelCategory}
                </Typography>
              )}
            </CardContent>
          </FlashcardFace>

          {/* Back of card - Answer */}
          <FlashcardBack elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
                <Typography 
                  variant="h5" 
                  sx={{ color: '#1b5e20', fontWeight: 'bold' }}
                >
                  Correct Answer:
                </Typography>
                {clue.difficulty && (
                  <Chip 
                    label={clue.difficulty.toUpperCase()}
                    size="small"
                    sx={{ 
                      backgroundColor: 
                        clue.difficulty === 'easy' ? '#4caf50' : 
                        clue.difficulty === 'medium' ? '#ff9800' : 
                        '#f44336',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      alignSelf: 'center'
                    }} 
                  />
                )}
              </Box>
              <Typography 
                variant="h3" 
                component="div" 
                sx={{ 
                  color: '#2e7d32',
                  fontWeight: 600,
                  mb: 3,
                  fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
                }}
              >
                What is {clue.response}?
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Typography variant="body2" sx={{ color: '#555', mb: 1 }}>
                  Category: {clue.category}
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', mb: 1 }}>
                  Value: ${clue.value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#555' }}>
                  Round: {clue.round}
                </Typography>
              </Box>
            </CardContent>
          </FlashcardBack>
        </FlashcardInner>
      </FlashcardContainer>

      {/* Control Buttons */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', px: { xs: 2, sm: 0 } }}>
        {!isFlipped && (
          <Button
            variant="contained"
            size="large"
            onClick={handleFlip}
            sx={{
              backgroundColor: '#f5f5f5',
              color: '#0f258f',
              fontSize: { xs: '1.4rem', sm: '1.54rem' },
              px: { xs: 4.2, sm: 5.6 },
              py: { xs: 2.1, sm: 2.1 },
              minHeight: '67px',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              }
            }}
          >
            Show Answer
          </Button>
        )}

        {isFlipped && !hasAnswered && (
          <>
            <Button
              variant="contained"
              size="large"
              onClick={handleCorrect}
              sx={{
                backgroundColor: '#4caf50',
                color: 'white',
                fontSize: { xs: '1.4rem', sm: '1.54rem' },
                px: { xs: 4.2, sm: 5.6 },
                py: { xs: 2.1, sm: 2.1 },
                minHeight: '67px',
                '&:hover': {
                  backgroundColor: '#45a049',
                }
              }}
            >
              ✓ I Got It Right
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleIncorrect}
              sx={{
                backgroundColor: '#f44336',
                color: 'white',
                fontSize: { xs: '1.4rem', sm: '1.54rem' },
                px: { xs: 4.2, sm: 5.6 },
                py: { xs: 2.1, sm: 2.1 },
                minHeight: '67px',
                '&:hover': {
                  backgroundColor: '#d32f2f',
                }
              }}
            >
              ✗ I Got It Wrong
            </Button>
          </>
        )}

        {isFlipped && hasAnswered && (
          <Button
            variant="contained"
            size="large"
            onClick={handleNext}
            sx={{
              backgroundColor: '#f5f5f5',
              color: '#0f258f',
              fontSize: { xs: '1rem', sm: '1.1rem' },
              px: { xs: 3, sm: 4 },
              py: { xs: 1.5, sm: 1.5 },
              minHeight: '48px',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              }
            }}
          >
            Next Question →
          </Button>
        )}
      </Box>

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
          <Tooltip title="Skip to first question">
            <span>
              <Button
                variant="outlined"
                startIcon={<FirstPageIcon />}
                onClick={() => {
                  setIsFlipped(false);
                  setHasAnswered(false);
                  onSkipToStart();
                }}
                disabled={currentIndex === 0}
                sx={{
                  color: '#0f258f',
                  borderColor: '#0f258f',
                  backgroundColor: '#fff',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 1, sm: 1.25 },
                  minHeight: '44px',
                  minWidth: 'auto',
                  '&:hover': {
                    borderColor: '#0f258f',
                    backgroundColor: 'rgba(15, 37, 143, 0.05)',
                  },
                  '&.Mui-disabled': {
                    borderColor: 'rgba(0, 0, 0, 0.12)',
                    color: 'rgba(0, 0, 0, 0.26)',
                    backgroundColor: '#fff',
                  }
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>First</Box>
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              setIsFlipped(false);
              setHasAnswered(false);
              onPrevious();
            }}
            disabled={currentIndex === 0}
            sx={{
              color: '#0f258f',
              borderColor: '#0f258f',
              backgroundColor: '#fff',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.25 },
              minHeight: '44px',
              '&:hover': {
                borderColor: '#0f258f',
                backgroundColor: 'rgba(15, 37, 143, 0.05)',
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

        <Typography 
          variant="body2" 
          sx={{ 
            color: '#666',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            fontWeight: 500
          }}
        >
          {currentIndex + 1} / {totalQuestions}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            onClick={() => {
              setIsFlipped(false);
              setHasAnswered(false);
              onNext();
            }}
            disabled={currentIndex === totalQuestions - 1}
            sx={{
              color: '#0f258f',
              borderColor: '#0f258f',
              backgroundColor: '#fff',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.25 },
              minHeight: '44px',
              '&:hover': {
                borderColor: '#0f258f',
                backgroundColor: 'rgba(15, 37, 143, 0.05)',
              },
              '&.Mui-disabled': {
                borderColor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
                backgroundColor: '#fff',
              }
            }}
          >
            Skip
          </Button>
          <Tooltip title="Skip to last question">
            <span>
              <Button
                variant="outlined"
                endIcon={<LastPageIcon />}
                onClick={() => {
                  setIsFlipped(false);
                  setHasAnswered(false);
                  onSkipToEnd();
                }}
                disabled={currentIndex === totalQuestions - 1}
                sx={{
                  color: '#0f258f',
                  borderColor: '#0f258f',
                  backgroundColor: '#fff',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 1, sm: 1.25 },
                  minHeight: '44px',
                  minWidth: 'auto',
                  '&:hover': {
                    borderColor: '#0f258f',
                    backgroundColor: 'rgba(15, 37, 143, 0.05)',
                  },
                  '&.Mui-disabled': {
                    borderColor: 'rgba(0, 0, 0, 0.12)',
                    color: 'rgba(0, 0, 0, 0.26)',
                    backgroundColor: '#fff',
                  }
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Last</Box>
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Flip back button when showing answer */}
      {isFlipped && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="text"
            onClick={handleFlip}
            sx={{
              color: '#f5f5f5',
              textDecoration: 'underline',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            ← Back to Question
          </Button>
        </Box>
      )}

      {/* Reclassify Dialog */}
      <Dialog 
        open={showReclassifyDialog} 
        onClose={handleCloseReclassifyDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#0f258f', color: '#f5f5f5' }}>
          Reclassify Question
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Current Category: <strong>{clue.topLevelCategory}</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
            Specific Topic: <em>{clue.category}</em>
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="new-category-label">New Main Category</InputLabel>
            <Select
              labelId="new-category-label"
              value={newCategory}
              label="New Main Category"
              onChange={(e) => setNewCategory(e.target.value)}
            >
              {availableCategories && availableCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReclassifyDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveReclassify} 
            variant="contained"
            disabled={!newCategory || newCategory === clue.topLevelCategory}
            sx={{
              backgroundColor: '#0f258f',
              '&:hover': {
                backgroundColor: '#0a1a6f',
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Exclude Question Dialog */}
      <Dialog 
        open={showExcludeDialog} 
        onClose={handleCloseExcludeDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#d32f2f', color: '#fff' }}>
          Remove Question
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to remove this question from practice?
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            This is typically used for visual clues that require an image to answer.
          </Typography>
          <Box sx={{ 
            p: 2, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 1,
            border: '1px solid #ddd'
          }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666' }}>
              "{clue.clue}"
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#999' }}>
            This question will be permanently excluded from all practice sessions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExcludeDialog}>Cancel</Button>
          <Button 
            onClick={handleConfirmExclude} 
            variant="contained"
            color="error"
            sx={{
              backgroundColor: '#d32f2f',
              '&:hover': {
                backgroundColor: '#b71c1c',
              }
            }}
          >
            Remove Question
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PracticeFlashcard;

