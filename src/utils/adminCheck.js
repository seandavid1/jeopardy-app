// Admin utilities for the Jeopardy application

/**
 * List of admin email addresses
 */
const ADMIN_EMAILS = [
  'seandavid1@gmail.com'
];

/**
 * Check if a user is an admin based on their email
 * @param {Object} user - Firebase user object
 * @returns {boolean} - True if user is an admin
 */
export const isAdmin = (user) => {
  if (!user || !user.email) {
    return false;
  }
  
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
};

/**
 * Check if an email is an admin email
 * @param {string} email - Email address to check
 * @returns {boolean} - True if email is an admin
 */
export const isAdminEmail = (email) => {
  if (!email) {
    return false;
  }
  
  return ADMIN_EMAILS.includes(email.toLowerCase());
};





