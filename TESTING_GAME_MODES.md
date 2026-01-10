# 🎮 Game Mode Selection - Testing Guide

## What to Test

### 1. Start a New Game
- From the start screen, click **"Start Game"**
- You should see a **new screen** with 3 game mode cards

### 2. Game Mode Selection Screen
You should see 3 options:

**👥 Two Player**
- Description: "Play with a friend on the same device"
- Click this → Should go to normal player setup (2 players)

**🎯 Solo Practice**
- Description: "Play alone and track your score"
- Click this → Should go to player setup (1 player only)

**🤖 vs CPU**
- Description: "Challenge legendary Jeopardy! champions"
- Click this → Should go to CPU opponent selection screen

### 3. CPU Opponent Selection Screen
If you click "vs CPU", you should see:
- **Title:** "Choose Your Opponent"
- **Grid of 12 opponents** with:
  - Generated avatar (initials-based)
  - Name (First-Timer Fred, Celebrity Casey, etc.)
  - Colored tier badge (Beginner/Intermediate/Advanced/Expert/Master/GOAT)
  - Bio description
  - Difficulty rating (1/12 to 12/12)
  - Accuracy percentage

**Test:**
- Click on different opponents → Card should get blue border
- Click "Continue" button → Should go to player setup (1 player)
- Click "Back" button → Should return to game mode selection

### 4. Player Setup Screens

**Two Player Mode:**
- Should show both Player 1 and Player 2 sections
- Same as before (no changes)

**Solo Practice Mode:**
- Should show **only Player 1** section
- Player 2 section hidden
- "Start Game" button should work with just one name

**vs CPU Mode:**
- Should show **only Player 1** section
- Player 2 is the CPU (pre-selected)
- "Start Game" button should work with just one name

### 5. Starting the Game

After player setup:
- Click "Start Game"
- **Two-Player**: Should work normally as before
- **Solo/CPU**: Game will load but CPU won't play yet (that's next step!)

### 6. Navigation

**Back buttons should work:**
- Mode selection → "Back to Menu" → Returns to start screen
- CPU selection → "Back" → Returns to mode selection
- Player setup → "Back" → Returns to previous screen (mode or CPU selection)

---

## Expected Behavior

✅ **Should work:**
- All navigation between screens
- Selecting game modes
- Selecting CPU opponents
- Player customization
- Starting a Two-Player game (works exactly as before)

⚠️ **Not implemented yet:**
- CPU actually answering questions
- Solo mode hiding Player 2 score display
- CPU stats tracking

---

## What to Look For

### Visual Check:
- ✅ Cards have hover effects (scale up slightly)
- ✅ CPU avatars display (colorful circles with initials)
- ✅ Tier badges are color-coded
- ✅ Selected CPU opponent has blue border
- ✅ Screens transition smoothly

### Functional Check:
- ✅ Can navigate forward and backward
- ✅ Can select each game mode
- ✅ Can select each CPU opponent
- ✅ Two-player game starts and plays normally
- ✅ Solo/CPU modes reach the game board (even if CPU doesn't play yet)

---

## How to Test

1. **Restart dev server** (if it's running):
   ```bash
   # Press Ctrl+C
   npm start
   ```

2. **Navigate in browser:**
   - Login (if needed)
   - Click "Start Game"
   - Test each path!

3. **Report any issues:**
   - Screens not showing?
   - Buttons not working?
   - Styling issues?
   - Let me know!

---

## 🐛 Potential Issues to Watch For

1. **Avatar images not showing** → Check browser console
2. **Cards not clickable** → Try clicking directly on the text
3. **Navigation stuck** → Use browser back or refresh
4. **Two-player mode broken** → Let me know immediately!

---

Ready to test! Let me know what you find! 🚀

