// IndexedDB service for storing category overrides
const DB_NAME = 'JeopardyCategoryOverrides';
const STORE_NAME = 'overrides';
const DB_VERSION = 1;

let db = null;

// Initialize the database
export const initCategoryOverridesDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening category overrides database');
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('Category overrides database opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'clueId' });
        objectStore.createIndex('newTopLevelCategory', 'newTopLevelCategory', { unique: false });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        console.log('Category overrides object store created');
      }
    };
  });
};

// Add or update a category override
export const saveCategoryOverride = async (clueId, originalCategory, newTopLevelCategory) => {
  if (!db) {
    await initCategoryOverridesDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);

    const override = {
      clueId,
      originalCategory,
      newTopLevelCategory,
      timestamp: new Date().toISOString()
    };

    const request = objectStore.put(override);

    request.onsuccess = () => {
      console.log('Category override saved:', override);
      resolve(override);
    };

    request.onerror = () => {
      console.error('Error saving category override');
      reject(request.error);
    };
  });
};

// Get a category override for a specific clue
export const getCategoryOverride = async (clueId) => {
  if (!db) {
    await initCategoryOverridesDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get(clueId);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('Error getting category override');
      reject(request.error);
    };
  });
};

// Get all category overrides
export const getAllCategoryOverrides = async () => {
  if (!db) {
    await initCategoryOverridesDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      console.error('Error getting all category overrides');
      reject(request.error);
    };
  });
};

// Delete a category override
export const deleteCategoryOverride = async (clueId) => {
  if (!db) {
    await initCategoryOverridesDB();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.delete(clueId);

    request.onsuccess = () => {
      console.log('Category override deleted:', clueId);
      resolve();
    };

    request.onerror = () => {
      console.error('Error deleting category override');
      reject(request.error);
    };
  });
};

// Initialize DB on module load
initCategoryOverridesDB().catch(console.error);





