import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Button, Typography, Card, styled, Box, TextField, Grid, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import GavelIcon from '@mui/icons-material/Gavel';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useGamepads } from 'react-gamepads';
import { synthesizeSpeech, VOICES, listAvailableVoices, DEFAULT_VOICE } from './services/pollyService';
import { evaluateAnswer } from './utils/answerEvaluator';
import { cpuShouldAttemptAnswer, calculateCPUDailyDoubleBet, cpuShouldAnswerCorrectly } from './utils/cpuGameLogic';
import AvatarWithAccessories from './components/AvatarWithAccessories';
import { useAuth } from './contexts/AuthContext';
import { isAdmin } from './utils/adminCheck';
import { markQuestionAsFlawed } from './services/flawedQuestionsDB';
import { evaluateChallenge, logChallenge } from './services/challengeRulingService';

// Todo

// 1 Buzzer lockout
// 2 External buzzers
// 2 Daily Doubles
// 3 Final Jeopardy

const ValueWrapper = styled(Box)(
  ({ theme }) => `
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid black; 
      color: white; 
      background-color: #0f258f; 
      cursor: pointer;  
      height: 100px;
      text-align: center;
      vertical-align: center;
      position: relative;

      .hide {
        display: none;
      }

      &:hover:not([style*="pointer-events: none"]) {
        .MuiTypography-root {
          color: #FFC870;
          transition: color 0.2s ease-in-out;
        }
      }
      
      ${theme.breakpoints.down('md')} {
        height: 80px;
        border: 2px solid black;
      }
      
      ${theme.breakpoints.down('sm')} {
        height: 60px;
        border: 2px solid black;
      }
  `
);

const DailyDoubleIndicator = styled(Box)(
  () => `
      position: absolute;
      bottom: 5px;
      right: 5px;
      color: white;
      font-size: 16px;
      font-weight: bold;
      text-shadow: 1px 1px 2px black;
      z-index: 1000;
  `
);

const DailyDoubleRevealScreen = styled(Box)(
  () => `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #0f258f;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: flashIn 0.3s ease-in;
      
      @keyframes flashIn {
        0% {
          opacity: 0;
          transform: scale(0.8);
        }
        50% {
          opacity: 1;
          transform: scale(1.1);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
  `
);

const QuestionWrapper = styled(Box)(
  () => `
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid black; 
      color: white;
      background-color: #0f258f; 
      cursor: pointer;
      text-align: center;
      vertical-align: center;
      position: fixed;
      width: 100%;
      top: 0px;
      left: 0px;
      right: 0px;
      bottom: 0px;
      height: 100vh;
      z-index: 1000;
      .go-lights {
        width: 30px;
        height: 30px; 
        position: absolute;
        background-color: #2338a2;
        border-radius: 30px;
        border: 2px solid #ccc;
      }
      .go-lights.left {
        left: 30px;
      }
      .go-lights.right {
        right: 30px;
      }
      .go-lights.active {
        background-color: #fff;
      }
  `
);

const TextWrapper = styled(Box)(
  ({ theme }) => `
      display: block;
      max-width: 80%;
      .player-rang {
        color: green;
        margin-left: 30%;
        margin-right: 30%;
        width: 40%;
        display: block;
        font-weight: bold;
        background-color: #fff;
        height: 40px;
        padding-top: 5px;
        border-radius: 30px;
        bottom: 130px;
        position: absolute;
        left: 0;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
      }
      
      .player-rang:hover {
        background-color: #e0e0e0;
        transform: scale(1.05);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }
      
      ${theme.breakpoints.down('sm')} {
        max-width: 90%;
        .player-rang {
          margin-left: 10%;
          margin-right: 10%;
          width: 80%;
          height: 48px;
          font-size: 1.1rem;
          bottom: 100px;
        }
      }
  `
);

// Mobile Buzzer Button - Fixed at bottom of screen
const MobileBuzzerButton = styled(Button)(
  ({ theme }) => `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 200px;
      height: 80px;
      font-size: 1.5rem;
      font-weight: bold;
      background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
      color: white;
      border: 4px solid #b71c1c;
      border-radius: 50px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), 0 0 20px rgba(211, 47, 47, 0.6);
      z-index: 9999;
      text-transform: uppercase;
      letter-spacing: 2px;
      transition: all 0.2s ease;
      display: none; /* Hidden by default */
      
      &:hover {
        background: linear-gradient(135deg, #e53935 0%, #d32f2f 100%);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 30px rgba(211, 47, 47, 0.8);
        transform: translateX(-50%) scale(1.05);
      }
      
      &:active {
        transform: translateX(-50%) scale(0.95);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4), 0 0 15px rgba(211, 47, 47, 0.5);
      }
      
      &.active {
        animation: buzzerPulse 1s ease-in-out infinite;
      }
      
      @keyframes buzzerPulse {
        0%, 100% {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), 0 0 20px rgba(211, 47, 47, 0.6);
        }
        50% {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), 0 0 40px rgba(211, 47, 47, 1);
        }
      }
      
      /* Show on mobile/tablet */
      ${theme.breakpoints.down('md')} {
        display: flex;
        align-items: center;
        justify-content: center;
      }
  `
);

const AnswerWrapper = styled(Box)(
  () => `
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid black; 
      color: white;
      background-color: #0f258f; 
      cursor: pointer;
      text-align: center;
      vertical-align: center;
      position: fixed;
      width: 100vw;
      top: 0px;
      left: 0px;
      right: 0px;
      bottom: 0px;
      height: 100vh;
      z-index: 1000;
  `
);

function Question({
  clue,
  index,
  updatePlayerOneScore,
  updatePlayerTwoScore,
  updateAnswered,
  answered,
  jeopardyRound,
  setHasControlOfBoard,
  playerOneName,
  playerTwoName,
  updateMissedQuestions,
  clueCountdown,
  throatCleared,
  setThroatCleared,
  isDailyDouble,
  playerOneScore,
  playerTwoScore,
  hasControlOfBoard,
  gameOptions,
  playerOneAvatar,
  playerTwoAvatar,
  isFinalJeopardy = false,
  isGameSetup = false,
  onQuestionDisplayChange,
  cpuSelectedClueId,
  onCpuClueOpened,
  trackPlayerResponseTime,
  trackPlayerCategoryPerformance,
  isValueRevealed = true // New prop to control dollar value visibility
}) {
  const { user } = useAuth(); // Get current user
  const userIsAdmin = user ? isAdmin(user) : false; // Check if user is admin
  
  const [metaData, setMetaData] = useState(null);
  const [showDollarValue, setShowDollarValue] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showDailyDouble, setShowDailyDouble] = useState(false);
  const [showDailyDoubleReveal, setShowDailyDoubleReveal] = useState(false); // Full-screen DD reveal
  const [showAnswer, setShowAnswer] = useState(false);
  const [buzzerActive, setBuzzerActive] = useState(false);
  const [playerOneBuzzed, setPlayerOneBuzzed] = useState(false);
  const [playerTwoBuzzed, setPlayerTwoBuzzed] = useState(false);
  const [enterKeyEnabled, setEnterKeyEnabled] = useState(false); // Track if Enter key is enabled
  const [dailyDoubleWager, setDailyDoubleWager] = useState(null);
  const [timeIsUp, setTimeIsUp] = useState(false);
  const [gamepads, setGamepads] = useState({});
  const [selectedVoice, setSelectedVoice] = useState(DEFAULT_VOICE);
  const [audioUrl, setAudioUrl] = useState(null);
  const [themeMusic, setThemeMusic] = useState(null);
  const [isThemePlaying, setIsThemePlaying] = useState(false);
  const [playerOneLockedOut, setPlayerOneLockedOut] = useState(false);
  const [playerTwoLockedOut, setPlayerTwoLockedOut] = useState(false);
  const [playerOneAnswer, setPlayerOneAnswer] = useState('');
  const [playerTwoAnswer, setPlayerTwoAnswer] = useState('');
  const [showAnswerInput, setShowAnswerInput] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState('');
  const [scoreChange, setScoreChange] = useState(0);
  const [questionEndTime, setQuestionEndTime] = useState(null); // Track when question audio ends
  const [playersWhoAttempted, setPlayersWhoAttempted] = useState([]); // Track who has already attempted this question
  const [firstPlayerAttempt, setFirstPlayerAttempt] = useState(null); // Store first player's attempt details: { player, answer, wasCorrect }
  const [firstPlayerEvaluation, setFirstPlayerEvaluation] = useState(null); // Store first player's evaluation result
  const [answerTimeRemaining, setAnswerTimeRemaining] = useState(null); // Track time remaining to answer
  const [isListening, setIsListening] = useState(false); // Track if speech recognition is active
  const [speechRecognition, setSpeechRecognition] = useState(null); // Store speech recognition instance
  
  // Challenge Ruling state
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeReason, setChallengeReason] = useState('');
  const [isEvaluatingChallenge, setIsEvaluatingChallenge] = useState(false);
  const [challengeResult, setChallengeResult] = useState(null);
  const [challengingPlayer, setChallengingPlayer] = useState(null); // 'playerOne' or 'playerTwo'

  // Use refs to track timers and audio so they can be cleaned up
  const timeoutIdsRef = useRef([]);
  const currentAudioRef = useRef(null);
  const answerInputRef = useRef(null); // Ref for the answer input field
  const answerTimerRef = useRef(null); // Ref for the answer timer
  const timerInitializedRef = useRef(false); // Track if timer has been initialized for current attempt

  // Debug effect to track showAnswer changes
  useEffect(() => {
    // console.log('showAnswer changed to:', showAnswer);
    // console.log('evaluationResult:', evaluationResult);
    // console.log('submittedAnswer:', submittedAnswer);
  }, [showAnswer, evaluationResult, submittedAnswer]);

  // Notify parent when question or answer is being displayed
  useEffect(() => {
    const isQuestionDisplayed = showQuestion || showAnswer || showDailyDouble;
    onQuestionDisplayChange?.(isQuestionDisplayed);
  }, [showQuestion, showAnswer, showDailyDouble, onQuestionDisplayChange]);

  // Auto-focus the answer input when the human player buzzes in
  useEffect(() => {
    if (showAnswerInput && answerInputRef.current) {
      // Focus for Player One (always human in CPU mode)
      if (playerOneBuzzed) {
        answerInputRef.current.focus();
      }
      // Focus for Player Two only in two-player mode (not CPU mode)
      else if (playerTwoBuzzed && gameOptions?.mode !== 'cpu') {
        answerInputRef.current.focus();
      }
    }
  }, [showAnswerInput, playerOneBuzzed, playerTwoBuzzed, gameOptions?.mode]);

  // Enable Enter key to submit after 3-second delay when someone buzzes in
  useEffect(() => {
    if (showAnswerInput && (playerOneBuzzed || playerTwoBuzzed)) {
      // Disable Enter key initially
      setEnterKeyEnabled(false);
      
      // Enable after 3 seconds
      const enterKeyTimer = setTimeout(() => {
        setEnterKeyEnabled(true);
        console.log('✅ Enter key now enabled for answer submission');
      }, 3000);
      
      // Cleanup
      return () => {
        clearTimeout(enterKeyTimer);
        setEnterKeyEnabled(false);
      };
    }
  }, [showAnswerInput, playerOneBuzzed, playerTwoBuzzed]);

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Speech recognized:', transcript);
        
        // Set the answer based on who buzzed in
        if (playerOneBuzzed) {
          setPlayerOneAnswer(transcript);
        } else if (playerTwoBuzzed && gameOptions?.mode !== 'cpu') {
          setPlayerTwoAnswer(transcript);
        }
        
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setSpeechRecognition(recognition);
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
    
    // Cleanup
    return () => {
      if (speechRecognition) {
        speechRecognition.stop();
      }
    };
  }, [playerOneBuzzed, playerTwoBuzzed, gameOptions?.mode]);

  // Handle microphone button click
  const handleMicrophoneClick = useCallback(() => {
    if (!speechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    
    if (isListening) {
      // Stop listening
      speechRecognition.stop();
      setIsListening(false);
    } else {
      // Start listening
      try {
        speechRecognition.start();
        setIsListening(true);
        console.log('🎤 Started listening...');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  }, [speechRecognition, isListening]);

  // Add keyboard shortcut (Control key) for microphone
  useEffect(() => {
    const handleControlForMic = (e) => {
      // Only trigger if showing answer input and Control is pressed
      if (e.key === 'Control' && 
          showAnswerInput && 
          !isEvaluating) {
        e.preventDefault(); // Prevent any default behavior
        handleMicrophoneClick();
      }
    };

    // Add event listener
    if (showAnswerInput) {
      document.addEventListener('keydown', handleControlForMic);
    }

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleControlForMic);
    };
  }, [showAnswerInput, isEvaluating, handleMicrophoneClick]);

  // Helper function to restore first player's evaluation
  const restoreFirstPlayerEvaluation = useCallback(() => {
    console.log('🔍 Attempting to restore first player evaluation:', {
      hasFirstPlayerEvaluation: !!firstPlayerEvaluation,
      hasFirstPlayerAttempt: !!firstPlayerAttempt,
      firstPlayerEvaluation,
      firstPlayerAttempt
    });
    
    if (firstPlayerEvaluation && firstPlayerAttempt) {
      console.log('🔄 Restoring first player evaluation:', {
        player: firstPlayerAttempt.player,
        answer: firstPlayerAttempt.answer,
        evaluation: firstPlayerEvaluation
      });
      
      setEvaluationResult(firstPlayerEvaluation.result);
      setSubmittedAnswer(firstPlayerEvaluation.submittedAnswer);
      setScoreChange(firstPlayerEvaluation.scoreChange);
      
      // Restore which player buzzed
      if (firstPlayerAttempt.player === playerOneName) {
        setPlayerOneBuzzed(true);
        setPlayerOneAnswer(firstPlayerAttempt.answer);
      } else {
        setPlayerTwoBuzzed(true);
        setPlayerTwoAnswer(firstPlayerAttempt.answer);
      }
      
      return true;
    }
    
    console.log('❌ Cannot restore: missing firstPlayerEvaluation or firstPlayerAttempt');
    return false;
  }, [firstPlayerEvaluation, firstPlayerAttempt, playerOneName]);

  // Add Enter key handler for "Show Answer" button
  useEffect(() => {
    const handleEnterForShowAnswer = (e) => {
      // Only trigger Enter for "Show Answer" when time is up and no one has buzzed
      if (e.key === 'Enter' && 
          timeIsUp && 
          !playerOneBuzzed && 
          !playerTwoBuzzed && 
          !showAnswer &&
          !showAnswerInput) {
        e.preventDefault();
        
        // Restore first player's evaluation if exists
        restoreFirstPlayerEvaluation();
        
        setShowAnswer(true);
      }
    };

    // Add event listener
    if (timeIsUp && !playerOneBuzzed && !playerTwoBuzzed && !showAnswer && !showAnswerInput) {
      document.addEventListener('keydown', handleEnterForShowAnswer);
    }

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleEnterForShowAnswer);
    };
  }, [timeIsUp, playerOneBuzzed, playerTwoBuzzed, showAnswer, showAnswerInput, restoreFirstPlayerEvaluation]);

  // Auto-show answer screen when time runs out and second player didn't buzz
  // This happens after first player got it wrong and second player's time expired
  useEffect(() => {
    if (timeIsUp && !playerOneBuzzed && !playerTwoBuzzed && !showAnswer && !showAnswerInput && firstPlayerAttempt && !isDailyDouble && firstPlayerEvaluation) {
      // First player attempted and got it wrong, second player didn't buzz in, time is up
      // Restore the first player's evaluation and show the answer screen
      const timer = setTimeout(() => {
        console.log('⏰ Auto-showing answer screen: first player missed, second player did not attempt');
        
        // Restore first player's evaluation
        restoreFirstPlayerEvaluation();
        
        setShowAnswer(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [timeIsUp, playerOneBuzzed, playerTwoBuzzed, showAnswer, showAnswerInput, firstPlayerAttempt, isDailyDouble, firstPlayerEvaluation, restoreFirstPlayerEvaluation]);

  // Handle timeout when player doesn't answer in time
  const handleTimeoutAnswer = useCallback(() => {
    const currentPlayer = playerOneBuzzed ? playerOneName : playerTwoName;
    const currentAnswer = playerOneBuzzed ? playerOneAnswer : playerTwoAnswer;
    
    // Mark as incorrect due to timeout
    setIsEvaluating(true);
    setSubmittedAnswer(currentAnswer || '(No answer provided)');
    
    const timeoutResult = {
      isCorrect: false,
      explanation: 'Time expired',
      score: 0
    };
    
    setEvaluationResult(timeoutResult);
    setIsEvaluating(false);
    
    // Calculate and store score change (negative)
    const pointValue = (index + 1) * jeopardyRound;
    const scoreChangeValue = -pointValue;
    setScoreChange(scoreChangeValue);
    
    // Track category performance as incorrect
    if (playerOneBuzzed && trackPlayerCategoryPerformance && gameOptions?.mode === 'cpu') {
      trackPlayerCategoryPerformance(clue.category, false);
    }
    
    if (playerTwoBuzzed && trackPlayerCategoryPerformance && gameOptions?.mode === 'two-player') {
      trackPlayerCategoryPerformance(clue.category, false);
    }
    
    // Mark this player as having attempted
    const currentPlayerKey = playerOneBuzzed ? 'playerOne' : 'playerTwo';
    setPlayersWhoAttempted(prev => [...prev, currentPlayerKey]);
    
    // Follow same logic as incorrect answer in handleSubmitAnswer
    // If it's NOT a Daily Double or Final Jeopardy, allow the other player to buzz in
    if (!isDailyDouble && !isFinalJeopardy) {
      // Check if the other player hasn't attempted yet
      const otherPlayerKey = playerOneBuzzed ? 'playerTwo' : 'playerOne';
      const otherPlayerAlreadyAttempted = playersWhoAttempted.includes(otherPlayerKey);
      
      if (!otherPlayerAlreadyAttempted) {
        // Store the first player's attempt for display on answer screen later
        setFirstPlayerAttempt({
          player: currentPlayer,
          answer: currentAnswer || '(timeout)',
          wasCorrect: false
        });
        
        // Lock out the current player and unlock the other player
        if (playerOneBuzzed) {
          setPlayerOneLockedOut(true);
          setPlayerTwoLockedOut(false); // Explicitly unlock Player 2
          // Clear lockout after 0.25 seconds
          const lockoutTimeout = setTimeout(() => {
            setPlayerOneLockedOut(false);
          }, 250);
          timeoutIdsRef.current.push(lockoutTimeout);
        } else {
          setPlayerTwoLockedOut(true);
          setPlayerOneLockedOut(false); // Explicitly unlock Player 1
          // Clear lockout after 0.25 seconds
          const lockoutTimeout = setTimeout(() => {
            setPlayerTwoLockedOut(false);
          }, 250);
          timeoutIdsRef.current.push(lockoutTimeout);
        }
        
        // Reset for next attempt
        setShowAnswerInput(false);
        setPlayerOneBuzzed(false);
        setPlayerTwoBuzzed(false);
        setPlayerOneAnswer('');
        setPlayerTwoAnswer('');
        setIsEvaluating(false);
        setEvaluationResult(null);
        setSubmittedAnswer('');
        setScoreChange(0);
        
        // Keep the question visible, reset timer, and reactivate buzzer
        setTimeIsUp(false);
        setBuzzerActive(true);
        
        // Set a timeout for the second player (5 seconds)
        const timeoutId = setTimeout(() => {
          setBuzzerActive(false);
          setTimeIsUp(true);
        }, 5000);
        timeoutIdsRef.current.push(timeoutId);
        
        return; // Don't go to answer screen yet
      }
    }
    
    // If we get here, go to answer screen (Daily Double, Final Jeopardy, or both players attempted)
    setShowAnswer(true);
    setShowAnswerInput(false);
  }, [
    playerOneBuzzed, 
    playerTwoBuzzed, 
    playerOneName, 
    playerTwoName, 
    playerOneAnswer, 
    playerTwoAnswer, 
    index, 
    jeopardyRound, 
    trackPlayerCategoryPerformance, 
    gameOptions?.mode, 
    clue.category,
    playersWhoAttempted,
    isDailyDouble,
    isFinalJeopardy
  ]);

  // Answer timer: enforce 15 seconds total to submit
  // Skip timer for CPU players - they have their own timing logic
  useEffect(() => {
    // Don't set timer for CPU player
    const isCPUAnswering = gameOptions?.mode === 'cpu' && playerTwoBuzzed;
    
    if (showAnswerInput && (playerOneBuzzed || playerTwoBuzzed) && !timerInitializedRef.current && !isCPUAnswering) {
      // Mark timer as initialized for this attempt
      timerInitializedRef.current = true;
      
      setAnswerTimeRemaining(15);

      // Start countdown
      const countdownInterval = setInterval(() => {
        setAnswerTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Timer to auto-submit after 15 seconds total
      const totalTimer = setTimeout(() => {
        if (!isEvaluating) {
          // Time's up - auto-submit whatever they have
          console.log('15 seconds elapsed - auto-submitting answer');
          clearInterval(countdownInterval);
          handleTimeoutAnswer();
        }
      }, 15000);

      answerTimerRef.current = { countdownInterval, totalTimer };

      // Only clean up if showAnswerInput becomes false
      return () => {
        // Don't cleanup if timer is still supposed to be running
        if (!showAnswerInput || !timerInitializedRef.current) {
          if (answerTimerRef.current) {
            clearInterval(answerTimerRef.current.countdownInterval);
            clearTimeout(answerTimerRef.current.totalTimer);
          }
        }
      };
    }
    
    if (!showAnswerInput) {
      // Reset when input is hidden - ready for next attempt
      setAnswerTimeRemaining(null);
      timerInitializedRef.current = false;
      
      // Clear timers
      if (answerTimerRef.current) {
        clearInterval(answerTimerRef.current.countdownInterval);
        clearTimeout(answerTimerRef.current.totalTimer);
        answerTimerRef.current = null;
      }
    }
  }, [showAnswerInput, playerOneBuzzed, playerTwoBuzzed]);

  useGamepads(gamepads => setGamepads(gamepads));
  const msg = new SpeechSynthesisUtterance();

  // Cleanup function to clear all timers and stop audio
  const cleanupAudioAndTimers = useCallback(() => {
    // Clear all pending timeouts
    timeoutIdsRef.current.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    timeoutIdsRef.current = [];

    // Stop and cleanup current audio
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current.removeEventListener('ended', () => {});
      } catch (error) {
        console.error('Error cleaning up audio:', error);
      }
      currentAudioRef.current = null;
    }
  }, [clue.id]);

  // Component mount/unmount tracking
  useEffect(() => {
    return () => {
      cleanupAudioAndTimers();
    };
  }, [cleanupAudioAndTimers]);

  // Initialize theme music - ONLY for Final Jeopardy or game setup, NOT for regular questions
  useEffect(() => {
    // Only create audio for Final Jeopardy or game setup screens
    if (!isFinalJeopardy && !isGameSetup) {
      return; // Don't create audio for regular question tiles
    }
    
    const music = new Audio(isGameSetup 
      ? `${process.env.PUBLIC_URL}/audio/jeopardy-opening-credits-song.mp3` 
      : `${process.env.PUBLIC_URL}/audio/jeopardy-theme.mp3`
    );
    music.loop = true;
    
    // Add error handling
    music.addEventListener('error', (e) => {
      console.error('Error loading theme music:', e);
      setIsThemePlaying(false);
    });
    
    setThemeMusic(music);

    return () => {
      if (music) {
        music.pause();
        music.currentTime = 0;
        music.src = '';
        music.load(); // Force cleanup
      }
    };
  }, [isFinalJeopardy, isGameSetup]);

  // Play theme music during Final Jeopardy think time or game setup
  useEffect(() => {
    if ((isFinalJeopardy && showQuestion && !showAnswer) || isGameSetup) {
      if (themeMusic && !isThemePlaying) {
        themeMusic.play().catch(error => {
          console.error('Error playing theme music:', error);
          setIsThemePlaying(false);
        });
        setIsThemePlaying(true);
      }
    } else if (themeMusic && isThemePlaying) {
      themeMusic.pause();
      themeMusic.currentTime = 0;
      setIsThemePlaying(false);
    }
  }, [isFinalJeopardy, showQuestion, showAnswer, themeMusic, isThemePlaying, isGameSetup]);

  // Function to play theme music
  const playThemeMusic = () => {
    if (themeMusic && !isThemePlaying) {
      themeMusic.play();
      setIsThemePlaying(true);
    }
  };

  // Function to stop theme music
  const stopThemeMusic = () => {
    if (themeMusic && isThemePlaying) {
      themeMusic.pause();
      themeMusic.currentTime = 0;
      setIsThemePlaying(false);
    }
  };

  // Add theme music controls to the UI
  const renderThemeMusicControls = () => {
    // Only show controls during game setup or Final Jeopardy
    if (isGameSetup || (isFinalJeopardy && showQuestion && !showAnswer)) {
      return (
        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
          <Button
            variant="contained"
            color={isThemePlaying ? 'secondary' : 'primary'}
            onClick={isThemePlaying ? stopThemeMusic : playThemeMusic}
            sx={{ backgroundColor: '#fff', color: '#000' }}
          >
            {isThemePlaying ? 'Stop Theme' : 'Play Theme'}
          </Button>
        </Box>
      );
    }
    return null;
  };

  const checkBuzzer = () => {
    setBuzzerActive(false);
  }

  const speechHandler = async (msg, text, volume = 1) => {
    // console.log('=== Question Reading Start ===');
    
    // Clean up any previous audio/timers before starting new one
    cleanupAudioAndTimers();
    
    try {
      // Only generate new audio if we don't have it cached
      if (!audioUrl) {
        // console.log('Calling Amazon Polly...');
        const newAudioUrl = await synthesizeSpeech(text, selectedVoice);
        // console.log('Polly URL received:', newAudioUrl);
        
        // Create a new Audio object and wait for it to load
        const audio = new Audio();
        currentAudioRef.current = audio; // Track the audio object
        
        // Wait for the audio to be loaded before playing
        await new Promise((resolve, reject) => {
          const handleCanPlay = () => {
            audio.removeEventListener('canplaythrough', handleCanPlay);
            audio.removeEventListener('error', handleError);
            resolve();
          };
          
          const handleError = (error) => {
            audio.removeEventListener('canplaythrough', handleCanPlay);
            audio.removeEventListener('error', handleError);
            console.error('Audio loading error:', error);
            reject(new Error(`Failed to load audio: ${error.type}`));
          };
          
          audio.addEventListener('canplaythrough', handleCanPlay);
          audio.addEventListener('error', handleError);
          
          // Set the source after adding event listeners
          audio.src = newAudioUrl;
          audio.volume = volume;
          
          // Add a timeout to handle cases where the audio never loads
          const loadTimeoutId = setTimeout(() => {
            if (!audio.readyState) {
              handleError(new Error('Audio loading timeout'));
            }
          }, 5000);
          timeoutIdsRef.current.push(loadTimeoutId);
          
          audio.load();
        });
        
        // Set the URL in state after we've confirmed it works        
        setAudioUrl(newAudioUrl);
        
        audio.addEventListener('ended', () => {
          // console.log('=== Question Reading Complete ===');
          // Record the time when question audio ends (for response time tracking)
          setQuestionEndTime(Date.now());
          
          if (!isDailyDouble) {
            setBuzzerActive(true);
            const timeoutId = setTimeout(() => {
              checkBuzzer();
              setTimeIsUp(true);
              // console.log('Time is up for regular question');
            }, 5000);
            timeoutIdsRef.current.push(timeoutId);
          }
          if (isDailyDouble) {
            setBuzzerActive(true);
            const timeoutId = setTimeout(() => {
              setBuzzerActive(false);
              setTimeIsUp(true);
              // console.log('Time is up for Daily Double');
            }, 10000);
            timeoutIdsRef.current.push(timeoutId);
          }
        });

        // Clean up any previous audio
        const synth = window.speechSynthesis;
        synth.cancel();
        
        await audio.play();
      } else {
        // If we already have the URL, create a new Audio object and wait for it to load
        const audio = new Audio();
        currentAudioRef.current = audio; // Track the audio object
        
        // Wait for the audio to be loaded before playing
        await new Promise((resolve, reject) => {
          const handleCanPlay = () => {
            audio.removeEventListener('canplaythrough', handleCanPlay);
            audio.removeEventListener('error', handleError);
            resolve();
          };
          
          const handleError = (error) => {
            audio.removeEventListener('canplaythrough', handleCanPlay);
            audio.removeEventListener('error', handleError);
            console.error('Audio loading error:', error);
            reject(new Error(`Failed to load audio: ${error.type}`));
          };
          
          audio.addEventListener('canplaythrough', handleCanPlay);
          audio.addEventListener('error', handleError);
          
          // Set the source after adding event listeners
          audio.src = audioUrl;
          audio.volume = volume;
          
          // Add a timeout to handle cases where the audio never loads
          const loadTimeoutId = setTimeout(() => {
            if (!audio.readyState) {
              handleError(new Error('Audio loading timeout'));
            }
          }, 5000);
          timeoutIdsRef.current.push(loadTimeoutId);
          
          audio.load();
        });
        
        audio.addEventListener('ended', () => {
          // console.log('=== Question Reading Complete ===');
          if (!isDailyDouble) {
            setBuzzerActive(true);
            const timeoutId = setTimeout(() => {
              checkBuzzer();
              setTimeIsUp(true);
              // console.log('Time is up for regular question');
            }, 5000);
            timeoutIdsRef.current.push(timeoutId);
          }
          if (isDailyDouble) {
            setBuzzerActive(true);
            const timeoutId = setTimeout(() => {
              setBuzzerActive(false);
              setTimeIsUp(true);
              // console.log('Time is up for Daily Double');
            }, 10000);
            timeoutIdsRef.current.push(timeoutId);
          }
        });

        // Clean up any previous audio
        const synth = window.speechSynthesis;
        synth.cancel();
        
        await audio.play();
      }
    } catch (error) {
      console.error('Error in speech synthesis:', error);
      // Clear the audio URL if there was an error
      setAudioUrl(null);
      throw error;
    }
  };

  // Clean up audio URL when component unmounts or when moving to a new question
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
    };
  }, [audioUrl]);

  function revealQuestion(clue) {
    cleanupAudioAndTimers();

    setTimeIsUp(false);
    setBuzzerActive(false);

    // Set metadata from the clue object
    setMetaData({
      air_date: clue.date || 'Unknown',
      season_id: clue.season || 'Unknown',
      episode_num: clue.game_id || 'Unknown'
    });

    if (isDailyDouble) {
      setShowQuestion(true);
      speechHandler(msg, clue.clue);
      
      // Don't automatically buzz in here - wait for audio to complete
      // The useEffect below will handle buzzing in after questionEndTime is set
    } else {
      setShowDailyDouble(false);
      setShowDollarValue(false);
      setShowQuestion(true);
      speechHandler(msg, clue.clue);
    }
  }

  // Auto-show answer input for Daily Doubles after audio completes
  useEffect(() => {
    if (isDailyDouble && questionEndTime && showQuestion && !showAnswerInput && !showAnswer) {
      console.log('🎤 Daily Double audio complete - showing answer input');
      
      // Automatically "buzz in" the player who has control of the board
      if (hasControlOfBoard === playerOneName) {
        setPlayerOneBuzzed(true);
        setShowAnswerInput(true);
      } else {
        setPlayerTwoBuzzed(true);
        setShowAnswerInput(true);
      }
    }
  }, [isDailyDouble, questionEndTime, showQuestion, showAnswerInput, showAnswer, hasControlOfBoard, playerOneName]);

  function closeQuestionBox() {
    console.log('🔴 closeQuestionBox called for clue:', clue.id);
    cleanupAudioAndTimers();

    updateAnswered(clue.id);
    console.log('🔴 updateAnswered called with:', clue.id);

    setShowAnswer(false);
    setShowQuestion(false);
    setPlayerOneBuzzed(false);
    setPlayerTwoBuzzed(false);
    setPlayerOneAnswer('');
    setPlayerTwoAnswer('');
    setShowAnswerInput(false);
    setEvaluationResult(null);
    setSubmittedAnswer('');
    setScoreChange(0);
    setPlayersWhoAttempted([]); // Reset for next question
    setFirstPlayerAttempt(null); // Reset first player attempt
    setPlayerOneLockedOut(false); // Reset lockouts
    setPlayerTwoLockedOut(false); // Reset lockouts
    clueCountdown();
  }

  // Mobile Buzzer Handler
  const handleMobileBuzzer = () => {
    // Only work if buzzer is active and player hasn't buzzed yet
    if (!buzzerActive || playerOneBuzzed || showAnswerInput) {
      return;
    }
    
    // Check if Player 1 has already attempted this question
    const alreadyAttempted = playersWhoAttempted.includes('playerOne');
    if (alreadyAttempted) {
      return;
    }
    
    console.log('Mobile buzzer pressed - Player 1');
    setPlayerOneBuzzed(true);
    setShowAnswerInput(true);
    setBuzzerActive(false);
    
    // Track response time for Player 1
    if (questionEndTime && trackPlayerResponseTime && gameOptions?.mode !== 'cpu') {
      const buzzerTime = Date.now();
      const responseTime = (buzzerTime - questionEndTime) / 1000;
      trackPlayerResponseTime(responseTime);
    }
  };

  const handleSubmitAnswer = async () => {
    const currentPlayer = playerOneBuzzed ? playerOneName : playerTwoName;
    const currentAnswer = playerOneBuzzed ? playerOneAnswer : playerTwoAnswer;
    
    if (!currentAnswer.trim()) {
      return; // Don't submit empty answers
    }

    // Clear answer timers
    if (answerTimerRef.current) {
      clearInterval(answerTimerRef.current.countdownInterval);
      clearTimeout(answerTimerRef.current.startTypingTimer);
      clearTimeout(answerTimerRef.current.totalTimer);
      answerTimerRef.current = null;
    }

    // console.log('=== SUBMIT ANSWER START ===');
    // console.log('Current Answer:', currentAnswer);
    
    setIsEvaluating(true);
    setSubmittedAnswer(currentAnswer); // Store the submitted answer
    
    try {
      const result = await evaluateAnswer(
        currentAnswer,
        clue.response,
        clue.category,
        clue.clue // Pass the clue text
      );
      
      // console.log('Evaluation Result:', result);
      
      setEvaluationResult(result);
      setIsEvaluating(false);
      
      // Calculate and store score change
      const pointValue = (index + 1) * jeopardyRound;
      const scoreChangeValue = result.isCorrect ? pointValue : -pointValue;
      setScoreChange(scoreChangeValue);
      
      // console.log('Score Change:', scoreChangeValue);
      
      // Track category performance for Player 1 (only in solo/cpu mode where Player 1 is the human)
      if (playerOneBuzzed && trackPlayerCategoryPerformance && gameOptions?.mode === 'cpu') {
        trackPlayerCategoryPerformance(clue.category, result.isCorrect);
      }
      
      // Track category performance for Player 2 in two-player mode
      if (playerTwoBuzzed && trackPlayerCategoryPerformance && gameOptions?.mode === 'two-player') {
        trackPlayerCategoryPerformance(clue.category, result.isCorrect);
      }
      
      // Mark this player as having attempted
      const currentPlayerKey = playerOneBuzzed ? 'playerOne' : 'playerTwo';
      setPlayersWhoAttempted(prev => [...prev, currentPlayerKey]);
      
      // NEW LOGIC: If answer is CORRECT, go to answer screen
      if (result.isCorrect) {
        // If both players attempted, restore first player's buzzed state for display
        if (firstPlayerAttempt && playersWhoAttempted.length > 0) {
          console.log('🔄 Restoring first player buzzed state before showing answer screen (correct answer)');
          if (firstPlayerAttempt.player === playerOneName) {
            setPlayerOneBuzzed(true);
          } else {
            setPlayerTwoBuzzed(true);
          }
        }
        
        // console.log('Answer is CORRECT - going to answer screen');
        setShowAnswer(true);
        setShowAnswerInput(false);
        return;
      }
      
      // If answer is INCORRECT and it's NOT a Daily Double or Final Jeopardy,
      // allow the other player to buzz in WITHOUT going to answer screen
      if (!result.isCorrect && !isDailyDouble && !isFinalJeopardy) {
        // Check if the other player hasn't attempted yet
        const otherPlayerKey = playerOneBuzzed ? 'playerTwo' : 'playerOne';
        const otherPlayerAlreadyAttempted = playersWhoAttempted.includes(otherPlayerKey);
        
        console.log('🔍 First player got it wrong:', {
          currentPlayer,
          otherPlayerKey,
          otherPlayerAlreadyAttempted,
          playersWhoAttempted
        });
        
        if (!otherPlayerAlreadyAttempted) {
          console.log('💾 Storing first player attempt and evaluation for later display');
          
          // Store the first player's attempt for display on answer screen later
          setFirstPlayerAttempt({
            player: currentPlayer,
            answer: currentAnswer,
            wasCorrect: false
          });
          
          // Store the first player's evaluation result
          setFirstPlayerEvaluation({
            result: result,
            submittedAnswer: currentAnswer,
            scoreChange: -pointValue
          });
          
          console.log('✅ Stored firstPlayerEvaluation:', {
            result,
            submittedAnswer: currentAnswer,
            scoreChange: -pointValue
          });
          
          // Lock out the current player and unlock the other player
          if (playerOneBuzzed) {
            setPlayerOneLockedOut(true);
            setPlayerTwoLockedOut(false); // Explicitly unlock Player 2
            // Clear lockout after 0.25 seconds
            const lockoutTimeout = setTimeout(() => {
              setPlayerOneLockedOut(false);
            }, 250);
            timeoutIdsRef.current.push(lockoutTimeout);
          } else {
            setPlayerTwoLockedOut(true);
            setPlayerOneLockedOut(false); // Explicitly unlock Player 1
            // Clear lockout after 0.25 seconds
            const lockoutTimeout = setTimeout(() => {
              setPlayerTwoLockedOut(false);
            }, 250);
            timeoutIdsRef.current.push(lockoutTimeout);
          }
          
          // Reset for next attempt
          setShowAnswerInput(false);
          setPlayerOneBuzzed(false);
          setPlayerTwoBuzzed(false);
          setPlayerOneAnswer('');
          setPlayerTwoAnswer('');
          setIsEvaluating(false);
          setEvaluationResult(null); // Clear evaluation result for second attempt
          setSubmittedAnswer(''); // Clear submitted answer for second attempt
          setScoreChange(0); // Clear score change for second attempt
          
          // Keep the question visible, reset timer, and reactivate buzzer
          setTimeIsUp(false);
          setBuzzerActive(true);
          
          // Set a timeout for the second player (5 seconds)
          const timeoutId = setTimeout(() => {
            setBuzzerActive(false);
            setTimeIsUp(true);
            // console.log('Time is up for second player');
          }, 5000);
          timeoutIdsRef.current.push(timeoutId);
          
          return; // Don't go to answer screen yet
        }
      }
      
      // If we get here, either:
      // - Answer was incorrect and it's a Daily Double/Final Jeopardy
      // - Answer was incorrect and both players have attempted
      // - Answer was incorrect and time ran out
      // In all cases, go to answer screen
      
      // If both players attempted, restore first player's buzzed state for display
      if (firstPlayerAttempt && playersWhoAttempted.length > 0) {
        console.log('🔄 Restoring first player buzzed state before showing answer screen');
        if (firstPlayerAttempt.player === playerOneName) {
          setPlayerOneBuzzed(true);
        } else {
          setPlayerTwoBuzzed(true);
        }
      }
      
      // console.log('Going to answer screen');
      setShowAnswer(true);
      setShowAnswerInput(false);
      
      // console.log('=== SUBMIT ANSWER END ===');
      
    } catch (error) {
      console.error('Error evaluating answer:', error);
      setIsEvaluating(false);
    }
  };

  const handleContinueToBoard = () => {
    console.log('🔵 handleContinueToBoard called');
    
    // Apply score changes based on what happened
    const pointValue = (index + 1) * jeopardyRound;
    
    // Determine if both players attempted or just one
    const bothPlayersAttempted = firstPlayerAttempt && playerOneBuzzed && playerTwoBuzzed;
    
    if (bothPlayersAttempted) {
      // BOTH players attempted - apply both score changes
      console.log('🔵 Both players attempted - applying both score changes');
      
      // First player's score (from firstPlayerEvaluation)
      // Use the scoreChange from firstPlayerEvaluation (could be positive if challenge was successful)
      const firstPlayerScoreChange = firstPlayerEvaluation?.scoreChange || -pointValue;
      if (firstPlayerAttempt.player === playerOneName) {
        console.log(`🔵 First player was ${playerOneName} - applying ${firstPlayerScoreChange}`);
        changePlayerOneScore(firstPlayerScoreChange);
      } else {
        console.log(`🔵 First player was ${playerTwoName} - applying ${firstPlayerScoreChange}`);
        changePlayerTwoScore(firstPlayerScoreChange);
      }
      
      // Second player's score (from current evaluation) - apply to the OTHER player
      // The second player is whoever is NOT the first player
      if (firstPlayerAttempt.player === playerOneName) {
        // First player was player one, so second player is player two
        console.log(`🔵 Second player was ${playerTwoName} - applying ${scoreChange}`);
        changePlayerTwoScore(scoreChange);
      } else {
        // First player was player two, so second player is player one
        console.log(`🔵 Second player was ${playerOneName} - applying ${scoreChange}`);
        changePlayerOneScore(scoreChange);
      }
    } else {
      // ONLY one player attempted - apply score change only once
      console.log('🔵 Only one player attempted - applying single score change');
      
      // Use the score change from firstPlayerEvaluation (if available) or evaluationResult (which may have been updated by a challenge)
      // When a single player attempts, their result is stored in firstPlayerEvaluation
      const finalScoreChange = firstPlayerEvaluation?.scoreChange || evaluationResult?.scoreChange || scoreChange;
      console.log(`🔵 Using score change: ${finalScoreChange} (from ${firstPlayerEvaluation?.scoreChange ? 'firstPlayerEvaluation' : evaluationResult?.scoreChange ? 'evaluationResult' : 'original scoreChange'})`);
      
      if (playerOneBuzzed || playerTwoBuzzed) {
        if (playerOneBuzzed) {
          changePlayerOneScore(finalScoreChange);
        } else {
          changePlayerTwoScore(finalScoreChange);
        }
      }
    }
    
    console.log('🔵 Closing question box and marking as answered:', clue.id);
    // Close the question box (this calls updateAnswered)
    closeQuestionBox();
  };

  // Admin function to mark question as flawed
  const handleMarkAsFlawed = async () => {
    if (!userIsAdmin || !user) {
      console.warn('Only admins can mark questions as flawed');
      return;
    }

    try {
      const confirmed = window.confirm(
        `Mark this question as flawed?\n\nQuestion: ${clue.clue}\nAnswer: ${clue.response}\n\nThis will remove it from future games for all players.`
      );

      if (!confirmed) return;

      await markQuestionAsFlawed(
        {
          id: clue.id,
          category: clue.category,
          question: clue.clue,
          answer: clue.response,
          value: clue.value
        },
        user.email,
        'Admin marked as flawed during gameplay'
      );

      alert('Question marked as flawed and removed from future games.');
      console.log('✅ Question marked as flawed:', clue.id);
    } catch (error) {
      console.error('Error marking question as flawed:', error);
      alert('Failed to mark question as flawed. Check console for details.');
    }
  };

  // Challenge Ruling function - allows players to dispute incorrect rulings
  const handleOpenChallenge = (playerKey) => {
    setChallengingPlayer(playerKey);
    setShowChallengeModal(true);
    setChallengeReason('');
    setChallengeResult(null);
  };

  const handleCloseChallenge = () => {
    setShowChallengeModal(false);
    setChallengeReason('');
    setChallengeResult(null);
    setChallengingPlayer(null);
  };

  const handleSubmitChallenge = async () => {
    if (!challengeReason.trim()) {
      alert('Please provide a reason for your challenge.');
      return;
    }

    setIsEvaluatingChallenge(true);

    try {
      // Get the player's answer based on who is challenging
      let playerAnswer, playerName, pointValue;
      pointValue = (index + 1) * jeopardyRound;
      
      if (challengingPlayer === 'playerOne') {
        // If challenging player one's answer
        if (firstPlayerAttempt && firstPlayerAttempt.player === playerOneName) {
          // Player one was the first attempt
          playerAnswer = firstPlayerAttempt.answer;
          playerName = playerOneName;
        } else {
          // Player one was the second attempt (current evaluation)
          playerAnswer = submittedAnswer || playerOneAnswer;
          playerName = playerOneName;
        }
      } else {
        // If challenging player two's answer
        if (firstPlayerAttempt && firstPlayerAttempt.player === playerTwoName) {
          // Player two was the first attempt
          playerAnswer = firstPlayerAttempt.answer;
          playerName = playerTwoName;
        } else {
          // Player two was the second attempt (current evaluation)
          playerAnswer = submittedAnswer || playerTwoAnswer;
          playerName = playerTwoName;
        }
      }
      
      // Evaluate the challenge with OpenAI
      const result = await evaluateChallenge(
        playerAnswer,
        clue.response,
        clue.category,
        challengeReason
      );

      // Log the challenge
      logChallenge({
        questionId: clue.id,
        category: clue.category,
        question: clue.clue,
        correctAnswer: clue.response,
        playerAnswer: playerAnswer,
        challengeReason: challengeReason,
        shouldOverrule: result.shouldOverrule,
        aiExplanation: result.explanation,
        playerName: playerName
      });

      setChallengeResult(result);

      // If challenge is successful, update the evaluation result and score change
      // Don't adjust scores here - let handleContinueToBoard do it
      if (result.shouldOverrule) {
        console.log(`✅ Challenge successful for ${playerName} - updating evaluation result`);
        
        // Update the evaluation for the challenged player to show as correct
        if (challengingPlayer === 'playerOne' && firstPlayerAttempt && firstPlayerAttempt.player === playerOneName) {
          // Player one was first attempt - update firstPlayerEvaluation
          setFirstPlayerEvaluation({
            result: {
              isCorrect: true,
              explanation: `Challenge Successful: ${result.explanation}`,
              usedAI: true
            },
            submittedAnswer: playerAnswer,
            scoreChange: pointValue // Change from negative to positive
          });
        } else if (challengingPlayer === 'playerTwo' && firstPlayerAttempt && firstPlayerAttempt.player === playerTwoName) {
          // Player two was first attempt - update firstPlayerEvaluation
          setFirstPlayerEvaluation({
            result: {
              isCorrect: true,
              explanation: `Challenge Successful: ${result.explanation}`,
              usedAI: true
            },
            submittedAnswer: playerAnswer,
            scoreChange: pointValue // Change from negative to positive
          });
        } else {
          // Was the current evaluation - update evaluationResult
          setEvaluationResult({
            isCorrect: true,
            explanation: `Challenge Accepted: ${result.explanation}`,
            usedAI: true
          });
          setScoreChange(pointValue); // Change from negative to positive
        }
      }

    } catch (error) {
      console.error('Error evaluating challenge:', error);
      alert('Failed to evaluate challenge. Please try again.');
    } finally {
      setIsEvaluatingChallenge(false);
    }
  };

  // Add Enter key handler for answer screen (after evaluation)
  // This allows pressing Enter to continue after seeing the result
  useEffect(() => {
    const handleAnswerScreenEnter = (e) => {
      // Only trigger on Enter key when answer is showing and not typing in an input
      if (e.key === 'Enter' && showAnswer) {
        const isTypingInInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        
        if (!isTypingInInput) {
          e.preventDefault();
          
          // If there's an evaluation result, use handleContinueToBoard
          if (evaluationResult) {
            handleContinueToBoard();
          } 
          // Otherwise, handle the manual scoring buttons
          else if (timeIsUp && !playerOneBuzzed && !playerTwoBuzzed) {
            // "No One Rang In" or "Continue to Board" button
            if (firstPlayerAttempt) {
              const pointValue = (index + 1) * jeopardyRound;
              if (firstPlayerAttempt.player === playerOneName) {
                changePlayerOneScore(-pointValue);
              } else {
                changePlayerTwoScore(-pointValue);
              }
            } else {
              updateMissedQuestions(clue, 'No One');
            }
            closeQuestionBox();
          }
        }
      }
    };

    if (showAnswer) {
      document.addEventListener('keydown', handleAnswerScreenEnter);
      return () => {
        document.removeEventListener('keydown', handleAnswerScreenEnter);
      };
    }
  }, [showAnswer, evaluationResult, timeIsUp, playerOneBuzzed, playerTwoBuzzed, firstPlayerAttempt, playerOneName, scoreChange, index, jeopardyRound]);

  function changePlayerOneScore(value) {
    if (isDailyDouble) {
      // Convert dailyDoubleWager to number before math operations
      const wagerAmount = Number(dailyDoubleWager);
      if (value >= 0) {
        updatePlayerOneScore(wagerAmount);
      }
      if (value < 0) {
        updatePlayerOneScore(wagerAmount * -1);
      }
    }
    if (!isDailyDouble) {
      updatePlayerOneScore(value);
    }
    if (value > 0) {
      setHasControlOfBoard(playerOneName);
    }
    if (value < 0) {
      updateMissedQuestions(clue, playerOneName);
    }
  }

  function changePlayerTwoScore(value) {
    if (isDailyDouble) {
      // Convert dailyDoubleWager to number before math operations
      const wagerAmount = Number(dailyDoubleWager);
      if (value >= 0) {
        updatePlayerTwoScore(wagerAmount);
      }
      if (value < 0) {
        updatePlayerTwoScore(wagerAmount * -1);
      }
    }
    if (!isDailyDouble) {
      updatePlayerTwoScore(value);
    }
    if (value > 0) {
      setHasControlOfBoard(playerTwoName);
    }
    if (value < 0) {
      updateMissedQuestions(clue, playerTwoName);
    }

    setDailyDoubleWager(null);
  }

  useEffect(() => {
    // Load custom buzzer keys from localStorage, or use defaults
    const loadBuzzerKeys = () => {
      try {
        const saved = localStorage.getItem('jeopardy_buzzer_keys');
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            playerOne: parsed.playerOne || [
              { keyCode: 50, code: 'Digit2' },
              { code: 'ShiftLeft' }
            ],
            playerTwo: parsed.playerTwo || [
              { keyCode: 13, code: 'Enter' },
              { code: 'ShiftRight' }
            ]
          };
        }
      } catch (error) {
        console.error('Error loading buzzer keys:', error);
      }
      
      // Return defaults if no saved keys
      return {
        playerOne: [
          { keyCode: 50, code: 'Digit2' },
          { code: 'ShiftLeft' }
        ],
        playerTwo: [
          { keyCode: 13, code: 'Enter' },
          { code: 'ShiftRight' }
        ]
      };
    };

    const buzzerKeys = loadBuzzerKeys();
    const playerOneKeys = buzzerKeys.playerOne;
    const playerTwoKeys = buzzerKeys.playerTwo;
    
    const isPlayerOneKey = (e) => playerOneKeys.some(key => {
      // Prioritize 'code' for modern browsers (more specific)
      if (key.code && e.code) {
        return e.code === key.code;
      }
      // Fall back to keyCode if code is not available
      if (key.keyCode && e.keyCode) {
        return e.keyCode === key.keyCode;
      }
      return false;
    });
    
    const isPlayerTwoKey = (e) => playerTwoKeys.some(key => {
      // Prioritize 'code' for modern browsers (more specific)
      if (key.code && e.code) {
        return e.code === key.code;
      }
      // Fall back to keyCode if code is not available
      if (key.keyCode && e.keyCode) {
        return e.keyCode === key.keyCode;
      }
      return false;
    });

    const handleKeyPress = (e) => {
      // Check if user is typing in an input field
      const isTypingInInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      
      // Only prevent default behavior for buzzer keys when NOT typing in an input
      if ((isPlayerOneKey(e) || isPlayerTwoKey(e)) && !isTypingInInput) {
        e.preventDefault();
      }
      
      // Don't handle buzzer presses if user is typing in an input field
      if (isTypingInInput) {
        return;
      }
      
      // Log all key presses for debugging
      console.log('Key pressed:', {
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        isPlayerOne: isPlayerOneKey(e),
        isPlayerTwo: isPlayerTwoKey(e)
      });

      // Handle Player 1 buzzer
      if (isPlayerOneKey(e)) {
        console.log('Player 1 buzzer pressed');
        // Check if Player 1 has already attempted this question
        const alreadyAttempted = playersWhoAttempted.includes('playerOne');
        
        // Check for early buzz (before question is fully read)
        if (!buzzerActive && showQuestion && !alreadyAttempted && !showAnswerInput) {
          // Early buzz - lock out player for 0.25 seconds
          setPlayerOneLockedOut(true);
          const lockoutTimeout = setTimeout(() => {
            setPlayerOneLockedOut(false);
          }, 250);
          timeoutIdsRef.current.push(lockoutTimeout);
          return;
        }
        
        if (buzzerActive && !playerOneLockedOut && !showAnswerInput && !alreadyAttempted) {
          // Clear any existing timeouts (like the "time is up" timeout)
          cleanupAudioAndTimers();
          
          setPlayerOneBuzzed(true);
          setBuzzerActive(false);
          setShowAnswerInput(true);
          
          // Track response time for Player 1 (only if they're the human player)
          if (questionEndTime && trackPlayerResponseTime && gameOptions?.mode !== 'cpu') {
            const buzzerTime = Date.now();
            const responseTime = (buzzerTime - questionEndTime) / 1000; // Convert to seconds
            trackPlayerResponseTime(responseTime);
          }
        }
      }

      // Handle Player 2 buzzer
      if (isPlayerTwoKey(e)) {
        console.log('Player 2 buzzer pressed');
        // Check if Player 2 has already attempted this question
        const alreadyAttempted = playersWhoAttempted.includes('playerTwo');
        
        // Check for early buzz (before question is fully read)
        if (!buzzerActive && showQuestion && !alreadyAttempted && !showAnswerInput) {
          // Early buzz - lock out player for 0.25 seconds
          setPlayerTwoLockedOut(true);
          const lockoutTimeout = setTimeout(() => {
            setPlayerTwoLockedOut(false);
          }, 250);
          timeoutIdsRef.current.push(lockoutTimeout);
          return;
        }
        
        if (buzzerActive && !playerTwoLockedOut && !showAnswerInput && !alreadyAttempted) {
          // Clear any existing timeouts (like the "time is up" timeout)
          cleanupAudioAndTimers();
          
          setPlayerTwoBuzzed(true);
          setBuzzerActive(false);
          setShowAnswerInput(true);
          
          // Track response time for Player 2 (only if they're the human player - two player mode)
          if (questionEndTime && trackPlayerResponseTime && gameOptions?.mode === 'two-player') {
            const buzzerTime = Date.now();
            const responseTime = (buzzerTime - questionEndTime) / 1000; // Convert to seconds
            trackPlayerResponseTime(responseTime);
          }
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [buzzerActive, playerOneLockedOut, playerTwoLockedOut, playersWhoAttempted, showQuestion, showAnswerInput]); // Add dependencies for buzzer state

  // CPU Buzzing Logic
  useEffect(() => {
    // Only process CPU buzzing if:
    // 1. We're in CPU mode
    // 2. Buzzer is active
    // 3. No one has buzzed yet
    // 4. It's not a daily double (CPU handles those separately)
    // 5. CPU hasn't already attempted this question
    const cpuAlreadyAttempted = playersWhoAttempted.includes('playerTwo');
    
    if (
      gameOptions?.mode === 'cpu' && 
      buzzerActive && 
      !playerOneBuzzed && 
      !playerTwoBuzzed && 
      !showAnswerInput &&
      !isDailyDouble &&
      !cpuAlreadyAttempted
    ) {
      const cpuOpponent = gameOptions.cpuOpponent;
      const category = clue.category;
      const clueValue = clue.value || ((index + 1) * jeopardyRound);
      const currentRound = jeopardyRound === 200 ? 'Jeopardy' : 'Double Jeopardy';
      
      // Determine if CPU wants to buzz in
      const cpuDelay = cpuShouldAttemptAnswer(cpuOpponent, category, clueValue, currentRound, clue.topLevelCategory);
      
      if (cpuDelay !== null) {
        // CPU will buzz in after a delay
        const buzzerTimeout = setTimeout(() => {
          // Check if buzzer is still active (player didn't buzz first)
          if (buzzerActive && !showAnswerInput) {
            // console.log(`CPU (${playerTwoName}) buzzed in after ${cpuDelay}ms`);
            
            // Clear any existing timeouts (like the "time is up" timeout)
            cleanupAudioAndTimers();
            
            setPlayerTwoBuzzed(true);
            setBuzzerActive(false);
            setShowAnswerInput(true); // Show the input so we can see CPU typing
            
            // Don't track CPU response times - only track human player response times
          }
        }, cpuDelay);
        
        return () => clearTimeout(buzzerTimeout);
      }
    }
  }, [buzzerActive, gameOptions, playerOneBuzzed, playerTwoBuzzed, showAnswerInput, isDailyDouble, clue.category, playerTwoName, questionEndTime, trackPlayerResponseTime, playersWhoAttempted]);

  // CPU Answer Generation and Submission
  useEffect(() => {
    // CPU should auto-answer if:
    // 1. We're in CPU mode
    // 2. CPU has buzzed in (playerTwoBuzzed) OR it's a daily double and CPU has control
    // 3. Answer input is showing
    // 4. Not currently evaluating
    // 5. No result yet
    // 6. CPU hasn't started typing yet (playerTwoAnswer is empty)
    const shouldCPUAnswer = gameOptions?.mode === 'cpu' && 
                           ((playerTwoBuzzed && !playerOneBuzzed && showAnswerInput) || 
                            (isDailyDouble && hasControlOfBoard === playerTwoName && showQuestion)) &&
                           !isEvaluating &&
                           !evaluationResult &&
                           !playerTwoAnswer; // Only trigger if CPU hasn't started typing
    
    if (shouldCPUAnswer) {
      const cpuOpponent = gameOptions.cpuOpponent;
      
      // Brief pause before CPU starts typing (thinking time)
      const thinkingTime = 500 + Math.random() * 500; // 0.5-1 second
      
      const thinkTimeout = setTimeout(() => {
        // Determine if CPU gets the answer right based on their accuracy
        // Use difficulty-based accuracy calculation
        const clueValue = clue.value || ((index + 1) * jeopardyRound);
        const currentRound = jeopardyRound === 200 ? 'Jeopardy' : 'Double Jeopardy';
        const isCorrect = cpuShouldAnswerCorrectly(
          cpuOpponent, 
          clue.category, 
          clueValue, 
          currentRound,
          clue.topLevelCategory
        );
        
        // Generate the full answer
        let fullAnswer;
        if (isCorrect) {
          // CPU answers correctly - use the actual answer
          fullAnswer = clue.response;
        } else {
          // CPU answers incorrectly - generate a plausibly wrong answer
          // Create variations that won't match the correct answer
          const wrongAnswerStrategies = [
            'I don\'t know',
            'Pass',
            '',  // Empty answer (ran out of time)
            `${clue.response.split(' ')[0]} something`, // Partial answer
            'Um... I\'m not sure', // Uncertainty
            '(Sigh) Pass',
            'Oop. Nevermind',
            'What is... I don\'t know?',
            'What is... I shouldn\'t have rung in?',
            'What is... I have no idea?'
          ];
          
          // Pick a random wrong answer strategy
          fullAnswer = wrongAnswerStrategies[Math.floor(Math.random() * wrongAnswerStrategies.length)];
        }
        
        // Type the answer character by character
        let currentIndex = 0;
        const typingSpeed = 50 + Math.random() * 50; // 50-100ms per character
        
        const typeInterval = setInterval(() => {
          if (currentIndex <= fullAnswer.length) {
            setPlayerTwoAnswer(fullAnswer.substring(0, currentIndex));
            currentIndex++;
          } else {
            clearInterval(typeInterval);
            
            // After typing is complete, auto-submit after a brief pause
            setTimeout(async () => {
              setSubmittedAnswer(fullAnswer);
              setIsEvaluating(true);
              
              try {
                // Evaluate the answer
                const result = await evaluateAnswer(
                  fullAnswer,
                  clue.response,
                  clue.category,
                  clue.clue // Pass the clue text
                );
                
                // console.log('CPU Evaluation Result:', result);
                
                setEvaluationResult(result);
                setIsEvaluating(false);
                
                // Calculate score change
                const pointValue = (index + 1) * jeopardyRound;
                const scoreChangeValue = result.isCorrect ? pointValue : -pointValue;
                setScoreChange(scoreChangeValue);
                
                // Mark CPU (playerTwo) as having attempted
                setPlayersWhoAttempted(prev => [...prev, 'playerTwo']);
                
                // If answer is CORRECT, go to answer screen
                if (result.isCorrect) {
                  // If both players attempted, restore first player's buzzed state for display
                  if (firstPlayerAttempt && playersWhoAttempted.length > 0) {
                    console.log('🔄 Restoring first player buzzed state before showing answer screen (CPU correct)');
                    if (firstPlayerAttempt.player === playerOneName) {
                      setPlayerOneBuzzed(true);
                    } else {
                      setPlayerTwoBuzzed(true);
                    }
                  }
                  
                  // console.log('CPU answer is CORRECT - going to answer screen');
                  setShowAnswer(true);
                  setShowAnswerInput(false);
                  return;
                }
                
                // If answer is INCORRECT and it's NOT a Daily Double or Final Jeopardy,
                // allow the human player to buzz in WITHOUT going to answer screen
                if (!result.isCorrect && !isDailyDouble && !isFinalJeopardy) {
                  // Check if the human player (playerOne) hasn't attempted yet
                  const humanAlreadyAttempted = playersWhoAttempted.includes('playerOne');
                  
                  if (!humanAlreadyAttempted) {
                    // console.log('CPU answer INCORRECT - locking out CPU and reopening buzzer for human player');
                    
                    // Store the CPU's attempt for display on answer screen later
                    setFirstPlayerAttempt({
                      player: playerTwoName,
                      answer: fullAnswer,
                      wasCorrect: false
                    });
                    
                    // Lock out the CPU and unlock the human player
                    setPlayerTwoLockedOut(true);
                    setPlayerOneLockedOut(false); // Explicitly unlock Player 1 (human)
                    // Clear lockout after 0.25 seconds
                    const lockoutTimeout = setTimeout(() => {
                      setPlayerTwoLockedOut(false);
                    }, 250);
                    timeoutIdsRef.current.push(lockoutTimeout);
                    
                    // Reset for human player's attempt
                    setShowAnswerInput(false);
                    setPlayerOneBuzzed(false);
                    setPlayerTwoBuzzed(false);
                    setPlayerOneAnswer('');
                    setPlayerTwoAnswer('');
                    setIsEvaluating(false);
                    setEvaluationResult(null); // Clear evaluation result for second attempt
                    setSubmittedAnswer(''); // Clear submitted answer for second attempt
                    setScoreChange(0); // Clear score change for second attempt
                    
                    // Keep the question visible, reset timer, and reactivate buzzer
                    setTimeIsUp(false);
                    setBuzzerActive(true);
                    
                    // Set a timeout for the human player (5 seconds)
                    const timeoutId = setTimeout(() => {
                      setBuzzerActive(false);
                      setTimeIsUp(true);
                      // console.log('Time is up for human player');
                    }, 5000);
                    timeoutIdsRef.current.push(timeoutId);
                    
                    return; // Don't go to answer screen yet
                  }
                }
                
                // If we get here, either:
                // - Answer was incorrect and it's a Daily Double/Final Jeopardy
                // - Answer was incorrect and human player already attempted
                // In all cases, go to answer screen
                
                // If both players attempted, restore first player's buzzed state for display
                if (firstPlayerAttempt && playersWhoAttempted.length > 0) {
                  console.log('🔄 Restoring first player buzzed state before showing answer screen (CPU mode)');
                  if (firstPlayerAttempt.player === playerOneName) {
                    setPlayerOneBuzzed(true);
                  } else {
                    setPlayerTwoBuzzed(true);
                  }
                }
                
                // console.log('Going to answer screen after CPU attempt');
                setShowAnswer(true);
                setShowAnswerInput(false);
              } catch (error) {
                console.error('Error evaluating CPU answer:', error);
                setIsEvaluating(false);
              }
            }, 500); // Brief pause after typing before submission
          }
        }, typingSpeed);
      }, thinkingTime);
      
      return () => clearTimeout(thinkTimeout);
    }
  }, [playerTwoBuzzed, playerOneBuzzed, showAnswerInput, gameOptions, isEvaluating, evaluationResult, playerTwoAnswer, clue.response, clue.category, index, jeopardyRound, isDailyDouble, hasControlOfBoard, playerTwoName, showQuestion]);

  // CPU Daily Double auto-wager
  useEffect(() => {
    if (
      gameOptions?.mode === 'cpu' &&
      showDailyDouble &&
      hasControlOfBoard === playerTwoName &&
      !dailyDoubleWager
    ) {
      // CPU automatically makes a wager based on their strategy
      const cpuOpponent = gameOptions.cpuOpponent;
      const currentScore = playerTwoScore;
      const clueValue = (index + 1) * jeopardyRound;
      
      const cpuWager = calculateCPUDailyDoubleBet(cpuOpponent, currentScore, clueValue);
      
      // console.log(`CPU (${playerTwoName}) wagering $${cpuWager} on Daily Double`);
      
      // Set the wager after a short delay to make it feel more natural
      setTimeout(() => {
        setDailyDoubleWager(cpuWager);
        // Auto-reveal the clue after another short delay
        setTimeout(() => {
          revealQuestion(clue);
        }, 1500);
      }, 2000);
    }
  }, [showDailyDouble, gameOptions, hasControlOfBoard, playerTwoName, dailyDoubleWager, playerTwoScore, index, jeopardyRound, clue]);

  const enableDailyDouble = () => {
    setShowDailyDouble(true);
  }

  const checkForDailyDoubles = (clue) => {
    if (isDailyDouble) {
      // Show the full-screen Daily Double reveal first
      setShowDailyDoubleReveal(true);
      
      // Play Daily Double audio
      const ddAudio = new Audio(`${process.env.PUBLIC_URL}/audio/daily-double.mp3`);
      ddAudio.play().catch(error => {
        console.error('DD audio playback failed:', error);
      });
      
      // After audio/animation, show the wager screen
      setTimeout(() => {
        setShowDailyDoubleReveal(false);
        enableDailyDouble();
      }, 3000); // 3 seconds for the reveal
    } 
    else {
      revealQuestion(clue);
    }
  }

  return (
    <>
      {renderThemeMusicControls()}
      
      {/* Full-screen Daily Double Reveal */}
      {showDailyDoubleReveal && (
        <DailyDoubleRevealScreen>
          <Typography
            sx={{
              color: 'white',
              fontSize: { xs: '4.8rem', sm: '7.2rem', md: '12rem' },
              fontWeight: 900,
              textAlign: 'center',
              textTransform: 'uppercase',
              lineHeight: 1.2,
              textShadow: '0 8px 16px rgba(0,0,0,0.5)',
            }}
          >
            Daily
            <br />
            Double
          </Typography>
        </DailyDoubleRevealScreen>
      )}
      
      <ValueWrapper 
        onClick={() => {
          if (!answered.includes(clue.id)) {
            // If CPU has control, only allow clicking on the CPU-selected clue
            const cpuHasControl = gameOptions?.mode === 'cpu' && hasControlOfBoard === playerTwoName;
            if (cpuHasControl && cpuSelectedClueId && cpuSelectedClueId !== clue.id) {
              // CPU has control and this is NOT the selected clue - ignore click
              return;
            }
            
            checkForDailyDoubles(clue);
            // Clear the CPU selection highlight when clicked
            if (cpuSelectedClueId === clue.id) {
              onCpuClueOpened?.();
            }
          }
        }}
        sx={{
          cursor: (() => {
            if (answered.includes(clue.id)) return 'default';
            // If CPU has control and this is not the selected clue, show not-allowed cursor
            const cpuHasControl = gameOptions?.mode === 'cpu' && hasControlOfBoard === playerTwoName;
            if (cpuHasControl && cpuSelectedClueId && cpuSelectedClueId !== clue.id) {
              return 'not-allowed';
            }
            return 'pointer';
          })(),
          pointerEvents: answered.includes(clue.id) ? 'none' : 'auto',
          // Dim non-selected clues when CPU has control
          opacity: (() => {
            if (answered.includes(clue.id)) return 1;
            const cpuHasControl = gameOptions?.mode === 'cpu' && hasControlOfBoard === playerTwoName;
            if (cpuHasControl && cpuSelectedClueId && cpuSelectedClueId !== clue.id) {
              return 0.4;
            }
            return 1;
          })(),
          // Highlight if CPU has selected this clue
          boxShadow: cpuSelectedClueId === clue.id && !answered.includes(clue.id) 
            ? '0 0 20px 5px #FFD700, inset 0 0 20px 5px rgba(255, 215, 0, 0.3)' 
            : 'none',
          border: cpuSelectedClueId === clue.id && !answered.includes(clue.id)
            ? '3px solid #FFD700 !important'
            : '3px solid black',
          animation: cpuSelectedClueId === clue.id && !answered.includes(clue.id)
            ? 'pulse 1.5s ease-in-out infinite'
            : 'none',
          '@keyframes pulse': {
            '0%, 100%': {
              boxShadow: '0 0 20px 5px #FFD700, inset 0 0 20px 5px rgba(255, 215, 0, 0.3)',
            },
            '50%': {
              boxShadow: '0 0 30px 10px #FFD700, inset 0 0 30px 10px rgba(255, 215, 0, 0.5)',
            }
          }
        }}
      >
        {showDollarValue && isValueRevealed && (
          <>
            <Typography
              className={answered.includes(clue.id) ? 'hide' : 'show'}
              variant="h4"
              sx={{
                color: '#e5984c',
                fontSize: { xs: '40px', sm: '50px', md: '69px' },
                fontWeight: 700,
            textShadow: '1px 2px 3px #000',
          }}
        >
          ${(index + 1) * jeopardyRound}
        </Typography>
      </>
    )}
    </ValueWrapper>

      {showDailyDouble && (() => {
        // Calculate maximum wager based on Jeopardy rules
        const currentPlayerScore = hasControlOfBoard === playerOneName ? playerOneScore : playerTwoScore;
        const otherPlayerScore = hasControlOfBoard === playerOneName ? playerTwoScore : playerOneScore;
        const otherPlayerName = hasControlOfBoard === playerOneName ? playerTwoName : playerOneName;
        const roundMaxValue = jeopardyRound === 200 ? 1000 : 2000; // $1000 for Jeopardy, $2000 for Double Jeopardy
        const maxWager = Math.max(currentPlayerScore, roundMaxValue);
        const minWager = 5; // Minimum wager of $5

        return (
          <QuestionWrapper>
            <Grid container >
              <Grid item sx={{ pl: 10, pr: 10 }} xs={12}>
                <Typography variant="h3" sx={{mb: 10}}>{hasControlOfBoard}, you found a Daily Double!</Typography>
                <Typography variant="h4" sx={{ mb: 6 }}>
                  <strong>Current Scores:</strong><br />
                  {hasControlOfBoard}: ${currentPlayerScore}<br />
                  {otherPlayerName}: ${otherPlayerScore}
                </Typography>
                <Typography variant="h4" sx={{ mb: 10 }}>
                  The category is:<br /> {clue.category}
                </Typography>
                <Typography variant="h5" sx={{ mb: 3 }}>
                  How much would you like to wager? (Min: ${minWager}, Max: ${maxWager})
                </Typography>
                <TextField
                  sx={{ backgroundColor: '#fff', fontSize: '30px', width: '250px' }}
                  variant="filled"
                  id="daily-double-wager"
                  label="Wager"
                  type="number"
                  placeholder="Enter your wager here."
                  value={dailyDoubleWager || ''}
                  inputProps={{
                    min: minWager,
                    max: maxWager,
                    step: 1
                  }}
                  onChange={(event) => {
                    const value = event.target.value;
                    // Allow empty or any numeric input while typing
                    // Validation happens on button enable/disable
                    if (value === '' || !isNaN(Number(value))) {
                      setDailyDoubleWager(value);
                    }
                  }}
                  error={dailyDoubleWager && dailyDoubleWager !== '' && (Number(dailyDoubleWager) < minWager || Number(dailyDoubleWager) > maxWager)}
                  helperText={dailyDoubleWager && dailyDoubleWager !== '' && (Number(dailyDoubleWager) < minWager || Number(dailyDoubleWager) > maxWager) 
                    ? `Wager must be between $${minWager} and $${maxWager}` 
                    : ''}
                />
              </Grid>
              <Grid item sx={{ pl: 10, pr: 10 }} xs={12}>
                {(dailyDoubleWager >= minWager && dailyDoubleWager <= maxWager) && 
                  <Button sx={{mt: 12}} variant="contained" onClick={() => revealQuestion(clue)}>
                    Reveal the clue.
                  </Button>
                }
              </Grid>
            </Grid>
          </QuestionWrapper>
        );
      })()}

{showQuestion && !showAnswer && (
    <QuestionWrapper>
      {/* Player Avatars and Scores */}
      <Box sx={{
        position: 'absolute',
        top: 20,
        left: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        {/* Player One Avatar */}
        <Box sx={{
          width: { xs: 60, sm: 70, md: 80 },
          height: { xs: 60, sm: 70, md: 80 },
          backgroundColor: '#1a1a2e',
          border: '3px solid #f5f5f5',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          mb: 1,
          position: 'relative',
        }}>
          {playerOneAvatar && (() => {
            // Check if avatar has custom accessories
            if (playerOneAvatar.customAccessories && playerOneAvatar.customAccessories.length > 0) {
              return (
                <AvatarWithAccessories
                  avatar={playerOneAvatar}
                  unlockedAccessories={playerOneAvatar.customAccessories}
                  achievements={[]}
                  size={60}
                  showEffects={false}
                />
              );
            }
            
            // Check if custom image
            const isCustomImage = playerOneAvatar.isCustom || playerOneAvatar.isDicebear || playerOneAvatar.dataUrl || 
              (playerOneAvatar.selectedImage && (
                playerOneAvatar.selectedImage.startsWith('http') || 
                playerOneAvatar.selectedImage.startsWith('/') ||
                playerOneAvatar.selectedImage.startsWith('data:')
              ));
            
            if (isCustomImage) {
              let imageSrc = playerOneAvatar.dataUrl || playerOneAvatar.selectedImage;
              if (playerOneAvatar.isDicebear) {
                imageSrc = playerOneAvatar.image || playerOneAvatar.selectedImage;
              } else if (playerOneAvatar.isCustom) {
                imageSrc = `${process.env.PUBLIC_URL}${playerOneAvatar.image}`;
              }
              return <img src={imageSrc} alt={playerOneName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
            }
            
            // Default emoji/text avatar
            return (
              <Box sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
                {playerOneAvatar.selectedImage || playerOneAvatar.image}
              </Box>
            );
          })()}
          
          {/* Lockout Indicator - Red light when player is locked out */}
          {playerOneLockedOut && (
            <Box sx={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: 12,
              height: 12,
              backgroundColor: '#ff0000',
              borderRadius: '50%',
              border: '1px solid #fff',
              boxShadow: '0 0 8px rgba(255, 0, 0, 0.8)',
              zIndex: 10,
            }} />
          )}
        </Box>
        {/* Player One Score */}
        <Typography sx={{
          color: '#FFFFFF',
          fontWeight: 'bold',
          fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          fontFamily: 'monospace',
        }}>
          {playerOneScore >= 0 ? '$' : '-$'}{Math.abs(playerOneScore).toLocaleString()}
        </Typography>
      </Box>

      {/* Player Two Avatar and Score */}
      {playerTwoName && (
        <Box sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          {/* Player Two Avatar */}
          <Box sx={{
            width: { xs: 60, sm: 70, md: 80 },
            height: { xs: 60, sm: 70, md: 80 },
            backgroundColor: '#1a1a2e',
            border: '3px solid #f5f5f5',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            mb: 1,
            position: 'relative',
          }}>
            {playerTwoAvatar && (() => {
              // Check if avatar has custom accessories
              if (playerTwoAvatar.customAccessories && playerTwoAvatar.customAccessories.length > 0) {
                return (
                  <AvatarWithAccessories
                    avatar={playerTwoAvatar}
                    unlockedAccessories={playerTwoAvatar.customAccessories}
                    achievements={[]}
                    size={60}
                    showEffects={false}
                  />
                );
              }
              
              // Check if custom image
              const isCustomImage = playerTwoAvatar.isCustom || playerTwoAvatar.isDicebear || playerTwoAvatar.dataUrl || 
                (playerTwoAvatar.selectedImage && (
                  playerTwoAvatar.selectedImage.startsWith('http') || 
                  playerTwoAvatar.selectedImage.startsWith('/') ||
                  playerTwoAvatar.selectedImage.startsWith('data:')
                ));
              
              if (isCustomImage) {
                let imageSrc = playerTwoAvatar.dataUrl || playerTwoAvatar.selectedImage;
                if (playerTwoAvatar.isDicebear) {
                  imageSrc = playerTwoAvatar.image || playerTwoAvatar.selectedImage;
                } else if (playerTwoAvatar.isCustom) {
                  imageSrc = `${process.env.PUBLIC_URL}${playerTwoAvatar.image}`;
                }
                return <img src={imageSrc} alt={playerTwoName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
              }
              
              // Default emoji/text avatar
              return (
                <Box sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
                  {playerTwoAvatar.selectedImage || playerTwoAvatar.image}
                </Box>
              );
            })()}
            
            {/* Lockout Indicator - Red light when player is locked out */}
            {playerTwoLockedOut && (
              <Box sx={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 12,
                height: 12,
                backgroundColor: '#ff0000',
                borderRadius: '50%',
                border: '1px solid #fff',
                boxShadow: '0 0 8px rgba(255, 0, 0, 0.8)',
                zIndex: 10,
              }} />
            )}
          </Box>
          {/* Player Two Score */}
          <Typography sx={{
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            fontFamily: 'monospace',
          }}>
            {playerTwoScore >= 0 ? '$' : '-$'}{Math.abs(playerTwoScore).toLocaleString()}
          </Typography>
        </Box>
      )}

      {timeIsUp && (
        <Typography variant="h4" sx={{ position: 'absolute', top: '100px', color: 'yellow' }}>Time Is Up!</Typography>
      )}
      
      {/* Show which players have already attempted (for multi-attempt questions) */}
      {!isDailyDouble && !isFinalJeopardy && playersWhoAttempted.length > 0 && (
        <Box sx={{ 
          position: 'absolute', 
          top: '150px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '10px 20px',
          borderRadius: '8px',
          zIndex: 1000
        }}>
          <Typography variant="body1" sx={{ color: '#c62828', fontWeight: 'bold' }}>
            Already Attempted: {playersWhoAttempted.map(p => p === 'playerOne' ? playerOneName : playerTwoName).join(', ')}
          </Typography>
        </Box>
      )}
      
      <TextWrapper>
        <Typography
          variant="h3"
          sx={{
            fontSize: '40px',
            textTransform: 'uppercase',
            position: 'absolute',
            top: 20,
            left: 0,
            width: '100%',
            textAlign: 'center',
          }}
        >
          {clue.category}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: { xs: '28px', sm: '40px', md: '60px' } }}>
          {clue.clue}
        </Typography>
        {showAnswerInput && (playerOneBuzzed || playerTwoBuzzed) && (
          <Box sx={{
            position: 'absolute',
            bottom: { xs: 80, sm: 120, md: 150 },
            left: '50%',
            transform: 'translateX(-50%)',
            width: { xs: '80%', sm: '60%', md: '50%' },
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: { xs: 2, sm: 3 },
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#0f258f', textAlign: 'center' }}>
              {playerOneBuzzed ? playerOneName : playerTwoName}, what is your answer?
            </Typography>
            {answerTimeRemaining !== null && (
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 2, 
                  color: answerTimeRemaining <= 5 ? '#d32f2f' : '#666', 
                  textAlign: 'center',
                  fontWeight: answerTimeRemaining <= 5 ? 700 : 400,
                  fontSize: answerTimeRemaining <= 5 ? '1.1rem' : '0.9rem'
                }}
              >
                Time remaining: {answerTimeRemaining}s
              </Typography>
            )}
            {showAnswerInput && (
              <Typography
                variant="caption"
                sx={{
                  mb: 1,
                  color: enterKeyEnabled ? '#4CAF50' : '#FFA726',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                {enterKeyEnabled ? '✓ Press Enter to submit' : '⏳ Enter enabled in a moment...'}
              </Typography>
            )}
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your answer here..."
              value={playerOneBuzzed ? playerOneAnswer : playerTwoAnswer}
              onChange={(e) => {
                if (playerOneBuzzed) {
                  setPlayerOneAnswer(e.target.value);
                } else {
                  // Don't allow manual input if CPU is player 2 and in CPU mode
                  if (gameOptions?.mode !== 'cpu') {
                    setPlayerTwoAnswer(e.target.value);
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && enterKeyEnabled && !isEvaluating) {
                  const currentAnswer = playerOneBuzzed ? playerOneAnswer : playerTwoAnswer;
                  if (currentAnswer.trim()) {
                    console.log('📝 Enter key pressed - submitting answer');
                    handleSubmitAnswer();
                  }
                }
              }}
              inputRef={answerInputRef} // Add ref for programmatic focus
              disabled={isEvaluating || (!playerOneBuzzed && playerTwoBuzzed && gameOptions?.mode === 'cpu')} // Disable only when evaluating or when CPU buzzed (but not when player one buzzed)
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#fff',
                }
              }}
            />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
              {/* Microphone button for speech-to-text */}
              {(playerOneBuzzed || gameOptions?.mode !== 'cpu') && (
                <IconButton
                  onClick={handleMicrophoneClick}
                  disabled={isEvaluating}
                  sx={{
                    backgroundColor: isListening ? '#f44336' : '#4CAF50',
                    color: 'white',
                    width: 56,
                    height: 56,
                    '&:hover': {
                      backgroundColor: isListening ? '#d32f2f' : '#45a049',
                    },
                    '&:disabled': {
                      backgroundColor: '#ccc',
                    },
                    animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none',
                    '@keyframes pulse': {
                      '0%, 100%': {
                        transform: 'scale(1)',
                        opacity: 1,
                      },
                      '50%': {
                        transform: 'scale(1.1)',
                        opacity: 0.8,
                      },
                    },
                  }}
                  title={isListening ? 'Stop recording' : 'Start voice input'}
                >
                  {isListening ? <MicOffIcon /> : <MicIcon />}
                </IconButton>
              )}
              
              {/* Only show submit button for human players */}
              {(playerOneBuzzed || gameOptions?.mode !== 'cpu') && (
                <Button
                  variant="contained"
                  onClick={handleSubmitAnswer}
                  disabled={isEvaluating || (playerOneBuzzed ? !playerOneAnswer.trim() : !playerTwoAnswer.trim())}
                  sx={{
                    backgroundColor: '#0f258f',
                    '&:hover': {
                      backgroundColor: '#0a1a6f',
                    },
                    minWidth: '140px',
                  }}
                >
                  {isEvaluating ? 'Checking...' : 'Submit Answer'}
                </Button>
              )}
            </Box>
          </Box>
        )}
        {!showAnswerInput && playerOneBuzzed && !showAnswer && (
          <Typography onClick={() => setShowAnswerInput(true)} className="player-rang" variant="h6">{timeIsUp ? 'Enter Answer' : 'Player One Rang In'}</Typography>
        )}
        {!showAnswerInput && playerTwoBuzzed && !showAnswer && (
          <Typography onClick={() => setShowAnswerInput(true)} className="player-rang" variant="h6">{timeIsUp ? 'Enter Answer' : 'Player Two Rang In'}</Typography>
        )}
        {timeIsUp && !playerOneBuzzed && !playerTwoBuzzed && !showAnswer && (
          <Typography 
            onClick={() => {
              console.log('👆 Show Answer clicked, restoring first player evaluation');
              // Restore first player's evaluation if exists
              const restored = restoreFirstPlayerEvaluation();
              console.log('Restoration result:', restored);
              
              // Show answer screen
              setShowAnswer(true);
            }} 
            className="player-rang" 
            variant="h6"
          >
            Show Answer
          </Typography>
        )}
        <Typography
          variant="body2"
          sx={{
            fontSize: { xs: '14px', sm: '16px', md: '18px' },
            textTransform: 'none',
            position: 'absolute',
            bottom: 20,
            left: 0,
            width: '100%',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: 1.6
          }}
        >
          {metaData && (
            <>
              <Typography component="span" sx={{ display: 'block', fontSize: 'inherit' }}>
                Air Date: {metaData.air_date} • Season {metaData.season_id} • Show #{metaData.episode_num}
              </Typography>
              {metaData.notes && metaData.notes !== '' && (
                <Typography component="span" sx={{ display: 'block', fontSize: 'inherit', fontStyle: 'italic', mt: 0.5 }}>
                  {metaData.notes}
                </Typography>
              )}
            </>
          )}
        </Typography>
      </TextWrapper>
      <Box className={buzzerActive ? 'go-lights left active' : 'go-lights left'} sx={{ top: '60px' }} />
      <Box className={buzzerActive ? 'go-lights left active' : 'go-lights left'} sx={{ top: '150px' }} />
      <Box className={buzzerActive ? 'go-lights left active' : 'go-lights left'} sx={{ top: '240px' }} />
      <Box className={buzzerActive ? 'go-lights left active' : 'go-lights left'} sx={{ top: '330px' }} />
      <Box className={buzzerActive ? 'go-lights left active' : 'go-lights left'} sx={{ top: '420px' }} />
      <Box className={buzzerActive ? 'go-lights left active' : 'go-lights left'} sx={{ top: '510px' }} />
      <Box className={buzzerActive ? 'go-lights left active' : 'go-lights left'} sx={{ top: '600px' }} />
      <Box className={buzzerActive ? 'go-lights left active' : 'go-lights left'} sx={{ top: '690px' }} />
      <Box className={buzzerActive ? 'go-lights left active' : 'go-lights left'} sx={{ top: '780px' }} />
      <Box className={buzzerActive ? 'go-lights left active' : 'go-lights left'} sx={{ top: '870px' }} />

      <Box className={buzzerActive ? 'go-lights right active' : 'go-lights right'} sx={{ top: '60px' }} />
      <Box className={buzzerActive ? 'go-lights right active' : 'go-lights right'} sx={{ top: '150px' }} />
      <Box className={buzzerActive ? 'go-lights right active' : 'go-lights right'} sx={{ top: '240px' }} />
      <Box className={buzzerActive ? 'go-lights right active' : 'go-lights right'} sx={{ top: '330px' }} />
      <Box className={buzzerActive ? 'go-lights right active' : 'go-lights right'} sx={{ top: '420px' }} />
      <Box className={buzzerActive ? 'go-lights right active' : 'go-lights right'} sx={{ top: '510px' }} />
      <Box className={buzzerActive ? 'go-lights right active' : 'go-lights right'} sx={{ top: '600px' }} />
      <Box className={buzzerActive ? 'go-lights right active' : 'go-lights right'} sx={{ top: '690px' }} />
      <Box className={buzzerActive ? 'go-lights right active' : 'go-lights right'} sx={{ top: '780px' }} />
      <Box className={buzzerActive ? 'go-lights right active' : 'go-lights right'} sx={{ top: '870px' }} />
      
      {/* Mobile Buzzer Button - Only visible on mobile/tablet */}
      {buzzerActive && !showAnswerInput && !playerOneBuzzed && (
        <MobileBuzzerButton
          onClick={handleMobileBuzzer}
          className={buzzerActive ? 'active' : ''}
          startIcon={<NotificationsActiveIcon />}
        >
          Buzz In
        </MobileBuzzerButton>
      )}
    </QuestionWrapper>
  )
}
{
  showAnswer && (
    <AnswerWrapper>
      {/* {console.log('=== RENDERING ANSWER WRAPPER ===', { showAnswer, evaluationResult, submittedAnswer, scoreChange })} */}
      <TextWrapper sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Category at the top */}
        <Typography
          variant="h3"
          sx={{
            fontSize: '40px',
            textTransform: 'uppercase',
            position: 'absolute',
            top: 20,
            left: 0,
            width: '100%',
            textAlign: 'center',
          }}
        >
          {clue.category}
        </Typography>
        {evaluationResult ? (
          // Show comprehensive results when answer was evaluated
          <Box sx={{ 
            width: { xs: '95%', sm: '90%', md: '85%' },
            minWidth: '600px',
            maxWidth: '1600px',
            textAlign: 'center'
          }}>
            {/* Check if both players attempted - must have firstPlayerEvaluation AND current player is different */}
            {firstPlayerEvaluation && firstPlayerAttempt && playerOneBuzzed && playerTwoBuzzed ? (
              // Both players attempted - show side by side
              <>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'white' }}>
                  Both Players Attempted
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  {/* First Player's Result */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{
                      p: 3,
                      backgroundColor: firstPlayerEvaluation.result.isCorrect ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 67, 54, 0.15)',
                      borderRadius: 3,
                      border: `3px solid ${firstPlayerEvaluation.result.isCorrect ? '#4caf50' : '#f44336'}`,
                      height: '100%'
                    }}>
                      <Typography variant="h5" sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        mb: 2
                      }}>
                        {firstPlayerAttempt.player}
                      </Typography>
                      
                      <Typography variant="h4" sx={{ 
                        color: firstPlayerEvaluation.result.isCorrect ? '#4caf50' : '#f44336', 
                        fontWeight: 'bold',
                        mb: 2,
                        fontSize: { xs: '1.5rem', sm: '2rem' }
                      }}>
                        {firstPlayerEvaluation.result.isCorrect ? '✓ CORRECT!' : '✗ INCORRECT'}
                      </Typography>
                      
                      <Typography variant="h5" sx={{ 
                        color: firstPlayerEvaluation.scoreChange > 0 ? '#4caf50' : '#f44336',
                        fontWeight: 'bold',
                        mb: 2
                      }}>
                        {firstPlayerEvaluation.scoreChange > 0 ? '+' : ''}{firstPlayerEvaluation.scoreChange > 0 ? '$' : '-$'}{Math.abs(firstPlayerEvaluation.scoreChange)}
                      </Typography>
                      
                      <Box sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                          Answer:
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#0f258f', fontWeight: 'bold' }}>
                          {firstPlayerAttempt.answer}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  {/* Second Player's Result */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{
                      p: 3,
                      backgroundColor: evaluationResult.isCorrect ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 67, 54, 0.15)',
                      borderRadius: 3,
                      border: `3px solid ${evaluationResult.isCorrect ? '#4caf50' : '#f44336'}`,
                      height: '100%'
                    }}>
                      <Typography variant="h5" sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        mb: 2
                      }}>
                        {firstPlayerAttempt.player === playerOneName ? playerTwoName : playerOneName}
                      </Typography>
                      
                      <Typography variant="h4" sx={{ 
                        color: evaluationResult.isCorrect ? '#4caf50' : '#f44336', 
                        fontWeight: 'bold',
                        mb: 2,
                        fontSize: { xs: '1.5rem', sm: '2rem' }
                      }}>
                        {evaluationResult.isCorrect ? '✓ CORRECT!' : '✗ INCORRECT'}
                      </Typography>
                      
                      <Typography variant="h5" sx={{ 
                        color: scoreChange > 0 ? '#4caf50' : '#f44336',
                        fontWeight: 'bold',
                        mb: 2
                      }}>
                        {scoreChange > 0 ? '+' : ''}{scoreChange > 0 ? '$' : '-$'}{Math.abs(scoreChange)}
                      </Typography>
                      
                      <Box sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                          Answer:
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#0f258f', fontWeight: 'bold' }}>
                          {submittedAnswer}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                
                {/* Correct Answer */}
                <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                    Correct Answer:
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    color: '#2e7d32', 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' }
                  }}>
                    What is {clue.response}?
                  </Typography>
                </Box>
              </>
            ) : (
              // Only one player attempted - show single result
              <>
                {/* Result Status */}
                <Box sx={{
                  mb: 3,
                  p: 3,
                  backgroundColor: evaluationResult.isCorrect ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 67, 54, 0.15)',
                  borderRadius: 3,
                  border: `3px solid ${evaluationResult.isCorrect ? '#4caf50' : '#f44336'}`
                }}>
                  <Typography variant="h3" sx={{ 
                    color: evaluationResult.isCorrect ? '#2e7d32' : '#c62828', 
                    fontWeight: 'bold',
                    mb: 2,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                  }}>
                    {evaluationResult.isCorrect ? '✓ CORRECT!' : '✗ INCORRECT'}
                  </Typography>
                  
                  {/* Score Change */}
                  <Typography variant="h4" sx={{ 
                    color: scoreChange > 0 ? '#2e7d32' : '#c62828',
                    fontWeight: 'bold',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                  }}>
                    {scoreChange > 0 ? '+' : ''}{scoreChange > 0 ? '$' : '-$'}{Math.abs(scoreChange)}
                  </Typography>
                </Box>

                {/* Your Answer */}
                <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ color: '#666', mb: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {playerOneBuzzed ? playerOneName : playerTwoName}'s Answer:
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    color: '#0f258f', 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' }
                  }}>
                    {submittedAnswer}
                  </Typography>
                </Box>

                {/* Correct Answer */}
                <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ color: '#666', mb: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    Correct Answer:
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    color: '#2e7d32', 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' }
                  }}>
                    What is {clue.response}?
                  </Typography>
                </Box>

                {/* Explanation */}
                {evaluationResult.explanation && (
                  <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 2 }}>
                    <Typography variant="body1" sx={{ color: '#333', fontStyle: 'italic' }}>
                      {evaluationResult.explanation}
                    </Typography>
                  </Box>
                )}
              </>
            )}

            {/* Continue Button */}
            <Button
              variant="contained"
              size="large"
              onClick={handleContinueToBoard}
              sx={{
                mt: 2,
                px: 6,
                py: 1.5,
                fontSize: { xs: '1rem', sm: '1.2rem' },
                backgroundColor: '#0f258f',
                '&:hover': {
                  backgroundColor: '#0a1a6f',
                },
              }}
            >
              Continue
            </Button>

            {/* Action Buttons Row - Challenge and Mark as Flawed */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* Challenge Ruling Buttons - One for each player who got it wrong */}
              
              {/* Challenge Button for Player One */}
              {((firstPlayerAttempt && firstPlayerAttempt.player === playerOneName && !firstPlayerAttempt.wasCorrect) ||
                (evaluationResult && !evaluationResult.isCorrect && playerOneBuzzed)) && (
                <Tooltip title={`Dispute ${playerOneName}'s ruling and request re-evaluation`}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenChallenge('playerOne')}
                    startIcon={<GavelIcon />}
                    sx={{
                      px: 3,
                      py: 1,
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      color: '#ff9800',
                      borderColor: '#ff9800',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        borderColor: '#f57c00',
                      },
                    }}
                  >
                    Challenge {playerOneName}'s Ruling
                  </Button>
                </Tooltip>
              )}
              
              {/* Challenge Button for Player Two */}
              {((firstPlayerAttempt && firstPlayerAttempt.player === playerTwoName && !firstPlayerAttempt.wasCorrect) ||
                (evaluationResult && !evaluationResult.isCorrect && playerTwoBuzzed)) && (
                <Tooltip title={`Dispute ${playerTwoName}'s ruling and request re-evaluation`}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenChallenge('playerTwo')}
                    startIcon={<GavelIcon />}
                    sx={{
                      px: 3,
                      py: 1,
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      color: '#2196f3',
                      borderColor: '#2196f3',
                      '&:hover': {
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        borderColor: '#1976d2',
                      },
                    }}
                  >
                    Challenge {playerTwoName}'s Ruling
                  </Button>
                </Tooltip>
              )}
            </Box>
          </Box>
        ) : (
          // Show normal answer display when no evaluation (manual mode)
          <>
            <Typography variant="body1" sx={{ fontSize: { xs: '32px', sm: '50px', md: '70px' } }}>
              What is {clue.response}?
            </Typography>
            {playerOneBuzzed && showAnswer && (
              <>
                <Button
                  color="success"
                  variant="outlined"
                  sx={{
                    position: 'absolute',
                    zIndex: 1000,
                    bottom: { xs: 60, sm: 100, md: 120 },
                    right: { xs: 20, sm: 50, md: 70 },
                    backgroundColor: '#fff',
                    minHeight: { xs: '48px', sm: '40px' },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  }}
                  onClick={() => {
                    changePlayerOneScore((index + 1) * jeopardyRound);
                    closeQuestionBox();
                  }}
                >
                  Correct Answer
                </Button>
                <Button
                  color="error"
                  variant="outlined"
                  sx={{
                    position: 'absolute',
                    zIndex: 1000,
                    bottom: { xs: 60, sm: 100, md: 120 },
                    left: { xs: 20, sm: 50, md: 70 },
                    backgroundColor: '#fff',
                    minHeight: { xs: '48px', sm: '40px' },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  }}
                  onClick={() => {
                    changePlayerOneScore(-(index + 1) * jeopardyRound);
                    closeQuestionBox();
                  }}
                >
                  Incorrect Answer
                </Button>
              </>
            )}
            {playerTwoBuzzed && showAnswer && (
              <>
                <Button
                  color="success"
                  variant="outlined"
                  sx={{
                    position: 'absolute',
                    zIndex: 1000,
                    bottom: { xs: 60, sm: 100, md: 120 },
                    right: { xs: 20, sm: 50, md: 70 },
                    backgroundColor: '#fff',
                    minHeight: { xs: '48px', sm: '40px' },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  }}
                  onClick={() => {
                    changePlayerTwoScore((index + 1) * jeopardyRound);
                    closeQuestionBox();
                  }}
                >
                  Correct Answer
                </Button>
                <Button
                  color="error"
                  variant="outlined"
                  sx={{
                    position: 'absolute',
                    zIndex: 1000,
                    bottom: { xs: 60, sm: 100, md: 120 },
                    left: { xs: 20, sm: 50, md: 70 },
                    backgroundColor: '#fff',
                    minHeight: { xs: '48px', sm: '40px' },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  }}
                  onClick={() => {
                    changePlayerTwoScore(-(index + 1) * jeopardyRound);
                    closeQuestionBox();
                  }}
                >
                  Incorrect Answer
                </Button>
              </>
            )}
            {timeIsUp && !playerOneBuzzed && !playerTwoBuzzed && (
              <Button
                color="primary"
                variant="outlined"
                sx={{
                  position: 'absolute',
                  zIndex: 1000,
                  bottom: { xs: 60, sm: 100, md: 120 },
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#fff',
                  minHeight: { xs: '48px', sm: '40px' },
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  '&:hover': {
                    borderColor: '#fff',
                    color: '#fff',
                    backgroundColor: 'transparent',
                  },
                }}
                onClick={() => {
                  // If there was a first player attempt, they got it wrong and should lose points
                  if (firstPlayerAttempt) {
                    const pointValue = (index + 1) * jeopardyRound;
                    if (firstPlayerAttempt.player === playerOneName) {
                      changePlayerOneScore(-pointValue);
                    } else {
                      changePlayerTwoScore(-pointValue);
                    }
                  } else {
                    // Nobody attempted at all
                    updateMissedQuestions(clue, 'No One');
                  }
                  closeQuestionBox();
                }}
              >
                {firstPlayerAttempt ? 'Continue' : 'No One Rang In'}
              </Button>
            )}
          </>
        )}
      </TextWrapper>
      
      {/* Admin Button - Mark Question as Flawed (Absolutely Positioned) */}
      {userIsAdmin && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        >
          <Tooltip title="Remove this question from future games for all players">
            <Button
              variant="outlined"
              size="small"
              onClick={handleMarkAsFlawed}
              startIcon={<ReportProblemIcon />}
              sx={{
                px: 3,
                py: 1,
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                color: '#d32f2f',
                borderColor: '#d32f2f',
                backgroundColor: 'rgba(15, 37, 143, 0.95)',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.2)',
                  borderColor: '#b71c1c',
                },
              }}
            >
              Mark Question as Flawed
            </Button>
          </Tooltip>
        </Box>
      )}
    </AnswerWrapper>
  )
}

      {/* Challenge Ruling Modal */}
      <Dialog 
        open={showChallengeModal} 
        onClose={handleCloseChallenge}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#0f258f', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GavelIcon />
            <Typography variant="h6">
              Challenge Ruling - {challengingPlayer === 'playerOne' ? playerOneName : playerTwoName}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Question:
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {clue.clue}
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Correct Answer:
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {clue.response}
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {challengingPlayer === 'playerOne' ? playerOneName : playerTwoName}'s Answer:
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {challengingPlayer === 'playerOne' 
                ? (firstPlayerAttempt && firstPlayerAttempt.player === playerOneName 
                    ? firstPlayerAttempt.answer 
                    : submittedAnswer || playerOneAnswer)
                : (firstPlayerAttempt && firstPlayerAttempt.player === playerTwoName 
                    ? firstPlayerAttempt.answer 
                    : submittedAnswer || playerTwoAnswer)}
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Why should you receive credit for this answer?"
            placeholder="Explain why your answer should be accepted according to Jeopardy! rules..."
            value={challengeReason}
            onChange={(e) => setChallengeReason(e.target.value)}
            disabled={isEvaluatingChallenge || challengeResult !== null}
            sx={{ mb: 2 }}
          />

          {challengeResult && (
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 1, 
                backgroundColor: challengeResult.shouldOverrule ? '#e8f5e9' : '#ffebee',
                border: `1px solid ${challengeResult.shouldOverrule ? '#4caf50' : '#f44336'}`
              }}
            >
              <Typography variant="h6" sx={{ color: challengeResult.shouldOverrule ? '#2e7d32' : '#c62828', mb: 1 }}>
                {challengeResult.shouldOverrule ? '✓ Challenge Successful' : '✗ Challenge Denied'}
              </Typography>
              <Typography variant="body2">
                {challengeResult.explanation}
              </Typography>
              {challengeResult.shouldOverrule && (
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', color: '#2e7d32' }}>
                  Your score has been adjusted!
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {!challengeResult ? (
            <>
              <Button onClick={handleCloseChallenge} disabled={isEvaluatingChallenge}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitChallenge} 
                variant="contained"
                disabled={isEvaluatingChallenge || !challengeReason.trim()}
                startIcon={isEvaluatingChallenge && <CircularProgress size={20} />}
              >
                {isEvaluatingChallenge ? 'Evaluating...' : 'Submit Challenge'}
              </Button>
            </>
          ) : (
            <Button onClick={handleCloseChallenge} variant="contained">
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

Question.propTypes = {};

export default React.memo(Question);
