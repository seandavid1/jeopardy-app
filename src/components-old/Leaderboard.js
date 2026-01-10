import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getLeaderboard, clearLeaderboard, getPlayerStats, deleteLeaderboardEntry, loadLeaderboardWithSync } from '../services/leaderboardService';
import { useAuth } from '../contexts/AuthContext';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '16px'
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: '8px',
  maxHeight: '600px',
  '& .MuiTableCell-head': {
    backgroundColor: '#0f258f',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1rem'
  }
}));

const RankCell = styled(TableCell)(({ rank }) => {
  let color = 'inherit';
  if (rank === 1) color = '#FFD700'; // Gold
  if (rank === 2) color = '#C0C0C0'; // Silver
  if (rank === 3) color = '#CD7F32'; // Bronze
  
  return {
    fontWeight: 'bold',
    color,
    fontSize: rank <= 3 ? '1.2rem' : '1rem'
  };
});

const ScoreCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  color: '#0f258f',
  fontSize: '1.1rem'
}));

const Leaderboard = ({ onClose }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadLeaderboard();
  }, [user]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      if (user) {
        // Sync with Firebase
        const data = await loadLeaderboardWithSync(user.uid);
        setLeaderboard(data);
      } else {
        // Just load from localStorage
        const data = getLeaderboard();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      const data = getLeaderboard();
      setLeaderboard(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLeaderboard = async () => {
    await clearLeaderboard(user?.uid);
    await loadLeaderboard();
    setConfirmClear(false);
  };

  const handlePlayerClick = (playerName) => {
    setSelectedPlayer(playerName);
    const stats = getPlayerStats(playerName);
    setPlayerStats(stats);
  };

  const handleDeleteEntry = async (entryId, event) => {
    // Stop propagation to prevent triggering the row click
    event.stopPropagation();
    
    if (window.confirm('Delete this leaderboard entry?')) {
      await deleteLeaderboardEntry(entryId, false, user?.uid);
      await loadLeaderboard();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatScore = (score) => {
    return score >= 0 ? `$${score.toLocaleString()}` : `-$${Math.abs(score).toLocaleString()}`;
  };

  const getGameModeLabel = (mode) => {
    const labels = {
      'cpu': 'vs CPU',
      'two-player': 'PvP',
      'practice': 'Practice'
    };
    return labels[mode] || mode;
  };

  const getGameModeColor = (mode) => {
    const colors = {
      'cpu': 'primary',
      'two-player': 'secondary',
      'practice': 'default'
    };
    return colors[mode] || 'default';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton onClick={onClose} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h3" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEventsIcon sx={{ fontSize: '2.5rem', color: '#FFD700' }} />
          Leaderboard
        </Typography>
      </Box>

      <StyledPaper>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading leaderboard...
            </Typography>
          </Box>
        ) : leaderboard.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No games recorded yet. Play some games to see your scores here!
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Top {leaderboard.length} Score{leaderboard.length !== 1 ? 's' : ''}
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setConfirmClear(true)}
                size="small"
              >
                Clear All
              </Button>
            </Box>

            <StyledTableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width="60">Rank</TableCell>
                    <TableCell>Winner</TableCell>
                    <TableCell align="right">Score</TableCell>
                    <TableCell>Opponent</TableCell>
                    <TableCell align="right">Opp. Score</TableCell>
                    <TableCell align="center">Mode</TableCell>
                    <TableCell align="center">Difficulty</TableCell>
                    <TableCell align="right">Date</TableCell>
                    <TableCell align="center" width="60">Delete</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.map((entry, index) => (
                    <TableRow 
                      key={entry.id}
                      hover
                      sx={{ 
                        backgroundColor: index < 3 ? 'rgba(255, 215, 0, 0.05)' : 'inherit',
                        cursor: 'pointer'
                      }}
                      onClick={() => handlePlayerClick(entry.winnerName)}
                    >
                      <RankCell align="center" rank={index + 1}>
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && `#${index + 1}`}
                      </RankCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight={index < 3 ? 'bold' : 'normal'}>
                          {entry.winnerName}
                        </Typography>
                      </TableCell>
                      <ScoreCell align="right">
                        {formatScore(entry.winnerScore)}
                      </ScoreCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {entry.opponentName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {formatScore(entry.opponentScore)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={getGameModeLabel(entry.gameMode)}
                          color={getGameModeColor(entry.gameMode)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={entry.difficultyMode === 'tournament' ? 'Tournament' : 'Regular'}
                          color={entry.difficultyMode === 'tournament' ? 'secondary' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(entry.date)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => handleDeleteEntry(entry.id, e)}
                          sx={{ '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </>
        )}
      </StyledPaper>

      {/* Clear Confirmation Dialog */}
      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)}>
        <DialogTitle>Clear Leaderboard?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear all leaderboard entries? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClear(false)}>Cancel</Button>
          <Button onClick={handleClearLeaderboard} color="error" variant="contained">
            Clear All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Player Stats Dialog */}
      <Dialog open={!!selectedPlayer} onClose={() => setSelectedPlayer(null)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEventsIcon color="primary" />
            {selectedPlayer}'s Stats
          </Box>
        </DialogTitle>
        <DialogContent>
          {playerStats && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Total Wins:</strong> {playerStats.totalWins}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>High Score:</strong> {formatScore(playerStats.highScore)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Average Score:</strong> {formatScore(playerStats.averageScore)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPlayer(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Leaderboard;

