# 🎨 Custom Avatar Guide

## 📁 Folder Structure

```
/public/avatars/
  ├── cpu/           → CPU opponent avatars
  │   └── james-holzhauer.png
  └── users/         → User player avatars
      └── [your-avatar-name].png
```

---

## 🤖 CPU Avatars (Already Set Up!)

### James Holzhauer
✅ Custom avatar uploaded and configured!

### Adding More CPU Avatars

1. **Create/find an image** for the opponent
2. **Save it in:** `/public/avatars/cpu/`
3. **Name it:** `[opponent-id].png` (e.g., `ken-jennings.png`, `buzzy-cohen.png`)
4. **Update the config** in `src/config/cpuOpponents.js`:

```javascript
avatar: {
  seed: 'opponent-id',
  style: 'custom',
  customImage: '/avatars/cpu/opponent-name.png',
  backgroundColor: '#color'
}
```

**Available Opponent IDs:**
- `first-timer`
- `celebrity`
- `5-day-champ`
- `college-champ`
- `teacher-champ`
- `austin-rogers`
- `matt-amodio`
- `amy-schneider`
- `buzzy-cohen`
- `brad-rutter`
- `ken-jennings`
- `james-holzhauer` ✅ (Already has custom avatar!)

---

## 👤 User Avatars (New!)

### How to Add Custom User Avatars

1. **Place your avatar image** in:
   ```
   /public/avatars/users/[your-name].png
   ```

2. **Edit** `src/utils/customUserAvatars.js`:

```javascript
export const customUserAvatars = [
  {
    id: 'custom-courtney',
    name: 'Courtney',
    image: '/avatars/users/courtney.png',
    femaleImage: '/avatars/users/courtney.png', // Can be different for each gender
    color: '#FF6B9D',
    isCustom: true, // Required flag
  },
  {
    id: 'custom-sean',
    name: 'Sean',
    image: '/avatars/users/sean.png',
    femaleImage: '/avatars/users/sean.png',
    color: '#4A90E2',
    isCustom: true,
  },
  // Add more custom avatars here
];
```

3. **Refresh the app** - Your custom avatars will appear in the avatar selection grid during player setup!

### Gender-Specific Avatars

You can provide different images for male/female gender selections:

```javascript
{
  id: 'custom-alex',
  name: 'Alex',
  image: '/avatars/users/alex-male.png',      // Male version
  femaleImage: '/avatars/users/alex-female.png',  // Female version
  color: '#4A90E2',
  isCustom: true,
}
```

Or use the same image for both genders:

```javascript
{
  id: 'custom-taylor',
  name: 'Taylor',
  image: '/avatars/users/taylor.png',
  femaleImage: '/avatars/users/taylor.png', // Same image
  color: '#9B59B6',
  isCustom: true,
}
```

---

## 📐 Image Specifications

### Recommended Specs:
- **Format:** PNG (for transparency), JPG, WebP
- **Size:** 200x200 px or larger
- **Aspect Ratio:** Square (1:1) works best
- **File Size:** Keep under 500KB for fast loading

### Display Sizes:
- **CPU Selection Screen:** ~60px circle
- **Player Setup:** ~80px circle  
- **Game Board:** ~40-60px circle
- **Avatars are auto-cropped to circles**

---

## 🎨 Tips for Best Results

### For CPU Opponents:
- Use headshots or character portraits
- High contrast works well in circles
- Solid backgrounds or transparent PNGs

### For User Avatars:
- Photos, illustrations, or icons all work
- Fun/expressive faces show personality
- Match your color choice to the image

---

## 🔄 Workflow

### Quick Add:
1. Drop image in correct folder
2. Update config file (for CPU) or customUserAvatars.js (for users)
3. Refresh browser
4. Done! ✨

### Current Status:
- ✅ CPU Avatar System: Ready
- ✅ James Holzhauer: Custom avatar uploaded
- ✅ User Avatar System: Ready for your avatars
- ⏳ Other CPU opponents: Using generated initials

---

## 💡 Ideas

**Popular Jeopardy! Champions to Add:**
- Ken Jennings
- Amy Schneider
- Matt Amodio
- Buzzy Cohen
- Brad Rutter
- Austin Rogers

**Where to Find Images:**
- Official Jeopardy! press photos
- Wikipedia (check licensing)
- Create illustrated versions
- Commission custom art

---

Need help adding avatars? Just let me know! 🎯

