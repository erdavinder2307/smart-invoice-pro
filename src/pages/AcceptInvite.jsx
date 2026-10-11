import React, { useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import AuthCardLayout from '../components/Auth/AuthCardLayout';
import authService from '../services/authService';

export const MIN_PASSWORD_LENGTH = 8;

/** Opened from an Admin's invite email: /accept-invite?token=… — the invitee chooses their own password. */
const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const token = (searchParams.get('token') || '').trim();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(token ? '' : 'This invite link is missing its code. Open the link from the email again.');
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = await authService.acceptInvite(token, password);
      setUsername(data?.username || '');
    } catch (err) {
      setError(err.response?.data?.error || 'We could not set your password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (username !== null) {
    return (
      <AuthCardLayout seoTitle="Password set | Solidev Books" canonicalPath="/accept-invite" title="You're all set">
        <Alert severity="success" sx={{ mb: 3 }}>
          Your password is set.{username ? ` Sign in with the username ${username}.` : ' You can sign in now.'}
        </Alert>
        <Button component={RouterLink} to="/login" variant="contained" sx={{ textTransform: 'none' }}>
          Sign in
        </Button>
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout seoTitle="Set your password | Solidev Books" canonicalPath="/accept-invite" title="Set your password">
      <Typography sx={{ mb: 2, color: 'text.secondary' }}>
        You were invited to Solidev Books. Choose a password to finish setting up your account.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {token && (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="New password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText={`At least ${MIN_PASSWORD_LENGTH} characters`}
            required
            fullWidth
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" disabled={saving} sx={{ textTransform: 'none' }}>
            {saving ? 'Saving…' : 'Set password'}
          </Button>
        </Box>
      )}
    </AuthCardLayout>
  );
};

export default AcceptInvite;
