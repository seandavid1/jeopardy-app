import React, { useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Box,
  Grid,
  styled,
  Avatar,
} from '@mui/material';
import { keyframes } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import Question from './Question';
import questionSetSeason38Part1 from './cluebase-questions/jeopardy-questions-season38-2021-09-12-to-2022-02-23-part1';
import questionSetSeason38Part2 from './cluebase-questions/jeopardy-questions-season38-2022-02-23-to-2022-07-28-part2';
import questionSetSeason39Part1 from './cluebase-questions/jeopardy-questions-season39-2022-09-11-to-2023-02-23-part1';
import questionSetSeason39Part2 from './cluebase-questions/jeopardy-questions-season39-2023-02-23-to-2023-07-27-part2';
import questionSetSeason40Part1 from './cluebase-questions/jeopardy-questions-season40-2023-09-10-to-2024-02-22-part1';
import questionSetSeason40Part2 from './cluebase-questions/jeopardy-questions-season40-2024-02-22-to-2024-07-25-part2';
import questionSetSeason41Part1 from './cluebase-questions/jeopardy-questions-season41-2024-09-08-to-2024-12-29-part1';
import questionSetSeason41Part2 from './cluebase-questions/jeopardy-questions-season41-2024-12-29-to-2025-04-09-part2';
import MissedQuestions from './components/MissedQuestions';
import ScoreDisplay from './components/ScoreDisplay';
import { addMissedQuestion } from './services/missedQuestionsDB';
import FinalJeopardy from './components/FinalJeopardy';

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
  onReturnToStart,
  onViewMissedQuestions,
}) {
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
  const [scoreUpdateValue, setScoreUpdateValue] = useState(0);
  const [scoreUpdatePlayer, setScoreUpdatePlayer] = useState(null);
  const [dailyDoubleCategories, setDailyDoubleCategories] = useState([]);
  const [dailyDoubleLocations, setDailyDoubleLocations] = useState([]);

  useEffect(() => {
    if (playerOneName && playerTwoName && !showBoard) {
      // console.log('Players set, starting game');
      startGame();
    }
  }, [playerOneName, playerTwoName]);

  function startGame() {
    console.log('🎮 START GAME called');
    setShowBoard(true);
    setJeopardyRound('Jeopardy');
    setAnswered([]);
    setThroatCleared(false);
    setPlayerOneScore(0);
    setPlayerTwoScore(0);
    setHasControlOfBoard(playerOneName);
    startRound();
  }

  const goToDoubleJeopardy = () => {
    console.log('🎮 GO TO DOUBLE JEOPARDY called');
    setThroatCleared(false);
    setJeopardyRound('Double Jeopardy');
    startRound();
  }

  const clueCountdown = () => {
    // Implementation of clueCountdown
  }

  function updateAnswered(id) {
    console.log('📝 UPDATE ANSWERED called for id:', id);
    console.log('📝 Current answered array before update:', answered);
    let _array = answered;
    _array.push(id);
    setAnswered(_array);
    console.log('📝 Answered array after update:', answered);
  }

  function updateMissedQuestions(clue, player) {
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

    addMissedQuestion(clue, player)
      .then((newQuestion) => {
        // console.log('Successfully stored missed question:', newQuestion);
      })
      .catch(error => {
        // console.error('Error storing missed question:', error);
      });
  }

  const handleScoreUpdate = (player, value) => {
    setScoreUpdateValue(value);
    setScoreUpdatePlayer(player);
    setShowScoreUpdate(true);
    setTimeout(() => {
      setShowScoreUpdate(false);
      setScoreUpdateValue(0);
      setScoreUpdatePlayer(null);
    }, 2000);
  };

  const updatePlayerOneScore = (value) => {
    setPlayerOneScore(prev => prev + value);
    handleScoreUpdate('playerOne', value);
  };

  const updatePlayerTwoScore = (value) => {
    setPlayerTwoScore(prev => prev + value);
    handleScoreUpdate('playerTwo', value);
  };

  function randomIntFromInterval(limit) {
    const num = Math.floor(Math.random() * (limit - 1 + 1) + 1);
    return num;
  }

  const getCategory = async function () {
    const allQuestions = questionSetSeason38Part1.concat(
          questionSetSeason38Part2,
          questionSetSeason39Part1,
          questionSetSeason39Part2,
          questionSetSeason40Part1,
          questionSetSeason40Part2,
          questionSetSeason41Part1,
          questionSetSeason41Part2
        );
    // console.log('all qs length', allQuestions.length);
    const currentQuestionSet = await allQuestions.filter((item) => {
      if (item.round === jeopardyRound) {
        return item;
      }
    });
    const count = currentQuestionSet?.length;
    const rndNum = randomIntFromInterval(count);
    const cat = currentQuestionSet[rndNum - 1]?.category;
    const questionsFilteredByCategory = await currentQuestionSet.filter((item) => {
      if (item.category === cat) {
        return item;
      }
    });
    const rndNumTwo = randomIntFromInterval(questionsFilteredByCategory?.length);
    const game_id = questionsFilteredByCategory[rndNumTwo - 1]?.game_id;
    const fullResult = await questionsFilteredByCategory.filter((item) => {
      if (item.game_id === game_id) {
        return item;
      }
    });

    fullResult.sort(function(a, b) {
      var keyA = new Date(a.value),
        keyB = new Date(b.value);
      // Compare the 2 dates
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });
    const result = fullResult.splice(0, 5);
    return result;
  }

  const getCatOne = async function (retryCount = 0) {
    if (retryCount >= 10) {
      // console.error('Failed to get category one after 10 attempts');
      return;
    }
    try {
      const resultNew = await getCategory();
      // console.log('resultNew cat one', resultNew);
      if (resultNew && resultNew.length >= 5) {
        setCatOneClues(resultNew);
        // console.log('Category one loaded successfully:', resultNew);
        return resultNew;
      } else {
        // console.log(`Retrying category one, attempt ${retryCount + 1}`);
        setTimeout(() => getCatOne(retryCount + 1), 100);
      }
    } catch (error) {
      // console.error('Error loading category one:', error);
      setTimeout(() => getCatOne(retryCount + 1), 100);
    }
  }

  const getCatTwo = async function (retryCount = 0) {
    if (retryCount >= 10) {
      // console.error('Failed to get category two after 10 attempts');
      return;
    }
    try {
      const resultNew = await getCategory();
      if (resultNew && resultNew.length >= 5) {
        setCatTwoClues(resultNew);
        // console.log('Category two loaded successfully:', resultNew);
        return resultNew;
      } else {
        // console.log(`Retrying category two, attempt ${retryCount + 1}`);
        setTimeout(() => getCatTwo(retryCount + 1), 100);
      }
    } catch (error) {
      // console.error('Error loading category two:', error);
      setTimeout(() => getCatTwo(retryCount + 1), 100);
    }
  }

  const getCatThree = async function (retryCount = 0) {
    if (retryCount >= 10) {
      // console.error('Failed to get category three after 10 attempts');
      return;
    }
    try {
      const resultNew = await getCategory();
      if (resultNew && resultNew.length >= 5) {
        setCatThreeClues(resultNew);
        // console.log('Category three loaded successfully:', resultNew);
        return resultNew;
      } else {
        // console.log(`Retrying category three, attempt ${retryCount + 1}`);
        setTimeout(() => getCatThree(retryCount + 1), 100);
      }
    } catch (error) {
      // console.error('Error loading category three:', error);
      setTimeout(() => getCatThree(retryCount + 1), 100);
    }
  }

  const getCatFour = async function (retryCount = 0) {
    if (retryCount >= 10) {
      // console.error('Failed to get category four after 10 attempts');
      return;
    }
    try {
      const resultNew = await getCategory();
      if (resultNew && resultNew.length >= 5) {
        setCatFourClues(resultNew);
        // console.log('Category four loaded successfully:', resultNew);
        return resultNew;
      } else {
        // console.log(`Retrying category four, attempt ${retryCount + 1}`);
        setTimeout(() => getCatFour(retryCount + 1), 100);
      }
    } catch (error) {
      // console.error('Error loading category four:', error);
      setTimeout(() => getCatFour(retryCount + 1), 100);
    }
  }

  const getCatFive = async function (retryCount = 0) {
    if (retryCount >= 10) {
      // console.error('Failed to get category five after 10 attempts');
      return;
    }
    try {
      const resultNew = await getCategory();
      if (resultNew && resultNew.length >= 5) {
        setCatFiveClues(resultNew);
        // console.log('Category five loaded successfully:', resultNew);
        return resultNew;
      } else {
        // console.log(`Retrying category five, attempt ${retryCount + 1}`);
        setTimeout(() => getCatFive(retryCount + 1), 100);
      }
    } catch (error) {
      // console.error('Error loading category five:', error);
      setTimeout(() => getCatFive(retryCount + 1), 100);
    }
  }

  const getCatSix = async function (retryCount = 0) {
    if (retryCount >= 10) {
      // console.error('Failed to get category six after 10 attempts');
      return;
    }
    try {
      const resultNew = await getCategory();
      if (resultNew && resultNew.length >= 5) {
        setCatSixClues(resultNew);
        // console.log('Category six loaded successfully:', resultNew);
        return resultNew;
      } else {
        // console.log(`Retrying category six, attempt ${retryCount + 1}`);
        setTimeout(() => getCatSix(retryCount + 1), 100);
      }
    } catch (error) {
      // console.error('Error loading category six:', error);
      setTimeout(() => getCatSix(retryCount + 1), 100);
    }
  }

  function generateDailyDoubles() {
    if (jeopardyRound === 'Jeopardy') {
      // Generate one daily double for Jeopardy round
      const category = Math.floor(Math.random() * 6) + 1; // 1-6
      const location = Math.floor(Math.random() * 5) + 2; // 2-6
      setDailyDoubleCategories([category]);
      setDailyDoubleLocations([location]);
    } else {
      // Generate two daily doubles for Double Jeopardy
      const categories = [];
      const locations = [];
      
      // Generate first daily double
      categories.push(Math.floor(Math.random() * 6) + 1);
      locations.push(Math.floor(Math.random() * 5) + 2);
      
      // Generate second daily double, ensuring it's different from the first
      let secondCategory;
      do {
        secondCategory = Math.floor(Math.random() * 6) + 1;
      } while (secondCategory === categories[0]);
      
      let secondLocation;
      do {
        secondLocation = Math.floor(Math.random() * 5) + 2;
      } while (secondLocation === locations[0]);
      
      categories.push(secondCategory);
      locations.push(secondLocation);
      
      setDailyDoubleCategories(categories);
      setDailyDoubleLocations(locations);
    }
  }

  function startRound() {
    console.log('🎲 START ROUND called for:', jeopardyRound);
    setAnswered([]); // Reset answered questions
    setThroatCleared(false); // Reset throat cleared state
    generateDailyDoubles(); // Generate daily doubles for the round
    
    // Load categories sequentially to avoid race conditions
    const loadCategories = async () => {
      try {
        await getCatOne();
        await getCatTwo();
        await getCatThree();
        await getCatFour();
        await getCatFive();
        await getCatSix();
        console.log('🎲 All categories loaded');
      } catch (error) {
        // console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }

  const startNewRound = () => {
    goToDoubleJeopardy();
    setShowBoard(true);
  }

  const handleFinalJeopardyComplete = (finalScores) => {
    setPlayerOneScore(finalScores.playerOne);
    setPlayerTwoScore(finalScores.playerTwo);
  };

  const startFinalJeopardy = () => {
    setShowBoard(false);
    setShowFinalJeopardy(true);
  };

  const handleSkipToFinal = () => {
    setShowBoard(false);
    setShowFinalJeopardy(true);
  };

  function Category({ clues, categoryIndex }) {
    return (
      <>
        {clues?.map((clue, index) => {
          const isDailyDouble = dailyDoubleCategories.includes(categoryIndex + 1) && 
                              dailyDoubleLocations.includes(index + 1);
          
          return (
            <div key={index}>
              {index === 0 && (
                <CategoryTitleWrapper>
                  <Typography variant="h6">{clues[0].category}</Typography>
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
              />
            </div>
          );
        })}
      </>
    );
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
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
        {showScoreUpdate && !showFinalJeopardy && jeopardyRound === 'Double Jeopardy' && (
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
            onGameComplete={handleFinalJeopardyComplete}
            onReturnToStart={onReturnToStart}
          />
        )}

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

        {showBoard && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <ReturnButton 
                variant="contained" 
                onClick={onReturnToStart}
                startIcon={<HomeIcon />}
                size='small'
                sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  minWidth: '200px !important', 
                  height: '36px',
                  backgroundColor: '#f5f5f5',
                  color: '#0f258f',
                  '&:hover': {
                    backgroundColor: '#e0e0e0',
                  }
                }}
              >
                Exit to Main Menu
              </ReturnButton>
            </Box>
            <Grid container>
              <Grid item sm={12} sx={{ textAlign: 'center' }}>
                <h1>
                  {jeopardyRound === 'J!' && 'Jeopardy!'}
                  {jeopardyRound === 'DJ!' && 'Double Jeopardy!'}
                </h1>
              </Grid>
            </Grid>
            <ScoreDisplay
              playerOneName={playerOneName}
              playerTwoName={playerTwoName}
              playerOneScore={playerOneScore}
              playerTwoScore={playerTwoScore}
              hasControlOfBoard={hasControlOfBoard}
              playerOneAvatar={playerOneAvatar}
              playerTwoAvatar={playerTwoAvatar}
            />
            <Grid container spacing={0} sx={{ p: 2 }}>
              <Grid item xs={2}>
                <Category clues={catOneClues} categoryIndex={0} />
              </Grid>
              <Grid item xs={2}>
                <Category clues={catTwoClues} categoryIndex={1} />
              </Grid>
              <Grid item xs={2}>
                <Category clues={catThreeClues} categoryIndex={2} />
              </Grid>
              <Grid item xs={2}>
                <Category clues={catFourClues} categoryIndex={3} />
              </Grid>
              <Grid item xs={2}>
                <Category clues={catFiveClues} categoryIndex={4} />
              </Grid>
              <Grid item xs={2}>
                <Category clues={catSixClues} categoryIndex={5} />
              </Grid>
            </Grid>
            {jeopardyRound === 'Double Jeopardy' && (
              <SkipToFinalButton 
                variant="contained"
                onClick={handleSkipToFinal}
              >
                Skip to Final Jeopardy
              </SkipToFinalButton>
            )}
          </Box>
        )}
      </BoardWrapper>
    </Box>
  );
}

Board.propTypes = {};

export default Board;
