import React from 'react';
import { Box, Typography, Button, Paper, Grid, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimerIcon from '@mui/icons-material/Timer';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const RoundupContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  minHeight: '100vh',
  backgroundColor: '#0f258f',
  color: 'white',
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  color: '#333',
  width: '100%',
  maxWidth: '900px',
}));

const CategoryStat = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
  borderRadius: '4px',
  backgroundColor: '#f5f5f5',
}));

const MissedQuestion = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  borderRadius: '4px',
  backgroundColor: '#ffebee',
  border: '1px solid #ef5350',
}));

const ReturnButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: '12px 40px',
  fontSize: '1.1rem',
  backgroundColor: '#fff',
  color: '#0f258f',
  '&:hover': {
    backgroundColor: '#e0e0e0',
  },
}));

function GameRoundup({ 
  playerName,
  finalScore,
  missedQuestions = [],
  categoryStats = {},
  averageResponseTime,
  onReturnToStart
}) {
  // Calculate strongest and weakest categories
  const categoriesArray = Object.entries(categoryStats).map(([category, stats]) => ({
    category,
    correct: stats.correct || 0,
    incorrect: stats.incorrect || 0,
    total: (stats.correct || 0) + (stats.incorrect || 0),
    percentage: ((stats.correct || 0) + (stats.incorrect || 0)) > 0 
      ? (((stats.correct || 0) / ((stats.correct || 0) + (stats.incorrect || 0))) * 100).toFixed(0) 
      : 0
  })).filter(cat => cat.total > 0);

  const sortedByPerformance = [...categoriesArray].sort((a, b) => b.percentage - a.percentage);
  const strongestCategories = sortedByPerformance.slice(0, 3);
  const weakestCategories = sortedByPerformance.slice(-3).reverse();

  return (
    <RoundupContainer>
      <Typography variant="h2" sx={{ mb: 4, textAlign: 'center' }}>
        Game Statistics
      </Typography>

      <Typography variant="h4" sx={{ mb: 4, color: '#FFD700' }}>
        {playerName}: ${finalScore}
      </Typography>

      {/* Average Response Time */}
      {averageResponseTime !== null && averageResponseTime > 0 && (
        <StatsCard elevation={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TimerIcon sx={{ mr: 1, color: '#0f258f' }} />
            <Typography variant="h5">Average Response Time</Typography>
          </Box>
          <Typography variant="h3" sx={{ color: '#0f258f', textAlign: 'center' }}>
            {(averageResponseTime / 1000).toFixed(2)}s
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 1, color: '#666' }}>
            Time from question end to buzzer press
          </Typography>
        </StatsCard>
      )}

      {/* Strongest Categories */}
      {strongestCategories.length > 0 && (
        <StatsCard elevation={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TrendingUpIcon sx={{ mr: 1, color: '#4caf50' }} />
            <Typography variant="h5">Strongest Categories</Typography>
          </Box>
          {strongestCategories.map((cat, index) => (
            <CategoryStat key={index}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {cat.category}
              </Typography>
              <Typography variant="body1" sx={{ color: '#4caf50' }}>
                {cat.correct}/{cat.total} ({cat.percentage}%)
              </Typography>
            </CategoryStat>
          ))}
        </StatsCard>
      )}

      {/* Weakest Categories */}
      {weakestCategories.length > 0 && weakestCategories[0].percentage < 100 && (
        <StatsCard elevation={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TrendingDownIcon sx={{ mr: 1, color: '#f44336' }} />
            <Typography variant="h5">Categories to Study</Typography>
          </Box>
          {weakestCategories.map((cat, index) => (
            <CategoryStat key={index}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {cat.category}
              </Typography>
              <Typography variant="body1" sx={{ color: '#f44336' }}>
                {cat.correct}/{cat.total} ({cat.percentage}%)
              </Typography>
            </CategoryStat>
          ))}
        </StatsCard>
      )}

      {/* Missed Questions */}
      {missedQuestions.length > 0 && (
        <StatsCard elevation={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ErrorOutlineIcon sx={{ mr: 1, color: '#f44336' }} />
            <Typography variant="h5">Questions You Missed ({missedQuestions.length})</Typography>
          </Box>
          <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
            {missedQuestions.map((question, index) => (
              <MissedQuestion key={index}>
                <Typography variant="subtitle2" sx={{ color: '#c62828', fontWeight: 'bold', mb: 1 }}>
                  {question.category}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
                  {question.clue}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  Correct Answer: {question.response}
                </Typography>
              </MissedQuestion>
            ))}
          </Box>
        </StatsCard>
      )}

      {missedQuestions.length === 0 && (
        <StatsCard elevation={3}>
          <Typography variant="h5" sx={{ textAlign: 'center', color: '#4caf50' }}>
            🎉 Perfect Game! You didn't miss any questions!
          </Typography>
        </StatsCard>
      )}

      <ReturnButton
        variant="contained"
        startIcon={<HomeIcon />}
        onClick={onReturnToStart}
      >
        Return to Main Menu
      </ReturnButton>
    </RoundupContainer>
  );
}

export default GameRoundup;

