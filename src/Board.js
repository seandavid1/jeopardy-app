import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Button,
  Typography,
  Box,
  Grid,
  styled,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { keyframes } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import Question from './Question';
import MissedQuestions from './components/MissedQuestions';
import ScoreDisplay from './components/ScoreDisplay';
import CategoryShowcase from './components/CategoryShowcase';
import { addMissedQuestion } from './services/missedQuestionsDB-firebase';
import { saveCPUMatchResult } from './services/cpuMatchHistoryDB';
import { saveGameResult } from './services/leaderboardService';
import { checkAndUnlockOpponents, getUserUnlockState } from './services/cpuUnlockSystem';
import { checkAndUnlockTrophies } from './services/trophyService';
import { useAuth } from './contexts/AuthContext';
import FinalJeopardy from './components/FinalJeopardy';
import GameRoundup from './components/GameRoundup';
import UnlockReveal from './components/UnlockReveal';
import TrophyUnlockReveal from './components/TrophyUnlockReveal';
import { selectNextClue, getAllCluesFlat } from './utils/cpuClueSelection';
import { loadRandomQuestionSets } from './utils/questionLoader';
import { 
  getCategory as getImprovedCategory, 
  getCategoryWithDiversity,
  validateCategoryDifficulty,
  getCategoryDistribution,
  generateBoardSimplified
} from './utils/boardGenerator';

const slideRight = keyframes`
  0% {
    transform: translateX(150%);
  }
  100% {
    transform: translateX(-150%);
  }
`;

const slideLeft = keyframes`
  0% {
    transform: translateX(-150%);
  }
  100% {
    transform: translateX(150%);
  }
`;

const BackgroundContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#000033',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='shadow' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23000055' stop-opacity='0.5'/%3E%3Cstop offset='100%25' stop-color='%23000033' stop-opacity='0.5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='0' y='0' width='100' height='100' fill='%23000033' rx='8' ry='8'/%3E%3Crect x='5' y='5' width='90' height='90' fill='url(%23shadow)' rx='6' ry='6'/%3E%3C/svg%3E")`,
  overflowY: 'hidden',
  backgroundSize: '100px 100px',
  zIndex: -2,
}));

const AnimatedRectangles = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
  overflow: 'visible',
  '& > div': {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
  },
  '& > div:nth-of-type(1)': {
    top: '10%',
    left: '0',
    width: '200px',
    height: '40px',
    animation: `${slideRight} 11.2s linear infinite`,
  },
  '& > div:nth-of-type(2)': {
    top: '30%',
    right: '0',
    width: '300px',
    height: '60px',
    animation: `${slideLeft} 20s linear infinite`,
  },
  '& > div:nth-of-type(3)': {
    top: '50%',
    left: '0',
    width: '150px',
    height: '30px',
    animation: `${slideRight} 8.4s linear infinite`,
  },
  '& > div:nth-of-type(4)': {
    top: '70%',
    right: '0',
    width: '250px',
    height: '50px',
    animation: `${slideLeft} 24s linear infinite`,
  },
  '& > div:nth-of-type(5)': {
    top: '90%',
    left: '0',
    width: '180px',
    height: '35px',
    animation: `${slideRight} 12.3s linear infinite`,
  },
  '& > div:nth-of-type(6)': {
    top: '20%',
    left: '40%',
    width: '220px',
    height: '45px',
    animation: `${slideRight} 14.4s linear infinite`,
  },
  '& > div:nth-of-type(7)': {
    top: '40%',
    right: '30%',
    width: '280px',
    height: '55px',
    animation: `${slideLeft} 12.3s linear infinite`,
  },
  '& > div:nth-of-type(8)': {
    top: '60%',
    left: '35%',
    width: '170px',
    height: '20px',
    animation: `${slideRight} 12.8s linear infinite`,
  },
  '& > div:nth-of-type(9)': {
    top: '80%',
    right: '25%',
    width: '240px',
    height: '48px',
    animation: `${slideLeft} 15.7s linear infinite`,
  }
}));

const BoardWrapper = styled(Box)(
  ({ theme }) => `
    .clear-icon {
      cursor: pointer;
    }
    .ssh-link {
      color: ${theme.palette.primary.main}
    }
    .recommended {
      font-size: 14px; 
      color: #666;
    }
    .username {
      width: 90%;
    }
    .MuiTypography-h6 {
      font-weight: 700;
    }
  `
);

const CategoryTitleWrapper = styled(Box)(
  () => `
      text-align: center;
      text-transform: uppercase;
      height: 100px;
      border: 3px solid black; 
      color: white;
      background-color: #0f258f; 
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      h6 {
        line-height: 1; 
        font-wieght: 900;
      }
  `
);

const ReturnButton = styled(Button)(({ theme }) => ({
  margin: '40px auto 20px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f5f5f5',
  color: '#0f258f',
  padding: '10px 32px',
  minWidth: '230px',
  height: '48px',
  whiteSpace: 'nowrap',
  '&:hover': {
    backgroundColor: '#e0e0e0',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.5rem',
    marginRight: theme.spacing(1.5),
  },
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(1.5),
    marginLeft: 0,
  },
}));

const SkipToFinalButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  bottom: '20px',
  right: '20px',
  backgroundColor: '#f5f5f5',
  color: '#0f258f',
  padding: '4px 16px',
  fontSize: '0.875rem',
  minWidth: 'auto',
  '&:hover': {
    backgroundColor: '#e0e0e0',
  },
}));

const PlayerScore = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  width: '200px', // Fixed width for both player sections
}));

const ScoreText = styled(Typography)(({ theme }) => ({
  color: 'white',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  textAlign: 'center',
  width: '100%',
}));

const PlayerName = styled(Typography)(({ theme }) => ({
  color: 'white',
  fontSize: '1.2rem',
  textAlign: 'center',
  width: '100%',
}));

function Board({
  playerOneName,
  playerTwoName,
  playerOneAvatar,
  playerTwoAvatar,
  gameOptions,
  onReturnToStart,
  onViewMissedQuestions,
  difficultyMode, // Add difficulty mode prop
}) {
  const { user } = useAuth();
  
  const [jeopardyRound, setJeopardyRound] = useState('Jeopardy');
  const [catOneClues, setCatOneClues] = useState([]);
  const [catTwoClues, setCatTwoClues] = useState([]);
  const [catThreeClues, setCatThreeClues] = useState([]);
  const [catFourClues, setCatFourClues] = useState([]);
  const [catFiveClues, setCatFiveClues] = useState([]);
  const [catSixClues, setCatSixClues] = useState([]);
  const [playerOneScore, setPlayerOneScore] = useState(0);
  const [playerTwoScore, setPlayerTwoScore] = useState(0);
  const [answered, setAnswered] = useState([]);
  const [hasControlOfBoard, setHasControlOfBoard] = useState(playerOneName);
  const [missedQuestions, setMissedQuestions] = useState([]);
  const [throatCleared, setThroatCleared] = useState(false);
  const [showMissedQuestions, setShowMissedQuestions] = useState(false);
  const [showFinalJeopardy, setShowFinalJeopardy] = useState(false);
  const [showBoard, setShowBoard] = useState(false);
  const [showScoreUpdate, setShowScoreUpdate] = useState(false);
  const [showRoundTransition, setShowRoundTransition] = useState(false); // New state for round transitions
  const [showCategoryShowcase, setShowCategoryShowcase] = useState(false);
  const [showcaseCategories, setShowcaseCategories] = useState([]);
  const [revealedValues, setRevealedValues] = useState([]); // Track which clue values are revealed
  const [showCategoryNames, setShowCategoryNames] = useState(true); // Control category name visibility
  const [isRevealingValues, setIsRevealingValues] = useState(false); // Track if value reveal animation is running
  const boardAudioRef = useRef(null); // Use ref to track board audio instance
  const isCreatingAudioRef = useRef(false); // Flag to prevent multiple simultaneous audio creations
  const [scoreUpdateValue, setScoreUpdateValue] = useState(0);
  const [scoreUpdatePlayer, setScoreUpdatePlayer] = useState(null);
  const [dailyDoubleCategories, setDailyDoubleCategories] = useState([]);
  
  // Unlock reveal state
  const [showUnlockReveal, setShowUnlockReveal] = useState(false);
  const [unlockedOpponentId, setUnlockedOpponentId] = useState(null);
  const preUnlockStateRef = useRef(null); // Store unlock state before Final Jeopardy
  
  // Trophy unlock reveal state
  const [showTrophyReveal, setShowTrophyReveal] = useState(false);
  const [unlockedTrophies, setUnlockedTrophies] = useState([]);
  const [dailyDoubleLocations, setDailyDoubleLocations] = useState([]);
  const [isQuestionOpen, setIsQuestionOpen] = useState(false); // Track if a question is currently open
  const usedCategoriesRef = useRef([]); // Track categories that have been used in the current round
  const usedTopLevelCategoriesRef = useRef([]); // Track top-level categories for diversity
  const [cpuSelectedClueId, setCpuSelectedClueId] = useState(null); // Track CPU's clue selection
  
  // Dynamic question loading
  const [loadedQuestions, setLoadedQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionsLoadError, setQuestionsLoadError] = useState(null);
  
  // Game statistics tracking
  const [playerResponseTimes, setPlayerResponseTimes] = useState([]); // Array of response times in seconds
  const [playerCategoryPerformance, setPlayerCategoryPerformance] = useState({}); // { category: { correct: n, incorrect: n } }
  const [showGameRoundup, setShowGameRoundup] = useState(false);

  // Tracking callbacks
  const trackPlayerResponseTime = useCallback((time) => {
    setPlayerResponseTimes(prev => [...prev, time]);
  }, []);

  const trackPlayerCategoryPerformance = useCallback((category, isCorrect) => {
    setPlayerCategoryPerformance(prev => {
      const newPerformance = { ...prev };
      if (!newPerformance[category]) {
        newPerformance[category] = { correct: 0, incorrect: 0 };
      }
      if (isCorrect) {
        newPerformance[category].correct++;
      } else {
        newPerformance[category].incorrect++;
      }
      return newPerformance;
    });
  }, []);

  // Cleanup board audio on unmount
  useEffect(() => {
    return () => {
      if (boardAudioRef.current) {
        boardAudioRef.current.pause();
        boardAudioRef.current.currentTime = 0;
        boardAudioRef.current.src = '';
        boardAudioRef.current.load();
        boardAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (playerOneName && playerTwoName && !showBoard && !isLoadingQuestions) {
      // console.log('Players set, starting game');
      startGame();
    }
  }, [playerOneName, playerTwoName]);

  // Check if all clues have been answered and transition to next round
  useEffect(() => {
    // Get total number of clues on the board (6 categories × 5 clues = 30)
    const allClues = [
      ...catOneClues,
      ...catTwoClues,
      ...catThreeClues,
      ...catFourClues,
      ...catFiveClues,
      ...catSixClues
    ];

    // Only check if we have clues loaded and board is showing
    if (allClues.length > 0 && showBoard && !showFinalJeopardy) {
      const totalClues = allClues.length;
      const answeredCount = answered.length;

      // console.log(`Round: ${jeopardyRound}, Answered: ${answeredCount}/${totalClues}`);

      // If all clues are answered
      if (answeredCount === totalClues && totalClues === 30) {
        if (jeopardyRound === 'Jeopardy') {
          // Transition to Double Jeopardy
          // console.log('All Jeopardy clues answered! Transitioning to Double Jeopardy...');
          setTimeout(() => {
            setShowBoard(false);
            setShowRoundTransition(true);
          }, 1000);
        } else if (jeopardyRound === 'Double Jeopardy') {
          // Transition to Final Jeopardy
          // console.log('All Double Jeopardy clues answered! Transitioning to Final Jeopardy...');
          setTimeout(() => {
            setShowBoard(false);
            setShowRoundTransition(true);
          }, 1000);
        }
      }
    }
  }, [answered, catOneClues, catTwoClues, catThreeClues, catFourClues, catFiveClues, catSixClues, jeopardyRound, showBoard, showFinalJeopardy]);

  // Validate daily doubles after board is loaded
  useEffect(() => {
    const allClues = [
      ...catOneClues,
      ...catTwoClues,
      ...catThreeClues,
      ...catFourClues,
      ...catFiveClues,
      ...catSixClues
    ];

    // Only validate when board is fully loaded
    if (allClues.length === 30 && showBoard) {
      validateDailyDoubles(jeopardyRound);
    }
  }, [catOneClues, catTwoClues, catThreeClues, catFourClues, catFiveClues, catSixClues, showBoard, jeopardyRound, dailyDoubleCategories, dailyDoubleLocations]);

  async function startGame() {
    // Load questions first
    const questions = await loadQuestionsForGame();
    if (!questions) {
      return; // Don't start game if questions failed to load
    }
    
    setShowBoard(true);
    setJeopardyRound('Jeopardy');
    setAnswered([]);
    setThroatCleared(false);
    setPlayerOneScore(0);
    setPlayerTwoScore(0);
    setHasControlOfBoard(playerOneName);
    startRound(questions, 'Jeopardy'); // Explicitly pass 'Jeopardy' round to avoid state timing issues
  }

  const goToDoubleJeopardy = () => {
    console.log('\n🔄 Transitioning to Double Jeopardy...');
    
    setThroatCleared(false);
    setJeopardyRound('Double Jeopardy');
    
    // Player with lowest score goes first in Double Jeopardy
    if (playerOneScore < playerTwoScore) {
      setHasControlOfBoard(playerOneName);
      console.log(`  ${playerOneName} has control (lower score)`);
    } else if (playerTwoScore < playerOneScore) {
      setHasControlOfBoard(playerTwoName);
      console.log(`  ${playerTwoName} has control (lower score)`);
    } else {
      console.log(`  Tied - current player maintains control`);
    }
    // If tied, keep current control
    
    // Explicitly pass 'Double Jeopardy' to avoid state timing issues
    startRound(loadedQuestions, 'Double Jeopardy');
  }

  const clueCountdown = useCallback(() => {
    // Implementation of clueCountdown
  }, []);

  const updateAnswered = useCallback((id) => {
    console.log('updateAnswered called with ID:', id);
    setAnswered(prevAnswered => {
      // Prevent duplicate IDs from being added
      if (prevAnswered.includes(id)) {
        console.warn('Attempted to add duplicate ID to answered array:', id);
        return prevAnswered;
      }
      const newAnswered = [...prevAnswered, id];
      console.log('Updated answered array:', newAnswered);
      return newAnswered;
    });
  }, []);

  const updateMissedQuestions = useCallback((clue, player) => {
    // Store the missed question in the database
    // console.log('Attempting to store missed question:', { clue, player });
    if (!clue || !player) {
      // console.error('Missing required parameters:', { clue, player });
      return;
    }
    
    // Validate clue object has required properties
    const requiredProps = ['category', 'clue', 'response', 'value', 'round'];
    const missingProps = requiredProps.filter(prop => !clue[prop]);
    if (missingProps.length > 0) {
      // console.error('Clue missing required properties:', missingProps);
      return;
    }

    // Update local state for GameRoundup display
    setMissedQuestions(prev => [...prev, {
      category: clue.category,
      clue: clue.clue,
      response: clue.response,
      value: clue.value,
      round: clue.round,
      player: player
    }]);

    // Store in database
    addMissedQuestion(clue, player)
      .then((newQuestion) => {
        // console.log('Successfully stored missed question:', newQuestion);
      })
      .catch(error => {
        // console.error('Error storing missed question:', error);
      });
  }, []);

  // Track response time (time from question end to buzzer press)
  const trackResponseTime = useCallback((timeInMs) => {
    setResponseTimes(prev => [...prev, timeInMs]);
  }, []);

  // Track category performance
  const trackCategoryPerformance = useCallback((category, wasCorrect) => {
    setCategoryPerformance(prev => {
      const current = prev[category] || { correct: 0, total: 0 };
      return {
        ...prev,
        [category]: {
          correct: current.correct + (wasCorrect ? 1 : 0),
          total: current.total + 1
        }
      };
    });
  }, []);

  const handleScoreUpdate = useCallback((player, value) => {
    setScoreUpdateValue(value);
    setScoreUpdatePlayer(player);
    setShowScoreUpdate(true);
    setTimeout(() => {
      setShowScoreUpdate(false);
      setScoreUpdateValue(0);
      setScoreUpdatePlayer(null);
    }, 2000);
  }, []);

  // CPU Automatic Clue Selection
  useEffect(() => {
    // Only auto-select if:
    // 1. In CPU mode
    // 2. CPU has control of the board
    // 3. No question is currently open
    // 4. Board is showing
    if (
      gameOptions?.mode === 'cpu' &&
      hasControlOfBoard === playerTwoName &&
      !isQuestionOpen &&
      showBoard &&
      !showFinalJeopardy &&
      !showRoundTransition
    ) {
      // Wait 2 seconds before CPU selects next clue
      const selectionTimeout = setTimeout(() => {
        const allClues = getAllCluesFlat({
          cat1: catOneClues,
          cat2: catTwoClues,
          cat3: catThreeClues,
          cat4: catFourClues,
          cat5: catFiveClues,
          cat6: catSixClues
        });

        const nextClue = selectNextClue(
          allClues,
          answered,
          gameOptions.cpuOpponent,
          jeopardyRound
        );

        if (nextClue) {
          // console.log(`CPU selecting clue: ${nextClue.category} for $${nextClue.value || 'unknown'}`);
          // Set the clue ID to trigger the Question component to open
          setCpuSelectedClueId(nextClue.id);
        }
      }, 2000); // 2 second delay

      return () => clearTimeout(selectionTimeout);
    }
  }, [
    gameOptions,
    hasControlOfBoard,
    playerTwoName,
    isQuestionOpen,
    showBoard,
    showFinalJeopardy,
    showRoundTransition,
    catOneClues,
    catTwoClues,
    catThreeClues,
    catFourClues,
    catFiveClues,
    catSixClues,
    answered,
    jeopardyRound
  ]);

  const updatePlayerOneScore = useCallback((value) => {
    setPlayerOneScore(prev => prev + value);
    handleScoreUpdate('playerOne', value);
  }, [handleScoreUpdate]);

  const updatePlayerTwoScore = useCallback((value) => {
    setPlayerTwoScore(prev => prev + value);
    handleScoreUpdate('playerTwo', value);
  }, [handleScoreUpdate]);

  function randomIntFromInterval(limit) {
    const num = Math.floor(Math.random() * (limit - 1 + 1) + 1);
    return num;
  }

  // Simplified board generation - generate all 6 categories at once
  const generateFullBoard = async function (questionsToUse, round) {
    if (!questionsToUse || questionsToUse.length === 0) {
      console.error('No questions loaded for board generation');
      return null;
    }
    
    try {
      console.log(`\n🎲 Generating ${round} board...`);
      
      // Use the new simplified board generation function
      const categories = await generateBoardSimplified(questionsToUse, round);
      
      if (!categories || categories.length !== 6) {
        console.error('Failed to generate complete board');
        return null;
      }
      
      // Set all categories at once
      setCatOneClues(categories[0] || []);
      setCatTwoClues(categories[1] || []);
      setCatThreeClues(categories[2] || []);
      setCatFourClues(categories[3] || []);
      setCatFiveClues(categories[4] || []);
      setCatSixClues(categories[5] || []);
      
      // DEBUG: Validate all clues have matching categories (hidden in production)
      if (process.env.NODE_ENV === 'development' && false) {
        categories.forEach((catClues, catIndex) => {
          const expectedCategory = catClues[0]?.category;
          const mismatchedClues = catClues.filter(clue => clue.category !== expectedCategory);
          if (mismatchedClues.length > 0) {
            console.error(`🚨 CATEGORY MISMATCH in column ${catIndex + 1}:`);
            console.error(`   Expected: "${expectedCategory}"`);
            mismatchedClues.forEach(clue => {
              console.error(`   Found: "${clue.category}" in clue ${clue.id}: "${clue.clue}"`);
            });
          }
        });
      }
      
      console.log('✅ Board generated successfully');
      return categories;
    } catch (error) {
      console.error('Error generating board:', error);
      return null;
    }
  }

  /**
   * Validate daily double placement after board is loaded
   */
  function validateDailyDoubles(round) {
    if (!dailyDoubleCategories || !dailyDoubleLocations) {
      console.error('❌ Daily double data not set!');
      return false;
    }
    
    const expectedCount = round === 'Jeopardy' ? 1 : 2;
    
    if (dailyDoubleCategories.length !== expectedCount) {
      console.error(`❌ Wrong number of daily double categories: ${dailyDoubleCategories.length}, expected ${expectedCount}`);
      return false;
    }
    
    if (dailyDoubleLocations.length !== expectedCount) {
      console.error(`❌ Wrong number of daily double locations: ${dailyDoubleLocations.length}, expected ${expectedCount}`);
      return false;
    }
    
    console.log(`✓ Daily doubles validated: ${expectedCount} daily double(s) set correctly`);
    return true;
  }

  /**
   * Generate daily doubles with improved logic
   * @param {string} round - 'Jeopardy' or 'Double Jeopardy'
   */
  function generateDailyDoubles(round = jeopardyRound) {
    console.log(`\n🎲 Generating Daily Doubles for ${round} round...`);
    
    if (round === 'Jeopardy') {
      // Generate ONE daily double for Jeopardy round
      // Placed in rows 2-5 (indices 1-4, representing $400-$1000)
      // Avoid row 1 (index 0, which is $200)
      const category = Math.floor(Math.random() * 6) + 1; // 1-6 (category index)
      const location = Math.floor(Math.random() * 4) + 2; // 2-5 (avoid $200 row)
      
      console.log(`  Daily Double #1: Category ${category}, Row ${location} ($${location * 200})`);
      
      setDailyDoubleCategories([category]);
      setDailyDoubleLocations([location]);
      
    } else if (round === 'Double Jeopardy') {
      // Generate TWO daily doubles for Double Jeopardy
      // Must be in DIFFERENT categories
      // Must NOT be in the $400 row (row index 1)
      // Should be in rows 2-5 (indices 1-4, representing $800-$2000)
      const categories = [];
      const locations = [];
      
      // Generate first daily double
      // Avoid row index 1 (the $400 spots in Double Jeopardy)
      const firstCategory = Math.floor(Math.random() * 6) + 1; // 1-6
      const firstLocation = Math.floor(Math.random() * 4) + 2; // 2-5 (skip row 1 which is $400)
      
      categories.push(firstCategory);
      locations.push(firstLocation);
      
      console.log(`  Daily Double #1: Category ${firstCategory}, Row ${firstLocation} ($${firstLocation * 400})`);
      
      // Generate second daily double in a DIFFERENT category
      // Also avoid row index 1 (the $400 spots)
      let secondCategory;
      let attempts = 0;
      do {
        secondCategory = Math.floor(Math.random() * 6) + 1;
        attempts++;
        if (attempts > 20) {
          console.error('  ❌ Could not find different category after 20 attempts');
          // This should never happen with 6 categories
          break;
        }
      } while (secondCategory === firstCategory);
      
      // Second location can be any row 2-5 (including same row as first)
      // Just avoid row 1 (the $400 spots)
      const secondLocation = Math.floor(Math.random() * 4) + 2; // 2-5 (skip row 1 which is $400)
      
      categories.push(secondCategory);
      locations.push(secondLocation);
      
      console.log(`  Daily Double #2: Category ${secondCategory}, Row ${secondLocation} ($${secondLocation * 400})`);
      
      // Validate the rules
      if (categories[0] === categories[1]) {
        console.error('  ❌ ERROR: Both Daily Doubles in same category!');
      }
      if (locations[0] === 1 || locations[1] === 1) {
        console.error('  ❌ ERROR: Daily Double in $400 row (row index 1)!');
      }
      
      setDailyDoubleCategories(categories);
      setDailyDoubleLocations(locations);
      
    } else {
      console.error(`Unknown round: ${round}`);
    }
    
    console.log(`✓ Daily Doubles generated for ${round}\n`);
  }

  function startRound(questionsToUse = loadedQuestions, round = jeopardyRound) {
    console.log(`\n🎮 Starting ${round} round...`);
    
    setAnswered([]); // Reset answered questions
    setThroatCleared(false); // Reset throat cleared state
    generateDailyDoubles(round); // Generate daily doubles for the specified round
    usedCategoriesRef.current = []; // Reset used categories for new round
    usedTopLevelCategoriesRef.current = []; // Reset top-level categories for diversity tracking
    
    // Reset reveal states
    setRevealedValues([]);
    setShowCategoryNames(false); // Hide category names initially
    setIsRevealingValues(false);
    setShowCategoryShowcase(false);
    isCreatingAudioRef.current = false; // Reset audio creation flag
    
    // Clear any existing audio reference and stop playback
    if (boardAudioRef.current) {
      boardAudioRef.current.pause();
      boardAudioRef.current.currentTime = 0;
      boardAudioRef.current.src = '';
      boardAudioRef.current.load();
      boardAudioRef.current = null;
    }
    
    // Preload the board audio NOW so it's ready when animation starts
    const preloadAudio = new Audio(`${process.env.PUBLIC_URL}/audio/jeopardy-board.mp3`);
    preloadAudio.volume = 0; // Start muted
    preloadAudio.preload = 'auto';
    preloadAudio.load(); // Force loading
    
    // Start playing immediately but muted - this initializes the audio pipeline
    preloadAudio.play().catch(error => {
      console.error('Preload audio play failed:', error);
    });
    
    boardAudioRef.current = preloadAudio;
    
    // Load all categories at once using the simplified approach
    const loadCategories = async () => {
      try {
        const categories = await generateFullBoard(questionsToUse, round);
        
        if (!categories) {
          console.error('Failed to generate board, retrying...');
          // Try one more time
          const retryCategories = await generateFullBoard(questionsToUse, round);
          if (!retryCategories) {
            console.error('Board generation failed after retry');
            setQuestionsLoadError('Failed to generate board. Please try again.');
            return;
          }
        }
        
        // Extract category names for showcase
        const categoryNames = categories.map(cat => cat[0]?.category).filter(Boolean);
        
        // Log board diversity statistics
        const distribution = getCategoryDistribution(categories);
        console.log('\n========================================');
        console.log(`${round} Board Generated!`);
        console.log('Top-Level Category Distribution:', distribution);
        console.log('Categories:', categoryNames);
        console.log('========================================\n');
        
        setShowcaseCategories(categoryNames);
        setShowBoard(true); // Show board immediately
        
        // Wait for board audio to be ready, then start animation
        const audio = boardAudioRef.current;
        if (audio) {
          // Check if audio is already loaded
          if (audio.readyState >= 3) { // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
            // Audio is ready, start animation immediately
            setTimeout(() => {
              startValueRevealAnimation();
            }, 500);
          } else {
            // Wait for audio to be ready
            const handleCanPlay = () => {
              audio.removeEventListener('canplaythrough', handleCanPlay);
              setTimeout(() => {
                startValueRevealAnimation();
              }, 500);
            };
            audio.addEventListener('canplaythrough', handleCanPlay);
            
            // Fallback timeout in case audio never loads
            setTimeout(() => {
              audio.removeEventListener('canplaythrough', handleCanPlay);
              startValueRevealAnimation();
            }, 2000);
          }
        } else {
          // No audio, just start animation
          setTimeout(() => {
            startValueRevealAnimation();
          }, 500);
        }
        
      } catch (error) {
        console.error('Error loading categories:', error);
        setQuestionsLoadError('Failed to load categories. Please try again.');
      }
    };

    loadCategories();
  }

  // Load questions when game starts
  async function loadQuestionsForGame() {
    setIsLoadingQuestions(true);
    setQuestionsLoadError(null);
    
    try {
      // console.log('Loading question sets for new game...');
      // Load 3 random question sets (adjust count as needed)
      const questions = await loadRandomQuestionSets(5, difficultyMode || 'regular');
      setLoadedQuestions(questions);
      console.log(`Successfully loaded ${questions.length} questions (${difficultyMode || 'regular'} mode)`);
      return questions; // Return questions for immediate use
    } catch (error) {
      console.error('Failed to load questions:', error);
      setQuestionsLoadError('Failed to load questions. Please try again.');
      return null;
    } finally {
      setIsLoadingQuestions(false);
    }
  }

  const startNewRound = () => {
    goToDoubleJeopardy();
    setShowRoundTransition(false);
    setShowBoard(true);
  }

  const handleFinalJeopardyComplete = async (finalScores) => {
    setPlayerOneScore(finalScores.playerOne);
    setPlayerTwoScore(finalScores.playerTwo);
    
    // Determine winner and save to leaderboard
    const playerOneWon = finalScores.playerOne > finalScores.playerTwo;
    
    // Only save to leaderboard if a human player won
    // In CPU mode: Player One is always human, Player Two is always CPU
    // In PvP mode: Both are human, so always save
    // In practice mode: Only Player One plays, so always save
    const shouldSaveToLeaderboard = 
      gameOptions?.mode === 'two-player' || // PvP - both human
      gameOptions?.mode === 'practice' || // Practice - human only
      (gameOptions?.mode === 'cpu' && playerOneWon); // CPU mode - only if human (Player One) won
    
    if (shouldSaveToLeaderboard) {
      const winnerName = playerOneWon ? playerOneName : playerTwoName;
      const winnerScore = playerOneWon ? finalScores.playerOne : finalScores.playerTwo;
      const opponentName = playerOneWon ? playerTwoName : playerOneName;
      const opponentScore = playerOneWon ? finalScores.playerTwo : finalScores.playerOne;
      
      // Save to leaderboard (localStorage + Firebase if logged in)
      await saveGameResult(
        winnerName, 
        winnerScore, 
        opponentName, 
        opponentScore, 
        gameOptions?.mode || 'practice',
        user?.uid || null, // Pass user ID for Firebase sync
        difficultyMode || 'regular' // Pass difficulty mode
      );
    }
    
    // Save match result if playing against CPU (for Record Book)
    if (gameOptions?.mode === 'cpu' && gameOptions?.cpuOpponent) {
      if (user) {
        try {
          const playerWon = finalScores.playerOne > finalScores.playerTwo;
          
          // console.log('Saving CPU match result...', {
          //   userId: user.uid,
          //   playerName: playerOneName,
          //   cpuOpponentId: gameOptions.cpuOpponent.id,
          //   cpuOpponentName: gameOptions.cpuOpponent.name,
          //   cpuDifficulty: gameOptions.cpuOpponent.difficulty,
          //   playerScore: finalScores.playerOne,
          //   cpuScore: finalScores.playerTwo,
          //   playerWon: playerWon
          // });
          
          await saveCPUMatchResult({
            userId: user.uid,
            playerName: playerOneName,
            cpuOpponentId: gameOptions.cpuOpponent.id,
            cpuOpponentName: gameOptions.cpuOpponent.name,
            cpuDifficulty: gameOptions.cpuOpponent.difficulty,
            playerScore: finalScores.playerOne,
            cpuScore: finalScores.playerTwo,
            playerWon: playerWon,
            gameDate: new Date()
          });
          
          console.log('✅ CPU match result saved successfully to Firebase');
          
          // Check and unlock new opponents if player won
          if (playerWon) {
            console.log('🎮 Player won! Checking for unlocks...');
            const newlyUnlocked = await checkAndUnlockOpponents(user.uid);
            console.log('🔓 Unlock check complete. Newly unlocked:', newlyUnlocked);
            
            // Collect all unlocked trophies
            const allUnlockedTrophies = [];
            
            // Trophy unlocks - First Win
            try {
              const firstWinTrophies = await checkAndUnlockTrophies(user.uid, {
                type: 'first_win'
              });
              if (firstWinTrophies && firstWinTrophies.length > 0) {
                allUnlockedTrophies.push(...firstWinTrophies);
                console.log('🏆 First win trophy unlocked!');
              }
            } catch (error) {
              console.error('Error checking first win trophy:', error);
            }
            
            // Trophy unlocks - CPU Victory
            try {
              const cpuVictoryTrophies = await checkAndUnlockTrophies(user.uid, {
                type: 'cpu_victory',
                cpuId: gameOptions.cpuOpponent.id
              });
              if (cpuVictoryTrophies && cpuVictoryTrophies.length > 0) {
                allUnlockedTrophies.push(...cpuVictoryTrophies);
                console.log(`🏆 CPU victory trophy unlocked for ${gameOptions.cpuOpponent.id}!`);
              }
            } catch (error) {
              console.error('Error checking CPU victory trophy:', error);
            }
            
            // Store unlocked trophies to show later
            if (allUnlockedTrophies.length > 0) {
              setUnlockedTrophies(allUnlockedTrophies);
              console.log(`🎉 ${allUnlockedTrophies.length} trophy/trophies unlocked!`, allUnlockedTrophies);
            }
            
            // Compare with pre-Final Jeopardy state to find new unlocks
            if (newlyUnlocked.length > 0) {
              console.log('🎉 New opponents unlocked:', newlyUnlocked);
              
              // Get the current unlock state and compare
              const currentUnlockState = await getUserUnlockState(user.uid);
              const previousUnlockState = preUnlockStateRef.current || {};
              
              // Find the first newly unlocked opponent
              const newUnlock = Object.keys(currentUnlockState).find(opponentId => {
                return currentUnlockState[opponentId] === true && 
                       previousUnlockState[opponentId] === false;
              });
              
              if (newUnlock) {
                console.log('🎊 Detected new unlock to display:', newUnlock);
                setUnlockedOpponentId(newUnlock);
                setShowUnlockReveal(true);
              }
            } else {
              console.log('ℹ️ No new opponents unlocked this time');
            }
          } else {
            console.log('❌ Player lost - no unlock check performed');
          }
        } catch (error) {
          // console.error('❌ Failed to save CPU match result:', error);
          // console.error('Error details:', error.message, error.code);
        }
        } else {
          // console.warn('⚠️ Cannot save match history: User is not logged in. Please log in to track your game history.');
      }
    }
    
    // Trophy unlocks for non-CPU modes (two-player and practice)
    if (user && (gameOptions?.mode === 'two-player' || gameOptions?.mode === 'practice')) {
      try {
        // Check for first win trophy
        const firstWinTrophies = await checkAndUnlockTrophies(user.uid, {
          type: 'first_win'
        });
        if (firstWinTrophies && firstWinTrophies.length > 0) {
          setUnlockedTrophies(firstWinTrophies);
          console.log('🏆 First win trophy unlocked (non-CPU mode)!');
        }
      } catch (error) {
        console.error('Error checking first win trophy:', error);
      }
    }
    
    // DON'T show the game roundup yet - let FinalJeopardy show a button first
    // The button will call handleShowGameRoundup
  };
  
  const handleShowGameRoundup = () => {
    setShowFinalJeopardy(false);
    
    // Check if we have trophies to show first
    if (unlockedTrophies.length > 0) {
      setShowTrophyReveal(true);
    } else if (unlockedOpponentId) {
      // Show CPU unlock if we have one and no trophies
      setShowUnlockReveal(true);
    } else {
      // Otherwise go straight to game roundup
      setShowGameRoundup(true);
    }
  };
  
  const handleUnlockRevealContinue = () => {
    setShowUnlockReveal(false);
    
    // Check if we have trophies to show after CPU unlock
    if (unlockedTrophies.length > 0) {
      setShowTrophyReveal(true);
    } else {
      setShowGameRoundup(true);
    }
  };
  
  const handleTrophyRevealContinue = () => {
    setShowTrophyReveal(false);
    setUnlockedTrophies([]); // Clear unlocked trophies
    
    // Check if we have a CPU unlock to show after trophies
    if (unlockedOpponentId && !showUnlockReveal) {
      setShowUnlockReveal(true);
    } else {
      setShowGameRoundup(true);
    }
  };

  // Function to reveal dollar values in a fixed pattern
  const startValueRevealAnimation = useCallback(() => {
    // Prevent multiple simultaneous calls
    if (isCreatingAudioRef.current || isRevealingValues) {
      return;
    }
    
    setIsRevealingValues(true);
    isCreatingAudioRef.current = true;
    
    // Create a fixed reveal pattern that ensures each consecutive pick is in a different column and different row
    // Pattern designed to jump around the board in an interesting way
    let revealPattern = [
      // Start with a diagonal pattern
      { category: 0, value: 0 },
      { category: 1, value: 1 },
      { category: 2, value: 2 },
      { category: 3, value: 3 },
      { category: 4, value: 4 },
      { category: 5, value: 0 },
      // Jump around in a zigzag
      { category: 0, value: 1 },
      { category: 1, value: 2 },
      { category: 2, value: 3 },
      { category: 3, value: 4 },
      { category: 4, value: 0 },
      { category: 5, value: 1 },
      // Continue the pattern
      { category: 0, value: 2 },
      { category: 1, value: 3 },
      { category: 2, value: 4 },
      { category: 3, value: 0 },
      { category: 4, value: 1 },
      { category: 5, value: 2 },
      // Fill in remaining
      { category: 0, value: 3 },
      { category: 1, value: 4 },
      { category: 2, value: 0 },
      { category: 3, value: 1 },
      { category: 4, value: 2 },
      { category: 5, value: 3 },
      // Last row
      { category: 0, value: 4 },
      { category: 1, value: 0 },
      { category: 2, value: 1 },
      { category: 3, value: 2 },
      { category: 4, value: 3 },
      { category: 5, value: 4 },
    ];
    
    // Swap every 3rd element with the next element (positions 2&3, 5&6, 8&9, etc.)
    for (let i = 2; i < revealPattern.length - 1; i += 3) {
      [revealPattern[i], revealPattern[i + 1]] = [revealPattern[i + 1], revealPattern[i]];
    }
    
    // Additional specific swap: position 2 with position 22
    [revealPattern[2], revealPattern[22]] = [revealPattern[22], revealPattern[2]];
    
    // Reveal each position at exactly 150ms intervals using setTimeout chain
    const revealSequence = (index) => {
      if (index >= revealPattern.length) {
        // All values revealed
        setIsRevealingValues(false);
        
        // Stop the board audio before showing category showcase
        if (boardAudioRef.current) {
          boardAudioRef.current.pause();
          boardAudioRef.current.currentTime = 0;
          boardAudioRef.current.src = '';
          boardAudioRef.current.load();
          boardAudioRef.current = null;
        }
        
        isCreatingAudioRef.current = false; // Reset flag
        
        // Show category showcase after a delay to ensure audio cleanup completes
        setTimeout(() => {
          setShowCategoryShowcase(true);
        }, 500); // Increased from 300ms to 500ms
        return;
      }
      
      const position = revealPattern[index];
      setRevealedValues(prev => [...prev, `${position.category}-${position.value}`]);
      
      // Schedule next reveal
      setTimeout(() => revealSequence(index + 1), 100);
    };
    
    // Use the preloaded audio from boardAudioRef (should already be loaded and playing muted from startRound)
    const audio = boardAudioRef.current;
    
    if (audio) {
      // Unmute the audio - it should already be playing from startRound
      audio.volume = 0.5;
      
      // Set up cleanup handler
      const handleEnded = () => {
        if (audio === boardAudioRef.current) {
          audio.pause();
          audio.src = '';
          audio.load();
          boardAudioRef.current = null;
          isCreatingAudioRef.current = false;
        }
      };
      audio.addEventListener('ended', handleEnded);
    }
    
    // Start the visual animation immediately
    revealSequence(0);
  }, []);

  const startFinalJeopardy = async () => {
    // Save unlock state before Final Jeopardy if this is a CPU game
    if (gameOptions?.mode === 'cpu' && user) {
      try {
        const currentUnlockState = await getUserUnlockState(user.uid);
        preUnlockStateRef.current = currentUnlockState;
        console.log('💾 Saved pre-Final Jeopardy unlock state:', currentUnlockState);
      } catch (error) {
        console.error('Error saving unlock state before Final Jeopardy:', error);
      }
    }
    
    setShowBoard(false);
    setShowRoundTransition(false);
    setShowFinalJeopardy(true);
  };

  const handleSkipToFinal = () => {
    setShowBoard(false);
    setShowFinalJeopardy(true);
  };

  // Memoize the Category component to prevent recreation on every render
  const Category = useMemo(() => {
    // Function to calculate font size based on category name length
    const getCategoryFontSize = (categoryName) => {
      if (!categoryName) return '1.5rem';
      const length = categoryName.length;
      // Linear interpolation between 1.5rem (short) and 1.1rem (long)
      // Assume short = 10 chars, long = 40+ chars
      if (length <= 10) return '1.5rem';
      if (length >= 40) return '1.1rem';
      // Linear scale between 10 and 40 characters
      const ratio = (length - 10) / (40 - 10);
      const fontSize = 1.5 - (ratio * 0.4); // 1.5 - 0.4 = 1.1
      return `${fontSize}rem`;
    };

    return React.memo(function Category({ clues, categoryIndex, cpuSelectedClueId }) {
      return (
        <>
          {clues?.map((clue, index) => {
            // Check if THIS SPECIFIC clue is a Daily Double
            // Need to match BOTH category AND location for the same Daily Double
            let isDailyDouble = false;
            for (let i = 0; i < dailyDoubleCategories.length; i++) {
              if (dailyDoubleCategories[i] === categoryIndex + 1 && 
                  dailyDoubleLocations[i] === index + 1) {
                isDailyDouble = true;
                break;
              }
            }
            
            const isValueRevealed = revealedValues.includes(`${categoryIndex}-${index}`);
            
            return (
              <div key={clue.id}>
                {index === 0 && (
                  <CategoryTitleWrapper>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        visibility: showCategoryNames ? 'visible' : 'hidden',
                        fontSize: getCategoryFontSize(clues[0].category),
                        fontWeight: 700,
                      }}
                    >
                      {clues[0].category}
                    </Typography>
                  </CategoryTitleWrapper>
                )}
                <Question
                  clue={clue}
                  index={index}
                  updatePlayerOneScore={updatePlayerOneScore}
                  updatePlayerTwoScore={updatePlayerTwoScore}
                  updateAnswered={updateAnswered}
                  answered={answered}
                  jeopardyRound={jeopardyRound === 'Jeopardy' ? 200 : 400}
                  setHasControlOfBoard={setHasControlOfBoard}
                  playerOneName={playerOneName}
                  playerTwoName={playerTwoName}
                  updateMissedQuestions={updateMissedQuestions}
                  clueCountdown={clueCountdown}
                  throatCleared={throatCleared}
                  setThroatCleared={setThroatCleared}
                  isDailyDouble={isDailyDouble}
                  playerOneScore={playerOneScore}
                  playerTwoScore={playerTwoScore}
                  hasControlOfBoard={hasControlOfBoard}
                  gameOptions={gameOptions}
                  playerOneAvatar={playerOneAvatar}
                  playerTwoAvatar={playerTwoAvatar}
                  onQuestionDisplayChange={setIsQuestionOpen}
                  cpuSelectedClueId={cpuSelectedClueId}
                  onCpuClueOpened={() => setCpuSelectedClueId(null)}
                  trackPlayerResponseTime={trackPlayerResponseTime}
                  trackPlayerCategoryPerformance={trackPlayerCategoryPerformance}
                  isValueRevealed={isValueRevealed}
                />
              </div>
            );
          })}
        </>
      );
    });
  }, [
    dailyDoubleCategories,
    dailyDoubleLocations,
    updatePlayerOneScore,
    updatePlayerTwoScore,
    updateAnswered,
    answered,
    jeopardyRound,
    playerOneName,
    playerTwoName,
    updateMissedQuestions,
    clueCountdown,
    throatCleared,
    playerOneScore,
    playerTwoScore,
    hasControlOfBoard,
    gameOptions,
    trackPlayerResponseTime,
    trackPlayerCategoryPerformance,
    revealedValues,
    showCategoryNames
    // Note: cpuSelectedClueId intentionally NOT included to prevent remounting
  ]);

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <BackgroundContainer />
      <AnimatedRectangles>
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </AnimatedRectangles>

      {showScoreUpdate && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '20px',
            borderRadius: '10px',
            zIndex: 1000,
          }}
        >
          <Typography variant="h4" sx={{ color: 'white', textAlign: 'center' }}>
            {scoreUpdatePlayer === 'playerOne' ? playerOneName : playerTwoName}
            {': '}
            {scoreUpdateValue > 0 ? '+' : ''}
            {scoreUpdateValue}
          </Typography>
        </Box>
      )}

      <BoardWrapper>
        {/* Loading screen while questions are being loaded */}
        {isLoadingQuestions && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              color: 'white',
              gap: 3,
            }}
          >
            <CircularProgress size={60} sx={{ color: 'white' }} />
            <Typography variant="h4">Loading Questions...</Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              Preparing your game
            </Typography>
          </Box>
        )}

        {/* Error screen if questions failed to load */}
        {questionsLoadError && !isLoadingQuestions && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              color: 'white',
              gap: 3,
            }}
          >
            <Typography variant="h4" sx={{ color: '#f44336' }}>
              {questionsLoadError}
            </Typography>
            <Button
              variant="contained"
              onClick={() => startGame()}
              sx={{
                backgroundColor: '#fff',
                color: '#0f258f',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                },
              }}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              onClick={onReturnToStart}
              sx={{
                borderColor: '#fff',
                color: '#fff',
                '&:hover': {
                  borderColor: '#e0e0e0',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Return to Start
            </Button>
          </Box>
        )}

        {showBoard && !isLoadingQuestions && !questionsLoadError && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 0 }}>
            {/* Exit Button - Top Left */}
            <ReturnButton 
              variant="contained" 
              onClick={onReturnToStart}
              size='small'
              sx={{ 
                position: 'absolute', 
                top: 0,
                left: 0,
                margin: 0,
                minWidth: '40px !important',
                width: '40px',
                height: '40px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 245, 245, 0.95)',
                color: '#0f258f',
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                },
                '& .MuiSvgIcon-root': {
                  marginRight: '2px',
                  fontSize: '1.5rem',
                }
              }}
            >
              <HomeIcon />
            </ReturnButton>

            {/* Debug Buttons */}
            {process.env.NODE_ENV === 'development' && (
              <>
                {/* Debug Button - Skip to End of Round */}
                <Button 
                  variant="contained" 
                  onClick={() => {
                    // Get all clues on the board
                    const allClues = [
                  ...catOneClues,
                  ...catTwoClues,
                  ...catThreeClues,
                  ...catFourClues,
                  ...catFiveClues,
                  ...catSixClues
                ];
                
                // Mark all but the last clue as answered
                const allButLastClue = allClues.slice(0, -1);
                const clueIdsToMark = allButLastClue.map(clue => clue.id);
                
                setAnswered(prevAnswered => {
                  // Combine existing answered with new IDs, removing duplicates
                  const combined = [...new Set([...prevAnswered, ...clueIdsToMark])];
                  console.log(`🎯 DEBUG: Marked ${clueIdsToMark.length} clues as answered. ${allClues.length - clueIdsToMark.length} remaining.`);
                  return combined;
                });
              }}
              size='small'
              sx={{ 
                position: 'absolute', 
                top: 0,
                right: 100,
                margin: 0,
                minWidth: '80px !important',
                height: '30px',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 100, 100, 0.95)',
                color: 'white',
                zIndex: 1000,
                fontSize: '0.7rem',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 80, 80, 0.95)',
                },
              }}
            >
              Skip to End
            </Button>

            {/* Debug Button - Show Unlock Reveal */}
            <Button 
              variant="contained" 
              onClick={() => {
                console.log('🎊 DEBUG: Triggering unlock reveal for celebrity');
                setUnlockedOpponentId('celebrity');
                setShowUnlockReveal(true);
              }}
              size='small'
              sx={{ 
                position: 'absolute', 
                top: 0,
                right: 0,
                margin: 0,
                minWidth: '80px !important',
                height: '30px',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                backgroundColor: 'rgba(100, 100, 255, 0.95)',
                color: 'white',
                zIndex: 1000,
                fontSize: '0.7rem',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(80, 80, 255, 0.95)',
                },
              }}
            >
              Test Unlock
            </Button>
              </>
            )}
            
            <Grid container sx={{ mb: 0, mt: 0 }}>
              <Grid item sm={12} sx={{ textAlign: 'center', py: 0.5 }}>
                <h1 style={{ margin: '8px 0' }}>
                  {jeopardyRound === 'J!' && 'Jeopardy!'}
                  {jeopardyRound === 'DJ!' && 'Double Jeopardy!'}
                </h1>
              </Grid>
            </Grid>

        {!showBoard && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'white',
            }}
          >
            <Typography variant="h4" sx={{ mb: 4 }}>
              Choose your avatars and click "Start Game" to begin
            </Typography>
          </Box>
        )}

            {/* Control of Board Indicator */}
            {!isQuestionOpen && (
              <Typography 
                variant="h6" 
                sx={{ 
                  position: 'absolute',
                  top: '10px',
                  left: 0,
                  right: 0,
                  margin: '0 auto',
                  textAlign: 'center', 
                  color: '#FFD700', 
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  zIndex: 10
                }}
              >
                {hasControlOfBoard} has control of the board
              </Typography>
            )}
            
            <ScoreDisplay
              playerOneName={playerOneName}
              playerTwoName={playerTwoName}
              playerOneScore={playerOneScore}
              playerTwoScore={playerTwoScore}
              hasControlOfBoard={hasControlOfBoard}
              playerOneAvatar={playerOneAvatar}
              playerTwoAvatar={playerTwoAvatar}
            />
            <Box sx={{ position: 'relative' }}>
              {/* Category Showcase - positioned over the grid */}
              {showCategoryShowcase && (
                <CategoryShowcase
                  categories={showcaseCategories}
                  onBeforeFadeOut={() => {
                    // Show category names on the board before the showcase fades out
                    setShowCategoryNames(true);
                  }}
                  onComplete={() => {
                    setShowCategoryShowcase(false);
                  }}
                />
              )}
              
              <Grid container spacing={0} sx={{ p: { xs: 0.5, sm: 1, md: 2 } }}>
              <Grid item xs={6} sm={4} md={2}>
                <Category clues={catOneClues} categoryIndex={0} cpuSelectedClueId={cpuSelectedClueId} />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Category clues={catTwoClues} categoryIndex={1} cpuSelectedClueId={cpuSelectedClueId} />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Category clues={catThreeClues} categoryIndex={2} cpuSelectedClueId={cpuSelectedClueId} />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Category clues={catFourClues} categoryIndex={3} cpuSelectedClueId={cpuSelectedClueId} />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Category clues={catFiveClues} categoryIndex={4} cpuSelectedClueId={cpuSelectedClueId} />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Category clues={catSixClues} categoryIndex={5} cpuSelectedClueId={cpuSelectedClueId} />
              </Grid>
            </Grid>
            {process.env.NODE_ENV === 'development' && jeopardyRound === 'Double Jeopardy' && (
              <SkipToFinalButton 
                variant="contained"
                onClick={handleSkipToFinal}
              >
                Skip to Final Jeopardy
              </SkipToFinalButton>
            )}
            </Box>
          </Box>
        )}


        {/* Single Jeopardy completion screen */}
        {showRoundTransition && !showFinalJeopardy && jeopardyRound === 'Jeopardy' && (
          <Grid container>
            <Grid item xs={12} sx={{ textAlign: 'center', pt: 20, color: '#fff' }}>
              <Typography variant="h2" sx={{ mb: 10 }}>Our scores after Jeopardy! are:</Typography>
              <Typography variant="h2" sx={{mb: 2}}>
                {playerOneName}: {playerOneScore >= 0 ? '$' : '-$'}
                {Math.abs(playerOneScore)}
              </Typography>
              <Typography variant="h2">
                {playerTwoName}: {playerTwoScore >= 0 ? '$' : '-$'}
                {Math.abs(playerTwoScore)}
              </Typography>
              <Button sx={{ mt: 10 }} variant="contained" onClick={startNewRound}>
                Begin Double Jeopardy
              </Button>
            </Grid>
          </Grid>
        )}
        
        {/* Double Jeopardy completion screen */}
        {showRoundTransition && !showFinalJeopardy && jeopardyRound === 'Double Jeopardy' && (
          <Grid container>
            <Grid item xs={12} sx={{ textAlign: 'center', pt: 20, color: '#fff' }}>
              <Typography variant="h2" sx={{ mb: 10 }}>Our scores after Double Jeopardy! are:</Typography>
              <Typography variant="h2" sx={{mb: 2}}>
                {playerOneName}: {playerOneScore >= 0 ? '$' : '-$'}
                {Math.abs(playerOneScore)}
              </Typography>
              <Typography variant="h2">
                {playerTwoName}: {playerTwoScore >= 0 ? '$' : '-$'}
                {Math.abs(playerTwoScore)}
              </Typography>
              <Button sx={{ mt: 10 }} variant="contained" onClick={startFinalJeopardy}>
                Begin Final Jeopardy
              </Button>
            </Grid>
          </Grid>
        )}

        {showFinalJeopardy && (
          <FinalJeopardy
            playerOneName={playerOneName}
            playerTwoName={playerTwoName}
            playerOneScore={playerOneScore}
            playerTwoScore={playerTwoScore}
            playerOneAvatar={playerOneAvatar}
            playerTwoAvatar={playerTwoAvatar}
            gameOptions={gameOptions}
            onGameComplete={handleFinalJeopardyComplete}
            onShowGameRoundup={handleShowGameRoundup}
            onReturnToStart={onReturnToStart}
          />
        )}

        {showUnlockReveal && unlockedOpponentId && (
          <UnlockReveal
            unlockedOpponentId={unlockedOpponentId}
            onContinue={handleUnlockRevealContinue}
          />
        )}

        {showTrophyReveal && unlockedTrophies.length > 0 && (
          <TrophyUnlockReveal
            trophies={unlockedTrophies}
            onContinue={handleTrophyRevealContinue}
          />
        )}

        {showGameRoundup && (
          <GameRoundup
            playerName={playerOneName}
            finalScore={playerOneScore}
            missedQuestions={missedQuestions}
            categoryStats={playerCategoryPerformance}
            averageResponseTime={playerResponseTimes.length > 0 
              ? (playerResponseTimes.reduce((a, b) => a + b, 0) / playerResponseTimes.length) * 1000 
              : null}
            onReturnToStart={onReturnToStart}
          />
        )}
      </BoardWrapper>
    </Box>
  );
}

Board.propTypes = {};

export default Board;
