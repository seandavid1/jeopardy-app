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
  Tooltip,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
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

  // Reset a single trophy
  const handleResetSingleTrophy = async (trophy, event) => {
    // Prevent event bubbling
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    console.log('🔄 Reset button clicked for trophy:', trophy.name, trophy.trophyId);
    
    if (!user) {
      console.error('No user logged in');
      alert('You must be logged in to reset trophies.');
      return;
    }
    
    if (!window.confirm(`Reset "${trophy.name}"? This will lock the trophy and clear related completion data.`)) {
      console.log('User cancelled reset');
      return;
    }
    
    try {
      console.log('Starting trophy reset...');
      const { db } = await import('../firebase-config');
      const { doc, updateDoc, getDoc } = await import('firebase/firestore');
      
      setLoading(true);
      
      // Update the trophy case to lock this specific trophy
      const trophyCaseRef = doc(db, 'trophy_cases', user.uid);
      const trophyCaseDoc = await getDoc(trophyCaseRef);
      
      console.log('Trophy case doc exists:', trophyCaseDoc.exists());
      
      if (trophyCaseDoc.exists()) {
        const data = trophyCaseDoc.data();
        const updatedTrophies = data.trophies.map(t => {
          if (t.trophyId === trophy.trophyId) {
            console.log('Locking trophy:', t.trophyId);
            return {
              ...t,
              isUnlocked: false,
              unlockedAt: null
            };
          }
          return t;
        });
        
        await updateDoc(trophyCaseRef, { trophies: updatedTrophies });
        console.log('Trophy case updated');
      }
      
      // If it's a flashcard trophy, clear the related completion data
      console.log('Trophy category:', trophy.category);
      if (trophy.category === 'Flashcards' && trophy.trophyId) {
        // Extract deckId from trophy ID (format: flashcard-perfect-{deckId} or flashcard-speed-{deckId} or flashcard-perfect-both-{deckId})
        let deckId = null;
        if (trophy.trophyId.startsWith('flashcard-perfect-both-')) {
          deckId = trophy.trophyId.replace('flashcard-perfect-both-', '');
        } else if (trophy.trophyId.startsWith('flashcard-perfect-')) {
          deckId = trophy.trophyId.replace('flashcard-perfect-', '');
        } else if (trophy.trophyId.startsWith('flashcard-speed-')) {
          deckId = trophy.trophyId.replace('flashcard-speed-', '');
        }
        
        console.log('Extracted deckId:', deckId);
        
        if (deckId) {
          const completionId = `${user.uid}_${deckId}`;
          const completionRef = doc(db, 'flashcard_completions', completionId);
          const completionDoc = await getDoc(completionRef);
          
          console.log('Completion doc exists:', completionDoc.exists());
          
          if (completionDoc.exists()) {
            // Determine what to clear based on trophy type
            if (trophy.trophyId.startsWith('flashcard-perfect-both-')) {
              // Silver trophy - clear both directions
              console.log('Clearing both directions for Silver trophy');
              await updateDoc(completionRef, {
                forwardCompletedAt: null,
                reversedCompletedAt: null,
                bestForwardSecondsPerCard: null,
                bestReversedSecondsPerCard: null,
                bestForwardCompletedAt: null,
                bestReversedCompletedAt: null
              });
            } else if (trophy.trophyId.startsWith('flashcard-speed-')) {
              // Gold trophy - clear speed records only
              console.log('Clearing speed records for Gold trophy');
              await updateDoc(completionRef, {
                bestForwardSecondsPerCard: null,
                bestReversedSecondsPerCard: null,
                bestForwardCompletedAt: null,
                bestReversedCompletedAt: null
              });
            } else {
              // Bronze trophy - clear all completion data
              console.log('Clearing all completion data for Bronze trophy');
              await updateDoc(completionRef, {
                forwardCompletedAt: null,
                reversedCompletedAt: null,
                bestForwardSecondsPerCard: null,
                bestReversedSecondsPerCard: null,
                bestForwardCompletedAt: null,
                bestReversedCompletedAt: null
              });
            }
            
            console.log(`🗑️ Cleared completion data for deck: ${deckId}`);
          }
        }
      }
      
      // Reload trophy case
      console.log('Reloading trophy case...');
      await loadTrophyCase();
      
      alert(`Trophy "${trophy.name}" has been reset!`);
      console.log('✅ Trophy reset complete!');
    } catch (error) {
      console.error('Error resetting trophy:', error);
      alert(`Error resetting trophy: ${error.message}. Check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  // DEBUG: Reset all trophies (lock them back) and clear flashcard completions
  const handleResetTrophies = async () => {
    if (!user || !window.confirm('This will lock all trophies AND clear all flashcard completion data. Continue?')) return;
    
    try {
      const { initializeTrophyCase } = await import('../services/trophyService');
      const { db } = await import('../firebase-config');
      const { doc, deleteDoc, collection, query, where, getDocs } = await import('firebase/firestore');
      
      setLoading(true);
      
      // Delete the trophy case document
      const trophyCaseRef = doc(db, 'trophy_cases', user.uid);
      await deleteDoc(trophyCaseRef);
      
      // Delete all flashcard completions for this user
      const completionsRef = collection(db, 'flashcard_completions');
      const q = query(completionsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = [];
      querySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      await Promise.all(deletePromises);
      
      console.log(`Deleted ${deletePromises.length} flashcard completion records`);
      
      // Re-initialize with all locked
      await initializeTrophyCase(user.uid);
      
      // Reload trophy case
      await loadTrophyCase();
      
      alert(`All trophies reset to locked!\nCleared ${deletePromises.length} flashcard completion records.`);
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
      case 0: // Unlocked (moved to first)
        return trophyCase.trophies.filter(t => t.isUnlocked);
      case 1: // All (moved to second)
        return trophyCase.trophies;
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
              <Tab label={`Unlocked (${stats?.unlocked || 0})`} />
              <Tab label={`All (${trophyCase?.trophies.length || 0})`} />
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
                    
                    {/* Reset Button - Only show in development mode and if trophy is unlocked */}
                    {process.env.NODE_ENV === 'development' && trophy.isUnlocked && (
                      <Tooltip title="Reset this trophy" arrow>
                        <IconButton
                          onClick={(e) => handleResetSingleTrophy(trophy, e)}
                          sx={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            backgroundColor: 'rgba(211, 47, 47, 0.9)',
                            color: '#fff',
                            width: 32,
                            height: 32,
                            zIndex: 10,
                            '&:hover': {
                              backgroundColor: '#d32f2f',
                            }
                          }}
                        >
                          <RestartAltIcon sx={{ fontSize: '1.2rem' }} />
                        </IconButton>
                      </Tooltip>
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

