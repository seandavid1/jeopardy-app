# CPU Boss Unlock System - Implementation Guide

## Overview

Implemented a comprehensive progression system where players unlock CPU opponents by beating them sequentially. Only **First-Timer Fred** is available at the start, and hidden/secret bosses remain hidden until unlocked.

## System Architecture

### 1. Unlock Service (`src/services/cpuUnlockSystem.js`)

**Key Features:**
- Firebase-based unlock state storage
- Default state: Only First-Timer Fred unlocked
- Progressive unlock chain
- Helper functions for checking/updating unlock status

**Main Functions:**
- `getUserUnlockState(userId)` - Get user's current unlocks
- `updateUnlockState(userId, opponentId, unlocked)` - Unlock an opponent
- `checkAndUnlockOpponents(userId)` - Auto-check and unlock based on victories
- `hasBeatenOpponent(userId, opponentId)` - Check if user has won against opponent
- `isOpponentUnlocked(userId, opponentId)` - Check specific unlock status
- `getNextOpponentToUnlock(userId)` - Get next in progression

### 2. Unlock Requirements

**Progressive Chain:**
```
First-Timer Fred (Always Unlocked)
  ↓ Beat Fred
Celebrity Casey
  ↓ Beat Casey  
5-Day Champion
  ↓ Beat 5-Day
College Champion
  ↓ Beat College
Teacher Champion
  ↓ Beat Teacher
Sam Buttrey
  ↓ Beat Sam
Austin Rogers
  ↓ Beat Austin
Matt Amodio
  ↓ Beat Matt
Buzzy Cohen
  ↓ Beat Buzzy
Amy Schneider
  ↓ Beat Amy
Victoria Groce
  ↓ Beat Victoria
Brad Rutter
  ↓ Beat Brad
Ken Jennings
  ↓ Beat Ken
James Holzhauer
  ↓ Beat James (SECRET REVEALED!)
Arthur Chu (???)
  ↓ Beat Arthur
Roger Craig (???)
  ↓ Beat Roger
Mark Labbett - "The Beast" (???)
  ↓ Beat The Beast
Alex Trebek (???) 👑 FINAL BOSS
```

### 3. Updated CPU Opponents Config

**Changes to `src/config/cpuOpponents.js`:**
- Added `isLocked: false` to First-Timer Fred (always available)
- Added `isLocked: true` to all other opponents (14 total)
- Secret bosses already had `isSecret: true` and `isLocked: true`

### 4. Display Rules

**Regular Opponents (Not Secret):**
- ✅ **Unlocked**: Show full name, avatar, stats
- 🔒 **Locked**: Show full name, avatar, but GRAYED OUT with lock icon
  - Still visible in opponent list
  - Cannot be selected
  - Shows unlock requirement on hover/click

**Secret Opponents (isSecret: true):**
- ✅ **Unlocked**: Show full name (e.g., "Arthur Chu"), real avatar, stats
- 🔒 **Locked**: Show "???" as name, mystery avatar (❓), completely HIDDEN from list
  - Not visible in opponent selection until unlocked
  - Only revealed after beating required opponent

## Implementation Plan

### Phase 1: PlayerSetup Component Updates ✅

**File:** `src/components/PlayerSetup.js`

**Changes Needed:**
1. Import unlock system service
2. Load user's unlock state on mount
3. Filter opponent list based on unlock status
4. Apply locked styling to locked opponents
5. Hide secret bosses that are locked
6. Show unlock requirements on locked opponents
7. Disable selection of locked opponents

### Phase 2: Game Completion Hook

**File:** `src/Board.js` (handleFinalJeopardyComplete or similar)

**Changes Needed:**
1. After game ends, call `checkAndUnlockOpponents(userId)`
2. Get list of newly unlocked opponents
3. If any unlocked, show notification
4. Update UI to reflect new unlocks

### Phase 3: Unlock Notification Component

**New File:** `src/components/UnlockNotification.js`

**Features:**
- Animated modal showing newly unlocked opponent
- Display opponent name, avatar, difficulty
- Celebration animation
- "Continue" button to dismiss

### Phase 4: Testing & Polish

**Test Cases:**
1. New user sees only First-Timer Fred
2. Beating Fred unlocks Celebrity Casey
3. Locked opponents show lock icon
4. Secret bosses are completely hidden when locked
5. Secret bosses appear after unlock condition met
6. Unlock notifications display correctly
7. Unlock state persists across sessions

## User Experience Flow

### Initial State (New Player)
```
AVAILABLE OPPONENTS:
[✓] First-Timer Fred (Difficulty 1)

LOCKED OPPONENTS (Visible but not selectable):
[🔒] Celebrity Casey (Difficulty 2) - Beat First-Timer Fred to unlock
[🔒] 5-Day Champion (Difficulty 3) - Beat Celebrity Casey to unlock
[🔒] College Champion (Difficulty 4) - Beat 5-Day Champion to unlock
... (all non-secret opponents visible but locked)

SECRET OPPONENTS (Hidden):
(None visible - will appear after beating James Holzhauer)
```

### After Beating First-Timer Fred
```
🎉 OPPONENT UNLOCKED!
Celebrity Casey
Difficulty: 2 | Tier: Beginner
[Continue]

AVAILABLE OPPONENTS:
[✓] First-Timer Fred
[✓] Celebrity Casey ← NEW!

LOCKED:
[🔒] 5-Day Champion - Beat Celebrity Casey to unlock
...
```

### After Beating James Holzhauer
```
🎉 SECRET OPPONENT REVEALED!
Arthur Chu - "???"
The Unconventional Strategist
Difficulty: 15 | Tier: LEGENDARY
[Challenge Now] [Later]

NEW SECRET BOSS AVAILABLE:
[✓] Arthur Chu (formerly ???)
```

## Code Structure

### Unlock State Schema (Firebase)
```javascript
{
  userId: "user123",
  unlocks: {
    "first-timer": true,
    "celebrity": false,
    "5-day-champ": false,
    // ... all opponents
    "arthur-chu": false,  // Secret
    "roger-craig": false, // Secret
    "mark-labbett": false, // Secret
    "alex-trebek": false  // Secret
  },
  lastUpdated: "2026-01-03T..."
}
```

### Unlock Requirements Schema
```javascript
UNLOCK_REQUIREMENTS = {
  'celebrity': {
    requirement: 'beat',
    beatOpponent: 'first-timer',
    description: 'Beat First-Timer Fred'
  },
  'arthur-chu': {
    requirement: 'beat',
    beatOpponent: 'james-holzhauer',
    description: 'Beat James Holzhauer to reveal the secret boss',
    isSecret: true
  },
  // ... etc
}
```

## Benefits

1. **Progressive Difficulty**: Players advance naturally through difficulty levels
2. **Achievement System**: Unlocking opponents feels rewarding
3. **Mystery & Discovery**: Secret bosses add excitement
4. **Replayability**: Players motivated to unlock all opponents
5. **Skill-Based**: Can't skip ahead - must earn progression

## Testing Commands

For development/testing, the service includes:

```javascript
// Reset to defaults (only Fred unlocked)
await resetUnlocks(userId);

// Unlock all opponents (testing)
await unlockAllOpponents(userId);

// Check specific opponent
const unlocked = await isOpponentUnlocked(userId, 'ken-jennings');

// Get next to unlock
const next = await getNextOpponentToUnlock(userId);
```

## Next Steps

1. ✅ Create unlock service
2. ✅ Update cpuOpponents.js with lock states
3. 🔄 Update PlayerSetup to filter/style based on locks
4. ⏳ Add unlock notification component
5. ⏳ Hook into game completion logic
6. ⏳ Test progression flow
7. ⏳ Polish animations and UX

---

**Status**: System infrastructure complete. Ready for UI integration.





