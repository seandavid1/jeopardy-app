// Firebase-based Category Overrides Service
import {
  collection,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase-config';

const COLLECTION_NAME = 'categoryOverrides';

// Helper to get current user ID
const getUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be logged in to access category overrides');
  }
  return user.uid;
};

// Add or update a category override
export const saveCategoryOverride = async (clueId, originalCategory, newTopLevelCategory) => {
  try {
    const userId = getUserId();

    // Use clueId_userId as document ID for uniqueness
    const docId = `${clueId}_${userId}`;

    const overrideData = {
      userId,
      clueId,
      originalCategory,
      newTopLevelCategory,
      timestamp: Timestamp.now()
    };

    const docRef = doc(db, COLLECTION_NAME, docId);
    await setDoc(docRef, overrideData);

    console.log('Category override saved to Firebase:', docId);
    return {
      id: docId,
      ...overrideData,
      timestamp: overrideData.timestamp.toDate().toISOString()
    };
  } catch (error) {
    console.error('Error saving category override to Firebase:', error);
    throw error;
  }
};

// Get a category override for a specific clue
export const getCategoryOverride = async (clueId) => {
  try {
    const userId = getUserId();
    const docId = `${clueId}_${userId}`;

    const docRef = doc(db, COLLECTION_NAME, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        timestamp: docSnap.data().timestamp?.toDate().toISOString()
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting category override from Firebase:', error);
    throw error;
  }
};

// Get all category overrides for current user
export const getAllCategoryOverrides = async () => {
  try {
    const userId = getUserId();

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const overrides = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate().toISOString()
    }));

    console.log('Retrieved category overrides from Firebase:', overrides.length);
    return overrides;
  } catch (error) {
    console.error('Error getting all category overrides from Firebase:', error);
    throw error;
  }
};

// Delete a category override
export const deleteCategoryOverride = async (clueId) => {
  try {
    const userId = getUserId();
    const docId = `${clueId}_${userId}`;

    const docRef = doc(db, COLLECTION_NAME, docId);
    await deleteDoc(docRef);

    console.log('Category override deleted from Firebase:', docId);
    return true;
  } catch (error) {
    console.error('Error deleting category override from Firebase:', error);
    throw error;
  }
};

// Clear all category overrides for current user
export const clearAllCategoryOverrides = async () => {
  try {
    const userId = getUserId();

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));

    await Promise.all(deletePromises);
    console.log('Cleared all category overrides from Firebase');
    return true;
  } catch (error) {
    console.error('Error clearing category overrides from Firebase:', error);
    throw error;
  }
};

