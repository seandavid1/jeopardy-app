import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, styled, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import finalJeopardyQuestions from '../final-jeopardy-questions';
import { styled as muiStyled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import GavelIcon from '@mui/icons-material/Gavel';
import { evaluateAnswer } from '../utils/answerEvaluator';
import { cpuShouldAnswerCorrectly } from '../utils/cpuGameLogic';
import { evaluateChallenge, logChallenge } from '../services/challengeRulingService';

const FinalJeopardyContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  gap: theme.spacing(4),
}));

const PlayerWagerContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  width: '100%',
  maxWidth: '600px',
}));

const QuestionContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  backgroundColor: '#0f258f',
  color: 'white',
  borderRadius: '8px',
  width: '100%',
  maxWidth: '800px',
  textAlign: 'center',
}));

const AnswerContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  width: '100%',
  maxWidth: '600px',
}));

const ReturnButton = muiStyled(Button)(({ theme }) => ({
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

const ScoreDisplay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '20px',
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0 40px',
  zIndex: 1,
  width: '100%',
  boxSizing: 'border-box',
}));

const PlayerScore = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  width: '200px',
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

function FinalJeopardy({ 
  playerOneName, 
  playerTwoName, 
  playerOneScore, 
  playerTwoScore,
  playerOneAvatar,
  playerTwoAvatar,
  gameOptions,
  onGameComplete,
  onShowGameRoundup,
  onReturnToStart
}) {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [playerOneWager, setPlayerOneWager] = useState('');
  const [playerTwoWager, setPlayerTwoWager] = useState('');
  const [playerOneAnswer, setPlayerOneAnswer] = useState('');
  const [playerTwoAnswer, setPlayerTwoAnswer] = useState('');
  const [showQuestion, setShowQuestion] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [showPlayerOneWager, setShowPlayerOneWager] = useState(true);
  const [showPlayerTwoWager, setShowPlayerTwoWager] = useState(false);
  const [showPlayerOneAnswer, setShowPlayerOneAnswer] = useState(true);
  const [showPlayerTwoAnswer, setShowPlayerTwoAnswer] = useState(false);
  const [finalScores, setFinalScores] = useState({
    playerOne: playerOneScore,
    playerTwo: playerTwoScore
  });
  const [evaluationResults, setEvaluationResults] = useState({
    playerOne: null,
    playerTwo: null
  });
  
  // Challenge Ruling state
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeReason, setChallengeReason] = useState('');
  const [isEvaluatingChallenge, setIsEvaluatingChallenge] = useState(false);
  const [challengeResult, setChallengeResult] = useState(null);
  const [challengingPlayer, setChallengingPlayer] = useState(null); // 'playerOne' or 'playerTwo'

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
    
    if (isCustomImage(avatar)) {
      let imageSrc = avatar.dataUrl || avatar.selectedImage;
      
      // Handle DiceBear avatars (data URLs)
      if (avatar.isDicebear) {
        imageSrc = avatar.image || avatar.selectedImage;
      }
      // Handle custom file-based avatars
      else if (avatar.isCustom) {
        imageSrc = `${process.env.PUBLIC_URL}${avatar.image}`;
      }
      
      return (
        <img 
          src={imageSrc} 
          alt={playerName}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%'
          }}
        />
      );
    }
    
    return (
      <Box sx={{ fontSize: '2rem' }}>
        {avatar.selectedImage || avatar.image}
      </Box>
    );
  };

  useEffect(() => {
    // Get a random Final Jeopardy question
    const randomIndex = Math.floor(Math.random() * finalJeopardyQuestions.length);
    setCurrentQuestion(finalJeopardyQuestions[randomIndex]);
  }, []);
  
  // CPU auto-wager logic
  useEffect(() => {
    if (gameOptions?.mode === 'cpu' && showPlayerTwoWager && !playerTwoWager) {
      // CPU calculates optimal wager based on Final Jeopardy strategy
      const cpuOpponent = gameOptions.cpuOpponent;
      const strategy = cpuOpponent.finalJeopardyStrategy;
      
      let wager = 0;
      
      if (strategy === 'optimal') {
        // Calculate optimal wager (Lockout strategy or All-in depending on scores)
        if (playerTwoScore > playerOneScore * 2) {
          // Large lead: Wager just enough to cover if player 1 goes all in and answers correctly
          wager = Math.max(0, (playerOneScore * 2 + 1) - playerTwoScore);
        } else if (playerTwoScore < playerOneScore) {
          // Behind: Go all in
          wager = playerTwoScore;
        } else {
          // Close game: Wager based on opponent's max bet
          wager = Math.floor(playerTwoScore * 0.6);
        }
      } else if (strategy === 'aggressive') {
        // Always wager high
        wager = Math.floor(playerTwoScore * 0.8);
      } else if (strategy === 'conservative') {
        // Wager conservatively
        wager = Math.floor(playerTwoScore * 0.4);
      }
      
      // Ensure wager is within bounds
      wager = Math.max(0, Math.min(wager, playerTwoScore));
      
      setTimeout(() => {
        setPlayerTwoWager(wager.toString());
        setTimeout(() => {
          handleWagerSubmit('playerTwo');
        }, 500); // Brief delay before auto-submitting
      }, 1500); // 1.5 second delay to simulate thinking
    }
  }, [gameOptions, showPlayerTwoWager, playerTwoWager, playerOneScore, playerTwoScore]);
  
  // CPU auto-answer logic
  useEffect(() => {
    if (gameOptions?.mode === 'cpu' && showPlayerTwoAnswer && !playerTwoAnswer && currentQuestion) {
      const cpuOpponent = gameOptions.cpuOpponent;
      const category = currentQuestion.category;
      
      // For Final Jeopardy, treat it as a high-difficulty question (equivalent to $2000 value)
      // This ensures top players maintain high accuracy while weaker players struggle more
      const isCorrect = cpuShouldAnswerCorrectly(cpuOpponent, category, 2000, 'Double Jeopardy');
      
      setTimeout(() => {
        if (isCorrect) {
          // Answer correctly
          setPlayerTwoAnswer(currentQuestion.answer);
        } else {
          // Answer incorrectly with a plausible wrong answer
          const wrongAnswers = [
            "I don't know",
            "Pass",
            "What is... I'm not sure?",
            currentQuestion.answer.replace(/\w+/, 'something else') // Modify the answer slightly
          ];
          setPlayerTwoAnswer(wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)]);
        }
        
        setTimeout(() => {
          handleAnswerSubmit('playerTwo');
        }, 500); // Brief delay before auto-submitting
      }, 2000); // 2 second delay to simulate thinking
    }
  }, [gameOptions, showPlayerTwoAnswer, playerTwoAnswer, currentQuestion]);

  useEffect(() => {
    if (showQuestion && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      setShowAnswers(true);
    }
  }, [showQuestion, timeRemaining]);

  const handleWagerSubmit = (player) => {
    if (player === 'playerOne') {
      if (parseInt(playerOneWager) > playerOneScore) {
        alert('You cannot wager more than your current score!');
        return;
      }
      setShowPlayerOneWager(false);
      setShowPlayerTwoWager(true);
    } else {
      if (parseInt(playerTwoWager) > playerTwoScore) {
        alert('You cannot wager more than your current score!');
        return;
      }
      setShowPlayerTwoWager(false);
      setShowQuestion(true);
    }
  };

  const handleAnswerSubmit = async (player) => {
    if (player === 'playerOne') {
      if (!playerOneAnswer) return;
      setShowPlayerOneAnswer(false);
      setShowPlayerTwoAnswer(true);
    } else {
      if (!playerTwoAnswer) return;
      
      // Evaluate both answers
      const playerOneResult = await evaluateAnswer(
        playerOneAnswer,
        currentQuestion.answer,
        currentQuestion.category
      );
      
      const playerTwoResult = await evaluateAnswer(
        playerTwoAnswer,
        currentQuestion.answer,
        currentQuestion.category
      );

      setEvaluationResults({
        playerOne: playerOneResult,
        playerTwo: playerTwoResult
      });

      setShowPlayerTwoAnswer(false);
      setShowResults(true);
      calculateFinalScores(playerOneResult.isCorrect, playerTwoResult.isCorrect);
    }
  };

  const calculateFinalScores = (playerOneCorrect, playerTwoCorrect) => {
    const newScores = {
      playerOne: playerOneCorrect 
        ? playerOneScore + parseInt(playerOneWager)
        : playerOneScore - parseInt(playerOneWager),
      playerTwo: playerTwoCorrect
        ? playerTwoScore + parseInt(playerTwoWager)
        : playerTwoScore - parseInt(playerTwoWager)
    };

    setFinalScores(newScores);
    onGameComplete(newScores);
  };
  
  // Challenge Ruling handlers
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
      const playerAnswer = challengingPlayer === 'playerOne' ? playerOneAnswer : playerTwoAnswer;
      const playerName = challengingPlayer === 'playerOne' ? playerOneName : playerTwoName;
      const playerWager = challengingPlayer === 'playerOne' ? playerOneWager : playerTwoWager;
      
      // Evaluate the challenge with OpenAI
      const result = await evaluateChallenge(
        playerAnswer,
        currentQuestion.answer,
        currentQuestion.category,
        challengeReason
      );

      // Log the challenge
      logChallenge({
        questionId: 'final-jeopardy',
        category: currentQuestion.category,
        question: currentQuestion.question,
        correctAnswer: currentQuestion.answer,
        playerAnswer: playerAnswer,
        challengeReason: challengeReason,
        shouldOverrule: result.shouldOverrule,
        aiExplanation: result.explanation,
        playerName: playerName
      });

      setChallengeResult(result);

      // If challenge is successful, adjust the score
      if (result.shouldOverrule) {
        const adjustment = parseInt(playerWager) * 2; // Reverse the deduction and add the points
        
        const newScores = {
          ...finalScores,
          [challengingPlayer === 'playerOne' ? 'playerOne' : 'playerTwo']: 
            finalScores[challengingPlayer === 'playerOne' ? 'playerOne' : 'playerTwo'] + adjustment
        };
        
        setFinalScores(newScores);
        
        // Update evaluation result
        setEvaluationResults(prev => ({
          ...prev,
          [challengingPlayer === 'playerOne' ? 'playerOne' : 'playerTwo']: {
            isCorrect: true,
            explanation: `Challenge Successful: ${result.explanation}`,
            usedAI: true
          }
        }));
        
        console.log(`✅ Challenge successful for ${playerName} - score adjusted by +${adjustment}`);
      }
    } catch (error) {
      console.error('Error evaluating challenge:', error);
      alert('Failed to evaluate challenge. Please try again.');
    } finally {
      setIsEvaluatingChallenge(false);
    }
  };

  if (!currentQuestion) return null;

  return (
    <FinalJeopardyContainer>
      {!showQuestion && !showAnswers && (
        <ScoreDisplay>
          <PlayerScore>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: playerOneAvatar?.color || '#1a1a2e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                overflow: 'hidden'
              }}
            >
              {renderAvatar(playerOneAvatar, playerOneName)}
            </Box>
            <PlayerName>{playerOneName}</PlayerName>
            <ScoreText>${playerOneScore}</ScoreText>
          </PlayerScore>
          <PlayerScore>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: playerTwoAvatar?.color || '#1a1a2e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                overflow: 'hidden'
              }}
            >
              {renderAvatar(playerTwoAvatar, playerTwoName)}
            </Box>
            <PlayerName>{playerTwoName}</PlayerName>
            <ScoreText>${playerTwoScore}</ScoreText>
          </PlayerScore>
        </ScoreDisplay>
      )}

      <Typography variant="h3" sx={{ color: '#fff', mb: 4 }}>
        Final Jeopardy!
      </Typography>

      {!showQuestion && !showAnswers && (
        <>
          <Typography variant="h4" sx={{ mb: 4, color: '#fff' }}>
            Category: {currentQuestion.category}
          </Typography>

          {showPlayerOneWager && (
            <PlayerWagerContainer>
              <Typography variant="h5">{playerOneName}'s Wager</Typography>
              <Typography>Current Score: ${playerOneScore}</Typography>
              <TextField
                type="number"
                value={playerOneWager}
                onChange={(e) => setPlayerOneWager(e.target.value)}
                label="Enter your wager"
                variant="outlined"
                sx={{ width: '200px' }}
              />
              <Button 
                variant="contained" 
                onClick={() => handleWagerSubmit('playerOne')}
                disabled={!playerOneWager}
              >
                Submit Wager
              </Button>
            </PlayerWagerContainer>
          )}

          {showPlayerTwoWager && (
            <PlayerWagerContainer>
              <Typography variant="h5">{playerTwoName}'s Wager</Typography>
              <Typography>Current Score: ${playerTwoScore}</Typography>
              <TextField
                type={gameOptions?.mode === 'cpu' ? 'password' : 'number'}
                value={playerTwoWager}
                onChange={(e) => setPlayerTwoWager(e.target.value)}
                label="Enter your wager"
                variant="outlined"
                sx={{ width: '200px' }}
                disabled={gameOptions?.mode === 'cpu'}
                InputProps={{
                  readOnly: gameOptions?.mode === 'cpu',
                }}
              />
              <Button 
                variant="contained" 
                onClick={() => handleWagerSubmit('playerTwo')}
                disabled={!playerTwoWager}
              >
                Submit Wager
              </Button>
            </PlayerWagerContainer>
          )}
        </>
      )}

      {showQuestion && !showAnswers && (
        <QuestionContainer>
          <Typography variant="h5" sx={{ mb: 3, textTransform: 'uppercase', opacity: 0.9 }}>
            {currentQuestion.category}
          </Typography>
          <Typography variant="h4">{currentQuestion.question}</Typography>
          <Typography variant="h5">Time Remaining: {timeRemaining} seconds</Typography>
        </QuestionContainer>
      )}

      {showAnswers && !showResults && (
        <>
          {showPlayerOneAnswer && (
            <AnswerContainer>
              <Typography variant="h5">{playerOneName}'s Answer</Typography>
              <TextField
                value={playerOneAnswer}
                onChange={(e) => setPlayerOneAnswer(e.target.value)}
                label="Enter your answer"
                variant="outlined"
                fullWidth
              />
              <Button 
                variant="contained" 
                onClick={() => handleAnswerSubmit('playerOne')}
                disabled={!playerOneAnswer}
              >
                Submit Answer
              </Button>
            </AnswerContainer>
          )}

          {showPlayerTwoAnswer && (
            <AnswerContainer>
              <Typography variant="h5">{playerTwoName}'s Answer</Typography>
              <TextField
                type={gameOptions?.mode === 'cpu' ? 'password' : 'text'}
                value={playerTwoAnswer}
                onChange={(e) => setPlayerTwoAnswer(e.target.value)}
                label="Enter your answer"
                variant="outlined"
                fullWidth
                disabled={gameOptions?.mode === 'cpu'}
                InputProps={{
                  readOnly: gameOptions?.mode === 'cpu',
                }}
              />
              <Button 
                variant="contained" 
                onClick={() => handleAnswerSubmit('playerTwo')}
                disabled={!playerTwoAnswer}
              >
                Submit Answer
              </Button>
            </AnswerContainer>
          )}
        </>
      )}

      {showResults && (
        <QuestionContainer>
          <Typography variant="h4">The correct answer is:</Typography>
          <Typography variant="h4" sx={{ color: '#e5984c' }}>{currentQuestion.answer}</Typography>
          
          <Box sx={{ mt: 4, width: '100%' }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {playerOneName}'s answer: {playerOneAnswer}
            </Typography>
            {evaluationResults.playerOne && (
              <Typography 
                variant="body1" 
                sx={{ 
                  color: evaluationResults.playerOne.isCorrect ? '#4caf50' : '#f44336',
                  mb: 2
                }}
              >
                {evaluationResults.playerOne.explanation}
              </Typography>
            )}
            
            {/* Challenge Button for Player One */}
            {evaluationResults.playerOne && !evaluationResults.playerOne.isCorrect && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleOpenChallenge('playerOne')}
                startIcon={<GavelIcon />}
                sx={{
                  mt: 1,
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
            )}
          </Box>

          <Box sx={{ mt: 4, width: '100%' }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {playerTwoName}'s answer: {playerTwoAnswer}
            </Typography>
            {evaluationResults.playerTwo && (
              <Typography 
                variant="body1" 
                sx={{ 
                  color: evaluationResults.playerTwo.isCorrect ? '#4caf50' : '#f44336',
                  mb: 2
                }}
              >
                {evaluationResults.playerTwo.explanation}
              </Typography>
            )}
            
            {/* Challenge Button for Player Two */}
            {evaluationResults.playerTwo && !evaluationResults.playerTwo.isCorrect && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleOpenChallenge('playerTwo')}
                startIcon={<GavelIcon />}
                sx={{
                  mt: 1,
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
            )}
          </Box>

          <Typography variant="h4" sx={{ mt: 4 }}>
            Final Scores:
          </Typography>
          <Typography variant="h5">
            {playerOneName}: ${finalScores.playerOne}
          </Typography>
          <Typography variant="h5">
            {playerTwoName}: ${finalScores.playerTwo}
          </Typography>
          <Typography variant="h3" sx={{ mt: 4, color: '#e5984c' }}>
            {finalScores.playerOne > finalScores.playerTwo ? playerOneName : playerTwoName} wins!
          </Typography>
          
          {/* Add View Stats button */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button 
              variant="contained" 
              onClick={onShowGameRoundup}
              sx={{
                backgroundColor: '#4caf50',
                '&:hover': {
                  backgroundColor: '#45a049',
                },
              }}
            >
              View Game Stats
            </Button>
            <Button 
              variant="outlined" 
              onClick={onReturnToStart}
              startIcon={<HomeIcon />}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: '#e5e5e5',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Return to Main Menu
            </Button>
          </Box>
        </QuestionContainer>
      )}
      
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
              {currentQuestion.question}
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Correct Answer:
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {currentQuestion.answer}
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {challengingPlayer === 'playerOne' ? playerOneName : playerTwoName}'s Answer:
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {challengingPlayer === 'playerOne' ? playerOneAnswer : playerTwoAnswer}
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
            disabled={isEvaluatingChallenge || challengeResult}
          />

          {challengeResult && (
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: challengeResult.shouldOverrule ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
              borderRadius: 1 
            }}>
              <Typography variant="h6" sx={{ 
                color: challengeResult.shouldOverrule ? '#2e7d32' : '#c62828',
                mb: 1 
              }}>
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
    </FinalJeopardyContainer>
  );
}

export default FinalJeopardy; 