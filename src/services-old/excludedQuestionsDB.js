// IndexedDB service for storing excluded questions
const DB_NAME = 'JeopardyExcludedQuestions';
const STORE_NAME = 'excluded';
const DB_VERSION = 1;

let db = null;

// Initialize the database
export const initExcludedQuestionsDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening excluded questions database');
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('Excluded questions database opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'clueId' });
        objectStore.createIndex('reason', 'reason', { unique: false });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        console.log('Excluded questions object store created');
      }
    };
  });
};

// Add a question to excluded list
export const excludeQuestion = async (clueId, reason = 'Visual clue without image') => {
  if (!db) {
    await initExcludedQuestionsDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);

    const exclusion = {
      clueId,
      reason,
      timestamp: new Date().toISOString()
    };

    const request = objectStore.put(exclusion);

    request.onsuccess = () => {
      console.log('Question excluded:', exclusion);
      resolve(exclusion);
    };

    request.onerror = () => {
      console.error('Error excluding question');
      reject(request.error);
    };
  });
};

// Check if a question is excluded
export const isQuestionExcluded = async (clueId) => {
  if (!db) {
    await initExcludedQuestionsDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get(clueId);

    request.onsuccess = () => {
      resolve(!!request.result);
    };

    request.onerror = () => {
      console.error('Error checking if question is excluded');
      reject(request.error);
    };
  });
};

// Get all excluded question IDs
export const getAllExcludedQuestionIds = async () => {
  if (!db) {
    await initExcludedQuestionsDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.getAllKeys();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      console.error('Error getting all excluded questions');
      reject(request.error);
    };
  });
};

// Get all excluded questions with details
export const getAllExcludedQuestions = async () => {
  if (!db) {
    await initExcludedQuestionsDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      console.error('Error getting all excluded questions');
      reject(request.error);
    };
  });
};

// Remove a question from excluded list (restore it)
export const restoreQuestion = async (clueId) => {
  if (!db) {
    await initExcludedQuestionsDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.delete(clueId);

    request.onsuccess = () => {
      console.log('Question restored:', clueId);
      resolve();
    };

    request.onerror = () => {
      console.error('Error restoring question');
      reject(request.error);
    };
  });
};

// Clear all excluded questions
export const clearAllExclusions = async () => {
  if (!db) {
    await initExcludedQuestionsDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.clear();

    request.onsuccess = () => {
      console.log('All exclusions cleared');
      resolve();
    };

    request.onerror = () => {
      console.error('Error clearing exclusions');
      reject(request.error);
    };
  });
};

// Initialize DB on module load
initExcludedQuestionsDB().catch(console.error);





