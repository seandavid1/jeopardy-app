import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAuth } from '../contexts/AuthContext';
import { getUserTrophyCase, getTrophyStats } from '../services/trophyService';
import { TROPHY_CATEGORIES, getTrophyColor } from '../config/trophies';

const StyledCard = styled(Card)(({ theme, tier, isUnlocked }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  position: 'relative',
  backgroundColor: isUnlocked ? '#fff' : '#f5f5f5',
  opacity: isUnlocked ? 1 : 0.6,
  border: isUnlocked ? `3px solid ${getTrophyColor(tier)}` : '2px solid #ddd',
  '&:hover': {
    transform: isUnlocked ? 'translateY(-8px)' : 'none',
    boxShadow: isUnlocked ? `0 8px 24px ${getTrophyColor(tier)}40` : 'none',
  }
}));

const TrophyIcon = styled(Box)(({ theme, tier, isUnlocked }) => ({
  fontSize: '4rem',
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  filter: isUnlocked ? 'none' : 'grayscale(100%)',
  position: 'relative',
}));

const UnlockDate = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: '#666',
  fontStyle: 'italic',
  marginTop: theme.spacing(1)
}));

function TrophyCase({ onBack }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trophyCase, setTrophyCase] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    loadTrophyCase();
  }, [user]);

  const loadTrophyCase = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [caseData, statsData] = await Promise.all([
        getUserTrophyCase(user.uid),
        getTrophyStats(user.uid)
      ]);
      setTrophyCase(caseData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading trophy case:', error);
    } finally {
      setLoading(false);
    }
  };

  // DEBUG: Unlock all trophies for testing
  const handleUnlockAllTrophies = async () => {
    if (!user) return;
    
    try {
      const { unlockTrophy } = await import('../services/trophyService');
      const { ALL_TROPHIES } = await import('../config/trophies');
      
      setLoading(true);
      
      // Unlock all trophies
      for (const trophy of ALL_TROPHIES) {
        await unlockTrophy(user.uid, trophy.id);
      }
      
      // Reload trophy case
      await loadTrophyCase();
      
      alert('All trophies unlocked!');
    } catch (error) {
      console.error('Error unlocking all trophies:', error);
      alert('Error unlocking trophies. Check console.');
    }
  };

  // DEBUG: Reset all trophies (lock them back)
  const handleResetTrophies = async () => {
    if (!user || !window.confirm('This will lock all trophies. Continue?')) return;
    
    try {
      const { initializeTrophyCase } = await import('../services/trophyService');
      const { db } = await import('../firebase-config');
      const { doc, deleteDoc } = await import('firebase/firestore');
      
      setLoading(true);
      
      // Delete the trophy case document
      const trophyCaseRef = doc(db, 'trophy_cases', user.uid);
      await deleteDoc(trophyCaseRef);
      
      // Re-initialize with all locked
      await initializeTrophyCase(user.uid);
      
      // Reload trophy case
      await loadTrophyCase();
      
      alert('All trophies reset to locked!');
    } catch (error) {
      console.error('Error resetting trophies:', error);
      alert('Error resetting trophies. Check console.');
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getFilteredTrophies = () => {
    if (!trophyCase) return [];

    switch (selectedTab) {
      case 0: // All
        return trophyCase.trophies;
      case 1: // Unlocked
        return trophyCase.trophies.filter(t => t.isUnlocked);
      case 2: // Locked
        return trophyCase.trophies.filter(t => !t.isUnlocked);
      case 3: // Special
        return trophyCase.trophies.filter(t => t.category === TROPHY_CATEGORIES.SPECIAL);
      case 4: // CPU Victories
        return trophyCase.trophies.filter(t => t.category === TROPHY_CATEGORIES.CPU_VICTORIES);
      case 5: // Flashcards
        return trophyCase.trophies.filter(t => t.category === TROPHY_CATEGORIES.FLASHCARDS);
      default:
        return trophyCase.trophies;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#0f258f' }} />
        <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>
          Loading Trophy Case...
        </Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Please sign in to view your Trophy Case
        </Typography>
        <Button variant="contained" onClick={onBack} sx={{ backgroundColor: '#0f258f' }}>
          Back to Menu
        </Button>
      </Container>
    );
  }

  const completionPercentage = stats ? Math.round((stats.unlocked / stats.total) * 100) : 0;
  const filteredTrophies = getFilteredTrophies();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{
              color: '#fff',
              mb: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Back to Menu
          </Button>
            
          {/* DEBUG BUTTONS */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                onClick={handleUnlockAllTrophies}
                sx={{
                  backgroundColor: '#ffd700',
                  color: '#000',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#ffed4e',
                  }
                }}
              >
                🔓 DEBUG: Unlock All
              </Button>
              
              <Button
                variant="contained"
                onClick={handleResetTrophies}
                sx={{
                  backgroundColor: '#d32f2f',
                  color: '#fff',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#b71c1c',
                  }
                }}
              >
                🔒 DEBUG: Reset All
              </Button>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <EmojiEventsIcon sx={{ fontSize: '4rem', color: '#ffd700', mb: 2 }} />
            <Typography 
              variant="h2" 
              component="h1"
              sx={{ 
                color: '#fff',
                fontWeight: 'bold',
                mb: 2,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' }
              }}
            >
              Trophy Case
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3 }}>
              {stats?.unlocked || 0} of {stats?.total || 0} Trophies Unlocked
            </Typography>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <LinearProgress 
                variant="determinate" 
                value={completionPercentage}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 6,
                    background: 'linear-gradient(90deg, #ffd700 0%, #ffed4e 100%)',
                  }
                }}
              />
              <Typography variant="body2" sx={{ color: '#fff', mt: 1, fontWeight: 'bold' }}>
                {completionPercentage}% Complete
              </Typography>
            </Box>
          </Box>

          {/* Filter Tabs */}
          <Box sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 2,
            p: 1
          }}>
            <Tabs 
              value={selectedTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  color: '#666',
                  fontWeight: 600,
                  '&.Mui-selected': {
                    color: '#0f258f',
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#0f258f',
                  height: 3,
                }
              }}
            >
              <Tab label={`All (${trophyCase?.trophies.length || 0})`} />
              <Tab label={`Unlocked (${stats?.unlocked || 0})`} />
              <Tab label={`Locked (${stats?.locked || 0})`} />
              <Tab label="Special" />
              <Tab label="CPU Victories" />
              <Tab label="Flashcards" />
            </Tabs>
          </Box>
        </Box>

        {/* Trophy Grid */}
        <Grid container spacing={3}>
          {filteredTrophies.map((trophy) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={trophy.trophyId}>
              <Tooltip 
                title={trophy.isSecret && !trophy.isUnlocked ? 'Secret Trophy - Unlock to reveal' : trophy.description}
                arrow
              >
                <StyledCard tier={trophy.tier} isUnlocked={trophy.isUnlocked}>
                  <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                    {/* Lock Icon for Locked Trophies */}
                    {!trophy.isUnlocked && (
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10,
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '50%',
                        p: 0.5
                      }}>
                        <LockIcon sx={{ fontSize: '1.5rem', color: '#999' }} />
                      </Box>
                    )}

                    {/* Trophy Icon */}
                    <TrophyIcon tier={trophy.tier} isUnlocked={trophy.isUnlocked}>
                      {trophy.icon || '🏆'}
                    </TrophyIcon>

                    {/* Trophy Name */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 'bold',
                        mb: 1,
                        color: trophy.isUnlocked ? '#0f258f' : '#999',
                        fontSize: '1.1rem'
                      }}
                    >
                      {trophy.isSecret && !trophy.isUnlocked ? '???' : trophy.name}
                    </Typography>

                    {/* Trophy Description */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: trophy.isUnlocked ? '#666' : '#aaa',
                        mb: 2,
                        minHeight: 40
                      }}
                    >
                      {trophy.isSecret && !trophy.isUnlocked 
                        ? 'Keep playing to discover this trophy'
                        : trophy.description
                      }
                    </Typography>

                    {/* Tier Badge */}
                    <Chip 
                      label={trophy.tier?.toUpperCase() || 'BRONZE'}
                      size="small"
                      sx={{
                        backgroundColor: getTrophyColor(trophy.tier),
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '0.7rem'
                      }}
                    />

                    {/* Unlock Date */}
                    {trophy.isUnlocked && trophy.unlockedAt && (
                      <UnlockDate>
                        Unlocked: {formatDate(trophy.unlockedAt)}
                      </UnlockDate>
                    )}
                  </CardContent>
                </StyledCard>
              </Tooltip>
            </Grid>
          ))}
        </Grid>

        {filteredTrophies.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 2
          }}>
            <Typography variant="h5" sx={{ color: '#666', mb: 2 }}>
              No trophies found in this category
            </Typography>
            <Typography variant="body1" sx={{ color: '#999' }}>
              Keep playing to unlock more trophies!
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default TrophyCase;

