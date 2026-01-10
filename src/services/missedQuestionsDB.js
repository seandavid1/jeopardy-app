// This is a localStorage-based database for storing missed questions
// Data will persist across browser sessions

const STORAGE_KEY = 'jeopardy_missed_questions';

// Helper function to get all questions from localStorage
const getStoredQuestions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('Retrieved from localStorage:', stored);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Validate that we got an array
    if (!Array.isArray(parsed)) {
      console.error('Stored data is not an array, resetting storage');
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return parsed;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    // If there's an error reading the data, reset the storage
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

// Helper function to save questions to localStorage
const saveQuestions = (questions) => {
  try {
    if (!Array.isArray(questions)) {
      throw new Error('Questions must be an array');
    }
    const jsonString = JSON.stringify(questions);
    console.log('Saving to localStorage:', jsonString);
    localStorage.setItem(STORAGE_KEY, jsonString);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw error;
  }
};

// Add a missed question to the database
export const addMissedQuestion = (clue, playerName) => {
  return new Promise((resolve, reject) => {
    try {
      if (!clue || !playerName) {
        throw new Error('Missing required parameters');
      }

      console.log('Adding missed question:', { clue, playerName });
      const questions = getStoredQuestions();
      const newQuestion = {
        id: Date.now().toString(),
        date: new Date().toISOString(), // Store as ISO string for better serialization
        playerName,
        category: clue.category,
        topLevelCategory: clue.topLevelCategory || 'Other', // Include the top-level category
        question: clue.clue,
        answer: clue.response,
        value: clue.value,
        round: clue.round
      };
      
      questions.push(newQuestion);
      saveQuestions(questions);
      console.log('Successfully added missed question:', newQuestion);
      resolve(newQuestion);
    } catch (error) {
      console.error('Error adding missed question:', error);
      reject(error);
    }
  });
};

// Get all missed questions
export const getMissedQuestions = () => {
  return new Promise((resolve, reject) => {
    try {
      const questions = getStoredQuestions();
      console.log('Retrieved all missed questions:', questions);
      resolve([...questions]);
    } catch (error) {
      console.error('Error getting missed questions:', error);
      reject(error);
    }
  });
};

// Get missed questions for a specific player
export const getMissedQuestionsByPlayer = (playerName) => {
  return new Promise((resolve, reject) => {
    try {
      if (!playerName) {
        throw new Error('Player name is required');
      }

      const questions = getStoredQuestions();
      const playerQuestions = questions.filter(q => q.playerName === playerName);
      console.log(`Retrieved missed questions for ${playerName}:`, playerQuestions);
      resolve(playerQuestions);
    } catch (error) {
      console.error('Error getting player missed questions:', error);
      reject(error);
    }
  });
};

// Update the top-level category of a missed question
export const updateTopLevelCategory = (id, newTopLevelCategory) => {
  return new Promise((resolve, reject) => {
    try {
      if (!id || !newTopLevelCategory) {
        throw new Error('Question ID and new top-level category are required');
      }

      const questions = getStoredQuestions();
      const questionIndex = questions.findIndex(q => q.id === id);
      
      if (questionIndex === -1) {
        throw new Error(`Question with ID ${id} not found`);
      }
      
      // Update the top-level category
      questions[questionIndex].topLevelCategory = newTopLevelCategory;
      saveQuestions(questions);
      
      console.log(`Updated top-level category for question ${id} to ${newTopLevelCategory}`);
      resolve(questions[questionIndex]);
    } catch (error) {
      console.error('Error updating top-level category:', error);
      reject(error);
    }
  });
};

// Delete a missed question by ID
export const deleteMissedQuestion = (id) => {
  return new Promise((resolve, reject) => {
    try {
      if (!id) {
        throw new Error('Question ID is required');
      }

      const questions = getStoredQuestions();
      const filteredQuestions = questions.filter(q => q.id !== id);
      console.log('Deleting question with ID:', id);
      saveQuestions(filteredQuestions);
      resolve(true);
    } catch (error) {
      console.error('Error deleting missed question:', error);
      reject(error);
    }
  });
};

// Clear all missed questions
export const clearAllMissedQuestions = () => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Clearing all missed questions');
      localStorage.removeItem(STORAGE_KEY);
      resolve(true);
    } catch (error) {
      console.error('Error clearing missed questions:', error);
      reject(error);
    }
  });
}; 