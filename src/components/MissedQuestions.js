import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  TextField,
  InputAdornment,
  Container,
  Chip
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import HomeIcon from '@mui/icons-material/Home';
import RestoreIcon from '@mui/icons-material/Restore';
import ArchiveIcon from '@mui/icons-material/Archive';
import { 
  getMissedQuestions, 
  getMissedQuestionsByPlayer,
  deleteMissedQuestion,
  clearAllMissedQuestions,
  updateTopLevelCategory
} from '../services/missedQuestionsDB-firebase';
import { 
  getArchivedMissedQuestionIds, 
  unarchiveMissedQuestion,
  archiveMissedQuestion
} from '../services/archivedMissedQuestionsDB-firebase';
import { useAuth } from '../contexts/AuthContext';

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
  zIndex: -1,
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

const HomeButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  top: 20,
  left: 20,
  backgroundColor: '#f5f5f5',
  color: '#0f258f',
  '&:hover': {
    backgroundColor: '#e0e0e0',
  },
  zIndex: 1000,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: '#0f258f',
  color: 'white',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  border: '4px solid #f5f5f5',
  minHeight: '70vh',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    borderRadius: '12px',
    border: '3px solid #f5f5f5',
  }
}));

const QuestionListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  color: '#0f258f',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  }
}));

const PlayerInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const AvatarDisplay = styled(Box)(({ theme, color }) => ({
  fontSize: '1.5rem',
  backgroundColor: color,
  borderRadius: '50%',
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  flexWrap: 'wrap',
}));

const CategoryContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

function MissedQuestions({ playerOneName, playerTwoName, playerOneAvatar, playerTwoAvatar, onReturnToStart }) {
  const { user } = useAuth();
  const [missedQuestions, setMissedQuestions] = useState([]);
  const [archivedQuestionIds, setArchivedQuestionIds] = useState(new Set());
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTopLevelCategory, setSelectedTopLevelCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [topLevelCategories, setTopLevelCategories] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null);
  const [newTopLevelCategory, setNewTopLevelCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadMissedQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        console.log('No user logged in');
        setMissedQuestions([]);
        setLoading(false);
        return;
      }
      
      console.log('Loading all missed questions for user:', user.uid);
      const allQuestions = await getMissedQuestions();
      console.log('All questions loaded:', allQuestions);
      setMissedQuestions(allQuestions);
      
      // Load archived question IDs
      try {
        const archived = await getArchivedMissedQuestionIds();
        setArchivedQuestionIds(new Set(archived));
        console.log('Archived question IDs loaded:', archived.length);
      } catch (archiveError) {
        console.warn('Could not load archived questions:', archiveError.message);
        setArchivedQuestionIds(new Set());
      }
      
      // Extract unique categories and top-level categories
      const uniqueCategories = [...new Set(allQuestions.map(q => q.category))].sort();
      const uniqueTopLevelCategories = [...new Set(allQuestions.map(q => q.topLevelCategory || 'Other'))].sort();
      setCategories(uniqueCategories);
      setTopLevelCategories(uniqueTopLevelCategories);
      
      console.log('Final state:', {
        allQuestions: allQuestions.length
      });
    } catch (error) {
      console.error('Error loading missed questions:', error);
      console.error('Error details:', error.message, error.code);
      setError(`Failed to load missed questions: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadMissedQuestions();
    }
  }, [user]);

  const handleDeleteClick = (question) => {
    setQuestionToDelete(question);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setError(null);
      await deleteMissedQuestion(questionToDelete.id);
      setDeleteDialogOpen(false);
      await loadMissedQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      setError('Failed to delete question. Please try again.');
    }
  };

  const handleRestoreQuestion = async (questionId) => {
    try {
      setError(null);
      await unarchiveMissedQuestion(questionId);
      console.log('Question restored from archive:', questionId);
      // Reload to update the archived status
      await loadMissedQuestions();
    } catch (error) {
      console.error('Error restoring question:', error);
      setError('Failed to restore question. Please try again.');
    }
  };

  const handleArchiveQuestion = async (questionId) => {
    try {
      setError(null);
      console.log('Attempting to archive question:', questionId);
      await archiveMissedQuestion(questionId);
      console.log('Question archived successfully:', questionId);
      // Reload to update the archived status
      await loadMissedQuestions();
    } catch (error) {
      console.error('Error archiving question:', error);
      console.error('Error details:', error.message, error.code);
      setError(`Failed to archive question: ${error.message || 'Please try again.'}`);
    }
  };

  const handleClearAll = async () => {
    try {
      setError(null);
      await clearAllMissedQuestions(user?.uid);
      setClearDialogOpen(false);
      await loadMissedQuestions();
    } catch (error) {
      console.error('Error clearing questions:', error);
      setError('Failed to clear questions. Please try again.');
    }
  };

  const handleEditClick = (question) => {
    setQuestionToEdit(question);
    setNewTopLevelCategory(question.topLevelCategory || 'Other');
    setCustomCategory('');
    setShowCustomInput(false);
    setEditDialogOpen(true);
  };

  const handleEditConfirm = async () => {
    try {
      setError(null);
      const categoryToSave = showCustomInput ? customCategory : newTopLevelCategory;
      await updateTopLevelCategory(questionToEdit.id, categoryToSave);
      setEditDialogOpen(false);
      await loadMissedQuestions();
    } catch (error) {
      console.error('Error updating top-level category:', error);
      setError('Failed to update top-level category. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatValue = (value) => {
    return value ? `$${value}` : 'N/A';
  };

  const toggleAnswer = (questionId) => {
    setRevealedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const filterQuestions = (questions) => {
    return questions.filter(question => {
      // Archive filter
      const isArchived = archivedQuestionIds.has(question.id);
      const archiveMatch = showArchived ? isArchived : !isArchived;
      
      // Category filters
      const categoryMatch = selectedCategory === 'all' || question.category === selectedCategory;
      const topLevelCategoryMatch = selectedTopLevelCategory === 'all' || question.topLevelCategory === selectedTopLevelCategory;
      
      // Search filter (case-insensitive)
      const searchMatch = searchQuery.trim() === '' || 
        question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      return archiveMatch && categoryMatch && topLevelCategoryMatch && searchMatch;
    });
  };

  const QuestionItem = ({ question }) => (
    <QuestionListItem 
      sx={{ 
        flexDirection: 'column', 
        alignItems: 'flex-start',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: '#e8f4f8'
        }
      }}
      onClick={() => toggleAnswer(question.id)}
    >
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ListItemText
          primary={
            <Typography variant="h6" sx={{ color: '#0f258f', fontWeight: 'bold' }}>
              {question.question}
            </Typography>
          }
          secondary={
            <>
              <Box sx={{ mt: 1 }}>
                <Chip 
                  label={question.category} 
                  size="small"
                  sx={{ 
                    backgroundColor: '#0f258f', 
                    color: '#fff',
                    mr: 1,
                    mb: 1
                  }}
                />
                <Chip 
                  label={question.topLevelCategory || 'Other'} 
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(15, 37, 143, 0.7)', 
                    color: '#fff',
                    mr: 1,
                    mb: 1
                  }}
                />
                <Chip 
                  label={formatValue(question.value)} 
                  size="small"
                  sx={{ 
                    backgroundColor: '#4caf50', 
                    color: '#fff',
                    mb: 1
                  }}
                />
                {archivedQuestionIds.has(question.id) && (
                  <Chip 
                    icon={<ArchiveIcon sx={{ color: '#fff !important' }} />}
                    label="Archived" 
                    size="small"
                    sx={{ 
                      backgroundColor: '#ff9800', 
                      color: '#fff',
                      ml: 1,
                      mb: 1,
                      fontWeight: 'bold'
                    }}
                  />
                )}
              </Box>
              <CategoryContainer sx={{ mt: 1 }}>
                <Tooltip title="Edit top-level category">
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(question);
                    }}
                    sx={{ 
                      color: '#0f258f',
                      '&:hover': {
                        backgroundColor: 'rgba(15, 37, 143, 0.1)'
                      }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  Click to {revealedAnswers.has(question.id) ? 'hide' : 'reveal'} answer
                </Typography>
              </CategoryContainer>
            </>
          }
        />
        {!archivedQuestionIds.has(question.id) ? (
          <Tooltip title="Archive question (mark as mastered)">
            <IconButton 
              edge="end" 
              aria-label="archive"
              onClick={(e) => {
                e.stopPropagation();
                handleArchiveQuestion(question.id);
              }}
              sx={{ 
                color: '#ff9800',
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.1)'
                }
              }}
            >
              <ArchiveIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Restore from archive">
            <IconButton 
              edge="end" 
              aria-label="restore"
              onClick={(e) => {
                e.stopPropagation();
                handleRestoreQuestion(question.id);
              }}
              sx={{ 
                color: '#4caf50',
                '&:hover': {
                  backgroundColor: 'rgba(76, 175, 80, 0.1)'
                }
              }}
            >
              <RestoreIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      {revealedAnswers.has(question.id) && (
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          bgcolor: '#e8f4f8', 
          width: '100%', 
          borderRadius: 1,
          border: '2px solid #0f258f'
        }}>
          <Typography variant="h6" sx={{ color: '#0f258f', fontWeight: 'bold' }}>
            Answer: {question.answer}
          </Typography>
        </Box>
      )}
    </QuestionListItem>
  );

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
      
      <HomeButton
        variant="contained"
        startIcon={<HomeIcon />}
        onClick={onReturnToStart}
      >
        Home
      </HomeButton>

      <Container maxWidth="lg" sx={{ mt: { xs: 4, sm: 6, md: 8 }, mb: 4, px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
        <StyledPaper>
          <Typography variant="h3" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
            ❌ Missed Questions
          </Typography>

      {!loading && !error && missedQuestions.length > 0 && (
        <Typography variant="subtitle1" align="center" sx={{ mb: 4, color: '#f5f5f5', fontSize: '1.1rem' }}>
          Total: {missedQuestions.length} question{missedQuestions.length !== 1 ? 's' : ''}
        </Typography>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography sx={{ color: '#f5f5f5' }}>Loading missed questions...</Typography>
        </Box>
      )}

      {error && (
        <Box sx={{ 
          backgroundColor: 'rgba(244, 67, 54, 0.1)', 
          border: '2px solid #f44336',
          borderRadius: 2,
          p: 2,
          mb: 2 
        }}>
          <Typography sx={{ color: '#f44336', fontWeight: 'bold' }}>
            {error}
          </Typography>
        </Box>
      )}

      {!loading && !error && missedQuestions.length === 0 && (
        <Box sx={{ textAlign: 'center', my: 6, p: 4, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#f5f5f5' }}>
            🎉 No missed questions yet!
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Missed questions will appear here when you answer incorrectly during gameplay.
          </Typography>
        </Box>
      )}

      {!loading && !error && missedQuestions.length > 0 && (
        <>
      {/* Archive Toggle */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant={!showArchived ? "contained" : "outlined"}
          startIcon={<ClearIcon />}
          onClick={() => setShowArchived(false)}
          sx={{
            backgroundColor: !showArchived ? '#f5f5f5' : 'transparent',
            color: !showArchived ? '#0f258f' : '#f5f5f5',
            borderColor: '#f5f5f5',
            fontWeight: 'bold',
            px: 3,
            '&:hover': {
              backgroundColor: !showArchived ? '#e0e0e0' : 'rgba(255, 255, 255, 0.1)',
              borderColor: '#f5f5f5',
            }
          }}
        >
          Active Questions ({missedQuestions.filter(q => !archivedQuestionIds.has(q.id)).length})
        </Button>
        <Button
          variant={showArchived ? "contained" : "outlined"}
          startIcon={<ArchiveIcon />}
          onClick={() => setShowArchived(true)}
          sx={{
            backgroundColor: showArchived ? '#f5f5f5' : 'transparent',
            color: showArchived ? '#0f258f' : '#f5f5f5',
            borderColor: '#f5f5f5',
            fontWeight: 'bold',
            px: 3,
            '&:hover': {
              backgroundColor: showArchived ? '#e0e0e0' : 'rgba(255, 255, 255, 0.1)',
              borderColor: '#f5f5f5',
            }
          }}
        >
          Archived ({archivedQuestionIds.size})
        </Button>
      </Box>

      {/* Search Field */}
      <SearchContainer>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search questions by keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#0f258f' }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchQuery('')}
                  edge="end"
                  sx={{ color: '#0f258f' }}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#fff',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderWidth: 2,
              },
              '&:hover fieldset': {
                borderColor: '#f5f5f5',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#f5f5f5',
              },
            },
            '& .MuiInputBase-input': {
              color: '#0f258f',
              fontSize: '1.1rem',
            },
          }}
        />
        {searchQuery && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#f5f5f5' }}>
            {filterQuestions(missedQuestions).length} result{filterQuestions(missedQuestions).length !== 1 ? 's' : ''} found
          </Typography>
        )}
      </SearchContainer>

      <FilterContainer>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel 
            sx={{ 
              color: '#f5f5f5',
              '&.Mui-focused': { color: '#f5f5f5' }
            }}
          >
            Category
          </InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Category"
            sx={{
              color: '#f5f5f5',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '.MuiOutlinedInput-notchedOutline': { borderColor: '#f5f5f5', borderWidth: 2 },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f5f5f5' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f5f5f5' },
              '.MuiSvgIcon-root': { color: '#f5f5f5' }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#f5f5f5',
                }
              }
            }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel 
            sx={{ 
              color: '#f5f5f5',
              '&.Mui-focused': { color: '#f5f5f5' }
            }}
          >
            Top-Level Category
          </InputLabel>
          <Select
            value={selectedTopLevelCategory}
            onChange={(e) => setSelectedTopLevelCategory(e.target.value)}
            label="Top-Level Category"
            sx={{
              color: '#f5f5f5',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '.MuiOutlinedInput-notchedOutline': { borderColor: '#f5f5f5', borderWidth: 2 },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f5f5f5' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f5f5f5' },
              '.MuiSvgIcon-root': { color: '#f5f5f5' }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#f5f5f5',
                }
              }
            }}
          >
            <MenuItem value="all">All Top-Level Categories</MenuItem>
            {topLevelCategories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </FilterContainer>

      <List>
        {filterQuestions(missedQuestions).map((question) => (
          <QuestionItem key={question.id} question={question} />
        ))}
      </List>

      {filterQuestions(missedQuestions).length === 0 && searchQuery && (
        <Box sx={{ 
          textAlign: 'center', 
          my: 4, 
          p: 4, 
          backgroundColor: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: 2 
        }}>
          <Typography variant="h6" sx={{ color: '#f5f5f5', mb: 2 }}>
            No questions match your search "{searchQuery}"
          </Typography>
          <Button
            onClick={() => setSearchQuery('')}
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: '#f5f5f5',
              color: '#0f258f',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              }
            }}
          >
            Clear Search
          </Button>
        </Box>
      )}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={() => setClearDialogOpen(true)}
          sx={{
            backgroundColor: '#f44336',
            color: 'white',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': {
              backgroundColor: '#d32f2f',
            }
          }}
        >
          Clear All Questions
        </Button>
      </Box>
      </>
      )}
        </StyledPaper>
      </Container>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ color: '#0f258f', fontWeight: 'bold' }}>Delete Question</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#666' }}>Are you sure you want to delete this question?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#0f258f' }}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} sx={{ color: '#f44336', fontWeight: 'bold' }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ color: '#0f258f', fontWeight: 'bold' }}>Clear All Questions</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#666' }}>Are you sure you want to clear all missed questions? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)} sx={{ color: '#0f258f' }}>Cancel</Button>
          <Button onClick={handleClearAll} sx={{ color: '#f44336', fontWeight: 'bold' }}>Clear All</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ color: '#0f258f', fontWeight: 'bold' }}>Edit Top-Level Category</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Question: {questionToEdit?.question}
          </Typography>
          
          {!showCustomInput ? (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Top-Level Category</InputLabel>
              <Select
                value={newTopLevelCategory}
                onChange={(e) => setNewTopLevelCategory(e.target.value)}
                label="Top-Level Category"
              >
                <MenuItem value="History">History</MenuItem>
                <MenuItem value="Geography">Geography</MenuItem>
                <MenuItem value="Science">Science</MenuItem>
                <MenuItem value="Sports">Sports</MenuItem>
                <MenuItem value="Entertainment">Entertainment</MenuItem>
                <MenuItem value="Literature">Literature</MenuItem>
                <MenuItem value="Pop Culture">Pop Culture</MenuItem>
                <MenuItem value="Food and Drink">Food and Drink</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
                <MenuItem value="custom">+ Add Custom Category</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Custom Category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                autoFocus
              />
              <Button 
                size="small" 
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomCategory('');
                }}
                sx={{ mt: 1, color: '#0f258f' }}
              >
                Back to Preset Categories
              </Button>
            </Box>
          )}
          
          {!showCustomInput && newTopLevelCategory === 'custom' && (
            <Box sx={{ mt: 1 }}>
              <Button 
                size="small" 
                onClick={() => setShowCustomInput(true)}
                sx={{ color: '#0f258f' }}
              >
                Enter Custom Category
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ color: '#0f258f' }}>Cancel</Button>
          <Button 
            onClick={handleEditConfirm} 
            disabled={showCustomInput && !customCategory.trim()}
            sx={{ color: '#0f258f', fontWeight: 'bold' }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MissedQuestions; 