import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  Divider,
  Link as MuiLink
} from '@mui/material';
import { styled } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../contexts/AuthContext';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: '#0f258f',
  color: 'white',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  border: '4px solid #f5f5f5',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': {
      borderColor: '#f5f5f5',
    },
    '&:hover fieldset': {
      borderColor: '#fff',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#fff',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#f5f5f5',
    '&.Mui-focused': {
      color: '#fff',
    },
  },
}));

function Signup({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      // Navigation handled by App.js based on auth state
    } catch (err) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      console.error('Google signup error:', err);
      setError('Failed to sign up with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <StyledPaper elevation={3}>
        <Typography variant="h3" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
          Sign Up
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 0.5, color: '#fff', fontWeight: 500 }}>
              Email
            </Typography>
            <StyledTextField
              fullWidth
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              InputProps={{
                sx: { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 0.5, color: '#fff', fontWeight: 500 }}>
              Password
            </Typography>
            <StyledTextField
              fullWidth
              placeholder="At least 6 characters"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              InputProps={{
                sx: { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 0.5, color: '#fff', fontWeight: 500 }}>
              Confirm Password
            </Typography>
            <StyledTextField
              fullWidth
              placeholder="Re-enter your password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              InputProps={{
                sx: { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
              }}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              backgroundColor: '#f5f5f5',
              color: '#0f258f',
              fontSize: '1.1rem',
              py: 1.5,
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
              '&:disabled': {
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
              }
            }}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>

          <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.3)' }}>
            <Typography sx={{ color: '#f5f5f5' }}>OR</Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignup}
            disabled={loading}
            sx={{
              color: '#f5f5f5',
              borderColor: '#f5f5f5',
              '&:hover': {
                borderColor: '#fff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&:disabled': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'rgba(255, 255, 255, 0.5)',
              }
            }}
          >
            Continue with Google
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#f5f5f5' }}>
              Already have an account?{' '}
              <MuiLink
                component="button"
                type="button"
                variant="body2"
                onClick={onSwitchToLogin}
                sx={{
                  color: '#fff',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  '&:hover': {
                    color: '#e0e0e0',
                  }
                }}
              >
                Log in
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </StyledPaper>
    </Container>
  );
}

export default Signup;

