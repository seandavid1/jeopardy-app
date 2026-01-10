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
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  styled,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { 
  getMissedQuestions, 
  getMissedQuestionsByPlayer, 
  deleteMissedQuestion,
  clearAllMissedQuestions,
  updateTopLevelCategory
} from '../services/missedQuestionsDB';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(3),
  backgroundColor: '#f5f5f5',
}));

const ReturnButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  color: '#0f258f',
  '&:hover': {
    backgroundColor: '#e0e0e0',
  },
}));

const QuestionItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: 'white',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
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
  marginBottom: theme.spacing(2),
}));

const CategoryContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function MissedQuestions({ playerOneName, playerTwoName, playerOneAvatar, playerTwoAvatar, onReturnToStart }) {
  const [missedQuestions, setMissedQuestions] = useState([]);
  const [playerOneMissed, setPlayerOneMissed] = useState([]);
  const [playerTwoMissed, setPlayerTwoMissed] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTopLevelCategory, setSelectedTopLevelCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [topLevelCategories, setTopLevelCategories] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null);
  const [newTopLevelCategory, setNewTopLevelCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const loadMissedQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading all missed questions...');
      const allQuestions = await getMissedQuestions();
      console.log('All questions loaded:', allQuestions);
      setMissedQuestions(allQuestions);
      
      // Extract unique categories and top-level categories
      const uniqueCategories = [...new Set(allQuestions.map(q => q.category))].sort();
      const uniqueTopLevelCategories = [...new Set(allQuestions.map(q => q.topLevelCategory || 'Other'))].sort();
      setCategories(uniqueCategories);
      setTopLevelCategories(uniqueTopLevelCategories);
      
      console.log(`Loading missed questions for ${playerOneName}...`);
      const playerOneQuestions = await getMissedQuestionsByPlayer(playerOneName);
      console.log(`${playerOneName}'s questions:`, playerOneQuestions);
      setPlayerOneMissed(playerOneQuestions);
      
      console.log(`Loading missed questions for ${playerTwoName}...`);
      const playerTwoQuestions = await getMissedQuestionsByPlayer(playerTwoName);
      console.log(`${playerTwoName}'s questions:`, playerTwoQuestions);
      setPlayerTwoMissed(playerTwoQuestions);

      // Log the state after all updates
      console.log('Final state:', {
        allQuestions,
        playerOneQuestions,
        playerTwoQuestions
      });
    } catch (error) {
      console.error('Error loading missed questions:', error);
      setError('Failed to load missed questions. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMissedQuestions();
  }, [playerOneName, playerTwoName]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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

  const handleClearAll = async () => {
    try {
      setError(null);
      await clearAllMissedQuestions();
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
      const categoryMatch = selectedCategory === 'all' || question.category === selectedCategory;
      const topLevelCategoryMatch = selectedTopLevelCategory === 'all' || question.topLevelCategory === selectedTopLevelCategory;
      return categoryMatch && topLevelCategoryMatch;
    });
  };

  const QuestionItem = ({ question }) => (
    <ListItem 
      sx={{ 
        flexDirection: 'column', 
        alignItems: 'flex-start',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)'
        }
      }}
      onClick={() => toggleAnswer(question.id)}
    >
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ListItemText
          primary={question.question}
          secondary={
            <>
              <Typography component="span" variant="body2">
                Category: {question.category}
              </Typography>
              <br />
              <CategoryContainer>
                <Typography component="span" variant="body2">
                  Top-Level Category: {question.topLevelCategory || 'Other'}
                </Typography>
                <Tooltip title="Edit top-level category">
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(question);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </CategoryContainer>
              <br />
              <Typography component="span" variant="body2">
                Value: {formatValue(question.value)}
              </Typography>
            </>
          }
        />
        <IconButton 
          edge="end" 
          aria-label="delete"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(question);
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
      {revealedAnswers.has(question.id) && (
        <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', width: '100%', borderRadius: 1 }}>
          <Typography variant="body1" color="primary">
            Answer: {question.answer}
          </Typography>
        </Box>
      )}
    </ListItem>
  );

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: '0 auto', position: 'relative', p: 3 }}>
      <ReturnButton onClick={onReturnToStart} variant="contained">
        Return to Start
      </ReturnButton>

      <Typography variant="h4" component="h1" gutterBottom align="center">
        Missed Questions
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <FilterContainer>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Category"
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
          <InputLabel>Top-Level Category</InputLabel>
          <Select
            value={selectedTopLevelCategory}
            onChange={(e) => setSelectedTopLevelCategory(e.target.value)}
            label="Top-Level Category"
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="missed questions tabs">
          <Tab label="All Questions" {...a11yProps(0)} />
          <Tab label={`${playerOneName}'s Questions`} {...a11yProps(1)} />
          <Tab label={`${playerTwoName}'s Questions`} {...a11yProps(2)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <List>
          {filterQuestions(missedQuestions).map((question) => (
            <QuestionItem key={question.id} question={question} />
          ))}
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <List>
          {filterQuestions(playerOneMissed).map((question) => (
            <QuestionItem key={question.id} question={question} />
          ))}
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <List>
          {filterQuestions(playerTwoMissed).map((question) => (
            <QuestionItem key={question.id} question={question} />
          ))}
        </List>
      </TabPanel>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="error"
          onClick={() => setClearDialogOpen(true)}
          sx={{ mt: 2 }}
        >
          Clear All Questions
        </Button>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Question</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this question?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
      >
        <DialogTitle>Clear All Questions</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to clear all missed questions? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleClearAll} color="error">Clear All</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
      >
        <DialogTitle>Edit Top-Level Category</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
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
                sx={{ mt: 1 }}
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
              >
                Enter Custom Category
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleEditConfirm} 
            color="primary"
            disabled={showCustomInput && !customCategory.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MissedQuestions; 