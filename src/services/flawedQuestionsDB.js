// Flawed Questions Database Service (Firebase)
// Manages questions that have been marked as flawed by admins

import { db } from '../firebase-config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  doc,
  setDoc,
  Timestamp 
} from 'firebase/firestore';

/**
 * Mark a question as flawed (admin only)
 * @param {Object} questionData - Question data including id, category, question, answer
 * @param {string} adminEmail - Email of admin marking the question
 * @param {string} reason - Optional reason for marking as flawed
 * @returns {Promise<string>} - Document ID of the flawed question entry
 */
export const markQuestionAsFlawed = async (questionData, adminEmail, reason = 'Admin marked as flawed') => {
  try {
    if (!db) {
      console.warn('Firebase not initialized.');
      return null;
    }

    const flawedQuestion = {
      questionId: questionData.id,
      category: questionData.category,
      question: questionData.question,
      answer: questionData.answer,
      value: questionData.value,
      markedBy: adminEmail,
      reason: reason,
      markedAt: Timestamp.fromDate(new Date()),
      timestamp: Date.now()
    };

    // Use questionId as document ID to prevent duplicates
    const docRef = doc(db, 'flawed_questions', String(questionData.id));
    await setDoc(docRef, flawedQuestion);
    
    console.log('✅ Question marked as flawed:', questionData.id);
    return String(questionData.id);
  } catch (error) {
    console.error('❌ Error marking question as flawed:', error);
    throw error;
  }
};

/**
 * Get all flawed question IDs
 * @returns {Promise<Set>} - Set of flawed question IDs
 */
export const getFlawedQuestionIds = async () => {
  try {
    if (!db) {
      console.warn('Firebase not initialized.');
      return new Set();
    }

    const q = query(collection(db, 'flawed_questions'));
    const querySnapshot = await getDocs(q);
    
    const flawedIds = new Set();
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      flawedIds.add(data.questionId);
    });

    console.log(`✅ Loaded ${flawedIds.size} flawed question IDs`);
    return flawedIds;
  } catch (error) {
    console.error('❌ Error loading flawed questions:', error);
    return new Set();
  }
};

/**
 * Check if a question is flawed
 * @param {string} questionId - Question ID to check
 * @returns {Promise<boolean>} - True if question is flawed
 */
export const isQuestionFlawed = async (questionId) => {
  try {
    if (!db) {
      return false;
    }

    const flawedIds = await getFlawedQuestionIds();
    return flawedIds.has(questionId);
  } catch (error) {
    console.error('❌ Error checking if question is flawed:', error);
    return false;
  }
};

/**
 * Get all flawed questions with details (admin view)
 * @returns {Promise<Array>} - Array of flawed question objects
 */
export const getAllFlawedQuestions = async () => {
  try {
    if (!db) {
      console.warn('Firebase not initialized.');
      return [];
    }

    const q = query(collection(db, 'flawed_questions'));
    const querySnapshot = await getDocs(q);
    
    const flawedQuestions = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      flawedQuestions.push({
        id: doc.id,
        ...data,
        markedAt: data.markedAt?.toDate().toISOString() || new Date().toISOString()
      });
    });

    console.log(`✅ Loaded ${flawedQuestions.length} flawed questions with details`);
    return flawedQuestions;
  } catch (error) {
    console.error('❌ Error loading flawed questions:', error);
    return [];
  }
};





