import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme, Slider, IconButton, Tooltip } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import Board from './Board';
import MissedQuestions from './components/MissedQuestions';
import StartScreen from './components/StartScreen';
import PlayerSetup from './components/PlayerSetup';

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
  const [currentScreen, setCurrentScreen] = useState('start'); // 'start', 'setup', 'game', or 'missed'
  const [playerOneName, setPlayerOneName] = useState('Courtney');
  const [playerTwoName, setPlayerTwoName] = useState('Sean');
  const [playerOneAvatar, setPlayerOneAvatar] = useState(null);
  const [playerTwoAvatar, setPlayerTwoAvatar] = useState(null);
  const [themeMusic, setThemeMusic] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize theme music
  useEffect(() => {
    const music = new Audio('/audio/jeopardy-opening-credits-song.mp3');
    music.loop = true;
    music.volume = volume;
    
    // Add error handling
    music.addEventListener('error', (e) => {
      console.error('Error loading theme music:', e);
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
    }
  }, [volume, isMuted, themeMusic]);

  // Stop theme music when game starts
  useEffect(() => {
    if (currentScreen === 'game' && themeMusic) {
      themeMusic.pause();
      themeMusic.currentTime = 0;
    } else if (currentScreen === 'start' && themeMusic) {
      // Restart theme music when returning to start screen
      themeMusic.play().catch(error => {
        console.error('Error playing theme music:', error);
      });
    }
  }, [currentScreen, themeMusic]);

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    setIsMuted(false);
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
    setCurrentScreen('setup');
  };

  const handleStartGame = (p1Name, p2Name, p1Avatar, p2Avatar) => {
    setPlayerOneName(p1Name);
    setPlayerTwoName(p2Name);
    setPlayerOneAvatar(p1Avatar);
    setPlayerTwoAvatar(p2Avatar);
    setCurrentScreen('game');
  };

  const handleViewMissedQuestions = () => {
    setCurrentScreen('missed');
  };

  const handleReturnToStart = () => {
    setCurrentScreen('start');
  };

  useEffect(() => {
    // console.log('currentScreen', currentScreen);
    if (currentScreen === 'start') {
      handlePlayThemeMusic();
    }
  }, [currentScreen]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh', 
        padding: 2,
        position: 'relative'
      }}>
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
          />
        )}
        
        {currentScreen === 'setup' && (
          <PlayerSetup 
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
            onReturnToStart={handleReturnToStart}
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
      </Box>
    </ThemeProvider>
  );
}

export default App;
