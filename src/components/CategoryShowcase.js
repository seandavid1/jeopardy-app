import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { synthesizeSpeech, DEFAULT_VOICE } from '../services/pollyService';

const ShowcaseContainer = styled(Box)({
  position: 'absolute',
  top: '17px',
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#0f258f',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  transition: 'opacity 0.8s ease-out',
});

const CategoryText = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '6rem',
  fontWeight: 'bold',
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: '6px',
  padding: '0 40px',
  textShadow: '0 4px 8px rgba(0,0,0,0.5)',
  '@media (max-width: 960px)': {
    fontSize: '4.5rem',
    letterSpacing: '4.5px',
    padding: '0 30px',
  },
  '@media (max-width: 600px)': {
    fontSize: '3rem',
    letterSpacing: '3px',
    padding: '0 20px',
  },
});

const WipeOverlay = styled(Box)(({ direction }) => ({
  position: 'absolute',
  top: 0,
  left: direction === 'left' ? 0 : 'auto',
  right: direction === 'right' ? 0 : 'auto',
  bottom: 0,
  width: '100%',
  backgroundColor: '#0f258f',
  transformOrigin: direction === 'left' ? 'left' : 'right',
}));

function CategoryShowcase({ categories, onComplete, onBeforeFadeOut }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isWiping, setIsWiping] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [wipeDirection, setWipeDirection] = useState('right');
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const currentAudioRef = useRef(null);
  const isPlayingRef = useRef(false); // Flag to prevent duplicate playback

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current.src = '';
        currentAudioRef.current.load();
        currentAudioRef.current = null;
      }
      isPlayingRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (currentIndex >= categories.length) {
      // All categories shown, fade out
      const fadeTimer = setTimeout(() => {
        onBeforeFadeOut?.(); // Call this right before fading out
        setFadeOut(true);
        setTimeout(() => {
          onComplete?.();
        }, 800);
      }, 500);
      return () => clearTimeout(fadeTimer);
    }

    // Use a flag to track if this effect instance is still valid
    let isCancelled = false;

    // Synthesize speech for current category and wait for it to finish
    const playCategoryAudio = async () => {
      const categoryName = categories[currentIndex];
      if (!categoryName || isCancelled) return;
      
      // Prevent duplicate playback (React StrictMode causes double mount in dev)
      if (isPlayingRef.current) {
        return;
      }

      try {
        isPlayingRef.current = true; // Set flag before starting
        setIsLoadingAudio(true);
        
        // Stop any currently playing audio
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
          currentAudioRef.current.src = '';
          currentAudioRef.current.load();
          currentAudioRef.current = null;
        }
        
        // Get audio URL from Polly
        const audioUrl = await synthesizeSpeech(categoryName, DEFAULT_VOICE);
        
        // Check if effect was cancelled while waiting for Polly
        if (isCancelled) {
          isPlayingRef.current = false;
          return;
        }
        
        // Create and play audio
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        
        // Wait for audio to finish playing
        await new Promise((resolve, reject) => {
          audio.addEventListener('ended', resolve);
          audio.addEventListener('error', reject);
          audio.play().catch(reject);
        });
        
        // Check again if cancelled after audio finishes
        if (isCancelled) {
          isPlayingRef.current = false;
          return;
        }
        
        setIsLoadingAudio(false);
        
        // Clean up
        if (audio === currentAudioRef.current) {
          audio.pause();
          audio.src = '';
          audio.load();
          currentAudioRef.current = null;
        }
        
        isPlayingRef.current = false; // Reset flag after playback completes
        
        // Move to next category after audio completes
        if (currentIndex < categories.length - 1) {
          // Start wipe animation
          setIsWiping(true);
          setWipeDirection(currentIndex % 2 === 0 ? 'right' : 'left');
          
          // Move to next category during wipe
          setTimeout(() => {
            if (!isCancelled) {
              setCurrentIndex(currentIndex + 1);
              setIsWiping(false);
            }
          }, 400);
        } else {
          // Last category, move to fade out
          if (!isCancelled) {
            setCurrentIndex(currentIndex + 1);
          }
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error playing category audio:', error);
          setIsLoadingAudio(false);
          isPlayingRef.current = false; // Reset flag on error
          
          // Clean up on error
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.src = '';
            currentAudioRef.current.load();
            currentAudioRef.current = null;
          }
          
          // Fall back to timed transition if audio fails
          setTimeout(() => {
            if (!isCancelled) {
              if (currentIndex < categories.length - 1) {
                setIsWiping(true);
                setWipeDirection(currentIndex % 2 === 0 ? 'right' : 'left');
                setTimeout(() => {
                  if (!isCancelled) {
                    setCurrentIndex(currentIndex + 1);
                    setIsWiping(false);
                  }
                }, 400);
              } else {
                setCurrentIndex(currentIndex + 1);
              }
            }
          }, 1500);
        }
      }
    };

    playCategoryAudio();

    // Cleanup function to cancel this effect if it runs again or component unmounts
    return () => {
      isCancelled = true;
    };
  }, [currentIndex, categories, onComplete, onBeforeFadeOut]);

  if (!categories || categories.length === 0) {
    onComplete?.();
    return null;
  }

  return (
    <ShowcaseContainer sx={{ opacity: fadeOut ? 0 : 1 }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CategoryText>
          {categories[currentIndex] || ''}
        </CategoryText>
        
        {isWiping && (
          <WipeOverlay
            direction={wipeDirection}
            sx={{
              animation: `wipe-${wipeDirection} 0.8s ease-in-out`,
              '@keyframes wipe-right': {
                '0%': {
                  transform: 'scaleX(0)',
                },
                '100%': {
                  transform: 'scaleX(1)',
                },
              },
              '@keyframes wipe-left': {
                '0%': {
                  transform: 'scaleX(0)',
                },
                '100%': {
                  transform: 'scaleX(1)',
                },
              },
            }}
          />
        )}
      </Box>
    </ShowcaseContainer>
  );
}

export default CategoryShowcase;

