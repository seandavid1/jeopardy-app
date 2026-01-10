// Firebase-based Excluded Questions Service
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

const COLLECTION_NAME = 'excludedQuestions';

// Helper to get current user ID
const getUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be logged in to access excluded questions');
  }
  return user.uid;
};

// Add a question to excluded list
export const excludeQuestion = async (clueId, reason = 'Visual clue without image') => {
  try {
    const userId = getUserId();

    // Use clueId_userId as document ID for uniqueness
    const docId = `${clueId}_${userId}`;

    const exclusionData = {
      userId,
      clueId,
      reason,
      timestamp: Timestamp.now()
    };

    const docRef = doc(db, COLLECTION_NAME, docId);
    await setDoc(docRef, exclusionData);

    console.log('Question excluded in Firebase:', docId);
    return {
      id: docId,
      ...exclusionData,
      timestamp: exclusionData.timestamp.toDate().toISOString()
    };
  } catch (error) {
    console.error('Error excluding question in Firebase:', error);
    throw error;
  }
};

// Check if a question is excluded
export const isQuestionExcluded = async (clueId) => {
  try {
    const userId = getUserId();
    const docId = `${clueId}_${userId}`;

    const docRef = doc(db, COLLECTION_NAME, docId);
    const docSnap = await getDoc(docRef);

    return docSnap.exists();
  } catch (error) {
    console.error('Error checking if question is excluded in Firebase:', error);
    throw error;
  }
};

// Get all excluded question IDs for current user
export const getAllExcludedQuestionIds = async () => {
  try {
    const userId = getUserId();

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const ids = querySnapshot.docs.map(doc => doc.data().clueId);

    console.log('Retrieved excluded question IDs from Firebase:', ids.length);
    return ids;
  } catch (error) {
    console.error('Error getting excluded question IDs from Firebase:', error);
    throw error;
  }
};

// Get all excluded questions with details
export const getAllExcludedQuestions = async () => {
  try {
    const userId = getUserId();

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const questions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate().toISOString()
    }));

    console.log('Retrieved excluded questions from Firebase:', questions.length);
    return questions;
  } catch (error) {
    console.error('Error getting all excluded questions from Firebase:', error);
    throw error;
  }
};

// Remove a question from excluded list (restore it)
export const restoreQuestion = async (clueId) => {
  try {
    const userId = getUserId();
    const docId = `${clueId}_${userId}`;

    const docRef = doc(db, COLLECTION_NAME, docId);
    await deleteDoc(docRef);

    console.log('Question restored in Firebase:', docId);
    return true;
  } catch (error) {
    console.error('Error restoring question in Firebase:', error);
    throw error;
  }
};

// Clear all excluded questions for current user
export const clearAllExclusions = async () => {
  try {
    const userId = getUserId();

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));

    await Promise.all(deletePromises);
    console.log('Cleared all exclusions from Firebase');
    return true;
  } catch (error) {
    console.error('Error clearing exclusions from Firebase:', error);
    throw error;
  }
};

