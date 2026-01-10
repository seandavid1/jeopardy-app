import React from 'react';
import { Grid, Typography, Button } from '@mui/material';

function ScoreSummary({ 
  jeopardyRound, 
  playerOneName, 
  playerTwoName, 
  playerOneScore, 
  playerTwoScore, 
  startNewRound, 
  setShowMissedQuestions 
}) {
  return (
    <Grid container>
      <Grid item xs={12} sx={{ textAlign: 'center', pt: 20 }}>
        <Typography variant="h2" sx={{ mb: 10 }}>
          Our scores after {jeopardyRound === 'J!' ? 'the Jeopardy! round' : 'Double Jeopardy!'} are:
        </Typography>
        <Typography variant="h2" sx={{mb: 2}}>
          {playerOneName}: {playerOneScore >= 0 ? '$' : '-$'}
          {Math.abs(playerOneScore)}
        </Typography>
        <Typography variant="h2">
          {playerTwoName}: {playerTwoScore >= 0 ? '$' : '-$'}
          {Math.abs(playerTwoScore)}
        </Typography>
        <Button sx={{ mt: 10 }} variant="contained" onClick={startNewRound}>
          Begin Double Jeopardy
        </Button>
        <Button 
          sx={{ mt: 10, ml: 2 }} 
          variant="outlined" 
          onClick={() => setShowMissedQuestions(true)}
        >
          View Missed Questions
        </Button>
      </Grid>
    </Grid>
  );
}

export default ScoreSummary; 