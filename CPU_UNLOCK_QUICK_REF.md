# CPU Unlock System - Quick Reference

## ✅ What's Done

### Core System
- ✅ Unlock service (`cpuUnlockSystem.js`)
- ✅ All CPU opponents have lock states
- ✅ PlayerSetup filters & styles based on locks
- ✅ Secret bosses hidden until unlocked
- ✅ Firebase persistence

### User Experience
- ✅ Only First-Timer Fred unlocked initially
- ✅ Locked opponents show grayscale + lock icon
- ✅ Secret bosses completely hidden when locked
- ✅ Tooltips show unlock requirements
- ✅ Cannot select locked opponents

## 🎮 How It Works

### For Players
1. Start with **First-Timer Fred** (only available opponent)
2. Beat Fred → **Celebrity Casey** unlocks
3. Beat Casey → **5-Day Champion** unlocks
4. Continue progression through 14 opponents
5. Beat **James Holzhauer** → **Secret bosses revealed!**
6. Challenge legendary secret bosses (Arthur Chu, Roger Craig, The Beast, Alex Trebek)

### Display Rules
**Regular Opponents (Locked):**
- Visible in list
- Grayed out (60% opacity, 50% grayscale)
- Lock icon (🔒)
- Shows unlock requirement
- Not selectable

**Secret Bosses (Locked):**
- **HIDDEN** from list entirely
- Only shown as "???" when unlocked
- Revealed after beating previous boss

## 📁 Files Modified

1. **Created**: `/src/services/cpuUnlockSystem.js` (440 lines)
2. **Updated**: `/src/config/cpuOpponents.js` (added `isLocked` to all)
3. **Updated**: `/src/components/PlayerSetup.js` (integrated unlock logic)

## 🔧 Key Functions

```javascript
// Load user's unlocks
const unlocks = await getUserUnlockState(userId);

// Check if opponent unlocked
const unlocked = await isOpponentUnlocked(userId, 'ken-jennings');

// After winning a game
const newUnlocks = await checkAndUnlockOpponents(userId);
```

## 📊 Progression

```
First-Timer Fred (1) ✓ Always Available
↓
Celebrity Casey (2)
↓
5-Day Champion (3)
↓
... 11 more opponents ...
↓
James Holzhauer (14)
↓ SECRET REVEALED!
Arthur Chu (15) - ???
↓
Roger Craig (16) - ???
↓
Mark Labbett (17) - "The Beast" - ???
↓
Alex Trebek (18) - ??? 👑 FINAL BOSS
```

## 🧪 Testing

### In Browser
1. Go to http://localhost:3000/jeopardy
2. Login/create account
3. Click "Play vs CPU"
4. Should see only First-Timer Fred unlocked
5. Others grayed out with lock icons
6. No secret bosses visible

### Test Fresh State
```javascript
// In console (after importing service)
await resetUnlocks(user.uid);
// Refresh page - back to only Fred
```

### Test All Unlocked
```javascript
await unlockAllOpponents(user.uid);
// Refresh page - all available
```

## 🎯 Next Phase (Optional)

To complete the full experience:
1. Add unlock notification after winning
2. Hook into game completion logic
3. Show celebration animation
4. Track unlock statistics

## 💡 Quick Tips

- **Secret bosses**: Hidden until James beaten
- **Lock icon**: Gold (# FFD700)
- **Locked style**: Grayscale + dashed border
- **Tooltips**: Show unlock requirements on hover
- **Firebase**: Unlocks persist across devices

---

**Ready to play!** Start with First-Timer Fred and work your way up! 🎮





