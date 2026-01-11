import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PracticeFlashcard from './PracticeFlashcard';
import StudyFlashcard from './StudyFlashcard';
import questionSetSeason38Part1 from '../cluebase-questions/jeopardy-questions-season38-2021-09-12-to-2022-02-23-part1';
import questionSetSeason38Part2 from '../cluebase-questions/jeopardy-questions-season38-2022-02-23-to-2022-07-28-part2';
import questionSetSeason39Part1 from '../cluebase-questions/jeopardy-questions-season39-2022-09-11-to-2023-02-23-part1';
import questionSetSeason39Part2 from '../cluebase-questions/jeopardy-questions-season39-2023-02-23-to-2023-07-27-part2';
import questionSetSeason40Part1 from '../cluebase-questions/jeopardy-questions-season40-2023-09-10-to-2024-02-25-part1';
import questionSetSeason40Part2 from '../cluebase-questions/jeopardy-questions-season40-2024-02-25-to-2024-07-25-part2';
import questionSetSeason41Part1 from '../cluebase-questions/jeopardy-questions-season41-2024-09-08-to-2024-12-29-part1';
import questionSetSeason41Part2 from '../cluebase-questions/jeopardy-questions-season41-2024-12-29-to-2025-04-09-part2';
import { getAllCategoryOverrides } from '../services/categoryOverridesDB-firebase';
import { getAllExcludedQuestionIds } from '../services/excludedQuestionsDB-firebase';
import { getMissedQuestions } from '../services/missedQuestionsDB-firebase';
import { getArchivedMissedQuestionIds, archiveMissedQuestion } from '../services/archivedMissedQuestionsDB-firebase';
import { allFlashcardDecks, getFlashcardDecksByCategory } from '../flashcard-decks';
import { useAuth } from '../contexts/AuthContext';
import { checkAndUnlockTrophies, getUserTrophyCase } from '../services/trophyService';
import { recordFlashcardCompletion } from '../services/flashcardCompletionsDB-firebase';
import TrophyUnlockReveal from './TrophyUnlockReveal';
import { getTrophyById } from '../config/trophies';

const BackgroundContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#000033',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='shadow' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23000055' stop-opacity='0.5'/%3E%3Cstop offset='100%25' stop-color='%23000033' stop-opacity='0.5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='0' y='0' width='100' height='100' fill='%23000033' rx='8' ry='8'/%3E%3Crect x='5' y='5' width='90' height='90' fill='url(%23shadow)' rx='6' ry='6'/%3E%3C/svg%3E")`,
  backgroundSize: '100px 100px',
  zIndex: -1,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: '#0f258f',
  color: 'white',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  border: '4px solid #f5f5f5',
  minHeight: '60vh',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    borderRadius: '12px',
    border: '3px solid #f5f5f5',
    minHeight: '70vh',
  }
}));

const HomeButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  top: 20,
  left: 20,
  backgroundColor: '#f5f5f5',
  color: '#0f258f',
  '&:hover': {
    backgroundColor: '#e0e0e0',
  },
  zIndex: 1000,
}));

function Practice({ onReturnToStart }) {
  const { user } = useAuth();
  
  // Mode selection state
  const [practiceMode, setPracticeMode] = useState(null); // 'jeopardy' or 'study'
  
  // Jeopardy practice states
  const [allQuestions, setAllQuestions] = useState([]);
  const [topLevelCategories, setTopLevelCategories] = useState([]);
  const [selectedTopCategory, setSelectedTopCategory] = useState('');
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [categoryQuestions, setCategoryQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  
  // Study flashcard states
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [studyCards, setStudyCards] = useState([]);
  const [originalCards, setOriginalCards] = useState([]); // Keep original order
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studyStarted, setStudyStarted] = useState(false);
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);
  const [isShuffleMode, setIsShuffleMode] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [correctCardIds, setCorrectCardIds] = useState(new Set());
  const [missedCardIds, setMissedCardIds] = useState(new Set());
  const [archivedCardIds, setArchivedCardIds] = useState(new Set());
  const [showSummary, setShowSummary] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [selectedDeckCategory, setSelectedDeckCategory] = useState('all');
  const [selectedDifficulties, setSelectedDifficulties] = useState(['easy', 'medium', 'hard']); // Array to hold multiple selections

  // Timing states for speed challenge
  const [cardStartTime, setCardStartTime] = useState(null); // When current card was shown
  const [sessionStartTime, setSessionStartTime] = useState(null); // When session started
  const [cardTimes, setCardTimes] = useState([]); // Array of time taken for each card
  const [currentCardElapsed, setCurrentCardElapsed] = useState(0); // Live elapsed time for current card

  // Missed questions state
  const [missedQuestionsDeck, setMissedQuestionsDeck] = useState(null);
  const [loadingMissedQuestions, setLoadingMissedQuestions] = useState(true);

  // Trophy unlock state
  const [unlockedTrophies, setUnlockedTrophies] = useState([]);
  const [showTrophyReveal, setShowTrophyReveal] = useState(false);
  const [userTrophyCase, setUserTrophyCase] = useState(null);

  // Update current card elapsed time (for live display)
  useEffect(() => {
    if (!cardStartTime || !studyStarted || showSummary) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = (Date.now() - cardStartTime) / 1000;
      setCurrentCardElapsed(elapsed);
    }, 100); // Update every 100ms for smooth display

    return () => clearInterval(interval);
  }, [cardStartTime, studyStarted, showSummary]);

  // Load all questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      const combined = questionSetSeason38Part1.concat(
        questionSetSeason38Part2,
        questionSetSeason39Part1,
        questionSetSeason39Part2,
        questionSetSeason40Part1,
        questionSetSeason40Part2,
        questionSetSeason41Part1,
        questionSetSeason41Part2
      );
      
      console.log('Total questions loaded:', combined.length);
      
      // Apply category overrides and exclusions
      try {
        const [overrides, excludedIds] = await Promise.all([
          getAllCategoryOverrides(user?.uid),
          getAllExcludedQuestionIds(user?.uid)
        ]);
        
        console.log('Category overrides loaded:', overrides.length);
        console.log('Excluded questions loaded:', excludedIds.length);
        
        // Create a map for quick lookup
        const overrideMap = {};
        overrides.forEach(override => {
          overrideMap[override.clueId] = override.newTopLevelCategory;
        });
        
        // Create a set for quick exclusion checking
        const excludedSet = new Set(excludedIds);
        
        // Apply overrides and filter out excluded questions and empty clues
        const questionsWithOverrides = combined
          .filter(q => !excludedSet.has(q.id) && !q.isEmpty) // Filter out excluded and empty
          .map(q => {
            if (overrideMap[q.id]) {
              return {
                ...q,
                topLevelCategory: overrideMap[q.id],
                originalTopLevelCategory: q.topLevelCategory, // Keep original for reference
                hasOverride: true
              };
            }
            return q;
          });
        
        console.log('Questions after filtering:', questionsWithOverrides.length);
        setAllQuestions(questionsWithOverrides);
        
        // Extract unique top-level categories (including overridden ones)
        const uniqueTopCategories = [...new Set(questionsWithOverrides.map(q => q.topLevelCategory))].sort();
        console.log('Top-level categories:', uniqueTopCategories);
        setTopLevelCategories(uniqueTopCategories);
      } catch (error) {
        console.error('Error loading overrides/exclusions:', error);
        // Fallback: use questions without overrides (but still filter out empty clues)
        const nonEmptyQuestions = combined.filter(q => !q.isEmpty);
        setAllQuestions(nonEmptyQuestions);
        const uniqueTopCategories = [...new Set(nonEmptyQuestions.map(q => q.topLevelCategory))].sort();
        setTopLevelCategories(uniqueTopCategories);
      }
      
      setIsLoading(false);
    };

    loadQuestions();
  }, []);

  // Load missed questions and create a dynamic deck
  useEffect(() => {
    const loadMissedQuestions = async () => {
      if (!user) {
        setLoadingMissedQuestions(false);
        return;
      }

      try {
        console.log('Loading missed questions for flashcards...');
        
        // Load missed questions
        const missedQuestions = await getMissedQuestions();
        console.log('Missed questions loaded:', missedQuestions.length);
        
        // Load archived questions (with error handling)
        let archivedIds = [];
        try {
          archivedIds = await getArchivedMissedQuestionIds();
          console.log('Archived question IDs:', archivedIds.length);
        } catch (archiveError) {
          console.warn('Could not load archived questions (may not exist yet):', archiveError.message);
          archivedIds = [];
        }

        // Filter out archived questions
        const archivedSet = new Set(archivedIds);
        const activeQuestions = missedQuestions.filter(q => !archivedSet.has(q.id));
        
        console.log('Active (non-archived) questions:', activeQuestions.length);

        if (activeQuestions.length > 0) {
          // Convert missed questions to flashcard format
          const flashcards = activeQuestions.map((q, index) => ({
            id: `missed-${q.id}`,
            question: q.question,
            answer: q.answer,
            category: q.category,
            topLevelCategory: q.topLevelCategory,
            value: q.value,
            playerName: q.playerName,
            date: q.date,
            originalQuestionId: q.id // Store the original ID for archiving
          }));

          // Create the missed questions deck
          const deck = {
            id: 'missed-questions',
            name: '❌ Missed Questions',
            description: `Review ${activeQuestions.length} question${activeQuestions.length > 1 ? 's' : ''} you missed during gameplay`,
            category: 'Review',
            cards: flashcards,
            isDynamic: true,
            allowArchive: true // Flag to enable archive feature
          };

          setMissedQuestionsDeck(deck);
          console.log('Missed questions deck created:', deck);
        } else {
          console.log('No active missed questions to display');
          setMissedQuestionsDeck(null);
        }
      } catch (error) {
        console.error('Error loading missed questions for flashcards:', error);
        setMissedQuestionsDeck(null);
      }

      setLoadingMissedQuestions(false);
    };

    loadMissedQuestions();
  }, [user]);

  // Load user's trophy case to display trophies on flashcard decks
  useEffect(() => {
    const loadTrophyCase = async () => {
      if (user) {
        try {
          const trophyCase = await getUserTrophyCase(user.uid);
          setUserTrophyCase(trophyCase);
        } catch (error) {
          console.error('Error loading trophy case:', error);
        }
      }
    };
    
    loadTrophyCase();
  }, [user]);

  // Update sub-categories when top category changes
  useEffect(() => {
    if (selectedTopCategory) {
      const filteredQuestions = allQuestions.filter(q => q.topLevelCategory === selectedTopCategory);
      const uniqueSubs = [...new Set(filteredQuestions.map(q => q.category))].sort();
      console.log(`Sub-categories for ${selectedTopCategory}:`, uniqueSubs.length);
      setSubCategories(uniqueSubs);
      setSelectedSubCategory('all'); // Reset to 'all' when top category changes
    } else {
      setSubCategories([]);
      setSelectedSubCategory('all');
    }
  }, [selectedTopCategory, allQuestions]);

  const handleTopCategorySelect = (event) => {
    setSelectedTopCategory(event.target.value);
  };

  const handleSubCategorySelect = (event) => {
    setSelectedSubCategory(event.target.value);
  };

  const handleStartPractice = () => {
    if (!selectedTopCategory) return;
    
    // Filter questions by top-level category
    let filtered = allQuestions.filter(q => q.topLevelCategory === selectedTopCategory);
    
    // Further filter by sub-category if one is selected (not 'all')
    if (selectedSubCategory !== 'all') {
      filtered = filtered.filter(q => q.category === selectedSubCategory);
    }
    
    console.log(`Starting practice with ${filtered.length} questions`);
    
    // Shuffle the questions
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    
    setCategoryQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setPracticeStarted(true);
    setStats({ correct: 0, incorrect: 0 });
  };

  const handleAnswer = (isCorrect) => {
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1)
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < categoryQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // End of practice session
      alert(`Practice session complete!\n\nCorrect: ${stats.correct}\nIncorrect: ${stats.incorrect}\nTotal: ${stats.correct + stats.incorrect}`);
      setPracticeStarted(false);
      setSelectedCategory('');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSkipToStartQuestion = () => {
    setCurrentQuestionIndex(0);
  };

  const handleSkipToEndQuestion = () => {
    setCurrentQuestionIndex(categoryQuestions.length - 1);
  };

  // Study flashcard handlers
  const handleSelectDeck = (deck) => {
    setSelectedDeck(deck);
    
    // Check if this deck has difficulty levels
    const hasDifficulties = deck.cards.some(card => card.difficulty);
    
    if (hasDifficulties) {
      // Deck has difficulty levels, show difficulty selector
      setSelectedDifficulties(['easy', 'medium', 'hard']);
      setShowDifficultySelector(true);
    } else {
      // Deck doesn't have difficulty levels, skip directly to study
      setSelectedDifficulties([]);
      setShowDifficultySelector(false);
      
      // Start studying immediately with all cards
      const cards = [...deck.cards];
      setOriginalCards(cards);
      setStudyCards(cards);
      setCurrentCardIndex(0);
      setIsShuffleMode(false);
      setIsReversed(false);
      setCorrectCardIds(new Set());
      setMissedCardIds(new Set());
      setShowSummary(false);
      setIsReviewMode(false);
      
      // Initialize timing for speed challenge
      const now = Date.now();
      setSessionStartTime(now);
      setCardStartTime(now);
      setCardTimes([]);
      setCurrentCardElapsed(0);
      
      setStudyStarted(true);
    }
  };

  const handleStartStudy = () => {
    if (!selectedDeck) return;
    
    const cards = [...selectedDeck.cards];
    
    // Check if cards have difficulty levels
    const hasDifficulties = cards.some(card => card.difficulty);
    
    let filteredCards;
    if (hasDifficulties && selectedDifficulties.length > 0) {
      // Filter by selected difficulties
      filteredCards = cards.filter(card => selectedDifficulties.includes(card.difficulty));
    } else {
      // No difficulty filtering - use all cards
      filteredCards = cards;
    }
    
    setOriginalCards(filteredCards);
    setStudyCards(filteredCards);
    setCurrentCardIndex(0);
    setIsShuffleMode(false);
    setIsReversed(false);
    setCorrectCardIds(new Set());
    setMissedCardIds(new Set());
    setShowSummary(false);
    setIsReviewMode(false);
    setShowDifficultySelector(false);
    
    // Initialize timing for speed challenge
    const now = Date.now();
    setSessionStartTime(now);
    setCardStartTime(now);
    setCardTimes([]);
    
    setStudyStarted(true);
  };

  const handleNextCard = async () => {
    // Record time for the card we're leaving
    if (cardStartTime) {
      const timeSpent = (Date.now() - cardStartTime) / 1000; // Convert to seconds
      setCardTimes(prev => [...prev, timeSpent]);
    }
    
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      // Start timing for next card
      setCardStartTime(Date.now());
      setCurrentCardElapsed(0); // Reset display
    } else {
      // Reached the end - show summary
      setShowSummary(true);
      setCardStartTime(null); // Stop timing
      setCurrentCardElapsed(0);
      
      // Trophy unlock is handled in handleMarkCorrect to avoid race condition
      // with state updates
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  const handleSkipToStartCard = () => {
    setCurrentCardIndex(0);
  };

  const handleSkipToEndCard = () => {
    setCurrentCardIndex(studyCards.length - 1);
  };

  const handleMarkCorrect = () => {
    const currentCard = studyCards[currentCardIndex];
    const isLastCard = currentCardIndex === studyCards.length - 1;
    
    // Record time for current card before moving on
    let currentCardTime = null;
    if (cardStartTime) {
      currentCardTime = (Date.now() - cardStartTime) / 1000; // Convert to seconds
    }
    
    // Update both sets
    setCorrectCardIds(prev => {
      const newSet = new Set(prev);
      newSet.add(currentCard.id);
      return newSet;
    });
    
    setMissedCardIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentCard.id); // Remove from missed if it was there
      
      // If this is the last card and we have no misses, check for trophy
      // BUT ONLY if this is NOT a review session (first pass only)
      if (isLastCard && user && newSet.size === 0 && !isReviewMode) {
        // Use setTimeout to ensure state has updated and summary is showing
        setTimeout(async () => {
          try {
            console.log('🏆 Last card marked correct! Checking for flashcard trophy unlock...');
            console.log('🏆 Review mode:', isReviewMode, '(trophies only awarded on first pass)');
            
            // Calculate final timing stats (include current card time)
            const allCardTimes = currentCardTime ? [...cardTimes, currentCardTime] : cardTimes;
            const averageSecondsPerCard = allCardTimes.length > 0 
              ? allCardTimes.reduce((sum, time) => sum + time, 0) / allCardTimes.length 
              : null;
            
            console.log('🏆 Trophy check conditions:');
            console.log('  - User logged in:', !!user);
            console.log('  - Missed cards:', newSet.size);
            console.log('  - Total cards:', studyCards.length);
            console.log('  - Selected deck:', selectedDeck?.id);
            console.log('  - Is reversed:', isReversed);
            console.log('  - Is review mode:', isReviewMode);
            console.log('  - Average time per card:', averageSecondsPerCard ? `${averageSecondsPerCard.toFixed(2)}s` : 'N/A');
            
            // Record the completion in Firebase (with timing)
            await recordFlashcardCompletion(
              user.uid, 
              selectedDeck?.id, 
              isReversed,
              averageSecondsPerCard,
              studyCards.length
            );
            
            const newTrophies = await checkAndUnlockTrophies(user.uid, {
              type: 'flashcard_perfect',
              deckId: selectedDeck?.id
            });
            
            console.log('🏆 Trophy service returned:', newTrophies);
            
            if (newTrophies && newTrophies.length > 0) {
              setUnlockedTrophies(newTrophies);
              // Delay showing trophy reveal to allow summary to render first
              setTimeout(() => {
                setShowTrophyReveal(true);
              }, 500);
              console.log(`🎉 Unlocked ${newTrophies.length} flashcard trophy/trophies!`);
            } else {
              console.log('🏆 No new trophies unlocked (may already be unlocked)');
            }
          } catch (error) {
            console.error('Error checking flashcard trophies:', error);
          }
        }, 100);
      } else if (isLastCard && user && newSet.size === 0 && isReviewMode) {
        // Perfect score but in review mode - no trophy
        console.log('✅ Perfect score, but in review mode. Trophies only awarded on first pass through deck.');
      }
      
      return newSet;
    });
    
    handleNextCard();
  };

  const handleMarkMissed = () => {
    const currentCard = studyCards[currentCardIndex];
    setMissedCardIds(prev => {
      const newSet = new Set(prev);
      newSet.add(currentCard.id);
      return newSet;
    });
    setCorrectCardIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentCard.id); // Remove from correct if it was there
      return newSet;
    });
    setArchivedCardIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentCard.id); // Remove from archived if it was there
      return newSet;
    });
    handleNextCard();
  };

  const handleArchiveCard = async () => {
    const currentCard = studyCards[currentCardIndex];
    
    // Archive the question in Firebase
    if (currentCard.originalQuestionId) {
      try {
        await archiveMissedQuestion(currentCard.originalQuestionId);
        console.log('Archived question:', currentCard.originalQuestionId);
        
        // Mark as archived locally
        setArchivedCardIds(prev => {
          const newSet = new Set(prev);
          newSet.add(currentCard.id);
          return newSet;
        });
        
        // Also mark as correct (since they've mastered it)
        setCorrectCardIds(prev => {
          const newSet = new Set(prev);
          newSet.add(currentCard.id);
          return newSet;
        });
        
        // Remove from missed
        setMissedCardIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentCard.id);
          return newSet;
        });
        
        handleNextCard();
      } catch (error) {
        console.error('Error archiving question:', error);
        // Still proceed to next card even if archive fails
        handleNextCard();
      }
    } else {
      // Not a missed question, just mark as archived locally
      setArchivedCardIds(prev => {
        const newSet = new Set(prev);
        newSet.add(currentCard.id);
        return newSet;
      });
      handleNextCard();
    }
  };

  const handleReviewMissed = () => {
    const missedCards = originalCards.filter(card => missedCardIds.has(card.id));
    setStudyCards(missedCards);
    setCurrentCardIndex(0);
    setShowSummary(false);
    setIsReviewMode(true);
    setCorrectCardIds(new Set());
    setMissedCardIds(new Set());
    setArchivedCardIds(new Set());
  };

  const handleFinishSession = () => {
    setShowSummary(false);
    setStudyStarted(false);
    setIsReviewMode(false);
    setCorrectCardIds(new Set());
    setMissedCardIds(new Set());
    setArchivedCardIds(new Set());
  };
  
  const handleTrophyRevealContinue = () => {
    setShowTrophyReveal(false);
    setUnlockedTrophies([]);
  };

  const handleToggleShuffleMode = () => {
    if (isShuffleMode) {
      // Switch back to original order
      setStudyCards([...originalCards]);
      setIsShuffleMode(false);
    } else {
      // Shuffle the cards
      const shuffled = [...originalCards].sort(() => Math.random() - 0.5);
      setStudyCards(shuffled);
      setIsShuffleMode(true);
    }
    setCurrentCardIndex(0); // Reset to start
  };

  const handleShuffleDeck = () => {
    // Re-shuffle when already in shuffle mode
    const shuffled = [...originalCards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
    setCurrentCardIndex(0);
  };

  const handleToggleReverse = () => {
    setIsReversed(!isReversed);
  };

  const handleBackToDecks = () => {
    setStudyStarted(false);
    setShowDifficultySelector(false);
    setSelectedDeck(null);
    setStudyCards([]);
    setOriginalCards([]);
    setCurrentCardIndex(0);
    setIsShuffleMode(false);
    setIsReversed(false);
    setSelectedDeckCategory('all');
    
    // Reset timing
    setSessionStartTime(null);
    setCardStartTime(null);
    setCardTimes([]);
  };

  const handleBackToDeckSelection = () => {
    setShowDifficultySelector(false);
    setSelectedDeck(null);
    setSelectedDifficulties(['easy', 'medium', 'hard']);
  };

  const handleBackToModeSelection = () => {
    setPracticeMode(null);
    setPracticeStarted(false);
    setStudyStarted(false);
    setShowDifficultySelector(false);
    setSelectedTopCategory('');
    setSelectedSubCategory('all');
    setSelectedDeck(null);
    setSelectedDeckCategory('all');
    setSelectedDifficulties(['easy', 'medium', 'hard']);
  };

  const handleBackToSelection = () => {
    setPracticeStarted(false);
    setSelectedTopCategory('');
    setSelectedSubCategory('all');
  };

  const handleCategoryOverride = async () => {
    // Reload questions to pick up the new override
    setIsLoading(true);
    
    try {
      const combined = questionSetSeason38Part1.concat(
        questionSetSeason38Part2,
        questionSetSeason39Part1,
        questionSetSeason39Part2,
        questionSetSeason40Part1,
        questionSetSeason40Part2,
        questionSetSeason41Part1,
        questionSetSeason41Part2
      );
      
      const [overrides, excludedIds] = await Promise.all([
        getAllCategoryOverrides(user?.uid),
        getAllExcludedQuestionIds(user?.uid)
      ]);
      
      const overrideMap = {};
      overrides.forEach(override => {
        overrideMap[override.clueId] = override.newTopLevelCategory;
      });
      
      const excludedSet = new Set(excludedIds);
      
      const questionsWithOverrides = combined
        .filter(q => !excludedSet.has(q.id) && !q.isEmpty) // Filter out excluded and empty
        .map(q => {
          if (overrideMap[q.id]) {
            return {
              ...q,
              topLevelCategory: overrideMap[q.id],
              originalTopLevelCategory: q.topLevelCategory,
              hasOverride: true
            };
          }
          return q;
        });
      
      setAllQuestions(questionsWithOverrides);
      
      // Update the current practice session questions
      if (practiceStarted && selectedTopCategory) {
        let filtered = questionsWithOverrides.filter(q => q.topLevelCategory === selectedTopCategory);
        if (selectedSubCategory !== 'all') {
          filtered = filtered.filter(q => q.category === selectedSubCategory);
        }
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        setCategoryQuestions(shuffled);
      }
      
      const uniqueTopCategories = [...new Set(questionsWithOverrides.map(q => q.topLevelCategory))].sort();
      setTopLevelCategories(uniqueTopCategories);
      
      console.log('Questions reloaded with new overrides/exclusions');
    } catch (error) {
      console.error('Error reloading questions:', error);
    }
    
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <>
        <BackgroundContainer />
        <Container maxWidth="md" sx={{ mt: 8 }}>
          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <CircularProgress sx={{ color: '#f5f5f5' }} />
            </Box>
          </StyledPaper>
        </Container>
      </>
    );
  }

  return (
    <>
      <BackgroundContainer />
      <HomeButton
        variant="contained"
        startIcon={<HomeIcon />}
        onClick={onReturnToStart}
      >
        Home
      </HomeButton>

      <Container maxWidth="lg" sx={{ mt: { xs: 4, sm: 6, md: 8 }, mb: 4, px: { xs: 2, sm: 3 } }}>
        <StyledPaper>
          {!practiceMode ? (
            // Mode Selection Screen
            <Box>
              <Typography variant="h3" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
                Practice Mode
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 4, textAlign: 'center' }}>
                Choose your practice type:
              </Typography>

              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} sm={6} md={5}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      backgroundColor: '#f5f5f5',
                      border: '3px solid #0f258f',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                      }
                    }}
                  >
                    <CardActionArea 
                      onClick={() => setPracticeMode('jeopardy')}
                      sx={{ height: '100%', p: 3 }}
                    >
                      <CardContent sx={{ textAlign: 'center' }}>
                        <QuizIcon sx={{ fontSize: 80, color: '#0f258f', mb: 2 }} />
                        <Typography variant="h4" sx={{ color: '#0f258f', fontWeight: 'bold', mb: 2 }}>
                          Jeopardy! Practice
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#666' }}>
                          Practice real Jeopardy! questions organized by category. 
                          Track your performance and review missed questions.
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={5}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      backgroundColor: '#f5f5f5',
                      border: '3px solid #0f258f',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                      }
                    }}
                  >
                    <CardActionArea 
                      onClick={() => setPracticeMode('study')}
                      sx={{ height: '100%', p: 3 }}
                    >
                      <CardContent sx={{ textAlign: 'center' }}>
                        <SchoolIcon sx={{ fontSize: 80, color: '#0f258f', mb: 2 }} />
                        <Typography variant="h4" sx={{ color: '#0f258f', fontWeight: 'bold', mb: 2 }}>
                          Study Flashcards
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#666' }}>
                          Learn facts for rote memorization. Study capitals, 
                          presidents, elements, and more!
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          ) : practiceMode === 'jeopardy' && !practiceStarted ? (
            // Jeopardy Category Selection Screen
            <Box>
              <Typography variant="h3" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
                Practice Mode
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
                Select a category to practice:
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel 
                  id="top-category-select-label"
                  sx={{ 
                    color: '#f5f5f5',
                    '&.Mui-focused': { color: '#f5f5f5' }
                  }}
                >
                  Main Category
                </InputLabel>
                <Select
                  labelId="top-category-select-label"
                  id="top-category-select"
                  value={selectedTopCategory}
                  label="Main Category"
                  onChange={handleTopCategorySelect}
                  sx={{
                    color: '#f5f5f5',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '.MuiOutlinedInput-notchedOutline': { borderColor: '#f5f5f5' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f5f5f5' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f5f5f5' },
                    '.MuiSvgIcon-root': { color: '#f5f5f5' }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 400,
                        backgroundColor: '#f5f5f5',
                      }
                    },
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <em>Select a main category</em>
                  </MenuItem>
                  {topLevelCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedTopCategory && (
                <FormControl fullWidth sx={{ mb: 4 }}>
                  <InputLabel 
                    id="sub-category-select-label"
                    sx={{ 
                      color: '#f5f5f5',
                      '&.Mui-focused': { color: '#f5f5f5' }
                    }}
                  >
                    Specific Topic (Optional)
                  </InputLabel>
                  <Select
                    labelId="sub-category-select-label"
                    id="sub-category-select"
                    value={selectedSubCategory}
                    label="Specific Topic (Optional)"
                    onChange={handleSubCategorySelect}
                    sx={{
                      color: '#f5f5f5',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: '#f5f5f5' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f5f5f5' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f5f5f5' },
                      '.MuiSvgIcon-root': { color: '#f5f5f5' }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 400,
                          backgroundColor: '#f5f5f5',
                        }
                      },
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left',
                      },
                    }}
                  >
                    <MenuItem value="all">
                      <strong>All {selectedTopCategory} Questions</strong>
                    </MenuItem>
                    {subCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Box sx={{ textAlign: 'center', display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={handleBackToModeSelection}
                  sx={{
                    color: '#f5f5f5',
                    borderColor: '#f5f5f5',
                    fontSize: '1rem',
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#f5f5f5',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  ← Back
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  disabled={!selectedTopCategory}
                  onClick={handleStartPractice}
                  sx={{
                    backgroundColor: '#f5f5f5',
                    color: '#0f258f',
                    fontSize: '1.2rem',
                    px: 6,
                    py: 2,
                    '&:hover': {
                      backgroundColor: '#e0e0e0',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'rgba(255, 255, 255, 0.5)',
                    }
                  }}
                >
                  Start Practice
                </Button>
              </Box>
            </Box>
          ) : practiceMode === 'jeopardy' && practiceStarted ? (
            // Jeopardy Flashcard Display
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleBackToSelection}
                  sx={{
                    color: '#f5f5f5',
                    borderColor: '#f5f5f5',
                    '&:hover': {
                      borderColor: '#f5f5f5',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  ← Back to Categories
                </Button>

                <Typography variant="h6">
                  Question {currentQuestionIndex + 1} of {categoryQuestions.length}
                </Typography>

                <Typography variant="h6">
                  ✓ {stats.correct} | ✗ {stats.incorrect}
                </Typography>
              </Box>

              <PracticeFlashcard
                clue={categoryQuestions[currentQuestionIndex]}
                onAnswer={handleAnswer}
                onNext={handleNextQuestion}
                onPrevious={handlePreviousQuestion}
                onSkipToStart={handleSkipToStartQuestion}
                onSkipToEnd={handleSkipToEndQuestion}
                currentIndex={currentQuestionIndex}
                totalQuestions={categoryQuestions.length}
                availableCategories={topLevelCategories}
                onCategoryOverride={handleCategoryOverride}
              />
            </Box>
          ) : practiceMode === 'study' && !studyStarted && !showDifficultySelector ? (
            // Study Deck Selection Screen
            <Box>
              <Typography variant="h3" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
                Study Flashcards
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
                Select a flashcard deck to study:
              </Typography>

              {/* Category Filter */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                <Chip
                  label={`All Categories (${allFlashcardDecks.length + (missedQuestionsDeck ? 1 : 0)})`}
                  onClick={() => setSelectedDeckCategory('all')}
                  sx={{
                    backgroundColor: selectedDeckCategory === 'all' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.1)',
                    color: selectedDeckCategory === 'all' ? '#0f258f' : '#f5f5f5',
                    fontWeight: selectedDeckCategory === 'all' ? 'bold' : 'normal',
                    border: '1px solid',
                    borderColor: selectedDeckCategory === 'all' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: selectedDeckCategory === 'all' ? '#e0e0e0' : 'rgba(255, 255, 255, 0.2)',
                    }
                  }}
                />
                {missedQuestionsDeck && (
                  <Chip
                    label="Review (1)"
                    onClick={() => setSelectedDeckCategory('Review')}
                    sx={{
                      backgroundColor: selectedDeckCategory === 'Review' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.1)',
                      color: selectedDeckCategory === 'Review' ? '#0f258f' : '#f5f5f5',
                      fontWeight: selectedDeckCategory === 'Review' ? 'bold' : 'normal',
                      border: '1px solid',
                      borderColor: selectedDeckCategory === 'Review' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.3)',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: selectedDeckCategory === 'Review' ? '#e0e0e0' : 'rgba(255, 255, 255, 0.2)',
                      }
                    }}
                  />
                )}
                {[...new Set(allFlashcardDecks.map(d => d.category))].sort().map((category) => {
                  const count = allFlashcardDecks.filter(d => d.category === category).length;
                  return (
                    <Chip
                      key={category}
                      label={`${category} (${count})`}
                      onClick={() => setSelectedDeckCategory(category)}
                      sx={{
                        backgroundColor: selectedDeckCategory === category ? '#f5f5f5' : 'rgba(255, 255, 255, 0.1)',
                        color: selectedDeckCategory === category ? '#0f258f' : '#f5f5f5',
                        fontWeight: selectedDeckCategory === category ? 'bold' : 'normal',
                        border: '1px solid',
                        borderColor: selectedDeckCategory === category ? '#f5f5f5' : 'rgba(255, 255, 255, 0.3)',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: selectedDeckCategory === category ? '#e0e0e0' : 'rgba(255, 255, 255, 0.2)',
                        }
                      }}
                    />
                  );
                })}
              </Box>

              <Grid container spacing={3}>
                {/* Missed Questions Deck (if available) */}
                {(selectedDeckCategory === 'all' || selectedDeckCategory === 'Review') && missedQuestionsDeck && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        backgroundColor: '#fff3e0',
                        border: '3px solid #f44336',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                        }
                      }}
                    >
                      <CardActionArea 
                        onClick={() => handleSelectDeck(missedQuestionsDeck)}
                        sx={{ height: '100%', p: 2 }}
                      >
                        <CardContent>
                          <Typography variant="h5" sx={{ color: '#f44336', fontWeight: 'bold', mb: 1 }}>
                            {missedQuestionsDeck.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                            {missedQuestionsDeck.description}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip 
                              label={missedQuestionsDeck.category} 
                              size="small"
                              sx={{ backgroundColor: '#f44336', color: '#fff' }}
                            />
                            <Typography variant="caption" sx={{ color: '#999' }}>
                              {missedQuestionsDeck.cards.length} cards
                            </Typography>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                )}

                {/* Regular flashcard decks */}
                {allFlashcardDecks
                  .filter(deck => selectedDeckCategory === 'all' || deck.category === selectedDeckCategory)
                  .map((deck) => {
                    // Get all trophies for this deck (bronze, silver, gold)
                    const bronzeTrophyId = `flashcard-perfect-${deck.id}`;
                    const silverTrophyId = `flashcard-perfect-both-${deck.id}`;
                    const goldTrophyId = `flashcard-speed-${deck.id}`;
                    
                    // Check which trophies are unlocked
                    const bronzeUnlocked = userTrophyCase?.trophies?.find(t => t.trophyId === bronzeTrophyId)?.isUnlocked;
                    const silverUnlocked = userTrophyCase?.trophies?.find(t => t.trophyId === silverTrophyId)?.isUnlocked;
                    const goldUnlocked = userTrophyCase?.trophies?.find(t => t.trophyId === goldTrophyId)?.isUnlocked;
                    
                    // Determine highest trophy to display (Gold > Silver > Bronze)
                    let displayTrophy = null;
                    let displayTrophyUnlocked = false;
                    
                    if (goldUnlocked) {
                      displayTrophy = getTrophyById(goldTrophyId);
                      displayTrophyUnlocked = true;
                    } else if (silverUnlocked) {
                      displayTrophy = getTrophyById(silverTrophyId);
                      displayTrophyUnlocked = true;
                    } else if (bronzeUnlocked) {
                      displayTrophy = getTrophyById(bronzeTrophyId);
                      displayTrophyUnlocked = true;
                    }
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={deck.id}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            backgroundColor: '#f5f5f5',
                            border: '2px solid #0f258f',
                            transition: 'transform 0.2s',
                            position: 'relative',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                            }
                          }}
                        >
                          {/* Trophy thumbnail in top right */}
                          {displayTrophyUnlocked && displayTrophy && (
                            <Tooltip title={displayTrophy.name} arrow>
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  width: 40,
                                  height: 40,
                                  backgroundColor: displayTrophy.tier === 'bronze' ? '#cd7f32' :
                                                   displayTrophy.tier === 'silver' ? '#c0c0c0' :
                                                   displayTrophy.tier === 'gold' ? '#ffd700' :
                                                   displayTrophy.tier === 'platinum' ? '#e5e4e2' :
                                                   '#ff6b35',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '1.5rem',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                  border: '2px solid #fff',
                                  zIndex: 10,
                                  cursor: 'help'
                                }}
                              >
                                {displayTrophy.icon}
                              </Box>
                            </Tooltip>
                          )}
                          
                          <CardActionArea 
                            onClick={() => handleSelectDeck(deck)}
                            sx={{ height: '100%', p: 2 }}
                          >
                            <CardContent>
                              <Typography variant="h5" sx={{ color: '#0f258f', fontWeight: 'bold', mb: 1 }}>
                                {deck.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                                {deck.description}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Chip 
                                  label={deck.category} 
                                  size="small"
                                  sx={{ backgroundColor: '#0f258f', color: '#fff' }}
                                />
                                <Typography variant="caption" sx={{ color: '#999' }}>
                                  {deck.cards.length} cards
                                </Typography>
                              </Box>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    );
                  })}
              </Grid>

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleBackToModeSelection}
                  sx={{
                    color: '#f5f5f5',
                    borderColor: '#f5f5f5',
                    '&:hover': {
                      borderColor: '#f5f5f5',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  ← Back to Mode Selection
                </Button>
              </Box>
            </Box>
          ) : practiceMode === 'study' && showDifficultySelector ? (
            // Difficulty Selection Screen (after deck selected)
            <Box>
              <Typography variant="h3" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
                {selectedDeck?.name}
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 4, textAlign: 'center' }}>
                Select difficulty levels (choose 1, 2, or all 3):
              </Typography>

              <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
                {[
                  { 
                    value: 'easy', 
                    label: 'Easy', 
                    description: 'Most well-known facts',
                    color: '#4caf50',
                    count: selectedDeck?.cards.filter(c => c.difficulty === 'easy').length || 0
                  },
                  { 
                    value: 'medium', 
                    label: 'Medium', 
                    description: 'Moderate challenge',
                    color: '#ff9800',
                    count: selectedDeck?.cards.filter(c => c.difficulty === 'medium').length || 0
                  },
                  { 
                    value: 'hard', 
                    label: 'Hard', 
                    description: 'Deep knowledge required',
                    color: '#f44336',
                    count: selectedDeck?.cards.filter(c => c.difficulty === 'hard').length || 0
                  }
                ].map((option) => (
                  <Grid item xs={12} sm={4} md={3} key={option.value}>
                    <Box
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (option.count > 0) {
                          setSelectedDifficulties(prev => {
                            if (prev.includes(option.value)) {
                              // Remove if already selected (but keep at least one selected)
                              const newSelection = prev.filter(d => d !== option.value);
                              return newSelection.length > 0 ? newSelection : prev;
                            } else {
                              // Add to selection
                              return [...prev, option.value];
                            }
                          });
                        }
                      }}
                      sx={{ 
                        height: '100%',
                        cursor: option.count > 0 ? 'pointer' : 'not-allowed',
                        '&:hover .difficulty-card': {
                          transform: option.count > 0 ? 'translateY(-5px)' : 'none',
                          boxShadow: option.count > 0 ? '0 6px 20px rgba(0, 0, 0, 0.3)' : 'none',
                        }
                      }}
                    >
                      <Card 
                        className="difficulty-card"
                        sx={{ 
                          height: '100%',
                          backgroundColor: selectedDifficulties.includes(option.value) ? option.color : '#f5f5f5',
                          border: `3px solid ${option.color}`,
                          transition: 'transform 0.2s, background-color 0.2s, box-shadow 0.2s',
                          opacity: option.count === 0 ? 0.5 : 1,
                        }}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 2 }}>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              color: selectedDifficulties.includes(option.value) ? '#fff' : option.color,
                              fontWeight: 'bold',
                              mb: 1
                            }}
                          >
                            {option.label}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: selectedDifficulties.includes(option.value) ? 'rgba(255, 255, 255, 0.9)' : '#666',
                              mb: 2
                            }}
                          >
                            {option.description}
                          </Typography>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: selectedDifficulties.includes(option.value) ? '#fff' : '#999',
                              fontWeight: 'bold'
                            }}
                          >
                            {option.count} cards
                          </Typography>
                          {selectedDifficulties.includes(option.value) && (
                            <Box sx={{ mt: 2 }}>
                              <CheckBoxIcon sx={{ color: '#fff', fontSize: 32 }} />
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="body1" sx={{ color: '#f5f5f5' }}>
                  {selectedDifficulties.length === 3 && 'All difficulties selected'}
                  {selectedDifficulties.length === 2 && `${selectedDifficulties.join(' + ')} selected`}
                  {selectedDifficulties.length === 1 && `${selectedDifficulties[0]} only`}
                  {' • '}
                  {selectedDeck?.cards.filter(c => selectedDifficulties.includes(c.difficulty)).length || 0} total cards
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center', display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={handleBackToDeckSelection}
                  sx={{
                    color: '#f5f5f5',
                    borderColor: '#f5f5f5',
                    fontSize: '1rem',
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#f5f5f5',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  ← Back to Decks
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleStartStudy}
                  disabled={
                    selectedDifficulties.length === 0 ||
                    (selectedDeck?.cards.filter(c => selectedDifficulties.includes(c.difficulty)).length || 0) === 0
                  }
                  sx={{
                    backgroundColor: '#f5f5f5',
                    color: '#0f258f',
                    fontSize: '1.2rem',
                    px: 6,
                    py: 2,
                    '&:hover': {
                      backgroundColor: '#e0e0e0',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'rgba(255, 255, 255, 0.5)',
                    }
                  }}
                >
                  Start Studying
                </Button>
              </Box>
            </Box>
          ) : practiceMode === 'study' && studyStarted ? (
            // Study Flashcard Display
            <Box>
              {/* Fixed Timer Display - Top Right Corner */}
              {!showSummary && sessionStartTime && (
                <Box sx={{
                  position: 'fixed',
                  top: 80,
                  right: 20,
                  zIndex: 1000,
                  backgroundColor: 'rgba(15, 37, 143, 0.95)',
                  border: '2px solid rgba(255, 215, 0, 0.8)',
                  borderRadius: 2,
                  p: 2,
                  minWidth: 200,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  <Typography variant="caption" sx={{ color: '#ffd700', display: 'block', textAlign: 'center', mb: 0.5, fontWeight: 'bold' }}>
                    ⏱️ SPEED CHALLENGE
                  </Typography>
                  
                  {/* Total Elapsed Time */}
                  <Box sx={{ mb: 1, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#ccc', display: 'block', fontSize: '0.7rem' }}>
                      Current Time
                    </Typography>
                    <Typography variant="h5" sx={{
                      color: (() => {
                        const totalElapsed = cardTimes.reduce((sum, t) => sum + t, 0) + currentCardElapsed;
                        const targetTotal = studyCards.length * 2.5;
                        if (totalElapsed <= targetTotal) return '#4caf50';
                        if (totalElapsed <= targetTotal * 1.5) return '#ff9800';
                        return '#f44336';
                      })(),
                      fontWeight: 'bold',
                      fontFamily: 'monospace'
                    }}>
                      {(() => {
                        const totalElapsed = cardTimes.reduce((sum, t) => sum + t, 0) + currentCardElapsed;
                        return `${totalElapsed.toFixed(1)}s`;
                      })()}
                    </Typography>
                  </Box>

                  {/* Target Total Time */}
                  <Box sx={{ mb: 1, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#ccc', display: 'block', fontSize: '0.7rem' }}>
                      Target Time
                    </Typography>
                    <Typography variant="body1" sx={{
                      color: '#f5f5f5',
                      fontWeight: 'bold',
                      fontFamily: 'monospace'
                    }}>
                      {(studyCards.length * 2.5).toFixed(1)}s
                    </Typography>
                  </Box>

                  {/* Status */}
                  <Box sx={{ 
                    textAlign: 'center', 
                    borderTop: '1px solid rgba(255, 215, 0, 0.3)',
                    pt: 1
                  }}>
                    <Typography variant="caption" sx={{ color: '#ffd700', display: 'block', fontSize: '0.7rem' }}>
                      🥇 Goal: 2.50s per card
                    </Typography>
                    <Typography variant="caption" sx={{
                      color: (() => {
                        const totalElapsed = cardTimes.reduce((sum, t) => sum + t, 0) + currentCardElapsed;
                        const targetTotal = studyCards.length * 2.5;
                        const diff = targetTotal - totalElapsed;
                        if (diff >= 0) return '#4caf50';
                        if (diff >= -5) return '#ff9800';
                        return '#f44336';
                      })(),
                      display: 'block',
                      fontWeight: 'bold',
                      mt: 0.5
                    }}>
                      {(() => {
                        const totalElapsed = cardTimes.reduce((sum, t) => sum + t, 0) + currentCardElapsed;
                        const targetTotal = studyCards.length * 2.5;
                        const diff = targetTotal - totalElapsed;
                        if (diff >= 0) {
                          return `✓ ${diff.toFixed(1)}s ahead`;
                        } else {
                          return `⚠ ${Math.abs(diff).toFixed(1)}s behind`;
                        }
                      })()}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleBackToDecks}
                  sx={{
                    color: '#f5f5f5',
                    borderColor: '#f5f5f5',
                    '&:hover': {
                      borderColor: '#f5f5f5',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  ← Back to Decks
                </Button>

                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {selectedDeck?.name} {isReviewMode && '(Review Mode)'}
                  </Typography>
                  {!showSummary && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
                      <Chip 
                        icon={<CheckCircleIcon />}
                        label={correctCardIds.size}
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(76, 175, 80, 0.2)',
                          color: '#4caf50',
                          fontWeight: 'bold'
                        }}
                      />
                      <Chip 
                        icon={<CancelIcon />}
                        label={missedCardIds.size}
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(244, 67, 54, 0.2)',
                          color: '#f44336',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                    <ToggleButtonGroup
                      value={isShuffleMode ? 'shuffle' : 'original'}
                      exclusive
                      onChange={handleToggleShuffleMode}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiToggleButton-root': {
                          color: '#f5f5f5',
                          borderColor: '#f5f5f5',
                          '&.Mui-selected': {
                            backgroundColor: '#f5f5f5',
                            color: '#0f258f',
                            '&:hover': {
                              backgroundColor: '#e0e0e0',
                            }
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }
                        }
                      }}
                    >
                      <ToggleButton value="original">
                        <FormatListNumberedIcon sx={{ mr: 0.5, fontSize: '1.2rem' }} />
                        Original Order
                      </ToggleButton>
                      <ToggleButton value="shuffle">
                        <ShuffleIcon sx={{ mr: 0.5, fontSize: '1.2rem' }} />
                        Shuffle Mode
                      </ToggleButton>
                    </ToggleButtonGroup>
                    
                    <Button
                      variant={isReversed ? "contained" : "outlined"}
                      size="small"
                      startIcon={<SwapHorizIcon />}
                      onClick={handleToggleReverse}
                      sx={{
                        color: isReversed ? '#0f258f' : '#f5f5f5',
                        borderColor: '#f5f5f5',
                        backgroundColor: isReversed ? '#f5f5f5' : 'transparent',
                        '&:hover': {
                          borderColor: '#f5f5f5',
                          backgroundColor: isReversed ? '#e0e0e0' : 'rgba(255, 255, 255, 0.1)',
                        }
                      }}
                    >
                      {isReversed ? 'Answer → Question' : 'Question → Answer'}
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ width: { xs: 0, sm: 120 } }} /> {/* Spacer for alignment on desktop */}
              </Box>

              {!showSummary ? (
                <StudyFlashcard
                  card={studyCards[currentCardIndex]}
                  currentIndex={currentCardIndex}
                  totalCards={studyCards.length}
                  onNext={handleNextCard}
                  onPrevious={handlePreviousCard}
                  onSkipToStart={handleSkipToStartCard}
                  onSkipToEnd={handleSkipToEndCard}
                  onShuffle={isShuffleMode ? handleShuffleDeck : null}
                  isShuffleMode={isShuffleMode}
                  isReversed={isReversed}
                  onMarkCorrect={handleMarkCorrect}
                  onMarkMissed={handleMarkMissed}
                  isMarkedCorrect={correctCardIds.has(studyCards[currentCardIndex]?.id)}
                  isMarkedMissed={missedCardIds.has(studyCards[currentCardIndex]?.id)}
                  allowArchive={selectedDeck?.allowArchive || false}
                  onArchive={handleArchiveCard}
                  isArchived={archivedCardIds.has(studyCards[currentCardIndex]?.id)}
                />
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50', mb: 3 }} />
                  <Typography variant="h3" sx={{ mb: 3, color: '#f5f5f5' }}>
                    Session Complete!
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: 4, 
                    mb: 4,
                    flexWrap: 'wrap'
                  }}>
                    <Box sx={{ 
                      backgroundColor: 'rgba(76, 175, 80, 0.2)', 
                      borderRadius: 2, 
                      p: 3,
                      minWidth: 150
                    }}>
                      <CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                      <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                        {correctCardIds.size}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#f5f5f5' }}>
                        Correct
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      backgroundColor: 'rgba(244, 67, 54, 0.2)', 
                      borderRadius: 2, 
                      p: 3,
                      minWidth: 150
                    }}>
                      <CancelIcon sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
                      <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                        {missedCardIds.size}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#f5f5f5' }}>
                        Missed
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                      borderRadius: 2, 
                      p: 3,
                      minWidth: 150
                    }}>
                      <Typography variant="h4" sx={{ color: '#f5f5f5', mb: 1 }}>
                        ⏱️
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#f5f5f5', fontWeight: 'bold', fontFamily: 'monospace' }}>
                        {(() => {
                          if (cardTimes.length === 0) return '--';
                          const avg = cardTimes.reduce((sum, t) => sum + t, 0) / cardTimes.length;
                          return `${avg.toFixed(2)}s`;
                        })()}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#f5f5f5' }}>
                        Avg Time/Card
                      </Typography>
                      {cardTimes.length > 0 && (
                        <Typography variant="caption" sx={{ 
                          color: (() => {
                            const avg = cardTimes.reduce((sum, t) => sum + t, 0) / cardTimes.length;
                            return avg <= 2.0 ? '#4caf50' : '#ff9800';
                          })(),
                          display: 'block',
                          mt: 1,
                          fontWeight: 'bold'
                        }}>
                          {(() => {
                            const avg = cardTimes.reduce((sum, t) => sum + t, 0) / cardTimes.length;
                            return avg <= 2.0 ? '⚡ Gold Trophy Pace!' : `(Gold: ≤2.00s)`;
                          })()}
                        </Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                      borderRadius: 2, 
                      p: 3,
                      minWidth: 150
                    }}>
                      <Typography variant="h4" sx={{ color: '#f5f5f5', fontWeight: 'bold' }}>
                        {studyCards.length - correctCardIds.size - missedCardIds.size}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#f5f5f5' }}>
                        Unmarked
                      </Typography>
                    </Box>
                  </Box>

                  {/* Difficulty Breakdown */}
                  {(correctCardIds.size > 0 || missedCardIds.size > 0) && originalCards.some(card => card.difficulty) && (
                    <Box sx={{ mb: 4, mt: 4 }}>
                      <Typography variant="h5" sx={{ color: '#f5f5f5', mb: 3, fontWeight: 'bold' }}>
                        Breakdown by Difficulty
                      </Typography>
                      <Grid container spacing={2} justifyContent="center">
                        {['easy', 'medium', 'hard'].map((difficulty) => {
                          const difficultyColor = 
                            difficulty === 'easy' ? '#4caf50' : 
                            difficulty === 'medium' ? '#ff9800' : 
                            '#f44336';
                          
                          const correctCount = originalCards.filter(card => 
                            card.difficulty === difficulty && correctCardIds.has(card.id)
                          ).length;
                          
                          const missedCount = originalCards.filter(card => 
                            card.difficulty === difficulty && missedCardIds.has(card.id)
                          ).length;
                          
                          const totalDifficulty = originalCards.filter(card => 
                            card.difficulty === difficulty
                          ).length;
                          
                          // Only show if this difficulty was included in the session
                          if (totalDifficulty === 0) return null;
                          
                          return (
                            <Grid item xs={12} sm={4} md={3} key={difficulty}>
                              <Box sx={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: `2px solid ${difficultyColor}`,
                                borderRadius: 2,
                                p: 2
                              }}>
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    color: difficultyColor, 
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    mb: 2
                                  }}
                                >
                                  {difficulty}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 1 }}>
                                  <Box>
                                    <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                      {correctCount}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#f5f5f5' }}>
                                      Correct
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="h5" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                                      {missedCount}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#f5f5f5' }}>
                                      Missed
                                    </Typography>
                                  </Box>
                                </Box>
                                <Typography variant="caption" sx={{ color: '#999' }}>
                                  {correctCount + missedCount} of {totalDifficulty} marked
                                </Typography>
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  )}

                  {missedCardIds.size > 0 && (
                    <>
                      <Typography variant="h6" sx={{ color: '#f5f5f5', mb: 2 }}>
                        Review your missed cards?
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<CancelIcon />}
                          onClick={handleReviewMissed}
                          sx={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            fontSize: '1.1rem',
                            px: 4,
                            py: 1.5,
                            '&:hover': {
                              backgroundColor: '#d32f2f',
                            }
                          }}
                        >
                          Review {missedCardIds.size} Missed Card{missedCardIds.size > 1 ? 's' : ''}
                        </Button>
                        <Button
                          variant="outlined"
                          size="large"
                          onClick={handleFinishSession}
                          sx={{
                            color: '#f5f5f5',
                            borderColor: '#f5f5f5',
                            fontSize: '1.1rem',
                            px: 4,
                            py: 1.5,
                            '&:hover': {
                              borderColor: '#f5f5f5',
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            }
                          }}
                        >
                          Finish
                        </Button>
                      </Box>
                    </>
                  )}

                  {missedCardIds.size === 0 && (
                    <>
                      <Typography variant="h5" sx={{ color: '#4caf50', mb: 3 }}>
                        Perfect! You got them all! 🎉
                      </Typography>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleFinishSession}
                        sx={{
                          backgroundColor: '#f5f5f5',
                          color: '#0f258f',
                          fontSize: '1.1rem',
                          px: 4,
                          py: 1.5,
                          '&:hover': {
                            backgroundColor: '#e0e0e0',
                          }
                        }}
                      >
                        Back to Decks
                      </Button>
                    </>
                  )}
                </Box>
              )}
            </Box>
          ) : null}
        </StyledPaper>
      </Container>

      {/* Trophy Unlock Reveal */}
      {showTrophyReveal && unlockedTrophies.length > 0 && (
        <TrophyUnlockReveal
          trophies={unlockedTrophies}
          onContinue={handleTrophyRevealContinue}
        />
      )}
    </>
  );
}

export default Practice;

