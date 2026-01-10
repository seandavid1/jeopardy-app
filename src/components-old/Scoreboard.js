import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  styled
} from '@mui/material';
import { keyframes } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAuth } from '../contexts/AuthContext';
import { getUserStatistics } from '../services/cpuMatchHistoryDB';
import CPU_OPPONENTS from '../config/cpuOpponents';
import { generateCPUAvatar } from '../utils/avatarGenerator';

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

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
}));

function Scoreboard({ onReturnToStart }) {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    loadStatistics();
  }, [user]);

  const loadStatistics = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const stats = await getUserStatistics(user.uid);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
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
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <CircularProgress size={60} />
            </Box>
          </StyledPaper>
        </Container>
      </>
    );
  }

  if (!user) {
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
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <StyledPaper>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h4" gutterBottom>
                Login Required
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Please log in to view your match history and statistics.
              </Typography>
              <Button
                variant="contained"
                startIcon={<ArrowBackIcon />}
                onClick={onReturnToStart}
              >
                Back to Menu
              </Button>
            </Box>
          </StyledPaper>
        </Container>
      </>
    );
  }

  if (!statistics || statistics.totalMatches === 0) {
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
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <StyledPaper>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h4" gutterBottom>
                No Match History Yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Play against a CPU opponent while logged in to start building your stats!
              </Typography>
              <Button
                variant="contained"
                startIcon={<ArrowBackIcon />}
                onClick={onReturnToStart}
              >
                Back to Menu
              </Button>
            </Box>
          </StyledPaper>
        </Container>
      </>
    );
  }

  const opponentStatsArray = Object.entries(statistics.opponentStats).map(([id, stats]) => ({
    id,
    ...stats
  }));

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
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onReturnToStart}
            sx={{ 
              backgroundColor: 'white',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
            }}
          >
            Back to Menu
          </Button>
        </Box>

        <StyledPaper>
          <Typography variant="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EmojiEventsIcon sx={{ fontSize: '3rem', color: '#FFD700' }} />
            Record Book
          </Typography>

          {/* Overall Statistics */}
          <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Total Matches</Typography>
                  <Typography variant="h3">{statistics.totalMatches}</Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Win Rate</Typography>
                  <Typography variant="h3">{statistics.winRate.toFixed(1)}%</Typography>
                  <Typography variant="body2">{statistics.wins}W - {statistics.losses}L</Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Avg Score</Typography>
                  <Typography variant="h3">${statistics.avgScore}</Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Best Score</Typography>
                  <Typography variant="h3">${statistics.bestScore}</Typography>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>

          {/* Tabs for different views */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab label="By Opponent" />
              <Tab label="Recent Matches" />
            </Tabs>
          </Box>

          {/* By Opponent Tab */}
          {currentTab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Opponent</TableCell>
                    <TableCell>Difficulty</TableCell>
                    <TableCell align="center">Matches</TableCell>
                    <TableCell align="center">W-L</TableCell>
                    <TableCell align="center">Win Rate</TableCell>
                    <TableCell align="center">Avg Score</TableCell>
                    <TableCell align="center">Best Score</TableCell>
                    <TableCell>Last Played</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {opponentStatsArray
                    .sort((a, b) => b.difficulty - a.difficulty)
                    .map((opponentStat) => {
                      const opponent = CPU_OPPONENTS.find(opp => opp.id === opponentStat.id);
                      return (
                        <TableRow key={opponentStat.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {opponent && (
                                <Avatar
                                  src={generateCPUAvatar(opponent)}
                                  sx={{ width: 40, height: 40 }}
                                />
                              )}
                              <Typography variant="body1" fontWeight="bold">
                                {opponentStat.opponentName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={`${opponentStat.difficulty}/12`}
                              size="small"
                              color={
                                opponentStat.difficulty <= 2 ? 'success' :
                                opponentStat.difficulty <= 5 ? 'info' :
                                opponentStat.difficulty <= 7 ? 'warning' :
                                opponentStat.difficulty <= 9 ? 'error' :
                                'secondary'
                              }
                            />
                          </TableCell>
                          <TableCell align="center">{opponentStat.matches}</TableCell>
                          <TableCell align="center">
                            <Typography 
                              variant="body2"
                              color={opponentStat.wins > opponentStat.losses ? 'success.main' : 'error.main'}
                              fontWeight="bold"
                            >
                              {opponentStat.wins}-{opponentStat.losses}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color={
                                opponentStat.winRate >= 60 ? 'success.main' :
                                opponentStat.winRate >= 40 ? 'warning.main' :
                                'error.main'
                              }
                            >
                              {opponentStat.winRate.toFixed(0)}%
                            </Typography>
                          </TableCell>
                          <TableCell align="center">${opponentStat.avgPlayerScore}</TableCell>
                          <TableCell align="center">${opponentStat.bestScore}</TableCell>
                          <TableCell>{formatDate(opponentStat.lastPlayed)}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Recent Matches Tab */}
          {currentTab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Opponent</TableCell>
                    <TableCell>Difficulty</TableCell>
                    <TableCell align="center">Your Score</TableCell>
                    <TableCell align="center">CPU Score</TableCell>
                    <TableCell align="center">Result</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statistics.recentMatches.map((match, index) => (
                    <TableRow key={match.id || index}>
                      <TableCell>{formatDate(match.gameDate)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {match.cpuOpponentName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${match.cpuDifficulty}/12`}
                          size="small"
                          color={
                            match.cpuDifficulty <= 2 ? 'success' :
                            match.cpuDifficulty <= 5 ? 'info' :
                            match.cpuDifficulty <= 7 ? 'warning' :
                            match.cpuDifficulty <= 9 ? 'error' :
                            'secondary'
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold">
                          ${match.playerScore}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          ${match.cpuScore}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={match.playerWon ? 'WIN' : 'LOSS'}
                          color={match.playerWon ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </StyledPaper>
      </Container>
    </>
  );
}

export default Scoreboard;

