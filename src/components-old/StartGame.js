import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Paper, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';

const pulse = keyframes`
  0% {
    transform: scale(1);
    text-shadow: 0 0 2.5px #fff, 0 0 5px #fff, 0 0 7.5px #0f258f, 0 0 10px #0f258f, 0 0 12.5px #0f258f;
  }
  50% {
    transform: scale(1.05);
    text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0f258f, 0 0 20px #0f258f, 0 0 25px #0f258f;
  }
  100% {
    transform: scale(1);
    text-shadow: 0 0 2.5px #fff, 0 0 5px #fff, 0 0 7.5px #0f258f, 0 0 10px #0f258f, 0 0 12.5px #0f258f;
  }
`;

const cornerPulse = keyframes`
  0% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
`;

const buttonPulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(15, 37, 143, 0.4);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(15, 37, 143, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(15, 37, 143, 0);
  }
`;

const slideLeft = keyframes`
  0% {
    transform: translateX(150%);
  }
  100% {
    transform: translateX(-150%);
  }
`;

const slideRight = keyframes`
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
  zIndex: -1,
}));

const AnimatedRectangles = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 0,
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

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: theme.spacing(8),
  backgroundColor: '#0f258f',
  color: 'white',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  border: '4px solid #f5f5f5',
  position: 'relative',
  overflow: 'hidden',
  zIndex: 1
}));

const MenuButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(1.5, 4),
  fontSize: '1.2rem',
  backgroundColor: '#f5f5f5',
  color: '#0f258f',
  borderRadius: '8px',
  border: '2px solid #0f258f',
  fontWeight: 'bold',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: '#e0e0e0',
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
  },
  '&:active': {
    transform: 'translateY(1px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'all 0.5s ease',
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const Title = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  fontWeight: 900,
  fontSize: '4.8rem',
  letterSpacing: '4px',
  textTransform: 'uppercase',
  animation: `${pulse} 4s infinite ease-in-out`,
  position: 'relative',
  textShadow: '0 0 2.5px #fff, 0 0 5px #fff, 0 0 7.5px #0f258f, 0 0 10px #0f258f, 0 0 12.5px #0f258f',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80%',
    height: '4px',
    background: 'linear-gradient(90deg, transparent, #f5f5f5, transparent)',
  }
}));

const CornerDecoration = styled(Box)(({ theme, position }) => ({
  position: 'absolute',
  width: '40px',
  height: '40px',
  border: '2px solid #f5f5f5',
  animation: `${cornerPulse} 3s infinite ease-in-out`,
  ...(position === 'topLeft' && {
    top: '10px',
    left: '10px',
    borderRight: 'none',
    borderBottom: 'none',
  }),
  ...(position === 'topRight' && {
    top: '10px',
    right: '10px',
    borderLeft: 'none',
    borderBottom: 'none',
  }),
  ...(position === 'bottomLeft' && {
    bottom: '10px',
    left: '10px',
    borderRight: 'none',
    borderTop: 'none',
  }),
  ...(position === 'bottomRight' && {
    bottom: '10px',
    right: '10px',
    borderLeft: 'none',
    borderTop: 'none',
  }),
}));

function StartGame({ onStartGame }) {
  const [buttonHovered, setButtonHovered] = useState(null);

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
      <Container maxWidth="md">
        <StyledPaper elevation={3}>
          <CornerDecoration position="topLeft" />
          <CornerDecoration position="topRight" />
          <CornerDecoration position="bottomLeft" />
          <CornerDecoration position="bottomRight" />
          
          <Title variant="h2" component="h1">
            JEOPARDY!
          </Title>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', position: 'relative', zIndex: 2 }}>
            <MenuButton 
              variant="contained" 
              onClick={onStartGame}
              fullWidth
              onMouseEnter={() => setButtonHovered('start')}
              onMouseLeave={() => setButtonHovered(null)}
              sx={{
                animation: buttonHovered === 'start' ? `${buttonPulse} 1s infinite` : 'none',
                transform: buttonHovered === 'start' ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              Start Game
            </MenuButton>
          </Box>
        </StyledPaper>
      </Container>
    </>
  );
}

export default StartGame; 