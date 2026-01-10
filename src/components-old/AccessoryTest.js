import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Grid, Checkbox, FormControlLabel } from '@mui/material';
import AvatarWithAccessories from './AvatarWithAccessories';
import { generateCustomAvatar } from '../utils/avatarGenerator';
import CUSTOM_ACCESSORIES from '../config/customAccessories';

/**
 * Test component to preview custom accessories on avatars
 * This helps you see how accessories look before implementing the full career mode
 */
function AccessoryTest() {
  // Generate a sample avatar
  const [avatar] = useState(() => ({
    dataUrl: generateCustomAvatar('avataaars', {
      hair: 'shortCurly',
      eyebrows: 'default',
      eyes: 'happy',
      mouth: 'smile',
      accessories: 'none', // No built-in accessories to see custom ones better
      clothing: 'hoodie',
      clothingColor: '3C4F5C',
      skinColor: 'EDB98A',
      backgroundColor: '#b6e3f4',
    })
  }));

  // Track which accessories are enabled for preview
  const [enabledAccessories, setEnabledAccessories] = useState(['heart-sunglasses']);
  
  // Track which achievements are enabled
  const [enabledAchievements, setEnabledAchievements] = useState(['first-win']);

  const toggleAccessory = (accessoryId) => {
    setEnabledAccessories(prev => 
      prev.includes(accessoryId)
        ? prev.filter(id => id !== accessoryId)
        : [...prev, accessoryId]
    );
  };

  const toggleAchievement = (achievementId) => {
    setEnabledAchievements(prev => 
      prev.includes(achievementId)
        ? prev.filter(id => id !== achievementId)
        : [...prev, achievementId]
    );
  };

  // Group accessories by rarity
  const accessoriesByRarity = {
    common: [],
    rare: [],
    epic: [],
    legendary: []
  };

  Object.values(CUSTOM_ACCESSORIES).forEach(accessory => {
    accessoriesByRarity[accessory.rarity]?.push(accessory);
  });

  return (
    <Box sx={{ p: 4, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        🎨 Accessory Preview Tool
      </Typography>

      <Grid container spacing={4}>
        {/* Avatar Preview */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Avatar Preview
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <AvatarWithAccessories
                avatar={avatar}
                unlockedAccessories={enabledAccessories}
                achievements={enabledAchievements}
                size={300}
                showEffects={true}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Toggle accessories on the right to preview them
            </Typography>
          </Paper>
        </Grid>

        {/* Accessory Controls */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Available Accessories
            </Typography>
            
            {/* Common Accessories */}
            {accessoriesByRarity.common.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                  ⭐ Common
                </Typography>
                {accessoriesByRarity.common.map(accessory => (
                  <FormControlLabel
                    key={accessory.id}
                    control={
                      <Checkbox
                        checked={enabledAccessories.includes(accessory.id)}
                        onChange={() => toggleAccessory(accessory.id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {accessory.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {accessory.description}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Box>
            )}

            {/* Rare Accessories */}
            {accessoriesByRarity.rare.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#4A90E2', mb: 1 }}>
                  💎 Rare
                </Typography>
                {accessoriesByRarity.rare.map(accessory => (
                  <FormControlLabel
                    key={accessory.id}
                    control={
                      <Checkbox
                        checked={enabledAccessories.includes(accessory.id)}
                        onChange={() => toggleAccessory(accessory.id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {accessory.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {accessory.description}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Box>
            )}

            {/* Epic Accessories */}
            {accessoriesByRarity.epic.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#9B59B6', mb: 1 }}>
                  🌟 Epic
                </Typography>
                {accessoriesByRarity.epic.map(accessory => (
                  <FormControlLabel
                    key={accessory.id}
                    control={
                      <Checkbox
                        checked={enabledAccessories.includes(accessory.id)}
                        onChange={() => toggleAccessory(accessory.id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {accessory.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {accessory.description}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Box>
            )}

            {/* Legendary Accessories */}
            {accessoriesByRarity.legendary.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#F39C12', mb: 1 }}>
                  ⚡ Legendary
                </Typography>
                {accessoriesByRarity.legendary.map(accessory => (
                  <FormControlLabel
                    key={accessory.id}
                    control={
                      <Checkbox
                        checked={enabledAccessories.includes(accessory.id)}
                        onChange={() => toggleAccessory(accessory.id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {accessory.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {accessory.description}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Box>
            )}

            {/* Achievement Badges */}
            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #ddd' }}>
              <Typography variant="h6" gutterBottom>
                Achievement Effects
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                These add special frames and badges around the avatar
              </Typography>
              
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enabledAchievements.includes('5-day-champion')}
                        onChange={() => toggleAchievement('5-day-champion')}
                      />
                    }
                    label="5-Day Champion"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enabledAchievements.includes('10-day-champion')}
                        onChange={() => toggleAchievement('10-day-champion')}
                      />
                    }
                    label="10-Day Champion"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enabledAchievements.includes('beat-holzhauer')}
                        onChange={() => toggleAchievement('beat-holzhauer')}
                      />
                    }
                    label="Beat Holzhauer ⚡"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enabledAchievements.includes('beat-jennings')}
                        onChange={() => toggleAchievement('beat-jennings')}
                      />
                    }
                    label="Beat Jennings 🐐"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enabledAchievements.includes('perfect-game')}
                        onChange={() => toggleAchievement('perfect-game')}
                      />
                    }
                    label="Perfect Game 💎"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enabledAchievements.includes('tournament-champion')}
                        onChange={() => toggleAchievement('tournament-champion')}
                      />
                    }
                    label="Tournament Champion"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enabledAchievements.includes('masters-champion')}
                        onChange={() => toggleAchievement('masters-champion')}
                      />
                    }
                    label="Masters Champion"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Quick Actions */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setEnabledAccessories([]);
                  setEnabledAchievements([]);
                }}
              >
                Clear All
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setEnabledAccessories(Object.keys(CUSTOM_ACCESSORIES));
                  setEnabledAchievements([
                    '5-day-champion', '10-day-champion', 'beat-holzhauer', 
                    'beat-jennings', 'perfect-game', 'tournament-champion', 'masters-champion'
                  ]);
                }}
              >
                Enable All
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          💡 How to Use This Tool
        </Typography>
        <Typography variant="body2" paragraph>
          1. Check/uncheck accessories to see how they look on the avatar
        </Typography>
        <Typography variant="body2" paragraph>
          2. Enable achievement effects to see special frames and badges
        </Typography>
        <Typography variant="body2" paragraph>
          3. Use this to test positioning and appearance before creating more accessories
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
          Note: This is a preview tool. In the actual game, accessories will unlock automatically when players earn achievements in Career Mode.
        </Typography>
      </Box>
    </Box>
  );
}

export default AccessoryTest;

