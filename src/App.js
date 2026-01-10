import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme, Slider, IconButton, Tooltip } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import Board from './Board';
import MissedQuestions from './components/MissedQuestions';
import StartScreen from './components/StartScreen';
import PlayerSetup from './components/PlayerSetup';
import Practice from './components/Practice';
import Scoreboard from './components/Scoreboard';
import Settings from './components/Settings';
import Login from './components/Login';
import Signup from './components/Signup';
import AccessoryTest from './components/AccessoryTest';
import Leaderboard from './components/Leaderboard';
import TrophyCase from './components/TrophyCase';
import { useAuth } from './contexts/AuthContext';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#0f258f',
    },
    secondary: {
      main: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  const [currentScreen, setCurrentScreen] = useState('start'); // 'start', 'setup', 'game', 'missed', 'practice', 'scoreboard', 'settings', 'login', 'signup', 'accessory-test', 'leaderboard', 'trophy-case'
  const [playerOneName, setPlayerOneName] = useState('Courtney');
  const [playerTwoName, setPlayerTwoName] = useState('Sean');
  const [playerOneAvatar, setPlayerOneAvatar] = useState(null);
  const [playerTwoAvatar, setPlayerTwoAvatar] = useState(null);
  const [gameOptions, setGameOptions] = useState(null); // Store game mode and CPU opponent info
  const [difficultyMode, setDifficultyMode] = useState('regular'); // Store difficulty mode
  const [themeMusic, setThemeMusic] = useState(null);
  const [volume, setVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [setupKey, setSetupKey] = useState(0); // Counter to force PlayerSetup remount

  const { user } = useAuth();

  // Initialize theme music
  useEffect(() => {
    const music = new Audio(`${process.env.PUBLIC_URL}/audio/jeopardy-opening-credits-song.mp3`);
    music.loop = true;
    music.volume = volume;
    
    // Add error handling
    music.addEventListener('error', (e) => {
      console.error('Error loading theme music:', e);
      console.error('Attempted path:', music.src);
    });
    
    setThemeMusic(music);

    return () => {
      if (music) {
        music.pause();
        music.currentTime = 0;
      }
    };
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (themeMusic) {
      themeMusic.volume = isMuted ? 0 : volume;
      
      // Only try to play if volume > 0 and we're on the start screen
      if (!isMuted && volume > 0 && currentScreen === 'start') {
        themeMusic.play().catch(error => {
          // Silently catch autoplay errors - user needs to interact first
          console.log('Music will play once user interacts with the page');
        });
      } else if (isMuted || volume === 0) {
        themeMusic.pause();
      }
    }
  }, [volume, isMuted, themeMusic, currentScreen]);

  // Stop theme music when game starts
  useEffect(() => {
    if (currentScreen === 'game' && themeMusic) {
      themeMusic.pause();
      themeMusic.currentTime = 0;
    }
    // Don't auto-play when returning to start - let volume control handle it
  }, [currentScreen, themeMusic]);

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    setIsMuted(false);
    // Music will start playing via the volume useEffect
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handlePlayThemeMusic = () => {
    if (themeMusic) {
      themeMusic.play().catch(error => {
        console.error('Error playing theme music:', error);
      });
    }
  }

  // Start theme music when user clicks start
  const handleStartNewGame = () => {
    setSetupKey(prev => prev + 1); // Increment key to force PlayerSetup remount
    setCurrentScreen('setup');
  };

  const handleStartGame = (p1Name, p2Name, p1Avatar, p2Avatar, options = {}, difficulty = 'regular') => {
    setPlayerOneName(p1Name);
    setPlayerTwoName(p2Name);
    setPlayerOneAvatar(p1Avatar);
    setPlayerTwoAvatar(p2Avatar);
    setGameOptions(options);
    setDifficultyMode(difficulty);
    console.log('Starting game with difficulty:', difficulty);
    setCurrentScreen('game');
  };

  const handleViewMissedQuestions = () => {
    setCurrentScreen('missed');
  };

  const handleStartPractice = () => {
    setCurrentScreen('practice');
  };

  const handleViewScoreboard = () => {
    setCurrentScreen('scoreboard');
  };

  const handleOpenSettings = () => {
    setCurrentScreen('settings');
  };

  const handleReturnToStart = () => {
    setCurrentScreen('start');
  };

  const handleShowAccessoryTest = () => {
    setCurrentScreen('accessory-test');
  };

  const handleShowLogin = () => {
    setCurrentScreen('login');
  };

  const handleShowSignup = () => {
    setCurrentScreen('signup');
  };

  const handleViewLeaderboard = () => {
    setCurrentScreen('leaderboard');
  };

  const handleViewTrophyCase = () => {
    setCurrentScreen('trophy-case');
  };

  // Check if user is logged in, if not show auth screens
  useEffect(() => {
    if (!user && currentScreen !== 'login' && currentScreen !== 'signup') {
      setCurrentScreen('login');
    } else if (user && (currentScreen === 'login' || currentScreen === 'signup')) {
      // If user just logged in/signed up, redirect to start screen
      setCurrentScreen('start');
    }
  }, [user, currentScreen]);

  useEffect(() => {
    // Don't auto-play - let user control via volume slider
  }, [currentScreen]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh', 
        padding: 2,
        position: 'relative'
      }}>
        {/* Show login/signup screens if not authenticated */}
        {!user && currentScreen === 'login' && (
          <Login onSwitchToSignup={handleShowSignup} />
        )}

        {!user && currentScreen === 'signup' && (
          <Signup onSwitchToLogin={handleShowLogin} />
        )}

        {/* Show main app if authenticated */}
        {user && (
          <>
            {currentScreen !== 'game' && (
              <Box sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '8px 16px',
                borderRadius: '20px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                zIndex: 1000
              }}>
                <Tooltip title={isMuted ? "Unmute" : "Mute"}>
                  <IconButton onClick={handleMuteToggle}>
                    {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                  </IconButton>
                </Tooltip>
                <Slider
                  value={volume}
                  onChange={handleVolumeChange}
                  min={0}
                  max={1}
                  step={0.1}
                  sx={{
                    width: 100,
                    color: 'primary.main',
                    '& .MuiSlider-thumb': {
                      width: 12,
                      height: 12,
                    },
                  }}
                />
              </Box>
            )}

            {currentScreen === 'start' && (
              <StartScreen 
                onStartNewGame={handleStartNewGame} 
                onViewMissedQuestions={handleViewMissedQuestions}
                onStartPractice={handleStartPractice}
                onViewScoreboard={handleViewScoreboard}
                onViewLeaderboard={handleViewLeaderboard}
                onViewTrophyCase={handleViewTrophyCase}
                onOpenSettings={handleOpenSettings}
                onShowAccessoryTest={handleShowAccessoryTest}
              />
            )}
            
            {currentScreen === 'setup' && (
              <PlayerSetup 
                key={setupKey} // Force remount when setupKey changes
                onStartGame={handleStartGame}
                onReturnToMenu={handleReturnToStart}
              />
            )}
            
            {currentScreen === 'game' && (
              <Board 
                playerOneName={playerOneName}
                playerTwoName={playerTwoName}
                playerOneAvatar={playerOneAvatar}
                playerTwoAvatar={playerTwoAvatar}
                gameOptions={gameOptions}
                difficultyMode={difficultyMode}
                onReturnToStart={handleReturnToStart}
              />
            )}
            
            {currentScreen === 'practice' && (
              <Practice 
                onReturnToStart={handleReturnToStart}
              />
            )}
            
            {currentScreen === 'scoreboard' && (
              <Scoreboard 
                onReturnToStart={handleReturnToStart}
              />
            )}
            
            {currentScreen === 'settings' && (
              <Settings 
                onReturnToMenu={handleReturnToStart}
              />
            )}
            
            {currentScreen === 'leaderboard' && (
              <Leaderboard 
                onClose={handleReturnToStart}
              />
            )}
            
            {currentScreen === 'trophy-case' && (
              <TrophyCase 
                onBack={handleReturnToStart}
              />
            )}
            
            {currentScreen === 'missed' && (
              <MissedQuestions 
                playerOneName={playerOneName}
                playerTwoName={playerTwoName}
                playerOneAvatar={playerOneAvatar}
                playerTwoAvatar={playerTwoAvatar}
                onReturnToStart={handleReturnToStart}
              />
            )}

            {currentScreen === 'accessory-test' && (
              <AccessoryTest />
            )}
          </>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
