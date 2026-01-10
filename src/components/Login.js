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
  '& .MuiInput-underline:before': {
    borderBottomColor: '#f5f5f5',
  },
  '& .MuiInput-underline:hover:before': {
    borderBottomColor: '#fff',
  },
}));

function Login({ onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      // Navigation handled by App.js based on auth state
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError('Failed to log in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      console.error('Google login error:', err);
      setError('Failed to log in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <StyledPaper elevation={3}>
        <Typography variant="h3" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
          Log In
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
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
            {loading ? 'Logging in...' : 'Log In'}
          </Button>

          <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.3)' }}>
            <Typography sx={{ color: '#f5f5f5' }}>OR</Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
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
              Don't have an account?{' '}
              <MuiLink
                component="button"
                type="button"
                variant="body2"
                onClick={onSwitchToSignup}
                sx={{
                  color: '#fff',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  '&:hover': {
                    color: '#e0e0e0',
                  }
                }}
              >
                Sign up
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </StyledPaper>
    </Container>
  );
}

export default Login;

