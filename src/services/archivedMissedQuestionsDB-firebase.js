// Firebase-based Archived Missed Questions Service
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase-config';

const COLLECTION_NAME = 'archivedMissedQuestions';

// Helper to get current user ID
const getUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be logged in to archive missed questions');
  }
  return user.uid;
};

// Archive a missed question (stores the question ID)
export const archiveMissedQuestion = async (questionId) => {
  try {
    console.log('archiveMissedQuestion called with:', questionId);
    
    if (!questionId) {
      throw new Error('Question ID is required to archive');
    }
    
    const userId = getUserId();
    console.log('User ID:', userId);

    const archiveData = {
      userId,
      questionId,
      archivedAt: Timestamp.now()
    };

    console.log('Attempting to add document to Firestore...', archiveData);
    const docRef = await addDoc(collection(db, COLLECTION_NAME), archiveData);
    console.log('Missed question archived successfully. Document ID:', docRef.id);

    return {
      id: docRef.id,
      ...archiveData
    };
  } catch (error) {
    console.error('Error archiving missed question:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide more specific error messages
    if (error.message.includes('User must be logged in')) {
      throw new Error('You must be logged in to archive questions');
    } else if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Check your Firestore security rules.');
    } else if (error.code === 'unavailable') {
      throw new Error('Network error. Check your internet connection.');
    }
    
    throw error;
  }
};

// Get all archived question IDs for current user
export const getArchivedMissedQuestionIds = async () => {
  try {
    const userId = getUserId();

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const questionIds = querySnapshot.docs.map(doc => doc.data().questionId);

    console.log('Retrieved archived missed question IDs:', questionIds.length);
    return questionIds;
  } catch (error) {
    // If user not logged in, return empty array instead of throwing
    if (error.message && error.message.includes('User must be logged in')) {
      console.warn('User not logged in, returning empty archived list');
      return [];
    }
    console.error('Error getting archived missed questions:', error);
    // Return empty array on error so app can continue
    return [];
  }
};

// Unarchive a missed question (remove from archive)
export const unarchiveMissedQuestion = async (questionId) => {
  try {
    const userId = getUserId();

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('questionId', '==', questionId)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));

    await Promise.all(deletePromises);
    console.log('Unarchived missed question:', questionId);
    return true;
  } catch (error) {
    console.error('Error unarchiving missed question:', error);
    throw error;
  }
};

// Clear all archived missed questions for current user
export const clearAllArchivedMissedQuestions = async () => {
  try {
    const userId = getUserId();

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));

    await Promise.all(deletePromises);
    console.log('Cleared all archived missed questions');
    return true;
  } catch (error) {
    console.error('Error clearing archived missed questions:', error);
    throw error;
  }
};

