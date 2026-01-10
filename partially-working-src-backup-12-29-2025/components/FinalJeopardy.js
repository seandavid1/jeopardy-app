import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, styled, Avatar } from '@mui/material';
import finalJeopardyQuestions from '../final-jeopardy-questions';
import { styled as muiStyled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import { evaluateAnswer } from '../utils/answerEvaluator';

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
  onGameComplete,
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

  useEffect(() => {
    // Get a random Final Jeopardy question
    const randomIndex = Math.floor(Math.random() * finalJeopardyQuestions.length);
    setCurrentQuestion(finalJeopardyQuestions[randomIndex]);
  }, []);

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
                backgroundColor: playerOneAvatar.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                fontSize: '2rem'
              }}
            >
              {playerOneAvatar.image}
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
                backgroundColor: playerTwoAvatar.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                fontSize: '2rem'
              }}
            >
              {playerTwoAvatar.image}
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
                type="number"
                value={playerTwoWager}
                onChange={(e) => setPlayerTwoWager(e.target.value)}
                label="Enter your wager"
                variant="outlined"
                sx={{ width: '200px' }}
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
                value={playerTwoAnswer}
                onChange={(e) => setPlayerTwoAnswer(e.target.value)}
                label="Enter your answer"
                variant="outlined"
                fullWidth
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
        </QuestionContainer>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <ReturnButton 
          variant="contained" 
          onClick={onReturnToStart}
          startIcon={<HomeIcon />}
        >
          Exit to Main Menu
        </ReturnButton>
      </Box>
    </FinalJeopardyContainer>
  );
}

export default FinalJeopardy; 