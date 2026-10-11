import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useOrgGst } from '../context/OrgGstContext';
import { useMe } from '../context/MeContext';
import { getOrgProfile, updateOrgProfile } from '../services/organizationProfileService';
import { validators } from '../utils/validation';
import { isInteractiveWorkspace } from '../utils/demoMode';

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
];

const STEPS = ['Your business', 'GST and state', 'First invoice'];

const REGISTRATION_OPTIONS = [
  { value: 'regular', label: 'Registered (regular)' },
  { value: 'composition', label: 'Registered (composition scheme)' },
  { value: 'unregistered', label: 'Not registered for GST' },
];

export const firstRunDoneKey = (tenantId) => `books.firstRunDone.${tenantId || 'default'}`;

const readDone = (tenantId) => {
  try {
    return localStorage.getItem(firstRunDoneKey(tenantId)) === '1';
  } catch {
    return false;
  }
};

const writeDone = (tenantId) => {
  try {
    localStorage.setItem(firstRunDoneKey(tenantId), '1');
  } catch {
    // Storage blocked: the wizard may show again next visit, which is harmless.
  }
};

/**
 * First-run setup for a new organisation: business name → GST registration and
 * state → first invoice. Shown once to an Admin whose organisation profile has
 * no name yet (self sign-up creates the tenant without one).
 */
const FirstRunWizard = () => {
  const { user, isAdmin } = useAuth();
  const gst = useOrgGst();
  const { refreshMe } = useMe() || {};
  const navigate = useNavigate();

  const tenantId = user?.tenant_id;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [registration, setRegistration] = useState('regular');
  const [gstin, setGstin] = useState('');
  const [state, setState] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!user || !isAdmin || isInteractiveWorkspace(user) || readDone(tenantId)) return undefined;
    let cancelled = false;
    getOrgProfile()
      .then((data) => {
        if (cancelled || (data?.organization_name || '').trim()) return;
        setProfile(data || {});
        setState(data?.address?.state || '');
        setOpen(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, isAdmin, tenantId]);

  if (!open) return null;

  const finish = () => {
    writeDone(tenantId);
    setOpen(false);
  };

  const registered = registration !== 'unregistered';

  const handleNameNext = () => {
    if (!name.trim()) {
      setErrors({ name: 'Enter your business name.' });
      return;
    }
    setErrors({});
    setStep(1);
  };

  const handleSave = async () => {
    const e = {};
    if (registered) {
      if (!gstin.trim()) e.gstin = 'Enter your GSTIN.';
      else {
        const gstError = validators.gst()(gstin);
        if (gstError) e.gstin = gstError;
      }
    }
    if (!state) e.state = 'Choose your state.';
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    setSaveError('');
    try {
      // The API replaces the whole profile, so send every field it keeps.
      await updateOrgProfile({
        organization_name: name.trim(),
        industry: profile.industry || '',
        country: profile.country || 'India',
        gstin: registered ? gstin.trim().toUpperCase() : '',
        gst_registration_type: registration,
        website_url: profile.website_url || '',
        logo_url: profile.logo_url || '',
        address: { ...(profile.address || {}), state },
      });
    } catch (err) {
      setSaveError(err.response?.data?.error || 'We could not save your details. Please try again.');
      setSaving(false);
      return;
    }
    setSaving(false);
    setStep(2);
    // Refresh the GST settings and the top bar's organisation name; failures here are not the user's problem.
    if (typeof gst?.reload === 'function') gst.reload();
    if (typeof refreshMe === 'function') Promise.resolve(refreshMe()).catch(() => {});
  };

  const handleCreateInvoice = () => {
    finish();
    navigate('/invoices/add');
  };

  return (
    <Dialog
      open
      maxWidth="sm"
      fullWidth
      aria-labelledby="first-run-title"
      // Full screen on phones, a normal dialog from 600px up.
      sx={{
        '& .MuiDialog-paper': {
          m: { xs: 0, sm: 4 },
          width: { xs: '100%' },
          maxHeight: { xs: '100%', sm: 'calc(100% - 64px)' },
          height: { xs: '100%', sm: 'auto' },
          borderRadius: { xs: 0, sm: 1 },
        },
      }}
    >
      <DialogTitle id="first-run-title">Set up Solidev Books</DialogTitle>
      <DialogContent>
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {step === 0 && (
          <Box>
            <Typography sx={{ mb: 2 }}>This name appears on your invoices.</Typography>
            <TextField
              label="Business name"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              error={!!errors.name}
              helperText={errors.name || ' '}
              fullWidth
              autoFocus
              inputProps={{ maxLength: 120 }}
            />
          </Box>
        )}

        {step === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="GST registration"
              value={registration}
              onChange={(ev) => setRegistration(ev.target.value)}
              fullWidth
            >
              {REGISTRATION_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </TextField>
            {registered && (
              <TextField
                label="GSTIN"
                value={gstin}
                onChange={(ev) => setGstin(ev.target.value.toUpperCase().replace(/\s+/g, ''))}
                error={!!errors.gstin}
                helperText={errors.gstin || '15 characters, e.g. 27AABCU9603R1ZX'}
                fullWidth
                inputProps={{ maxLength: 15 }}
              />
            )}
            <TextField
              select
              label="State"
              value={state}
              onChange={(ev) => setState(ev.target.value)}
              error={!!errors.state}
              helperText={errors.state || 'Used to decide CGST + SGST or IGST on your invoices.'}
              fullWidth
            >
              {INDIAN_STATES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
            {saveError && <Alert severity="error">{saveError}</Alert>}
          </Box>
        )}

        {step === 2 && (
          <Box>
            <Typography sx={{ mb: 2 }}>
              Your business details are saved. You can change them any time in Settings → Organization Profile.
            </Typography>
            {user?.email_verified === false && (
              <Alert severity="info">
                Verify your email first: open the link we sent you, then create your invoice.
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {step < 2 && (
          <Button onClick={finish} color="inherit" sx={{ mr: 'auto' }}>
            Skip for now
          </Button>
        )}
        {step === 1 && (
          <Button onClick={() => setStep(0)} disabled={saving}>Back</Button>
        )}
        {step === 0 && (
          <Button variant="contained" onClick={handleNameNext}>Next</Button>
        )}
        {step === 1 && (
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save and continue'}
          </Button>
        )}
        {step === 2 && (
          <>
            <Button onClick={finish}>Go to dashboard</Button>
            <Button variant="contained" onClick={handleCreateInvoice}>Create your first invoice</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FirstRunWizard;
