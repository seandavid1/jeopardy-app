# Converting to User Authentication + Database Storage

## Overview of Changes Needed

This guide outlines how to convert your Jeopardy app from browser-local storage to a full user authentication system with database storage.

**Complexity Level:** Intermediate to Advanced  
**Time Estimate:** 20-40 hours of development  
**New Skills Required:** Backend development, database management, authentication

---

## Architecture Change

### Current Architecture:
```
Browser (React App)
    ↓
localStorage / IndexedDB
```

### New Architecture:
```
Browser (React App)
    ↓
API Calls (HTTP/REST)
    ↓
Backend Server (Node.js/Express)
    ↓
Database (MongoDB/PostgreSQL)
```

---

## Option 1: Full Custom Backend (Most Control)

### Tech Stack:
- **Frontend:** React (what you have)
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (free tier)
- **Auth:** JWT (JSON Web Tokens)
- **Hosting:** 
  - Frontend: GoDaddy (static files)
  - Backend: Heroku/Railway/DigitalOcean

### Step 1: Create Backend Server

**Install dependencies:**
```bash
# In a new folder or /api directory
npm init -y
npm install express mongoose bcryptjs jsonwebtoken cors dotenv
```

**Basic server structure:**
```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/missed-questions', require('./routes/missedQuestions'));
app.use('/api/category-overrides', require('./routes/categoryOverrides'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Step 2: Create Database Models

**User Model:**
```javascript
// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
```

**Missed Question Model:**
```javascript
// models/MissedQuestion.js
const mongoose = require('mongoose');

const MissedQuestionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clueId: { type: String, required: true },
  category: String,
  topLevelCategory: String,
  question: String,
  answer: String,
  value: Number,
  round: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MissedQuestion', MissedQuestionSchema);
```

### Step 3: Authentication Routes

```javascript
// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    user = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // Create token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token, user: { id: user.id, username, email } });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: { id: user.id, username: user.username, email: user.email } 
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
```

### Step 4: Protected Routes (Middleware)

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
```

### Step 5: Data Routes

```javascript
// routes/missedQuestions.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MissedQuestion = require('../models/MissedQuestion');

// Get user's missed questions
router.get('/', auth, async (req, res) => {
  try {
    const questions = await MissedQuestion.find({ userId: req.userId });
    res.json(questions);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Add missed question
router.post('/', auth, async (req, res) => {
  try {
    const newQuestion = new MissedQuestion({
      userId: req.userId,
      ...req.body
    });
    
    await newQuestion.save();
    res.json(newQuestion);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete missed question
router.delete('/:id', auth, async (req, res) => {
  try {
    await MissedQuestion.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Question deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
```

### Step 6: Frontend Changes

**Create API service:**
```javascript
// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Set auth token
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Auth APIs
export const register = (userData) => 
  axios.post(`${API_URL}/auth/register`, userData);

export const login = (credentials) => 
  axios.post(`${API_URL}/auth/login`, credentials);

// Missed Questions APIs
export const getMissedQuestions = () => 
  axios.get(`${API_URL}/missed-questions`);

export const addMissedQuestion = (question) => 
  axios.post(`${API_URL}/missed-questions`, question);

export const deleteMissedQuestion = (id) => 
  axios.delete(`${API_URL}/missed-questions/${id}`);
```

**Create Auth Context:**
```javascript
// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { setAuthToken } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token on mount
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      // Verify token / load user
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    // Call API to verify token and get user
    setLoading(false);
  };

  const loginUser = async (credentials) => {
    const response = await login(credentials);
    setAuthToken(response.data.token);
    setUser(response.data.user);
  };

  const logoutUser = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Create Login Component:**
```javascript
// src/components/Login.js
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser({ email, password });
      // Redirect to game
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

**Update existing services to use API:**
```javascript
// src/services/missedQuestionsDB.js - NEW VERSION
import { getMissedQuestions, addMissedQuestion as addToAPI, deleteMissedQuestion as deleteFromAPI } from './api';

export const addMissedQuestion = async (clue, playerName) => {
  const question = {
    clueId: clue.id,
    category: clue.category,
    topLevelCategory: clue.topLevelCategory,
    question: clue.clue,
    answer: clue.response,
    value: clue.value,
    round: clue.round
  };
  
  const response = await addToAPI(question);
  return response.data;
};

export const getMissedQuestions = async () => {
  const response = await getMissedQuestions();
  return response.data;
};

// ... etc
```

### Step 7: Environment Variables

**Backend (.env):**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jeopardy
JWT_SECRET=your_super_secret_key_here_make_it_long_and_random
PORT=5000
```

**Frontend (.env):**
```bash
REACT_APP_API_URL=https://your-api.herokuapp.com/api
REACT_APP_AWS_REGION=us-east-1
REACT_APP_AWS_ACCESS_KEY_ID=your_key
REACT_APP_AWS_SECRET_ACCESS_KEY=your_secret
```

### Step 8: Deployment

**Backend (Heroku example):**
```bash
# Create Heroku app
heroku create your-jeopardy-api

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

**Frontend (GoDaddy):**
- Update API_URL in .env to point to deployed backend
- Build: `npm run build`
- Upload to GoDaddy as before

---

## Option 2: Firebase (Easiest Full Solution)

### Advantages:
- ✅ No backend code needed
- ✅ Built-in authentication
- ✅ Real-time database
- ✅ Free tier is generous
- ✅ Automatic scaling

### Implementation:

**Install Firebase:**
```bash
npm install firebase
```

**Initialize Firebase:**
```javascript
// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

**Authentication:**
```javascript
// src/services/authService.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { auth } from '../firebase';

export const register = (email, password) => 
  createUserWithEmailAndPassword(auth, email, password);

export const login = (email, password) => 
  signInWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);
```

**Database Operations:**
```javascript
// src/services/missedQuestionsDB.js - Firebase version
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const addMissedQuestion = async (clue, playerName) => {
  const userId = auth.currentUser.uid;
  
  const docRef = await addDoc(collection(db, 'missedQuestions'), {
    userId,
    clueId: clue.id,
    category: clue.category,
    question: clue.clue,
    answer: clue.response,
    date: new Date()
  });
  
  return docRef;
};

export const getMissedQuestions = async () => {
  const userId = auth.currentUser.uid;
  const q = query(
    collection(db, 'missedQuestions'), 
    where('userId', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

---

## Option 3: Supabase (Firebase Alternative, PostgreSQL-based)

### Advantages:
- ✅ Similar to Firebase but open-source
- ✅ Uses PostgreSQL (SQL)
- ✅ Generous free tier
- ✅ Built-in auth and real-time
- ✅ Easy API

Very similar implementation to Firebase, with SQL instead of NoSQL.

---

## Comparison of Options

| Feature | Custom Backend | Firebase | Supabase |
|---------|---------------|----------|----------|
| **Complexity** | High | Low | Low |
| **Control** | Full | Limited | Medium |
| **Cost (small)** | ~$7-15/month | Free | Free |
| **Cost (large)** | Variable | Can get expensive | More affordable |
| **Learning Curve** | Steep | Gentle | Gentle |
| **Time to Implement** | 30-40 hours | 8-10 hours | 8-10 hours |
| **Scalability** | Manual | Automatic | Automatic |

---

## My Recommendation

**For your use case, I recommend Firebase because:**

1. **Fastest to implement** (8-10 hours vs 30-40 hours)
2. **No backend server to maintain**
3. **Built-in authentication** (email/password, Google, Facebook, etc.)
4. **Free tier covers most personal use**
5. **Real-time sync across devices**
6. **Automatic scaling**
7. **Still works with GoDaddy hosting** (frontend stays static)

**Custom backend only if:**
- You want to learn backend development
- You need very specific custom logic
- You have unique requirements Firebase can't handle

---

## Cost Comparison

**Current Setup (Static):**
- GoDaddy hosting: $X/month (what you pay now)
- AWS Polly: ~$1-3/month
- **Total: ~$1-3/month extra**

**With Firebase:**
- GoDaddy hosting: $X/month
- AWS Polly: ~$1-3/month  
- Firebase: FREE (up to 50K reads/day, 20K writes/day)
- **Total: ~$1-3/month extra** (same!)

**With Custom Backend:**
- GoDaddy hosting: $X/month
- AWS Polly: ~$1-3/month
- Heroku/Railway: $7/month
- MongoDB Atlas: FREE
- **Total: ~$8-10/month extra**

---

## Would You Like Me To...

1. **Implement Firebase auth + database** for you?
2. **Build a custom backend** step-by-step?
3. **Provide more detailed code** for any specific part?
4. **Help you choose** between options based on your needs?

Let me know which direction you'd like to go, and I can help implement it!

