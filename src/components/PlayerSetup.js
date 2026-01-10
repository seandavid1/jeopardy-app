import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Container, Paper, Grid, Modal, Card, CardContent, CardActionArea, Chip, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import { avatarOptions } from './avatarOptions';
import { getAllUserAvatars } from '../utils/customUserAvatars';
import { keyframes } from '@mui/material';
import Question from '../Question';
import CPU_OPPONENTS, { getCPUOpponentById } from '../config/cpuOpponents';
import { generateCPUAvatar } from '../utils/avatarGenerator';
import AvatarBuilder from './AvatarBuilder';
import AvatarWithAccessories from './AvatarWithAccessories';
import { useAuth } from '../contexts/AuthContext';
import { getUserUnlockState, UNLOCK_REQUIREMENTS, areSecretBossesVisible } from '../services/cpuUnlockSystem';
import { DIFFICULTY_MODES, DIFFICULTY_LABELS, DIFFICULTY_DESCRIPTIONS } from '../utils/difficultyFilter';

// Constants for localStorage
const PLAYER_PREFS_KEY = 'jeopardy_player_preferences';

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
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  zIndex: 1
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: 'white',
    '& fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.dark,
    },
  },
}));

const AvatarOption = styled(Paper)(({ theme, selected, color }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  backgroundColor: selected ? color : 'white',
  border: selected ? `2px solid ${color}` : '2px solid transparent',
  '&:hover': {
    transform: 'scale(1.05)',
    backgroundColor: selected ? color : '#f5f5f5',
  },
}));

const AvatarImage = styled(Typography)({
  fontSize: '3rem',
  marginBottom: '0.5rem',
});

const AvatarGridContainer = styled(Box)({
  maxHeight: '300px',
  overflowY: 'auto',
  padding: '8px',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#555',
  },
});

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

const AvatarModal = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 600,
  backgroundColor: 'white',
  padding: theme.spacing(4),
  borderRadius: '16px',
  maxHeight: '80vh',
  overflowY: 'auto',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const ColorPicker = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  borderRadius: '8px',
}));

const CurrentAvatar = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
}));

const AvatarCircle = styled(Box)(({ theme, color }) => ({
  width: '230px',
  height: '230px',
  borderRadius: '50%',
  backgroundColor: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '4px solid #f5f5f5',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '& > *': {
    fontSize: '6.7rem',
  },
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
  }
}));

function PlayerSetup({ onStartGame, onReturnToMenu }) {
  const { user } = useAuth();
  
  // CPU Unlock State
  const [cpuUnlockState, setCpuUnlockState] = useState({});
  const [isLoadingUnlocks, setIsLoadingUnlocks] = useState(true);
  const [secretBossesVisible, setSecretBossesVisible] = useState(false);
  
  // Load CPU unlock state
  useEffect(() => {
    async function loadUnlocks() {
      try {
        setIsLoadingUnlocks(true);
        const unlockState = await getUserUnlockState(user?.uid);
        setCpuUnlockState(unlockState);
        console.log('Loaded CPU unlock state:', unlockState);
        
        // Check if secret bosses should be visible (Ken beaten)
        const secretsVisible = await areSecretBossesVisible(user?.uid);
        setSecretBossesVisible(secretsVisible);
        console.log('Secret bosses visible:', secretsVisible);
      } catch (error) {
        console.error('Error loading unlock state:', error);
      } finally {
        setIsLoadingUnlocks(false);
      }
    }
    
    loadUnlocks();
  }, [user]);
  
  // Load saved custom DiceBear avatars from localStorage
  const [savedCustomAvatars, setSavedCustomAvatars] = useState([]);
  const preferencesLoadedRef = React.useRef(false);
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jeopardy_custom_avatars');
      if (saved) {
        const avatars = JSON.parse(saved);
        setSavedCustomAvatars(avatars);
        console.log('Loaded custom avatars:', avatars.length);
        console.log('Custom avatars:', avatars.map(a => ({ id: a.id, isDicebear: a.isDicebear, hasImage: !!a.image })));
      }
    } catch (error) {
      console.error('Error loading custom avatars:', error);
    }
  }, []);
  
  // Combine default avatars with custom avatars and saved DiceBear avatars
  const allAvatars = [...getAllUserAvatars(avatarOptions), ...savedCustomAvatars];
  
  // Find the SDR avatar (custom avatar) as default for Player 2
  const sdrAvatar = allAvatars.find(avatar => avatar.id === 'custom-sdr') || allAvatars[2];
  
  // Game mode selection
  const [setupStep, setSetupStep] = useState('mode'); // 'mode', 'opponent', 'players'
  const [gameMode, setGameMode] = useState(null); // 'two-player', 'solo', 'cpu'
  const [selectedCPU, setSelectedCPU] = useState(null);
  const [difficultyMode, setDifficultyMode] = useState(DIFFICULTY_MODES.REGULAR); // 'regular' or 'hard'
  
  const [playerOneName, setPlayerOneName] = useState('');
  const [playerTwoName, setPlayerTwoName] = useState('');
  const [playerOneAvatar, setPlayerOneAvatar] = useState(allAvatars[0]);
  const [playerTwoAvatar, setPlayerTwoAvatar] = useState(sdrAvatar);
  const [playerOneColor, setPlayerOneColor] = useState('#0A648A');
  const [playerTwoColor, setPlayerTwoColor] = useState(sdrAvatar.color);
  const [openCustomizationModal, setOpenCustomizationModal] = useState({ playerOne: false, playerTwo: false });
  const [openAvatarBuilder, setOpenAvatarBuilder] = useState({ playerOne: false, playerTwo: false });
  const [editingAvatar, setEditingAvatar] = useState({ playerOne: null, playerTwo: null }); // Track avatar being edited
  
  // Function to load saved preferences
  const loadSavedPreferences = () => {
    try {
      const saved = localStorage.getItem(PLAYER_PREFS_KEY);
      if (saved) {
        const prefs = JSON.parse(saved);
        console.log('Loaded saved preferences:', prefs);
        return prefs;
      }
    } catch (error) {
      console.error('Error loading player preferences:', error);
    }
    return null;
  };
  
  // Function to save preferences
  const savePlayerOnePreferences = (name, avatar, color) => {
    try {
      const preferences = {
        name,
        avatarId: avatar.id,
        color,
        timestamp: new Date().toISOString()
      };
      console.log('Saving Player One preferences:', preferences);
      localStorage.setItem(PLAYER_PREFS_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving player one preferences:', error);
    }
  };

  const savePlayerTwoPreferences = (name, avatar, color) => {
    try {
      const preferences = {
        name,
        avatarId: avatar.id,
        color,
        timestamp: new Date().toISOString()
      };
      console.log('Saving Player Two preferences:', preferences);
      localStorage.setItem('jeopardy_player_two_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving player two preferences:', error);
    }
  };
  
  // Load saved preferences on component mount (only once)
  useEffect(() => {
    // Only load preferences once, not on every re-render
    if (preferencesLoadedRef.current) {
      return;
    }
    
    // Skip if allAvatars hasn't loaded yet
    if (allAvatars.length === 0) {
      return;
    }
    
    console.log('PlayerSetup mounted, loading preferences...');
    
    // Load Player One preferences
    const savedPrefsPlayerOne = loadSavedPreferences();
    console.log('savedPrefs Player One:', savedPrefsPlayerOne);
    
    if (savedPrefsPlayerOne) {
      // Try to find the saved avatar
      const savedAvatar = allAvatars.find(avatar => avatar.id === savedPrefsPlayerOne.avatarId);
      console.log('Found saved avatar for Player One:', savedAvatar);
      
      if (savedAvatar) {
        console.log('Setting player one avatar to:', savedAvatar);
        setPlayerOneAvatar(savedAvatar);
      }
      
      console.log('Setting player one name to:', savedPrefsPlayerOne.name);
      setPlayerOneName(savedPrefsPlayerOne.name || '');
      setPlayerOneColor(savedPrefsPlayerOne.color || '#0A648A');
    } else {
      console.log('No saved preferences found for Player One');
    }

    // Load Player Two preferences
    try {
      const savedPlayerTwo = localStorage.getItem('jeopardy_player_two_preferences');
      if (savedPlayerTwo) {
        const savedPrefsPlayerTwo = JSON.parse(savedPlayerTwo);
        console.log('savedPrefs Player Two:', savedPrefsPlayerTwo);
        
        // Try to find the saved avatar
        const savedAvatar = allAvatars.find(avatar => avatar.id === savedPrefsPlayerTwo.avatarId);
        console.log('Found saved avatar for Player Two:', savedAvatar);
        
        if (savedAvatar) {
          console.log('Setting player two avatar to:', savedAvatar);
          setPlayerTwoAvatar(savedAvatar);
          setPlayerTwoColor(savedAvatar.color || savedPrefsPlayerTwo.color);
        }
        
        console.log('Setting player two name to:', savedPrefsPlayerTwo.name);
        setPlayerTwoName(savedPrefsPlayerTwo.name || '');
      } else {
        console.log('No saved preferences found for Player Two');
      }
    } catch (error) {
      console.error('Error loading Player Two preferences:', error);
    }
    
    // Mark preferences as loaded
    preferencesLoadedRef.current = true;
  }, [allAvatars]);

  // Dummy question for theme music
  const dummyQuestion = {
    id: 'setup',
    clue: 'Welcome to Jeopardy!',
    response: 'Let\'s play!',
    category: 'Game Setup'
  };

  const handleStartGame = () => {
    console.log('handleStartGame called', { 
      gameMode, 
      playerOneName, 
      playerTwoName, 
      selectedCPU,
      playerOneAvatar,
      playerTwoAvatar,
      difficultyMode
    });
    
    // Save Player 1 preferences
    savePlayerOnePreferences(playerOneName, playerOneAvatar, playerOneColor);
    
    if (gameMode === 'two-player') {
      // Save Player 2 preferences in two-player mode
      savePlayerTwoPreferences(playerTwoName, playerTwoAvatar, playerTwoColor);
      
      if (playerOneName.trim() && playerTwoName.trim()) {
        onStartGame(
          playerOneName, 
          playerTwoName, 
          { 
            ...playerOneAvatar, 
            selectedImage: playerOneAvatar.image,
            color: playerOneColor
          },
          { 
            ...playerTwoAvatar, 
            selectedImage: playerTwoAvatar.image,
            color: playerTwoColor
          },
          { mode: 'two-player' },
          difficultyMode
        );
      }
    } else if (gameMode === 'solo') {
      if (playerOneName.trim()) {
        onStartGame(
          playerOneName,
          null, // No second player
          {
            ...playerOneAvatar,
            selectedImage: playerOneAvatar.image,
            color: playerOneColor
          },
          null,
          { mode: 'solo' },
          difficultyMode
        );
      }
    } else if (gameMode === 'cpu') {
      if (playerOneName.trim() && selectedCPU) {
        // Get the full CPU opponent object
        const cpuOpponent = getCPUOpponentById(selectedCPU);
        
        onStartGame(
          playerOneName,
          cpuOpponent.name,
          {
            ...playerOneAvatar,
            selectedImage: playerOneAvatar.image,
            color: playerOneColor
          },
          {
            dataUrl: generateCPUAvatar(cpuOpponent),
            color: cpuOpponent.avatar.backgroundColor
          },
          { 
            mode: 'cpu',
            cpuOpponent: cpuOpponent
          },
          difficultyMode
        );
      }
    }
  };

  const handleModeSelect = (mode) => {
    setGameMode(mode);
    // All modes now go to players screen first
    setSetupStep('players');
  };

  const handleCPUSelect = (cpuId) => {
    setSelectedCPU(cpuId);
  };

  const handleContinueFromPlayers = () => {
    if (gameMode === 'cpu') {
      setSetupStep('opponent');
    }
  };

  const handleStartGameFromOpponent = () => {
    if (playerOneName.trim() && selectedCPU) {
      // Save Player 1 preferences
      savePlayerOnePreferences(playerOneName, playerOneAvatar, playerOneColor);
      
      // Get the full CPU opponent object
      const cpuOpponent = getCPUOpponentById(selectedCPU);
      
      onStartGame(
        playerOneName,
        cpuOpponent.name,
        {
          ...playerOneAvatar,
          selectedImage: playerOneAvatar.image,
          color: playerOneColor
        },
        {
          dataUrl: generateCPUAvatar(cpuOpponent),
          color: cpuOpponent.avatar.backgroundColor
        },
        { 
          mode: 'cpu',
          cpuOpponent: cpuOpponent
        },
        difficultyMode
      );
    }
  };

  const handleOpenCustomizationModal = (player) => {
    setOpenCustomizationModal(prev => ({ ...prev, [player]: true }));
  };

  const handleCloseCustomizationModal = (player) => {
    setOpenCustomizationModal(prev => ({ ...prev, [player]: false }));
  };

  const handleOpenAvatarBuilder = (player) => {
    setEditingAvatar(prev => ({ ...prev, [player]: null })); // Clear editing mode
    setOpenAvatarBuilder(prev => ({ ...prev, [player]: true }));
  };

  const handleEditAvatar = (player, avatar) => {
    setEditingAvatar(prev => ({ ...prev, [player]: avatar })); // Set avatar being edited
    setOpenAvatarBuilder(prev => ({ ...prev, [player]: true }));
  };

  const handleDeleteAvatar = (avatarId) => {
    try {
      const savedAvatars = JSON.parse(localStorage.getItem('jeopardy_custom_avatars') || '[]');
      const filteredAvatars = savedAvatars.filter(a => a.id !== avatarId);
      
      localStorage.setItem('jeopardy_custom_avatars', JSON.stringify(filteredAvatars));
      setSavedCustomAvatars(filteredAvatars);
      
      console.log('Deleted avatar:', avatarId);
      console.log('Remaining avatars:', filteredAvatars.length);
      
      // If deleted avatar was selected, reset to first avatar
      if (playerOneAvatar.id === avatarId) {
        const firstAvatar = allAvatars.find(a => a.id !== avatarId) || allAvatars[0];
        setPlayerOneAvatar(firstAvatar);
      }
      if (playerTwoAvatar.id === avatarId) {
        const firstAvatar = allAvatars.find(a => a.id !== avatarId) || allAvatars[0];
        setPlayerTwoAvatar(firstAvatar);
      }
    } catch (error) {
      console.error('Error deleting avatar:', error);
    }
  };

  const handleCloseAvatarBuilder = (player) => {
    setOpenAvatarBuilder(prev => ({ ...prev, [player]: false }));
    setEditingAvatar(prev => ({ ...prev, [player]: null })); // Clear editing state
  };

  const handleSaveCustomAvatar = (player, avatarData) => {
    // Check if we're editing an existing avatar
    const editingAvatarForPlayer = editingAvatar[player];
    
    // Create a custom avatar object from the builder data
    const customAvatar = {
      id: editingAvatarForPlayer ? editingAvatarForPlayer.id : `custom-dicebear-${Date.now()}`, // Keep same ID if editing
      name: 'My Avatar',
      image: avatarData.dataUrl,
      femaleImage: avatarData.dataUrl,
      color: avatarData.customizations.backgroundColor,
      isDicebear: true,
      dicebearStyle: avatarData.style,
      dicebearOptions: avatarData.customizations,
      customAccessories: avatarData.customAccessories || [] // Save custom accessories!
    };

    console.log('Creating custom avatar:', customAvatar.id);
    console.log('Avatar data URL length:', avatarData.dataUrl?.length || 0);
    console.log('Custom accessories:', avatarData.customAccessories);
    console.log('Editing mode:', !!editingAvatarForPlayer);

    // Save to localStorage for future use
    try {
      const savedAvatars = JSON.parse(localStorage.getItem('jeopardy_custom_avatars') || '[]');
      
      if (editingAvatarForPlayer) {
        // Replace the existing avatar
        const index = savedAvatars.findIndex(a => a.id === editingAvatarForPlayer.id);
        if (index !== -1) {
          savedAvatars[index] = customAvatar;
          console.log('Replaced avatar at index:', index);
        } else {
          // If not found, add as new (shouldn't happen, but just in case)
          savedAvatars.push(customAvatar);
        }
      } else {
        // Add the new avatar (limit to 10 saved avatars)
        savedAvatars.push(customAvatar);
        if (savedAvatars.length > 10) {
          savedAvatars.shift(); // Remove oldest if over 10
        }
      }
      
      localStorage.setItem('jeopardy_custom_avatars', JSON.stringify(savedAvatars));
      console.log('Saved custom avatar to localStorage:', customAvatar.id);
      console.log('Total saved avatars:', savedAvatars.length);
      
      // Update the saved avatars state to refresh the UI
      setSavedCustomAvatars(savedAvatars);
    } catch (error) {
      console.error('Error saving custom avatar:', error);
    }

    if (player === 'playerOne') {
      console.log('Setting player one avatar to custom avatar');
      setPlayerOneAvatar(customAvatar);
      setPlayerOneColor(avatarData.customizations.backgroundColor);
    } else {
      console.log('Setting player two avatar to custom avatar');
      setPlayerTwoAvatar(customAvatar);
      setPlayerTwoColor(avatarData.customizations.backgroundColor);
    }
    
    handleCloseAvatarBuilder(player);
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
        <div />
        <div />
        <div />
        <div />
      </AnimatedRectangles>
      
      {/* Game Mode Selection Screen */}
      {setupStep === 'mode' && (
        <Container maxWidth="lg" sx={{ backgroundColor: 'transparent', position: 'relative', zIndex: 1, mt: 8 }}>
          <StyledPaper elevation={3}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
              Select Game Mode
            </Typography>
            
            <Grid container spacing={3}>
              {/* Two Player - Hide on mobile */}
              <Grid 
                item 
                xs={12} 
                md={6}
                sx={{
                  display: { xs: 'none', md: 'block' } // Hide on mobile (xs), show on desktop (md+)
                }}
              >
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'scale(1.05)', boxShadow: 6 }
                  }}
                  onClick={() => handleModeSelect('two-player')}
                >
                  <CardActionArea>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h3" sx={{ mb: 2 }}>👥</Typography>
                      <Typography variant="h5" gutterBottom>Two Player</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Play with a friend on the same device
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              
              <Grid 
                item 
                xs={12} 
                md={6}
                sx={{
                  // On mobile, take full width since two-player is hidden
                  md: 6,
                  xs: 12
                }}
              >
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'scale(1.05)', boxShadow: 6 }
                  }}
                  onClick={() => handleModeSelect('cpu')}
                >
                  <CardActionArea>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h3" sx={{ mb: 2 }}>🤖</Typography>
                      <Typography variant="h5" gutterBottom>vs CPU</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Challenge legendary Jeopardy! champions
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button onClick={onReturnToMenu} variant="outlined">
                Back to Menu
              </Button>
            </Box>
          </StyledPaper>
        </Container>
      )}
      
      {/* CPU Opponent Selection Screen */}
      {setupStep === 'opponent' && (
        <Container maxWidth="lg" sx={{ backgroundColor: 'transparent', position: 'relative', zIndex: 1, mt: 8 }}>
          <StyledPaper elevation={3}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 2 }}>
              Choose Your Opponent
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Select a difficulty level and face off against legendary contestants!
            </Typography>
            
            <Box sx={{ maxHeight: '500px', overflowY: 'auto', px: 2 }}>
              {isLoadingUnlocks ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <Typography>Loading opponents...</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {CPU_OPPONENTS
                    .filter(opponent => {
                      // Secret bosses: only show if Ken Jennings has been beaten
                      if (opponent.isSecret && !secretBossesVisible) {
                        return false; // Hide completely until Ken beaten
                      }
                      return true; // Show all others (even if locked)
                    })
                    .map((opponent) => {
                      const isLocked = !cpuUnlockState[opponent.id];
                      const unlockReq = UNLOCK_REQUIREMENTS[opponent.id];
                      
                      // Generate tooltip text
                      let tooltipText = '';
                      if (isLocked && unlockReq) {
                        if (unlockReq.beatOpponent) {
                          const previousOpponent = CPU_OPPONENTS.find(opp => opp.id === unlockReq.beatOpponent);
                          tooltipText = `Beat ${previousOpponent?.name || 'previous opponent'} to unlock`;
                        } else {
                          tooltipText = unlockReq.description;
                        }
                      }
                      
                      return (
                        <Grid item xs={12} sm={6} md={4} key={opponent.id}>
                          <Tooltip 
                            title={tooltipText}
                            arrow
                          >
                            <Card 
                              sx={{ 
                                cursor: isLocked ? 'not-allowed' : 'pointer',
                                border: selectedCPU === opponent.id ? '3px solid #0f258f' : '1px solid #ddd',
                                transition: 'all 0.3s',
                                '&:hover': !isLocked && { transform: 'scale(1.02)', boxShadow: 4 },
                                position: 'relative',
                                minHeight: '280px',
                                opacity: isLocked ? 0.6 : 1,
                                filter: isLocked ? 'grayscale(50%)' : 'none',
                                ...(isLocked && {
                                  border: '2px dashed #999',
                                  backgroundColor: '#f5f5f5'
                                })
                              }}
                              onClick={() => !isLocked && handleCPUSelect(opponent.id)}
                            >
                              {/* Lock icon for locked opponents */}
                              {isLocked && (
                                <Box sx={{
                                  position: 'absolute',
                                  top: 10,
                                  right: 10,
                                  zIndex: 1
                                }}>
                                  <LockIcon sx={{ color: '#FFD700', fontSize: '2rem' }} />
                                </Box>
                              )}
                              
                              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 6 }}>
                                {/* Centered Avatar - 120px */}
                                <Box 
                                  component="img"
                                  src={generateCPUAvatar(opponent)}
                                  alt={opponent.name}
                                  sx={{ 
                                    width: 120, 
                                    height: 120, 
                                    borderRadius: '50%', 
                                    mb: 2 
                                  }}
                                />
                                
                                {/* Centered Bold Name */}
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    fontSize: '1rem', 
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    mb: 0.5
                                  }}
                                >
                                  {opponent.isSecret && isLocked ? opponent.displayName : opponent.name}
                                </Typography>
                                
                                {/* Difficulty Level */}
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    fontSize: '0.75rem', 
                                    textAlign: 'center',
                                    color: 'text.secondary',
                                    mb: 1
                                  }}
                                >
                                  Difficulty: {opponent.difficulty}/18
                                </Typography>
                                
                                {/* Description below name */}
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  sx={{ 
                                    fontSize: '0.85rem', 
                                    textAlign: 'center',
                                    mb: 2
                                  }}
                                >
                                  {isLocked && unlockReq 
                                    ? unlockReq.description 
                                    : opponent.bio}
                                </Typography>
                                
                                {/* Tier chip absolutely positioned at bottom center */}
                                <Chip 
                                  label={opponent.tier} 
                                  size="small" 
                                  color={
                                    opponent.tier === 'Beginner' ? 'success' :
                                    opponent.tier === 'Intermediate' ? 'info' :
                                    opponent.tier === 'Advanced' ? 'warning' :
                                    opponent.tier === 'Expert' ? 'error' :
                                    opponent.tier === 'Master' ? 'default' :
                                    opponent.tier === 'GOAT' ? 'error' :
                                    'default'
                                  }
                                  sx={{ 
                                    position: 'absolute',
                                    bottom: '15px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    ...(opponent.tier === 'Master' && {
                                      backgroundColor: '#000',
                                      color: '#fff',
                                      fontWeight: 'bold'
                                    }),
                                    ...(opponent.tier === 'LEGENDARY' && {
                                      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                                      color: '#000',
                                      fontWeight: 'bold',
                                      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                                    })
                                  }}
                                />
                              </CardContent>
                            </Card>
                          </Tooltip>
                        </Grid>
                      );
                    })}
                </Grid>
              )}
            </Box>
            
            {/* Buttons Container - 3-column layout */}
            <Grid container spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
              {/* Left column - Back button */}
              <Grid item xs={4}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Button 
                    onClick={() => setSetupStep('players')} 
                    variant="outlined"
                    sx={{
                      padding: '6px 20px',
                      textTransform: 'none',
                      fontSize: '0.9rem',
                    }}
                  >
                    Back
                  </Button>
                </Box>
              </Grid>
              
              {/* Center column - Start Game button */}
              <Grid item xs={4}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    onClick={handleStartGameFromOpponent} 
                    variant="contained"
                    disabled={!selectedCPU}
                    sx={{
                      padding: '12px 32px',
                      textTransform: 'none',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      minWidth: '200px',
                    }}
                  >
                    Start Game
                  </Button>
                </Box>
              </Grid>
              
              {/* Right column - Empty */}
              <Grid item xs={4}>
                {/* Intentionally empty for symmetry */}
              </Grid>
            </Grid>
          </StyledPaper>
        </Container>
      )}
      
      {/* Player Setup Screen */}
      {setupStep === 'players' && (
      <Container maxWidth="md" sx={{ backgroundColor: 'transparent', position: 'relative', zIndex: 1 }}>
        <StyledPaper elevation={3}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ mb: 4 }}
          >
            {gameMode === 'solo' ? 'Create Your Profile' : gameMode === 'cpu' ? 'Create Your Profile' : 'Create Player Profiles'}
          </Typography>
          
          <Grid container spacing={4} justifyContent="center">
            {/* Player 1 Section */}
            <Grid item xs={12} md={gameMode === 'two-player' ? 6 : 8}>
              <Typography variant="h6" gutterBottom>
                {gameMode === 'two-player' ? 'Player 1' : 'Your Profile'}
              </Typography>
              <StyledTextField
                label={gameMode === 'two-player' ? 'Player 1 Name' : 'Your Name'}
                variant="outlined"
                value={playerOneName}
                onChange={(e) => setPlayerOneName(e.target.value)}
                required
              />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                <CurrentAvatar>
                  <AvatarCircle 
                    color={playerOneColor}
                    onClick={() => handleOpenCustomizationModal('playerOne')}
                    title="Click to customize avatar"
                  >
                    {playerOneAvatar.isCustom || playerOneAvatar.isDicebear ? (
                      // Check if avatar has custom accessories
                      playerOneAvatar.customAccessories && playerOneAvatar.customAccessories.length > 0 ? (
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <AvatarWithAccessories
                            avatar={playerOneAvatar}
                            unlockedAccessories={playerOneAvatar.customAccessories}
                            achievements={[]}
                            size="100%"
                            showEffects={false}
                          />
                        </Box>
                      ) : (
                        <img 
                          src={playerOneAvatar.isDicebear 
                            ? playerOneAvatar.image 
                            : `${process.env.PUBLIC_URL}${playerOneAvatar.image}`}
                          alt={playerOneAvatar.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                        />
                      )
                    ) : (
                      <AvatarImage style={{ pointerEvents: 'none' }}>
                        {playerOneAvatar.image}
                      </AvatarImage>
                    )}
                  </AvatarCircle>
                </CurrentAvatar>
              </Box>

              <Modal
                open={openCustomizationModal.playerOne}
                onClose={() => handleCloseCustomizationModal('playerOne')}
              >
                <AvatarModal>
                  <Typography variant="h6" gutterBottom>
                    Customize {playerOneName}'s Appearance
                  </Typography>
                  
                  {/* Custom Avatar Builder Button */}
                  <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => {
                        handleCloseCustomizationModal('playerOne');
                        handleOpenAvatarBuilder('playerOne');
                      }}
                      sx={{ mb: 2 }}
                    >
                      🎨 Create Custom Avatar
                    </Button>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Or choose a preset below:
                    </Typography>
                  </Box>
                  
                  <AvatarGridContainer>
                    <Grid container spacing={1}>
                      {allAvatars.map((avatar) => (
                        <Grid item xs={4} key={avatar.id}>
                          <Box sx={{ position: 'relative' }}>
                            <AvatarOption
                              selected={playerOneAvatar.id === avatar.id}
                              color={playerOneAvatar.id === avatar.id ? playerOneColor : avatar.color}
                              onClick={() => {
                                console.log('Avatar clicked:', avatar.id, 'isDicebear:', avatar.isDicebear);
                                setPlayerOneAvatar(avatar);
                                // Also update color if it's a DiceBear avatar
                                if (avatar.isDicebear && avatar.color) {
                                  setPlayerOneColor(avatar.color);
                                }
                              }}
                            >
                              {avatar.isCustom || avatar.isDicebear ? (
                                // Check if avatar has custom accessories
                                avatar.customAccessories && avatar.customAccessories.length > 0 ? (
                                  <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    <AvatarWithAccessories
                                      avatar={avatar}
                                      unlockedAccessories={avatar.customAccessories}
                                      achievements={[]}
                                      size="100%"
                                      showEffects={false}
                                    />
                                  </Box>
                                ) : (
                                  <img 
                                    src={avatar.isDicebear 
                                      ? avatar.image 
                                      : `${process.env.PUBLIC_URL}${avatar.image}`}
                                    alt={avatar.name}
                                    style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      objectFit: 'cover', 
                                      borderRadius: '50%',
                                      pointerEvents: 'none'
                                    }}
                                  />
                                )
                              ) : (
                                <AvatarImage>
                                  {avatar.image}
                                </AvatarImage>
                              )}
                            </AvatarOption>
                            {/* Edit button for custom DiceBear avatars */}
                            {avatar.isDicebear && avatar.dicebearOptions && (
                              <>
                                <Tooltip title="Edit Avatar">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditAvatar('playerOne', avatar);
                                    }}
                                    sx={{
                                      position: 'absolute',
                                      top: 4,
                                      right: 4,
                                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                      '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 1)',
                                      },
                                      boxShadow: 1,
                                      zIndex: 10
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Avatar">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (window.confirm('Delete this avatar preset?')) {
                                        handleDeleteAvatar(avatar.id);
                                      }
                                    }}
                                    sx={{
                                      position: 'absolute',
                                      top: 4,
                                      right: 36,
                                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                      '&:hover': {
                                        backgroundColor: 'rgba(255, 100, 100, 0.9)',
                                        color: 'white'
                                      },
                                      boxShadow: 1,
                                      zIndex: 10
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </AvatarGridContainer>
                  <ColorPicker>
                    <Typography variant="subtitle1">
                      Choose Background Color:
                    </Typography>
                    <input
                      type="color"
                      value={playerOneColor}
                      onChange={(e) => setPlayerOneColor(e.target.value)}
                      style={{ width: '50px', height: '50px', padding: 0, border: 'none', borderRadius: '4px' }}
                    />
                  </ColorPicker>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button 
                      variant="contained" 
                      onClick={() => handleCloseCustomizationModal('playerOne')}
                    >
                      Done
                    </Button>
                  </Box>
                </AvatarModal>
              </Modal>

              {/* Avatar Builder Modal */}
              <AvatarBuilder 
                open={openAvatarBuilder.playerOne}
                onClose={() => handleCloseAvatarBuilder('playerOne')}
                onSave={(avatarData) => handleSaveCustomAvatar('playerOne', avatarData)}
                initialOptions={editingAvatar.playerOne ? {
                  customizations: editingAvatar.playerOne.dicebearOptions,
                  customAccessories: editingAvatar.playerOne.customAccessories || []
                } : null}
              />
            </Grid>

            {/* Player 2 Section - Only for two-player mode */}
            {gameMode === 'two-player' && (
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Player 2
              </Typography>
              <StyledTextField
                label="Player 2 Name"
                variant="outlined"
                value={playerTwoName}
                onChange={(e) => setPlayerTwoName(e.target.value)}
                required
              />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                <CurrentAvatar>
                  <AvatarCircle 
                    color={playerTwoColor}
                    onClick={() => handleOpenCustomizationModal('playerTwo')}
                    title="Click to customize avatar"
                  >
                    {playerTwoAvatar.isCustom || playerTwoAvatar.isDicebear ? (
                      // Check if avatar has custom accessories
                      playerTwoAvatar.customAccessories && playerTwoAvatar.customAccessories.length > 0 ? (
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <AvatarWithAccessories
                            avatar={playerTwoAvatar}
                            unlockedAccessories={playerTwoAvatar.customAccessories}
                            achievements={[]}
                            size="100%"
                            showEffects={false}
                          />
                        </Box>
                      ) : (
                        <img 
                          src={playerTwoAvatar.isDicebear 
                            ? playerTwoAvatar.image 
                            : `${process.env.PUBLIC_URL}${playerTwoAvatar.image}`}
                          alt={playerTwoAvatar.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                        />
                      )
                    ) : (
                      <AvatarImage style={{ pointerEvents: 'none' }}>
                        {playerTwoAvatar.image}
                      </AvatarImage>
                    )}
                  </AvatarCircle>
                </CurrentAvatar>
              </Box>

              <Modal
                open={openCustomizationModal.playerTwo}
                onClose={() => handleCloseCustomizationModal('playerTwo')}
              >
                <AvatarModal>
                  <Typography variant="h6" gutterBottom>
                    Customize {playerTwoName}'s Appearance
                  </Typography>
                  
                  {/* Custom Avatar Builder Button */}
                  <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => {
                        handleCloseCustomizationModal('playerTwo');
                        handleOpenAvatarBuilder('playerTwo');
                      }}
                      sx={{ mb: 2 }}
                    >
                      🎨 Create Custom Avatar
                    </Button>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Or choose a preset below:
                    </Typography>
                  </Box>
                  
                  <AvatarGridContainer>
                    <Grid container spacing={1}>
                      {allAvatars.map((avatar) => (
                        <Grid item xs={4} key={avatar.id}>
                          <Box sx={{ position: 'relative' }}>
                            <AvatarOption
                              selected={playerTwoAvatar.id === avatar.id}
                              color={playerTwoAvatar.id === avatar.id ? playerTwoColor : avatar.color}
                              onClick={() => {
                                console.log('Avatar clicked:', avatar.id, 'isDicebear:', avatar.isDicebear);
                                setPlayerTwoAvatar(avatar);
                                // Also update color if it's a DiceBear avatar
                                if (avatar.isDicebear && avatar.color) {
                                  setPlayerTwoColor(avatar.color);
                                }
                              }}
                            >
                              {avatar.isCustom || avatar.isDicebear ? (
                                // Check if avatar has custom accessories
                                avatar.customAccessories && avatar.customAccessories.length > 0 ? (
                                  <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    <AvatarWithAccessories
                                      avatar={avatar}
                                      unlockedAccessories={avatar.customAccessories}
                                      achievements={[]}
                                      size="100%"
                                      showEffects={false}
                                    />
                                  </Box>
                                ) : (
                                  <img 
                                    src={avatar.isDicebear 
                                      ? avatar.image 
                                      : `${process.env.PUBLIC_URL}${avatar.image}`}
                                    alt={avatar.name}
                                    style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      objectFit: 'cover', 
                                      borderRadius: '50%',
                                      pointerEvents: 'none'
                                    }}
                                  />
                                )
                              ) : (
                                <AvatarImage>
                                  {avatar.image}
                                </AvatarImage>
                              )}
                            </AvatarOption>
                            {/* Edit button for custom DiceBear avatars */}
                            {avatar.isDicebear && avatar.dicebearOptions && (
                              <>
                                <Tooltip title="Edit Avatar">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditAvatar('playerTwo', avatar);
                                    }}
                                    sx={{
                                      position: 'absolute',
                                      top: 4,
                                      right: 4,
                                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                      '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 1)',
                                      },
                                      boxShadow: 1,
                                      zIndex: 10
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Avatar">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (window.confirm('Delete this avatar preset?')) {
                                        handleDeleteAvatar(avatar.id);
                                      }
                                    }}
                                    sx={{
                                      position: 'absolute',
                                      top: 4,
                                      right: 36,
                                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                      '&:hover': {
                                        backgroundColor: 'rgba(255, 100, 100, 0.9)',
                                        color: 'white'
                                      },
                                      boxShadow: 1,
                                      zIndex: 10
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </AvatarGridContainer>
                  <ColorPicker>
                    <Typography variant="subtitle1">
                      Choose Background Color:
                    </Typography>
                    <input
                      type="color"
                      value={playerTwoColor}
                      onChange={(e) => setPlayerTwoColor(e.target.value)}
                      style={{ width: '50px', height: '50px', padding: 0, border: 'none', borderRadius: '4px' }}
                    />
                  </ColorPicker>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button 
                      variant="contained" 
                      onClick={() => handleCloseCustomizationModal('playerTwo')}
                    >
                      Done
                    </Button>
                  </Box>
                </AvatarModal>
              </Modal>

              {/* Avatar Builder Modal */}
              <AvatarBuilder 
                open={openAvatarBuilder.playerTwo}
                onClose={() => handleCloseAvatarBuilder('playerTwo')}
                onSave={(avatarData) => handleSaveCustomAvatar('playerTwo', avatarData)}
                initialOptions={editingAvatar.playerTwo ? {
                  customizations: editingAvatar.playerTwo.dicebearOptions,
                  customAccessories: editingAvatar.playerTwo.customAccessories || []
                } : null}
              />
            </Grid>
            )}
          </Grid>
          
          {/* Difficulty Mode Selector */}
          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
              Select Difficulty
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={6}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: difficultyMode === DIFFICULTY_MODES.REGULAR ? '3px solid #0f258f' : '1px solid #ddd',
                    backgroundColor: difficultyMode === DIFFICULTY_MODES.REGULAR ? 'rgba(15, 37, 143, 0.05)' : 'white',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => setDifficultyMode(DIFFICULTY_MODES.REGULAR)}
                >
                  <CardActionArea>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', color: '#0f258f' }}>
                        {DIFFICULTY_LABELS[DIFFICULTY_MODES.REGULAR]}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {DIFFICULTY_DESCRIPTIONS[DIFFICULTY_MODES.REGULAR]}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: difficultyMode === DIFFICULTY_MODES.TOURNAMENT ? '3px solid #d32f2f' : '1px solid #ddd',
                    backgroundColor: difficultyMode === DIFFICULTY_MODES.TOURNAMENT ? 'rgba(211, 47, 47, 0.05)' : 'white',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => setDifficultyMode(DIFFICULTY_MODES.TOURNAMENT)}
                >
                  <CardActionArea>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', color: '#d32f2f' }}>
                        {DIFFICULTY_LABELS[DIFFICULTY_MODES.TOURNAMENT]}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {DIFFICULTY_DESCRIPTIONS[DIFFICULTY_MODES.TOURNAMENT]}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
          </Box>
          
          {/* Buttons Container - 3-column layout */}
          <Grid container spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
            {/* Left column - Back button */}
            <Grid item xs={4}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setSetupStep('mode')}
                  sx={{
                    padding: '6px 20px',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                  }}
                >
                  Back
                </Button>
              </Box>
            </Grid>
            
            {/* Center column - Start Game button */}
            <Grid item xs={4}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={gameMode === 'cpu' ? handleContinueFromPlayers : handleStartGame}
                  disabled={
                    !playerOneName.trim() || 
                    (gameMode === 'two-player' && !playerTwoName.trim())
                  }
                  sx={{
                    padding: '12px 32px',
                    textTransform: 'none',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    minWidth: '200px',
                  }}
                >
                  {gameMode === 'cpu' ? 'Choose Opponent' : 'Start Game'}
                </Button>
              </Box>
            </Grid>
            
            {/* Right column - Empty */}
            <Grid item xs={4}>
              {/* Intentionally empty for symmetry */}
            </Grid>
          </Grid>
        </StyledPaper>
      </Container>
      )}
    </>
  );
}

export default PlayerSetup; 