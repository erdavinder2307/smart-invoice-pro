import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

/**
 * Shown while the signed-in user's email is unverified. Unverified accounts
 * cannot create invoices (API answers 403 EMAIL_NOT_VERIFIED).
 */
const EmailVerificationBanner = () => {
  const { user, setEmailVerified } = useAuth();
  const [state, setState] = useState('idle'); // idle | sending | sent | error
  const [message, setMessage] = useState('');

  if (!user || user.email_verified !== false) {
    return null;
  }

  const handleResend = async () => {
    setState('sending');
    setMessage('');
    try {
      const data = await authService.resendVerification();
      if (data?.email_verified) {
        setEmailVerified(true);
        return;
      }
      setState('sent');
      setMessage('Email sent. Check your inbox (and spam folder) for the link.');
    } catch (err) {
      setState('error');
      setMessage(err.response?.data?.error || 'We could not send the email. Please try again.');
    }
  };

  return (
    <Box
      role="status"
      sx={{
        bgcolor: '#fffbeb',
        color: '#78350f',
        py: 1,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 1,
        borderBottom: '1px solid #fde68a',
        fontSize: '0.875rem',
      }}
    >
      <MarkEmailUnreadOutlinedIcon sx={{ fontSize: 18 }} />
      <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 500 }}>
        {message || 'Please verify your email address before creating invoices. Open the link we sent you.'}
      </Typography>
      {state !== 'sent' && (
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={handleResend}
          disabled={state === 'sending'}
          sx={{ textTransform: 'none', py: 0, ml: 1 }}
        >
          {state === 'sending' ? 'Sending…' : 'Resend email'}
        </Button>
      )}
    </Box>
  );
};

export default EmailVerificationBanner;
