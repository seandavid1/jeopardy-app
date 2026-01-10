import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Container, Paper, Grid, ToggleButton, ToggleButtonGroup, Modal } from '@mui/material';
import { styled } from '@mui/material/styles';
import { avatarOptions } from './avatarOptions';
import { keyframes } from '@mui/material';
import Question from '../Question';

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

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButton-root': {
    width: '100px',
    borderRadius: '0',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    padding: '4px 12px',
    minHeight: '32px',
    '&:first-of-type': {
      borderTopLeftRadius: '8px',
      borderBottomLeftRadius: '8px',
    },
    '&:last-of-type': {
      borderTopRightRadius: '8px',
      borderBottomRightRadius: '8px',
    },
    '&.Mui-selected': {
      backgroundColor: 'white',
      color: '#333333',
      border: '1px solid rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: 'white',
      },
    },
  },
}));

const CustomizeButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1, 3),
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '0.9rem',
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
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  backgroundColor: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '4px solid #f5f5f5',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  '& > *': {
    fontSize: '3.5rem',
  }
}));

function PlayerSetup({ onStartGame, onReturnToMenu }) {
  const [playerOneName, setPlayerOneName] = useState('Courtney');
  const [playerTwoName, setPlayerTwoName] = useState('Sean');
  const [playerOneAvatar, setPlayerOneAvatar] = useState(avatarOptions[0]);
  const [playerTwoAvatar, setPlayerTwoAvatar] = useState(avatarOptions[2]);
  const [playerOneGender, setPlayerOneGender] = useState('female');
  const [playerTwoGender, setPlayerTwoGender] = useState('male');
  const [playerOneColor, setPlayerOneColor] = useState('#0A648A');
  const [playerTwoColor, setPlayerTwoColor] = useState(playerTwoAvatar.color);
  const [openCustomizationModal, setOpenCustomizationModal] = useState({ playerOne: false, playerTwo: false });

  // Dummy question for theme music
  const dummyQuestion = {
    id: 'setup',
    clue: 'Welcome to Jeopardy!',
    response: 'Let\'s play!',
    category: 'Game Setup'
  };

  const handleStartGame = () => {
    if (playerOneName.trim() && playerTwoName.trim()) {
      onStartGame(
        playerOneName, 
        playerTwoName, 
        { 
          ...playerOneAvatar, 
          selectedImage: playerOneGender === 'male' ? playerOneAvatar.image : playerOneAvatar.femaleImage,
          color: playerOneColor 
        },
        { 
          ...playerTwoAvatar, 
          selectedImage: playerTwoGender === 'male' ? playerTwoAvatar.image : playerTwoAvatar.femaleImage,
          color: playerTwoColor 
        }
      );
    }
  };

  const handleGenderChange = (player, event, newGender) => {
    if (newGender !== null) {
      if (player === 'one') {
        setPlayerOneGender(newGender);
      } else {
        setPlayerTwoGender(newGender);
      }
    }
  };

  const handleOpenCustomizationModal = (player) => {
    setOpenCustomizationModal(prev => ({ ...prev, [player]: true }));
  };

  const handleCloseCustomizationModal = (player) => {
    setOpenCustomizationModal(prev => ({ ...prev, [player]: false }));
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
      <Container maxWidth="md" sx={{ backgroundColor: 'transparent', position: 'relative', zIndex: 1 }}>
        <StyledPaper elevation={3}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ mb: 4 }}
          >
            Enter Player Names
          </Typography>
          
          <Grid container spacing={4}>
            {/* Player 1 Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Player 1
              </Typography>
              <StyledTextField
                label="Player 1 Name"
                variant="outlined"
                value={playerOneName}
                onChange={(e) => setPlayerOneName(e.target.value)}
                required
              />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                <StyledToggleButtonGroup
                  value={playerOneGender}
                  exclusive
                  onChange={(e, newValue) => handleGenderChange('one', e, newValue)}
                  aria-label="player one gender"
                >
                  <ToggleButton value="male" aria-label="male">
                    Male
                  </ToggleButton>
                  <ToggleButton value="female" aria-label="female">
                    Female
                  </ToggleButton>
                </StyledToggleButtonGroup>
                
                <CurrentAvatar>
                  <AvatarCircle color={playerOneColor}>
                    <AvatarImage>
                      {playerOneGender === 'male' ? playerOneAvatar.image : playerOneAvatar.femaleImage}
                    </AvatarImage>
                  </AvatarCircle>
                  <CustomizeButton 
                    onClick={() => handleOpenCustomizationModal('playerOne')}
                  >
                    Customize Avatar & Color
                  </CustomizeButton>
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
                  <AvatarGridContainer>
                    <Grid container spacing={1}>
                      {avatarOptions.map((avatar) => (
                        <Grid item xs={4} key={avatar.id}>
                          <AvatarOption
                            selected={playerOneAvatar.id === avatar.id}
                            color={playerOneAvatar.id === avatar.id ? playerOneColor : avatar.color}
                            onClick={() => {
                              setPlayerOneAvatar(avatar);
                            }}
                          >
                            <AvatarImage>
                              {playerOneGender === 'male' ? avatar.image : avatar.femaleImage}
                            </AvatarImage>
                          </AvatarOption>
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
            </Grid>

            {/* Player 2 Section */}
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
                <StyledToggleButtonGroup
                  value={playerTwoGender}
                  exclusive
                  onChange={(e, newValue) => handleGenderChange('two', e, newValue)}
                  aria-label="player two gender"
                >
                  <ToggleButton value="male" aria-label="male">
                    Male
                  </ToggleButton>
                  <ToggleButton value="female" aria-label="female">
                    Female
                  </ToggleButton>
                </StyledToggleButtonGroup>
                
                <CurrentAvatar>
                  <AvatarCircle color={playerTwoColor}>
                    <AvatarImage>
                      {playerTwoGender === 'male' ? playerTwoAvatar.image : playerTwoAvatar.femaleImage}
                    </AvatarImage>
                  </AvatarCircle>
                  <CustomizeButton 
                    onClick={() => handleOpenCustomizationModal('playerTwo')}
                  >
                    Customize Avatar & Color
                  </CustomizeButton>
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
                  <AvatarGridContainer>
                    <Grid container spacing={1}>
                      {avatarOptions.map((avatar) => (
                        <Grid item xs={4} key={avatar.id}>
                          <AvatarOption
                            selected={playerTwoAvatar.id === avatar.id}
                            color={playerTwoAvatar.id === avatar.id ? playerTwoColor : avatar.color}
                            onClick={() => {
                              setPlayerTwoAvatar(avatar);
                            }}
                          >
                            <AvatarImage>
                              {playerTwoGender === 'male' ? avatar.image : avatar.femaleImage}
                            </AvatarImage>
                          </AvatarOption>
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
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartGame}
              disabled={!playerOneName.trim() || !playerTwoName.trim()}
              sx={{
                padding: '8px 24px',
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Start Game
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              onClick={onReturnToMenu}
              sx={{
                padding: '8px 24px',
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Back to Menu
            </Button>
          </Box>
        </StyledPaper>
      </Container>
    </>
  );
}

export default PlayerSetup; 