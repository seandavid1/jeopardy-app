// Firebase-based Missed Questions Service
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase-config';

const COLLECTION_NAME = 'missedQuestions';

// Helper to get current user ID
const getUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be logged in to access missed questions');
  }
  return user.uid;
};

// Add a missed question
export const addMissedQuestion = async (clue, playerName) => {
  try {
    const userId = getUserId();

    const questionData = {
      userId,
      playerName,
      clueId: clue.id,
      category: clue.category,
      topLevelCategory: clue.topLevelCategory || 'Other',
      question: clue.clue,
      answer: clue.response,
      value: clue.value,
      round: clue.round,
      date: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), questionData);
    console.log('Missed question added to Firebase:', docRef.id);

    return {
      id: docRef.id,
      ...questionData,
      date: questionData.date.toDate().toISOString()
    };
  } catch (error) {
    console.error('Error adding missed question to Firebase:', error);
    throw error;
  }
};

// Get all missed questions for current user
export const getMissedQuestions = async () => {
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
      date: doc.data().date?.toDate().toISOString()
    }));

    // Sort by date in JavaScript instead of Firestore
    questions.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log('Retrieved missed questions from Firebase:', questions.length);
    return questions;
  } catch (error) {
    console.error('Error getting missed questions from Firebase:', error);
    throw error;
  }
};

// Get missed questions for a specific player
export const getMissedQuestionsByPlayer = async (playerName) => {
  try {
    const userId = getUserId();

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('playerName', '==', playerName)
    );

    const querySnapshot = await getDocs(q);
    const questions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate().toISOString()
    }));

    // Sort by date in JavaScript instead of Firestore
    questions.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log(`Retrieved missed questions for ${playerName} from Firebase:`, questions.length);
    return questions;
  } catch (error) {
    console.error('Error getting player missed questions from Firebase:', error);
    throw error;
  }
};

// Update the top-level category of a missed question
export const updateTopLevelCategory = async (id, newTopLevelCategory) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      topLevelCategory: newTopLevelCategory
    });

    console.log(`Updated category for question ${id} to ${newTopLevelCategory}`);
    return { id, topLevelCategory: newTopLevelCategory };
  } catch (error) {
    console.error('Error updating category in Firebase:', error);
    throw error;
  }
};

// Delete a missed question by ID
export const deleteMissedQuestion = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    console.log('Deleted missed question from Firebase:', id);
    return true;
  } catch (error) {
    console.error('Error deleting missed question from Firebase:', error);
    throw error;
  }
};

// Clear all missed questions for current user
export const clearAllMissedQuestions = async () => {
  try {
    const userId = getUserId();

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));

    await Promise.all(deletePromises);
    console.log('Cleared all missed questions from Firebase');
    return true;
  } catch (error) {
    console.error('Error clearing missed questions from Firebase:', error);
    throw error;
  }
};

