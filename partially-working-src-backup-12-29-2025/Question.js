import React, { useCallback, useEffect, useState } from 'react';
import { Button, Typography, Card, styled, Box, TextField, Grid } from '@mui/material';
import { useGamepads } from 'react-gamepads';
import { synthesizeSpeech, VOICES, listAvailableVoices, DEFAULT_VOICE } from './services/pollyService';

// Todo

// 1 Buzzer lockout
// 2 External buzzers
// 2 Daily Doubles
// 3 Final Jeopardy

const ValueWrapper = styled(Box)(
  () => `
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
      position: absolute;
      width: 100%;
      top: 0px;
      left: 0px;
      height: calc(100%);
      z-index: 1;
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
  () => `
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
      position: absolute;
      width: 100%;
      top: 0px;
      left: 0px;
      height: calc(100%);
      z-index: 2;
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
  isFinalJeopardy = false,
  isGameSetup = false
}) {
  console.log('🏗️ Question component rendered for clue:', clue.id, 'Answered:', answered.includes(clue.id));
  
  const [metaData, setMetaData] = useState(null);
  const [showDollarValue, setShowDollarValue] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showDailyDouble, setShowDailyDouble] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [buzzerActive, setBuzzerActive] = useState(false);
  const [playerOneBuzzed, setPlayerOneBuzzed] = useState(false);
  const [playerTwoBuzzed, setPlayerTwoBuzzed] = useState(false);
  const [dailyDoubleWager, setDailyDoubleWager] = useState(null);
  const [timeIsUp, setTimeIsUp] = useState(false);
  const [gamepads, setGamepads] = useState({});
  const [selectedVoice, setSelectedVoice] = useState(DEFAULT_VOICE);
  const [audioUrl, setAudioUrl] = useState(null);
  const [themeMusic, setThemeMusic] = useState(null);
  const [isThemePlaying, setIsThemePlaying] = useState(false);
  const [playerOneLockedOut, setPlayerOneLockedOut] = useState(false);
  const [playerTwoLockedOut, setPlayerTwoLockedOut] = useState(false);

  useGamepads(gamepads => setGamepads(gamepads));
  const msg = new SpeechSynthesisUtterance();

  // Component mount/unmount tracking
  useEffect(() => {
    console.log('🏗️ Question component MOUNTED for clue:', clue.id);
    return () => {
      console.log('🏗️ Question component UNMOUNTED for clue:', clue.id);
    };
  }, [clue.id]);

  // Track changes to answered prop
  useEffect(() => {
    console.log('📝 Answered prop changed for clue', clue.id, '- Is answered?', answered.includes(clue.id));
  }, [answered, clue.id]);

  // Track showQuestion state changes
  useEffect(() => {
    console.log('📊 showQuestion state changed:', showQuestion);
  }, [showQuestion]);

  // Track showAnswer state changes
  useEffect(() => {
    console.log('📊 showAnswer state changed:', showAnswer);
  }, [showAnswer]);

  // Track showDollarValue state changes
  useEffect(() => {
    console.log('📊 showDollarValue state changed:', showDollarValue);
  }, [showDollarValue]);

  // Track showDailyDouble state changes
  useEffect(() => {
    console.log('📊 showDailyDouble state changed for clue', clue.id, ':', showDailyDouble);
  }, [showDailyDouble, clue.id]);

  // Initialize theme music
  useEffect(() => {
    const music = new Audio(isGameSetup ? '/audio/jeopardy-opening-credits-song.mp3' : '/audio/jeopardy-theme.mp3');
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
      }
    };
  }, [isGameSetup]);

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
    try {
      // Only generate new audio if we don't have it cached
      if (!audioUrl) {
        // console.log('Calling Amazon Polly...');
        const newAudioUrl = await synthesizeSpeech(text, selectedVoice);
        // console.log('Polly URL received:', newAudioUrl);
        
        // Create a new Audio object and wait for it to load
        const audio = new Audio();
        
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
          setTimeout(() => {
            if (!audio.readyState) {
              handleError(new Error('Audio loading timeout'));
            }
          }, 5000);
          
          audio.load();
        });
        
        // Set the URL in state after we've confirmed it works        
        setAudioUrl(newAudioUrl);
        
        audio.addEventListener('ended', () => {
          // console.log('=== Question Reading Complete ===');
          if (!isDailyDouble) {
            setBuzzerActive(true);
            setTimeout(() => {
              checkBuzzer();
              setTimeIsUp(true);
              // console.log('Time is up for regular question');
            }, 5000);
          }
          if (isDailyDouble) {
            setBuzzerActive(true);
            setTimeout(() => {
              setBuzzerActive(false);
              setTimeIsUp(true);
              // console.log('Time is up for Daily Double');
            }, 10000);
          }
        });

        // Clean up any previous audio
        const synth = window.speechSynthesis;
        synth.cancel();
        
        await audio.play();
      } else {
        // If we already have the URL, create a new Audio object and wait for it to load
        const audio = new Audio();
        
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
          setTimeout(() => {
            if (!audio.readyState) {
              handleError(new Error('Audio loading timeout'));
            }
          }, 5000);
          
          audio.load();
        });
        
        audio.addEventListener('ended', () => {
          // console.log('=== Question Reading Complete ===');
          if (!isDailyDouble) {
            setBuzzerActive(true);
            setTimeout(() => {
              checkBuzzer();
              setTimeIsUp(true);
              // console.log('Time is up for regular question');
            }, 5000);
          }
          if (isDailyDouble) {
            setBuzzerActive(true);
            setTimeout(() => {
              setBuzzerActive(false);
              setTimeIsUp(true);
              // console.log('Time is up for Daily Double');
            }, 10000);
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
    console.log('🔵 REVEAL QUESTION called for clue:', clue.id, clue.clue.substring(0, 50));
    console.log('🔵 Is already answered?', answered.includes(clue.id));
    
    if (isDailyDouble) {
      console.log('🔵 Daily Double - setting states');
      setBuzzerActive(false);
      speechHandler(msg, clue.clue);
      setShowQuestion(true);
      updateAnswered(clue.id);
    } else {
      console.log('🔵 Regular question - setting states');
      setShowDailyDouble(false);
      setShowDollarValue(false);
      setShowQuestion(true);
      updateAnswered(clue.id);
      speechHandler(msg, clue.clue);
    }
    console.log('🔵 REVEAL QUESTION complete - showQuestion should be true');
  }

  function closeQuestionBox() {
    console.log('🔴 CLOSE QUESTION BOX called');
    console.log('🔴 Current state before close:', {
      showAnswer,
      showQuestion,
      playerOneBuzzed,
      playerTwoBuzzed,
      clueId: clue.id
    });
    setShowAnswer(false);
    setShowQuestion(false);
    setPlayerOneBuzzed(false);
    setPlayerTwoBuzzed(false);
    clueCountdown();
    console.log('🔴 CLOSE QUESTION BOX complete - states reset');
  }

  function changePlayerOneScore(value) {
    console.log('💰 PLAYER ONE SCORE CHANGE:', value);
    if (isDailyDouble) {
      // console.log('dd wager', dailyDoubleWager);
      // console.log(typeof(dailyDoubleWager));
      if (value >= 0) {
        updatePlayerOneScore(dailyDoubleWager);
      }
      if (value < 0) {
        updatePlayerOneScore(dailyDoubleWager * -1);
      }
    }
    if (!isDailyDouble) {
      updatePlayerOneScore(value);
    }
    if (value > 0) {
      setHasControlOfBoard(playerOneName);
    }
    if (value < 0) {
      // console.log('Player One missed question. Clue:', clue);
      updateMissedQuestions(clue, playerOneName);
    }
  }

  function changePlayerTwoScore(value) {
    console.log('💰 PLAYER TWO SCORE CHANGE:', value);
    if (isDailyDouble) {
      if (value >= 0) {
        updatePlayerTwoScore(dailyDoubleWager);
      }
      if (value < 0) {
        updatePlayerTwoScore(dailyDoubleWager * -1);
      }
    }
    if (!isDailyDouble) {
      updatePlayerTwoScore(value);
    }
    if (value > 0) {
      setHasControlOfBoard(playerTwoName);
    }
    if (value < 0) {
      // console.log('Player Two missed question. Clue:', clue);
      updateMissedQuestions(clue, playerTwoName);
    }

    setDailyDoubleWager(null);
  }

  useEffect(() => {
    // Player One buzzer keys: 2 (keyCode 50) and Left Shift (code 'ShiftLeft')
    const playerOneKeys = [
      { keyCode: 50 },           // 2 key
      { code: 'ShiftLeft' }      // Left Shift key
    ];
    
    // Player Two buzzer keys: Enter (keyCode 13) and Right Shift (code 'ShiftRight')
    const playerTwoKeys = [
      { keyCode: 13 },           // Enter key
      { code: 'ShiftRight' }     // Right Shift key
    ];
    
    const isPlayerOneKey = (e) => playerOneKeys.some(key => 
      (key.keyCode && e.keyCode === key.keyCode) || (key.code && e.code === key.code)
    );
    
    const isPlayerTwoKey = (e) => playerTwoKeys.some(key => 
      (key.keyCode && e.keyCode === key.keyCode) || (key.code && e.code === key.code)
    );

    const handleKeyPress = (e) => {
      // Prevent default behavior for buzzer keys
      if (isPlayerOneKey(e) || isPlayerTwoKey(e)) {
        e.preventDefault();
      }
      
      // Log all key presses for debugging
      // console.log('Key pressed:', {
      //   key: e.key,
      //   code: e.code,
      //   keyCode: e.keyCode
      // });

      // Handle Player 1 buzzer
      if (isPlayerOneKey(e)) {
        // console.log('Player 1 buzzer pressed');
        if (buzzerActive && !playerOneLockedOut) {
          setPlayerOneBuzzed(true);
          setBuzzerActive(false);
        }
      }

      // Handle Player 2 buzzer
      if (isPlayerTwoKey(e)) {
        // console.log('Player 2 buzzer pressed');
        if (buzzerActive && !playerTwoLockedOut) {
          setPlayerTwoBuzzed(true);
          setBuzzerActive(false);
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [buzzerActive, playerOneLockedOut, playerTwoLockedOut]); // Add dependencies for buzzer state

  const enableDailyDouble = () => {
    console.log('💎 ENABLE DAILY DOUBLE called');
    setShowDailyDouble(true);
    console.log('💎 showDailyDouble set to true');
  }

  const checkForDailyDoubles = (clue) => {
    console.log('🎯 CHECK FOR DAILY DOUBLES called for clue:', clue.id);
    console.log('🎯 Is Daily Double?', isDailyDouble);
    console.log('🎯 Is already answered?', answered.includes(clue.id));
    
    if (isDailyDouble) {
      // console.log('Daily Double!!!');
      enableDailyDouble();
    } 
    else {
      revealQuestion(clue);
    }
  }

  return (
    <>
      {renderThemeMusicControls()}
      <ValueWrapper onClick={() => {
        console.log('🖱️ VALUE WRAPPER CLICKED for clue:', clue.id);
        console.log('🖱️ Is already answered?', answered.includes(clue.id));
        checkForDailyDoubles(clue);
      }}>
        {showDollarValue && (
          <>
            <Typography
              className={answered.includes(clue.id) ? 'hide' : 'show'}
              variant="h4"
              sx={{
                color: '#e5984c',
                fontSize: '60px',
                textShadow: '1px 2px 3px #000',
              }}
            >
              ${(index + 1) * jeopardyRound}
            </Typography>
            {isDailyDouble && <DailyDoubleIndicator>DD</DailyDoubleIndicator>}
          </>
        )}
      </ValueWrapper>

      {showDailyDouble &&
        <QuestionWrapper>
          <Grid container >
            <Grid item sx={{ pl: 10, pr: 10 }} xs={12}>
              <Typography variant="h3" sx={{mb: 10}}>{hasControlOfBoard}, you found a Daily Double!</Typography>
              <Typography variant="h4" sx={{ mb: 10 }}>You have ${hasControlOfBoard === playerOneName ? playerOneScore : playerTwoScore}. <br /><br />The category is:<br /> {clue.category}</Typography>
              <Typography variant="h5" sx={{ mb: 3 }}>How much would you like to wager?</Typography>
              <TextField
                sx={{ backgroundColor: '#fff', fontSize: '30px' }}
                variant="filled"
                id="daily-double-wager"
                label="Wager"
                placeholder="Enter your wager here."
                value={dailyDoubleWager}
                onChange={(event) => {
                  setDailyDoubleWager(event.target.value);
                }}
              />
            </Grid>
            <Grid item sx={{ pl: 10, pr: 10 }} xs={12}>
              {(dailyDoubleWager > 0) && <Button sx={{mt: 12}} variant="contained" onClick={() => revealQuestion(clue)}>Reveal the clue.</Button>}
            </Grid>
        </Grid>
        </QuestionWrapper >
      }

{showQuestion && !showAnswer && (
    <QuestionWrapper>
      {timeIsUp && (
        <Typography variant="h4" sx={{ position: 'absolute', top: '100px', color: 'yellow' }}>Time Is Up!</Typography>
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
          {clue.category.title}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '60px' }}>
          {clue.clue}
        </Typography>
        {playerOneBuzzed && (
          <Typography onClick={() => setShowAnswer(true)} className="player-rang" variant="h6">{timeIsUp ? 'Show Answer' : 'Player One Rang In'}</Typography>
        )}
        {playerTwoBuzzed && (
          <Typography onClick={() => setShowAnswer(true)} className="player-rang" variant="h6">{timeIsUp ? 'Show Answer' : 'Player Two Rang In'}</Typography>
        )}
        <Typography
          variant="body2"
          sx={{
            fontSize: '20px',
            textTransform: 'uppercase',
            position: 'absolute',
            bottom: 20,
            left: 0,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Typography>Air Date: {metaData?.air_date}</Typography>
          <Typography>Season {metaData?.season_id}, Episode {metaData?.episode_num}</Typography>
          {metaData?.notes !== '' && <Typography>Notes: {metaData?.notes}</Typography>}
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
    </QuestionWrapper>
  )
}
{
  showAnswer && (
    <AnswerWrapper>
      <TextWrapper>
        {showAnswer && (
          <Typography variant="body1" sx={{ fontSize: '70px' }}>
            What is {clue.response}?
          </Typography>
        )}
        {playerOneBuzzed && showAnswer && (
          <>
            <Button
              color="success"
              variant="outlined"
              sx={{
                position: 'absolute',
                zIndex: 1000,
                bottom: 120,
                right: 70,
                backgroundColor: '#fff',
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
                bottom: 120,
                left: 70,
                backgroundColor: '#fff',
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
                bottom: 120,
                right: 70,
                backgroundColor: '#fff',
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
                bottom: 120,
                left: 70,
                backgroundColor: '#fff',
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
              bottom: 120,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#fff',
            }}
            onClick={() => {
              updateMissedQuestions(clue, 'No One');
              closeQuestionBox();
            }}
          >
            No One Rang In
          </Button>
        )}
      </TextWrapper>
    </AnswerWrapper>
  )
}
    </>
  );
}

Question.propTypes = {};

export default Question;
