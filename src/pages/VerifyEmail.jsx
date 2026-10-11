import React, { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import AuthCardLayout from '../components/Auth/AuthCardLayout';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

/** Opened from the sign-up email: /verify-email?token=… (works signed in or out). */
const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = (searchParams.get('token') || '').trim();
  const { user, setEmailVerified } = useAuth();
  const [status, setStatus] = useState(token ? 'verifying' : 'error'); // verifying | done | error
  const [error, setError] = useState(token ? '' : 'This link is missing its code. Open the link from the email again.');
  const [resendState, setResendState] = useState('idle');
  const started = useRef(false);

  useEffect(() => {
    // The token is one-time: never post it twice (React StrictMode runs effects twice in dev).
    if (!token || started.current) return;
    started.current = true;
    authService
      .verifyEmail(token)
      .then(() => {
        setStatus('done');
        setEmailVerified?.(true);
      })
      .catch((err) => {
        setStatus('error');
        setError(err.response?.data?.error || 'We could not verify your email. Please try again.');
      });
  }, [token, setEmailVerified]);

  const handleResend = async () => {
    setResendState('sending');
    try {
      await authService.resendVerification();
      setResendState('sent');
    } catch (err) {
      setResendState('error');
      setError(err.response?.data?.error || 'We could not send the email. Please try again.');
    }
  };

  return (
    <AuthCardLayout seoTitle="Verify your email | Solidev Books" canonicalPath="/verify-email" title="Verify your email">
      {status === 'verifying' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>Checking your link…</Typography>
        </Box>
      )}

      {status === 'done' && (
        <>
          <Alert severity="success" sx={{ mb: 3 }}>
            Your email is verified. You can create invoices now.
          </Alert>
          <Button component={RouterLink} to={user ? '/dashboard' : '/login'} variant="contained" sx={{ textTransform: 'none' }}>
            {user ? 'Go to dashboard' : 'Sign in'}
          </Button>
        </>
      )}

      {status === 'error' && (
        <>
          <Alert severity={resendState === 'sent' ? 'success' : 'error'} sx={{ mb: 3 }}>
            {resendState === 'sent' ? 'We sent you a new link. Check your inbox.' : error}
          </Alert>
          {user ? (
            resendState !== 'sent' && (
              <Button variant="contained" onClick={handleResend} disabled={resendState === 'sending'} sx={{ textTransform: 'none' }}>
                {resendState === 'sending' ? 'Sending…' : 'Send a new link'}
              </Button>
            )
          ) : (
            <Button component={RouterLink} to="/login" variant="contained" sx={{ textTransform: 'none' }}>
              Sign in to get a new link
            </Button>
          )}
        </>
      )}
    </AuthCardLayout>
  );
};

export default VerifyEmail;
