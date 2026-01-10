import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Modal,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Divider,
  styled,
  Chip,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { generateCustomAvatar } from '../utils/avatarGenerator';
import AvatarWithAccessories from './AvatarWithAccessories';
import CUSTOM_ACCESSORIES from '../config/customAccessories';

const ModalContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 800,
  maxHeight: '90vh',
  backgroundColor: 'white',
  padding: theme.spacing(4),
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  overflowY: 'auto',
}));

const PreviewBox = styled(Box)(({ theme }) => ({
  width: '200px',
  height: '200px',
  borderRadius: '50%',
  backgroundColor: '#f5f5f5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '4px solid #e0e0e0',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  margin: '0 auto',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  }
}));

// Customization options for avataaars style (from DiceBear v9 schema)
const AVATAAARS_OPTIONS = {
  hair: [
    'bob', 'bun', 'curly', 'curvy', 'dreads', 'dreads01', 'dreads02',
    'frida', 'fro', 'froBand', 'frizzle', 'longButNotTooLong', 'miaWallace',
    'shavedSides', 'shaggy', 'shaggyMullet', 'shortCurly', 'shortFlat',
    'shortRound', 'shortWaved', 'sides', 'straight01', 'straight02',
    'straightAndStrand', 'theCaesar', 'theCaesarAndSidePart', 'bigHair',
    'hat', 'hijab', 'turban', 'winterHat1', 'winterHat02', 'winterHat03', 'winterHat04'
  ],
  eyebrows: [
    'angryNatural', 'defaultNatural', 'flatNatural', 'frownNatural',
    'raisedExcitedNatural', 'sadConcernedNatural', 'unibrowNatural',
    'upDownNatural', 'angry', 'default', 'raisedExcited', 'sadConcerned', 'upDown'
  ],
  eyes: [
    'closed', 'cry', 'default', 'eyeRoll', 'happy', 'hearts',
    'side', 'squint', 'surprised', 'wink', 'winkWacky', 'xDizzy'
  ],
  mouth: [
    'concerned', 'default', 'disbelief', 'eating', 'grimace', 'sad',
    'screamOpen', 'serious', 'smile', 'tongue', 'twinkle', 'vomit'
  ],
  accessories: [
    'none', 'kurt', 'prescription01', 'prescription02', 'round', 'sunglasses', 'wayfarers', 'eyepatch'
  ],
  accessoriesColor: [
    { name: 'Black', value: '262E33' },
    { name: 'Blue', value: '65C9FF' },
    { name: 'Gray', value: 'B1E2FF' },
    { name: 'Red', value: 'F4D150' },
    { name: 'White', value: 'FFFFFF' }
  ],
  clothing: [
    'blazerAndShirt', 'blazerAndSweater', 'collarAndSweater', 'graphicShirt',
    'hoodie', 'overall', 'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck'
  ],
  clothingColor: [
    { name: 'Black', value: '262E33' },
    { name: 'Blue', value: '3C4F5C' },
    { name: 'Gray', value: '929598' },
    { name: 'Heather', value: 'B1B1B1' },
    { name: 'Pastel Blue', value: 'B1E2FF' },
    { name: 'Pastel Green', value: 'A7FFC4' },
    { name: 'Pastel Orange', value: 'FFDEB5' },
    { name: 'Pastel Red', value: 'FFAFB9' },
    { name: 'Pastel Yellow', value: 'FFFFB1' },
    { name: 'Pink', value: 'FF488E' },
    { name: 'Red', value: 'FF5C5C' },
    { name: 'White', value: 'FFFFFF' }
  ],
  skinColor: [
    { name: 'Tanned', value: 'FD9841' },
    { name: 'Yellow', value: 'F8D25C' },
    { name: 'Pale', value: 'FFDBB4' },
    { name: 'Light', value: 'EDB98A' },
    { name: 'Brown', value: 'D08B5B' },
    { name: 'Dark Brown', value: 'AE5D29' },
    { name: 'Black', value: '614335' }
  ],
  hairColor: [
    { name: 'Auburn', value: 'A55728' },
    { name: 'Black', value: '2C1B18' },
    { name: 'Blonde', value: 'B58143' },
    { name: 'Blonde Golden', value: 'D6B370' },
    { name: 'Brown', value: '724133' },
    { name: 'Brown Dark', value: '4A312C' },
    { name: 'Pastel Pink', value: 'F59797' },
    { name: 'Blue', value: '4281A4' },
    { name: 'Platinum', value: 'ECDCBF' },
    { name: 'Red', value: 'C93305' },
    { name: 'Silver Gray', value: 'E8E1E1' }
  ],
  facialHair: [
    'none',
    'beardLight',
    'beardMedium',
    'beardMagestic',
    'moustacheFancy',
    'moustacheMagnum'
  ],
  facialHairColor: [
    { name: 'Auburn', value: 'A55728' },
    { name: 'Black', value: '2C1B18' },
    { name: 'Blonde', value: 'B58143' },
    { name: 'Blonde Golden', value: 'D6B370' },
    { name: 'Brown', value: '724133' },
    { name: 'Brown Dark', value: '4A312C' },
    { name: 'Pastel Pink', value: 'F59797' },
    { name: 'Blue', value: '4281A4' },
    { name: 'Platinum', value: 'ECDCBF' },
    { name: 'Red', value: 'C93305' },
    { name: 'Silver Gray', value: 'E8E1E1' }
  ]
};

function AvatarBuilder({ open, onClose, onSave, initialOptions = null }) {
  const [options, setOptions] = useState({
    hair: 'shortCurly',
    hairColor: '724133', // Brown
    eyebrows: 'default',
    eyes: 'default',
    mouth: 'smile',
    facialHair: 'none',
    facialHairColor: '724133', // Brown
    accessories: 'none',
    accessoriesColor: '262E33', // Black
    clothing: 'graphicShirt',
    clothingColor: '3C4F5C', // Blue
    skinColor: 'EDB98A', // Light
    backgroundColor: '#b6e3f4',
  });
  const [customAccessories, setCustomAccessories] = useState([]); // Selected custom accessories
  const [previewUrl, setPreviewUrl] = useState('');
  const [renderCounter, setRenderCounter] = useState(0); // Force re-render counter

  // Initialize with existing options if provided
  useEffect(() => {
    if (initialOptions && initialOptions.customizations) {
      const { seed, ...customizationsWithoutSeed } = initialOptions.customizations;
      setOptions(prev => ({
        ...prev,
        ...customizationsWithoutSeed
      }));
    }
    // Load custom accessories if provided
    if (initialOptions && initialOptions.customAccessories) {
      setCustomAccessories(initialOptions.customAccessories);
    }
  }, [initialOptions]);

  // Update preview whenever options change
  useEffect(() => {
    try {
      const url = generateCustomAvatar('avataaars', options);
      setPreviewUrl(url);
      setRenderCounter(prev => prev + 1); // Increment to force re-render
    } catch (error) {
      console.error('Error generating avatar preview:', error);
    }
  }, [options]);

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    onSave({
      type: 'custom-dicebear',
      style: 'avataaars',
      customizations: options,
      dataUrl: previewUrl,
      customAccessories: customAccessories, // Save selected custom accessories
    });
    onClose();
  };

  const handleRandomize = () => {
    const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
    
    setOptions(prev => ({
      ...prev, // Keep the same seed
      hair: getRandomItem(AVATAAARS_OPTIONS.hair),
      hairColor: getRandomItem(AVATAAARS_OPTIONS.hairColor).value,
      eyebrows: getRandomItem(AVATAAARS_OPTIONS.eyebrows),
      eyes: getRandomItem(AVATAAARS_OPTIONS.eyes),
      mouth: getRandomItem(AVATAAARS_OPTIONS.mouth),
      facialHair: getRandomItem(AVATAAARS_OPTIONS.facialHair),
      facialHairColor: getRandomItem(AVATAAARS_OPTIONS.facialHairColor).value,
      accessories: getRandomItem(AVATAAARS_OPTIONS.accessories),
      accessoriesColor: getRandomItem(AVATAAARS_OPTIONS.accessoriesColor).value,
      clothing: getRandomItem(AVATAAARS_OPTIONS.clothing),
      clothingColor: getRandomItem(AVATAAARS_OPTIONS.clothingColor).value,
      skinColor: getRandomItem(AVATAAARS_OPTIONS.skinColor).value,
    }));
  };

  const toggleCustomAccessory = (accessoryId) => {
    setCustomAccessories(prev => 
      prev.includes(accessoryId)
        ? prev.filter(id => id !== accessoryId)
        : [...prev, accessoryId]
    );
  };

  const getCustomizationOptions = () => {
    return (
      <>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Hair Style</InputLabel>
            <Select
              value={options.hair || 'short01'}
              onChange={(e) => handleOptionChange('hair', e.target.value)}
            >
              {AVATAAARS_OPTIONS.hair.map((hair) => (
                <MenuItem key={hair} value={hair}>
                  {hair.charAt(0).toUpperCase() + hair.slice(1).replace(/(\d+)/, ' $1')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Hair Color</InputLabel>
            <Select
              value={options.hairColor || '724133'}
              onChange={(e) => handleOptionChange('hairColor', e.target.value)}
            >
              {AVATAAARS_OPTIONS.hairColor.map((color) => (
                <MenuItem key={color.value} value={color.value}>
                  {color.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Eyebrows</InputLabel>
            <Select
              value={options.eyebrows || 'variant01'}
              onChange={(e) => handleOptionChange('eyebrows', e.target.value)}
            >
              {AVATAAARS_OPTIONS.eyebrows.map((eyebrow) => (
                <MenuItem key={eyebrow} value={eyebrow}>
                  {eyebrow.charAt(0).toUpperCase() + eyebrow.slice(1).replace(/variant(\d+)/, 'Style $1')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Eyes</InputLabel>
            <Select
              value={options.eyes || 'variant01'}
              onChange={(e) => handleOptionChange('eyes', e.target.value)}
            >
              {AVATAAARS_OPTIONS.eyes.map((eye) => (
                <MenuItem key={eye} value={eye}>
                  {eye.charAt(0).toUpperCase() + eye.slice(1).replace(/variant(\d+)/, 'Style $1')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Mouth</InputLabel>
            <Select
              value={options.mouth || 'variant01'}
              onChange={(e) => handleOptionChange('mouth', e.target.value)}
            >
              {AVATAAARS_OPTIONS.mouth.map((mouth) => (
                <MenuItem key={mouth} value={mouth}>
                  {mouth.charAt(0).toUpperCase() + mouth.slice(1).replace(/variant(\d+)/, 'Style $1')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Facial Hair</InputLabel>
            <Select
              value={options.facialHair || 'none'}
              onChange={(e) => handleOptionChange('facialHair', e.target.value)}
            >
              {AVATAAARS_OPTIONS.facialHair.map((facialHair) => (
                <MenuItem key={facialHair} value={facialHair}>
                  {facialHair === 'none' ? 'None' : facialHair.charAt(0).toUpperCase() + facialHair.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {options.facialHair !== 'none' && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Facial Hair Color</InputLabel>
              <Select
                value={options.facialHairColor || '724133'}
                onChange={(e) => handleOptionChange('facialHairColor', e.target.value)}
              >
                {AVATAAARS_OPTIONS.facialHairColor.map((color) => (
                  <MenuItem key={color.value} value={color.value}>
                    {color.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Skin Color</InputLabel>
            <Select
              value={options.skinColor || 'EDB98A'}
              onChange={(e) => handleOptionChange('skinColor', e.target.value)}
            >
              {AVATAAARS_OPTIONS.skinColor.map((color) => (
                <MenuItem key={color.value} value={color.value}>
                  {color.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Accessories</InputLabel>
            <Select
              value={options.accessories || 'none'}
              onChange={(e) => handleOptionChange('accessories', e.target.value)}
            >
              {AVATAAARS_OPTIONS.accessories.map((acc) => (
                <MenuItem key={acc} value={acc}>
                  {acc.charAt(0).toUpperCase() + acc.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {options.accessories !== 'none' && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Accessories Color</InputLabel>
              <Select
                value={options.accessoriesColor || '262E33'}
                onChange={(e) => handleOptionChange('accessoriesColor', e.target.value)}
              >
                {AVATAAARS_OPTIONS.accessoriesColor.map((color) => (
                  <MenuItem key={color.value} value={color.value}>
                    {color.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Clothing</InputLabel>
            <Select
              value={options.clothing || 'shirt'}
              onChange={(e) => handleOptionChange('clothing', e.target.value)}
            >
              {AVATAAARS_OPTIONS.clothing.map((cloth) => (
                <MenuItem key={cloth} value={cloth}>
                  {cloth.charAt(0).toUpperCase() + cloth.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Clothing Color</InputLabel>
            <Select
              value={options.clothingColor || '3C4F5C'}
              onChange={(e) => handleOptionChange('clothingColor', e.target.value)}
            >
              {AVATAAARS_OPTIONS.clothingColor.map((color) => (
                <MenuItem key={color.value} value={color.value}>
                  {color.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </>
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          Create Your Avatar
        </Typography>

        <Grid container spacing={3}>
          {/* Preview Section */}
          <Grid item xs={12} md={5}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {previewUrl ? (
                  <AvatarWithAccessories
                    avatar={{ dataUrl: previewUrl }}
                    unlockedAccessories={customAccessories}
                    achievements={[]}
                    size={200}
                    showEffects={false}
                  />
                ) : (
                  <Typography>Loading...</Typography>
                )}
              </Box>
              <Button
                variant="outlined"
                onClick={handleRandomize}
                sx={{ mt: 2 }}
                fullWidth
              >
                🎲 Randomize Face
              </Button>
            </Paper>
          </Grid>

          {/* Customization Options */}
          <Grid item xs={12} md={7}>
            <Grid container spacing={2}>
              {getCustomizationOptions()}

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Background Color
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <input
                    type="color"
                    value={options.backgroundColor}
                    onChange={(e) => handleOptionChange('backgroundColor', e.target.value)}
                    style={{
                      width: '60px',
                      height: '40px',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  />
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {options.backgroundColor}
                  </Typography>
                </Box>
              </Grid>

              {/* Custom Accessories Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                  ✨ Custom Accessories
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Click to add special accessories (unlocked during career mode)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.values(CUSTOM_ACCESSORIES).map((accessory) => (
                    <Chip
                      key={accessory.id}
                      label={accessory.name}
                      onClick={() => toggleCustomAccessory(accessory.id)}
                      color={customAccessories.includes(accessory.id) ? 'primary' : 'default'}
                      variant={customAccessories.includes(accessory.id) ? 'filled' : 'outlined'}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          transition: 'transform 0.2s',
                        },
                        ...(accessory.rarity === 'legendary' && {
                          borderColor: '#FFD700',
                          color: customAccessories.includes(accessory.id) ? '#fff' : '#FFD700',
                          backgroundColor: customAccessories.includes(accessory.id) ? '#FFD700' : 'transparent',
                        }),
                        ...(accessory.rarity === 'epic' && {
                          borderColor: '#9B59B6',
                          color: customAccessories.includes(accessory.id) ? '#fff' : '#9B59B6',
                          backgroundColor: customAccessories.includes(accessory.id) ? '#9B59B6' : 'transparent',
                        }),
                        ...(accessory.rarity === 'rare' && {
                          borderColor: '#4A90E2',
                          color: customAccessories.includes(accessory.id) ? '#fff' : '#4A90E2',
                          backgroundColor: customAccessories.includes(accessory.id) ? '#4A90E2' : 'transparent',
                        }),
                      }}
                    />
                  ))}
                </Box>
                {customAccessories.length > 0 && (
                  <Button
                    size="small"
                    onClick={() => setCustomAccessories([])}
                    sx={{ mt: 1 }}
                  >
                    Clear All Accessories
                  </Button>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Save Avatar
          </Button>
        </Box>
      </ModalContent>
    </Modal>
  );
}

export default AvatarBuilder;

