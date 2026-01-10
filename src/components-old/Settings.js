import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Paper, 
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/material';

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

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: theme.spacing(8),
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  zIndex: 1,
  maxWidth: '800px',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(4),
  }
}));

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
}));

const KeyButton = styled(Box)(({ theme, isListening }) => ({
  padding: theme.spacing(2, 3),
  backgroundColor: isListening ? '#4caf50' : '#0f258f',
  color: 'white',
  borderRadius: '8px',
  cursor: 'pointer',
  textAlign: 'center',
  minWidth: '120px',
  transition: 'all 0.3s ease',
  fontWeight: 'bold',
  fontSize: '1rem',
  border: isListening ? '2px solid #2e7d32' : '2px solid #0a1850',
  '&:hover': {
    backgroundColor: isListening ? '#45a049' : '#0d1f73',
    transform: 'scale(1.05)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  }
}));

const STORAGE_KEY = 'jeopardy_buzzer_keys';

// Default keys
const DEFAULT_KEYS = {
  playerOne: [
    { key: '2', code: 'Digit2', keyCode: 50 },
    { key: 'ShiftLeft', code: 'ShiftLeft', keyCode: 16 }
  ],
  playerTwo: [
    { key: 'Enter', code: 'Enter', keyCode: 13 },
    { key: 'ShiftRight', code: 'ShiftRight', keyCode: 16 }
  ]
};

function Settings({ onReturnToMenu }) {
  const [playerOneKeys, setPlayerOneKeys] = useState([...DEFAULT_KEYS.playerOne]);
  const [playerTwoKeys, setPlayerTwoKeys] = useState([...DEFAULT_KEYS.playerTwo]);
  const [listeningFor, setListeningFor] = useState(null); // { player: 'playerOne'/'playerTwo', keyIndex: 0/1 }
  const [saveMessage, setSaveMessage] = useState('');

  // Load saved keys on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.playerOne) setPlayerOneKeys(parsed.playerOne);
        if (parsed.playerTwo) setPlayerTwoKeys(parsed.playerTwo);
      }
    } catch (error) {
      console.error('Error loading buzzer keys:', error);
    }
  }, []);

  // Listen for key press when setting a new key
  useEffect(() => {
    if (!listeningFor) return;

    const handleKeyDown = (e) => {
      e.preventDefault();
      
      // Allow ESC to cancel key listening
      if (e.key === 'Escape') {
        setListeningFor(null);
        return;
      }
      
      // Create key object with all the info we need
      const keyInfo = {
        key: e.key,
        code: e.code,
        keyCode: e.keyCode
      };

      // Update the appropriate key
      if (listeningFor.player === 'playerOne') {
        const newKeys = [...playerOneKeys];
        newKeys[listeningFor.keyIndex] = keyInfo;
        setPlayerOneKeys(newKeys);
      } else {
        const newKeys = [...playerTwoKeys];
        newKeys[listeningFor.keyIndex] = keyInfo;
        setPlayerTwoKeys(newKeys);
      }

      setListeningFor(null);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [listeningFor, playerOneKeys, playerTwoKeys]);

  // Listen for ESC key to exit settings (when not listening for a key)
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !listeningFor) {
        onReturnToMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [listeningFor, onReturnToMenu]);

  const handleSave = () => {
    try {
      const settings = {
        playerOne: playerOneKeys,
        playerTwo: playerTwoKeys
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaveMessage('Settings saved successfully!');
      
      // Return to menu after a brief delay to show the success message
      setTimeout(() => {
        onReturnToMenu();
      }, 800);
    } catch (error) {
      console.error('Error saving buzzer keys:', error);
      setSaveMessage('Error saving settings. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleResetToDefaults = () => {
    setPlayerOneKeys([...DEFAULT_KEYS.playerOne]);
    setPlayerTwoKeys([...DEFAULT_KEYS.playerTwo]);
    setSaveMessage('Reset to default keys');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleSetKey = (player, keyIndex) => {
    setListeningFor({ player, keyIndex });
  };

  const formatKeyName = (keyInfo) => {
    if (!keyInfo) return 'Not Set';
    
    // Friendly names for common keys
    const friendlyNames = {
      'ShiftLeft': 'Left Shift',
      'ShiftRight': 'Right Shift',
      'ControlLeft': 'Left Ctrl',
      'ControlRight': 'Right Ctrl',
      'AltLeft': 'Left Alt',
      'AltRight': 'Right Alt',
      'Enter': 'Enter',
      'Space': 'Space',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→'
    };

    return friendlyNames[keyInfo.code] || keyInfo.key.toUpperCase();
  };

  return (
    <>
      <BackgroundContainer />
      <AnimatedRectangles>
        <div />
        <div />
        <div />
        <div />
        <div />
      </AnimatedRectangles>
      
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <StyledPaper elevation={3}>
          {/* Close/Back Button in Top Right */}
          <IconButton
            onClick={onReturnToMenu}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: '#0f258f',
              backgroundColor: 'rgba(15, 37, 143, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(15, 37, 143, 0.2)',
              }
            }}
            title="Close Settings (ESC)"
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, color: '#0f258f', fontWeight: 'bold' }}>
            ⚙️ Settings
          </Typography>

          {saveMessage && (
            <Alert 
              severity={saveMessage.includes('Error') ? 'error' : 'success'} 
              sx={{ mb: 3, width: '100%' }}
            >
              {saveMessage}
            </Alert>
          )}

          <Box sx={{ width: '100%', mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#0f258f', mb: 2 }}>
              🎮 Buzzer Key Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Click on a key button below and press the key you want to use. Each player gets two buzzer keys.
            </Typography>

            <Grid container spacing={4}>
              {/* Player One Keys */}
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: 'rgba(15, 37, 143, 0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: '#0f258f', fontWeight: 'bold' }}>
                      Player 1 Buzzer Keys
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Primary Buzzer:
                        </Typography>
                        <KeyButton
                          isListening={listeningFor?.player === 'playerOne' && listeningFor?.keyIndex === 0}
                          onClick={() => handleSetKey('playerOne', 0)}
                        >
                          {listeningFor?.player === 'playerOne' && listeningFor?.keyIndex === 0
                            ? 'Press a key... (ESC to cancel)'
                            : formatKeyName(playerOneKeys[0])}
                        </KeyButton>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Secondary Buzzer:
                        </Typography>
                        <KeyButton
                          isListening={listeningFor?.player === 'playerOne' && listeningFor?.keyIndex === 1}
                          onClick={() => handleSetKey('playerOne', 1)}
                        >
                          {listeningFor?.player === 'playerOne' && listeningFor?.keyIndex === 1
                            ? 'Press a key... (ESC to cancel)'
                            : formatKeyName(playerOneKeys[1])}
                        </KeyButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Player Two Keys */}
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: 'rgba(15, 37, 143, 0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: '#0f258f', fontWeight: 'bold' }}>
                      Player 2 Buzzer Keys
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Primary Buzzer:
                        </Typography>
                        <KeyButton
                          isListening={listeningFor?.player === 'playerTwo' && listeningFor?.keyIndex === 0}
                          onClick={() => handleSetKey('playerTwo', 0)}
                        >
                          {listeningFor?.player === 'playerTwo' && listeningFor?.keyIndex === 0
                            ? 'Press a key... (ESC to cancel)'
                            : formatKeyName(playerTwoKeys[0])}
                        </KeyButton>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Secondary Buzzer:
                        </Typography>
                        <KeyButton
                          isListening={listeningFor?.player === 'playerTwo' && listeningFor?.keyIndex === 1}
                          onClick={() => handleSetKey('playerTwo', 1)}
                        >
                          {listeningFor?.player === 'playerTwo' && listeningFor?.keyIndex === 1
                            ? 'Press a key... (ESC to cancel)'
                            : formatKeyName(playerTwoKeys[1])}
                        </KeyButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ width: '100%', mb: 3 }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={onReturnToMenu}
              startIcon={<ArrowBackIcon />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              Back to Menu
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              💾 Save Settings
            </Button>

            <Button
              variant="outlined"
              color="warning"
              onClick={handleResetToDefaults}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
              }}
            >
              🔄 Reset to Defaults
            </Button>
          </Box>

          {/* Help Text */}
          <Box sx={{ mt: 4, p: 2, backgroundColor: 'rgba(15, 37, 143, 0.05)', borderRadius: '8px' }}>
            <Typography variant="body2" color="text.secondary">
              <strong>💡 Tips:</strong><br />
              • Choose keys that are comfortable to reach quickly<br />
              • Avoid keys used for typing answers (letters, numbers except 2)<br />
              • Recommended: Shift keys, Ctrl keys, or arrow keys<br />
              • Default keys: Player 1 (2, Left Shift) | Player 2 (Enter, Right Shift)<br />
              • Press <strong>ESC</strong> to exit settings or cancel key capture
            </Typography>
          </Box>
        </StyledPaper>
      </Container>
    </>
  );
}

export default Settings;

