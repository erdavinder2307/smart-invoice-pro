import React, { useEffect, useState } from 'react';
import { Alert, Button, Snackbar } from '@mui/material';

export const PLAN_LIMIT_EVENT = 'billing:plan-limit';

// Non-blocking notice for HTTP 402 plan-limit responses (trial ended, seat limit, feature not in plan).
const PlanLimitBanner = () => {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const handle = (event) => {
      setMessage(event.detail?.message || 'This needs a paid plan.');
    };
    window.addEventListener(PLAN_LIMIT_EVENT, handle);
    return () => window.removeEventListener(PLAN_LIMIT_EVENT, handle);
  }, []);

  return (
    <Snackbar
      open={Boolean(message)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      onClose={(_, reason) => reason !== 'clickaway' && setMessage(null)}
    >
      <Alert
        severity="warning"
        variant="filled"
        onClose={() => setMessage(null)}
        action={
          <Button color="inherit" size="small" href="/pricing">
            Choose a plan
          </Button>
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default PlanLimitBanner;
