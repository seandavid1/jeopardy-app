# 🎮 Buzzer Key Customization Guide

## Overview

The Jeopardy! game now features fully customizable buzzer keys! Players can now set their own preferred keys for buzzing in during gameplay, making the experience more comfortable and accessible for different setups.

## Features

### ⚙️ Settings Screen
- Access from the main menu by clicking the "⚙️ Settings" button
- Simple, user-friendly interface for customizing keys
- Real-time key capture - just click and press
- Visual feedback showing current key assignments
- Reset to defaults option

### 🎯 Key Features
- **Dual Keys Per Player**: Each player gets two buzzer keys (primary and secondary)
- **Any Key Support**: Use any keyboard key - letters, numbers, modifiers, arrows, etc.
- **Persistent Storage**: Settings saved to localStorage and persist across sessions
- **Real-time Updates**: Changes take effect immediately in gameplay
- **Visual Indicators**: Color-coded UI shows when listening for key input (green = listening)

## Default Keys

### Player 1
- **Primary**: `2` key
- **Secondary**: `Left Shift` key

### Player 2
- **Primary**: `Enter` key
- **Secondary**: `Right Shift` key

## How to Customize Keys

### Step 1: Access Settings
1. From the main menu, click the "⚙️ Settings" button
2. The Settings screen will open

### Step 2: Set a Key
1. Click on any key button you want to change
2. The button will turn green and display "Press a key... (ESC to cancel)"
3. Press the key you want to use (or press ESC to cancel)
4. The button will update to show your new key

### Step 3: Save
1. Click "💾 Save Settings" to store your configuration
2. A success message will confirm the save
3. Your settings are now active and will be used in all game modes

### Step 4: Exit Settings
You have multiple ways to exit the Settings screen:
- Click the **X button** in the top-right corner
- Click the **"Back to Menu"** button at the bottom
- Press the **ESC key** on your keyboard (when not capturing a key)

### Step 5: Test (Optional)
1. Start a game and test your new keys
2. If you want to change them, go back to Settings

## Recommended Keys

### For Side-by-Side Play
- **Player 1**: `Q`, `W`, `Tab`, `Caps Lock`, or `Left Shift`
- **Player 2**: `Enter`, `Right Shift`, `P`, `[`, or `]`

### For Single Player
- Use comfortable keys like `Space`, `Enter`, or modifier keys

### Keys to Avoid
- **Letters A-Z** (except in specific setups) - might interfere with typing answers
- **Numbers 1-9** - might interfere with typing numerical answers
- **Backspace/Delete** - interferes with answer editing

### Best Practices
- Choose keys that are easy to reach quickly
- Use modifier keys (Shift, Ctrl, Alt) for less interference
- Test different configurations to find what works best for you
- Consider using keys on opposite sides of the keyboard for two-player mode

## Technical Details

### Storage
- Keys are stored in `localStorage` under the key `jeopardy_buzzer_keys`
- Format: JSON object with `playerOne` and `playerTwo` arrays
- Each key stores: `key`, `code`, and `keyCode` properties

### Key Detection
- Uses both `keyCode` and `code` for maximum compatibility
- Prevents default browser behavior for buzzer keys
- Works across different keyboard layouts

### Compatibility
- Works with standard keyboards
- Compatible with most gaming keyboards
- Supports international keyboard layouts

## Troubleshooting

### Keys Not Working?
1. Check that you saved your settings
2. Try pressing the key during a question when the buzzer is active
3. Make sure you're not in text input mode
4. Reset to defaults and try again

### Want to Start Fresh?
Click "Reset to Defaults" in Settings to restore original key bindings.

### Keys Conflicting?
Make sure Player 1 and Player 2 don't use the same keys. The Settings screen doesn't prevent this, so choose carefully.

## Game Mode Support

The custom buzzer keys work in all game modes:
- ✅ Two Player Mode
- ✅ Solo Practice Mode
- ✅ vs CPU Mode
- ✅ Practice Flashcards Mode

## Tips for Different Setups

### Desktop Setup
- Use Split keyboard layout: Player 1 (left side), Player 2 (right side)
- Recommended: Player 1 (`Tab`, `Q`), Player 2 (`P`, `Enter`)

### Laptop Setup
- Use modifier keys for easier reach
- Recommended: Player 1 (`Left Shift`, `Z`), Player 2 (`Right Shift`, `/`)

### Accessibility Setup
- Choose keys that are comfortable for your specific needs
- Large keys like `Space`, `Enter`, and modifier keys are easier targets
- Consider external keyboards or gaming keypads for better ergonomics

## Future Enhancements

Potential future features:
- Gamepad/controller support
- Visual key conflict warnings
- Preset configurations
- Per-player color indicators on screen
- Key combination support

## Feedback

Enjoy your customized Jeopardy! experience! The ability to set your own buzzer keys makes the game more accessible and fun for everyone.

Happy buzzing! 🎯

