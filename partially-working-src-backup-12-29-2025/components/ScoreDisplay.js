import React from 'react';
import { Typography, Box } from '@mui/material';
import { ScoreWrapper } from '../styles/BoardStyles';
import { styled } from '@mui/material/styles';

const PlayerInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const PlayerTwoInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flexDirection: 'row-reverse',
}));

const AvatarDisplay = styled(Box)(({ theme, color }) => ({
  fontSize: '2rem',
  backgroundColor: color,
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
}));

function ScoreDisplay({ 
  playerOneName, 
  playerTwoName, 
  playerOneScore, 
  playerTwoScore, 
  hasControlOfBoard,
  playerOneAvatar,
  playerTwoAvatar
}) {
  return (
    <>
      <ScoreWrapper>
        <Typography className='score player1' variant="h4">
          <PlayerInfo>
            {playerOneAvatar && (
              <AvatarDisplay color={playerOneAvatar.color}>
                {playerOneAvatar.image}
              </AvatarDisplay>
            )}
            <Typography variant="h5" style={{color: '#fff'}}>
              {playerOneName} 
              <Typography variant="h5" display="inline" style={{marginLeft: '20px'}}>
                {playerOneScore >= 0 ? '$' : '-$'}{Math.abs(playerOneScore)}
              </Typography>
            </Typography>
          </PlayerInfo>
        </Typography>
        <Typography className='score player2' variant="h4">
          <PlayerTwoInfo>
            {playerTwoAvatar && (
              <AvatarDisplay color={playerTwoAvatar.color}>
                {playerTwoAvatar.image}
              </AvatarDisplay>
            )}
            <Typography variant="h5" style={{color: '#fff'}}>
              <Typography variant="h5" display="inline" style={{marginRight: '20px'}}>
                {playerTwoScore >= 0 ? '$' : '-$'}{Math.abs(playerTwoScore)}
              </Typography>
              {playerTwoName}
            </Typography>
          </PlayerTwoInfo>
        </Typography>
      </ScoreWrapper>
      <Typography variant="subtitle1" sx={{ textAlign: 'center', color: '#fff' }}>
        {hasControlOfBoard} has control of the board.
      </Typography>
    </>
  );
}

export default ScoreDisplay; 