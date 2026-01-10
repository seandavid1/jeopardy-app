# Custom Accessories Guide for Jeopardy Career Mode

## Overview
You can now add custom-designed accessories (sunglasses, crowns, hats, effects, etc.) that overlay on top of DiceBear avatars. These accessories are unlocked through achievements in Career Mode.

## ✅ How It Works

1. **Design Your Accessory** - Create PNG image with transparent background
2. **Add Image File** - Place in `/public/avatars/accessories/`
3. **Configure** - Add entry to `src/config/customAccessories.js`
4. **Link to Achievement** - Associate with an achievement in Career Mode
5. **Done!** - Accessory automatically appears when earned

---

## 🎨 Step 1: Design Your Accessory

### Design Requirements:
- **Format**: PNG with transparent background (recommended) or SVG
- **Size**: 400x400px or larger (will scale automatically)
- **Style**: Should match the aesthetic of DiceBear avatars
- **Transparency**: Background must be transparent

### Design Tips:
- Make the accessory slightly oversized - it's easier to scale down
- Consider how it will look on different avatar styles
- Test with different DiceBear face types
- Keep it simple and iconic

### Example: Custom Sunglasses

```
Recommended dimensions for sunglasses:
- Width: ~250px in a 400x400 canvas
- Position: Centered horizontally, ~40% from top
- Style: Bold outlines, high contrast colors
```

---

## 📁 Step 2: Add Image File

1. Save your PNG file to:
   ```
   /public/avatars/accessories/your-accessory-name.png
   ```

2. **Example file structure:**
   ```
   /public/avatars/accessories/
     ├── legendary-sunglasses.png
     ├── champion-crown.png
     ├── goat-horns.png
     ├── masters-medal.png
     ├── perfect-halo.png
     └── your-new-accessory.png  ← Add here
   ```

---

## ⚙️ Step 3: Configure the Accessory

Edit `/src/config/customAccessories.js` and add your accessory:

```javascript
export const CUSTOM_ACCESSORIES = {
  // ... existing accessories ...

  // Your new accessory
  'your-accessory-id': {
    id: 'your-accessory-id',
    name: 'Display Name',
    description: 'Description shown to players',
    imagePath: '/avatars/accessories/your-accessory-name.png',
    position: { 
      top: '40%',    // Vertical position (0% = top, 100% = bottom)
      left: '50%',   // Horizontal position (50% = centered)
      width: '65%'   // Size relative to avatar (100% = full width)
    },
    zIndex: 15,      // Layer order (higher = on top)
    rarity: 'epic',  // 'common', 'rare', 'epic', or 'legendary'
    requiredAchievement: 'achievement-id',
    unlockMessage: 'Congratulations message when unlocked!',
  },
};
```

### Position Guide:

```
Avatar Positioning Reference:
┌─────────────────┐
│      10%        │  ← Top of head (hats, crowns)
│      25%        │
│      40%        │  ← Eyes level (glasses)
│      50%        │  ← Center
│      65%        │  ← Mouth level
│      75%        │  ← Chin/neck (medals, necklaces)
│      90%        │  ← Bottom
└─────────────────┘
```

### Rarity Tiers:
- **common**: Easy achievements (first win, etc.)
- **rare**: Moderate achievements (5 wins, category mastery)
- **epic**: Difficult achievements (tournament wins, perfect games)
- **legendary**: Ultimate achievements (Masters Champion, beat Ken Jennings)

---

## 🏆 Step 4: Link to Achievement

The accessory will unlock automatically when the player earns the `requiredAchievement`.

**Make sure the achievement exists** in your achievements system:
- See `src/config/achievementsConfig.js` (once created)
- Achievement ID must match exactly

**Example Achievement IDs:**
- `first-win`
- `5-day-champion`
- `beat-holzhauer`
- `perfect-game`
- `tournament-champion`
- `masters-champion`

---

## 🧪 Step 5: Test Your Accessory

### Quick Test in Browser Console:

```javascript
// Test your accessory appearance
import AvatarWithAccessories from './components/AvatarWithAccessories';

<AvatarWithAccessories
  avatar={{ dataUrl: 'your-avatar-data-url' }}
  unlockedAccessories={['your-accessory-id']}
  achievements={['achievement-id']}
  size={200}
/>
```

### Positioning Adjustments:

If your accessory doesn't look right, adjust the `position` values:

- **Too high?** Increase `top` percentage
- **Too low?** Decrease `top` percentage
- **Too small?** Increase `width` percentage
- **Too big?** Decrease `width` percentage
- **Behind other elements?** Increase `zIndex`

---

## 📋 Complete Example: Adding "Wizard Hat"

### 1. Design the hat
- Create 400x400 PNG with transparent background
- Draw a purple wizard hat with stars
- Save as `wizard-hat.png`

### 2. Add file
```bash
cp wizard-hat.png /public/avatars/accessories/wizard-hat.png
```

### 3. Configure
```javascript
// In src/config/customAccessories.js
'wizard-hat': {
  id: 'wizard-hat',
  name: 'Wizard Hat',
  description: 'For mastering the art of trivia magic',
  imagePath: '/avatars/accessories/wizard-hat.png',
  position: { top: '8%', left: '50%', width: '70%' },
  zIndex: 16,
  rarity: 'rare',
  requiredAchievement: 'trivia-wizard',
  unlockMessage: 'You earned the Wizard Hat by becoming a Trivia Wizard!',
},
```

### 4. Done!
When a player earns the `trivia-wizard` achievement, the wizard hat automatically appears on their avatar!

---

## 🎯 Best Practices

### DO:
✅ Use transparent backgrounds
✅ Test on multiple avatar styles
✅ Make accessories slightly oversized
✅ Use high contrast colors
✅ Keep file sizes reasonable (<100KB)
✅ Name files descriptively

### DON'T:
❌ Use white backgrounds (will show up as boxes)
❌ Make accessories too small (hard to see)
❌ Use overly complex designs (won't scale well)
❌ Forget to test positioning
❌ Use copyrighted imagery without permission

---

## 🔧 Advanced: SVG Accessories

You can also use SVG files for accessories:

```javascript
'custom-svg-accessory': {
  id: 'custom-svg-accessory',
  name: 'SVG Accessory',
  description: 'Vector-based accessory',
  imagePath: '/avatars/accessories/custom-accessory.svg',
  // ... rest of config
}
```

**SVG Benefits:**
- Infinite scalability
- Smaller file sizes
- Can animate with CSS

---

## 💡 Creative Ideas

### Accessory Ideas for Different Achievements:

- **First Win**: Simple badge or ribbon
- **5-Day Champion**: Small crown or trophy
- **Perfect Game**: Halo or sparkles
- **Beat Ken Jennings**: GOAT horns 🐐
- **Beat James Holzhauer**: Lightning bolt ⚡
- **Tournament Champion**: Platinum frame
- **Category Master**: Scholar cap 🎓
- **High Score**: Money bags 💰
- **Comeback Win**: Phoenix wings 🔥

---

## 🐛 Troubleshooting

### Accessory Not Showing Up?
1. Check file path is correct
2. Check achievement ID matches exactly
3. Verify user has unlocked the achievement
4. Check browser console for errors

### Accessory in Wrong Position?
- Adjust `top`, `left`, and `width` values
- Use browser dev tools to inspect positioning
- Test with different avatar styles

### Accessory Behind Avatar?
- Increase `zIndex` value
- Standard values: 5 = behind, 15 = on top, 20 = way on top

---

## 📸 Example Accessories Included

The following accessories are pre-configured and ready to use (you just need to create the images):

1. **legendary-sunglasses.png** - Lightning shades (beat Holzhauer)
2. **champion-crown.png** - Gold crown (5-day champion)
3. **goat-horns.png** - GOAT horns (beat Jennings)
4. **masters-medal.png** - Masters medal (Masters champion)
5. **perfect-halo.png** - Perfect halo (perfect game)
6. **money-bag.png** - Money bag ($50K+ score)
7. **scholar-cap.png** - Scholar cap (category master)
8. **lightning-badge.png** - Lightning badge (DD sweep)
9. **phoenix-wings.png** - Phoenix wings (comeback)
10. **trophy-hat.png** - Trophy hat (tournament champion)

---

## 🚀 Next Steps

1. Design your first custom accessory
2. Add it following this guide
3. Test it in-game
4. Create more accessories as needed!

**Need help?** Check the example configurations in `src/config/customAccessories.js` or examine the `AvatarWithAccessories` component.

