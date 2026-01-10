# Leaderboard Feature Documentation

## Overview
The Jeopardy game now includes a comprehensive leaderboard system that tracks high scores from completed games. The leaderboard displays the top 50 scores with full game details.

## Features

### 1. **Automatic Score Tracking**
- Automatically saves game results when Final Jeopardy completes
- Tracks winner's score, opponent's score, and game mode
- Records date of play

### 2. **Leaderboard Display**
- Shows top 50 scores ranked by winner's final dollar amount
- Displays:
  - Rank (with 🥇🥈🥉 medals for top 3)
  - Winner name
  - Winner's final score
  - Opponent name
  - Opponent's score
  - Game mode (vs CPU / PvP / Practice)
  - Date played

### 3. **Player Statistics**
- Click any player name to see their stats:
  - Total wins
  - High score
  - Average score

### 4. **Leaderboard Management**
- Clear all entries option (with confirmation dialog)
- Automatically keeps only top 50 scores
- Persistent storage using localStorage

## How to Access

From the **Start Screen**, click the **"🏆 Leaderboard"** button.

## Data Structure

Each leaderboard entry contains:
```javascript
{
  id: timestamp,
  winnerName: "Player Name",
  winnerScore: 25400,
  opponentName: "Opponent Name",
  opponentScore: 18200,
  gameMode: "cpu" | "two-player" | "practice",
  date: "2025-01-02T10:30:00.000Z",
  timestamp: 1704192600000
}
```

## Storage

- **Location**: Browser localStorage
- **Key**: `jeopardy_leaderboard`
- **Max Entries**: 50 (keeps top 50 scores)
- **Persistence**: Data persists across browser sessions

## Game Modes Tracked

1. **CPU Mode** (`cpu`) - Games vs computer opponents
2. **PvP Mode** (`two-player`) - Two human players
3. **Practice Mode** (`practice`) - Solo practice games

## UI Components

### Leaderboard Table
- Sticky header for easy scrolling
- Hover effects on rows
- Color-coded game mode chips
- Formatted currency display
- Responsive design

### Player Stats Dialog
- Shows detailed statistics when clicking a player name
- Displays total wins, high score, and average score

### Clear Confirmation Dialog
- Safety confirmation before clearing all entries
- Prevents accidental data loss

## Service Functions

### `saveGameResult()`
```javascript
saveGameResult(winnerName, winnerScore, opponentName, opponentScore, gameMode)
```
Saves a completed game to the leaderboard.

### `getLeaderboard()`
```javascript
getLeaderboard()
```
Returns all leaderboard entries sorted by score.

### `getTopScores(limit)`
```javascript
getTopScores(10)
```
Returns top N scores (default: 10).

### `clearLeaderboard()`
```javascript
clearLeaderboard()
```
Removes all leaderboard entries.

### `getPlayerStats(playerName)`
```javascript
getPlayerStats("Player Name")
```
Returns statistics for a specific player.

### `isNewHighScore(score)`
```javascript
isNewHighScore(25000)
```
Checks if a score would make the top 10.

## Files Added/Modified

### New Files
- `src/services/leaderboardService.js` - Core leaderboard logic
- `src/components/Leaderboard.js` - Leaderboard UI component

### Modified Files
- `src/App.js` - Added leaderboard screen routing
- `src/Board.js` - Auto-saves results on game completion
- `src/components/StartScreen.js` - Added leaderboard button

## Future Enhancements

Possible additions:
- 🌐 Cloud sync across devices (Firebase integration)
- 📊 Charts and graphs for score trends
- 🏅 Achievements/badges for milestones
- 🎯 Filtered leaderboards (by game mode, date range)
- 👥 Multiplayer tournament mode
- 📤 Export/share leaderboard data

## Usage Example

```javascript
// Game ends, Final Jeopardy completes
handleFinalJeopardyComplete({ playerOne: 25400, playerTwo: 18200 });

// System automatically:
// 1. Determines winner
// 2. Saves to leaderboard
// 3. Maintains top 50 list

// Later, view leaderboard:
const topScores = getTopScores(10);
// Returns array of top 10 entries

// Check player stats:
const stats = getPlayerStats("Sean");
// Returns { totalWins: 15, highScore: 32000, averageScore: 21500 }
```

## Data Persistence

The leaderboard uses localStorage, which means:
- ✅ Data persists across browser sessions
- ✅ No server/network required
- ✅ Instant read/write
- ⚠️ Data is per-browser (not synced)
- ⚠️ Clearing browser data clears leaderboard

## Privacy

- All data stored locally on the device
- No data sent to external servers
- User controls their own data
- Easy to clear all entries

## Performance

- Lightweight (minimal storage)
- Fast read/write operations
- Efficient sorting and filtering
- No network latency

Enjoy competing for the top score! 🏆






