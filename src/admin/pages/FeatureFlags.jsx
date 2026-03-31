import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
} from '@mui/material';
import AdminLayout from '../components/AdminLayout';
import {
  listTenants,
  getFeatureFlags,
  createFeatureFlags,
  updateFeatureFlags,
} from '../services/adminApiService';

const DEFAULT_FLAGS = {
  invoicing: true,
  quotes: true,
  purchase_orders: true,
  expenses: true,
  reports: true,
  bank_reconciliation: false,
  gst_filing: false,
  multi_currency: false,
  api_access: false,
};

const FeatureFlags = () => {
  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [flags, setFlags] = useState({});
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenantsLoading, setTenantsLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const data = await listTenants(0, 200);
        setTenants(data.tenants || []);
      } catch {
        setError('Failed to load tenants');
      } finally {
        setTenantsLoading(false);
      }
    };
    fetchTenants();
  }, []);

  const loadFlags = useCallback(async (tenantId) => {
    if (!tenantId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await getFeatureFlags(tenantId);
      if (data.flags && Object.keys(data.flags).length > 0) {
        setFlags(data.flags);
        setIsNew(false);
      } else {
        setFlags({ ...DEFAULT_FLAGS });
        setIsNew(true);
      }
    } catch {
      setFlags({ ...DEFAULT_FLAGS });
      setIsNew(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTenantSelect = (tenantId) => {
    setSelectedTenantId(tenantId);
    loadFlags(tenantId);
  };

  const handleToggle = (flagName) => {
    setFlags((prev) => ({ ...prev, [flagName]: !prev[flagName] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (isNew) {
        await createFeatureFlags(selectedTenantId, flags);
      } else {
        await updateFeatureFlags(selectedTenantId, flags);
      }
      setIsNew(false);
      setSuccess('Feature flags saved successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save feature flags');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Feature Flags
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Select Tenant
        </Typography>
        {tenantsLoading ? (
          <CircularProgress size={24} />
        ) : (
          <TextField
            select
            fullWidth
            label="Tenant"
            value={selectedTenantId}
            onChange={(e) => handleTenantSelect(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="">— Select a tenant —</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name || t.id}
              </option>
            ))}
          </TextField>
        )}
      </Paper>

      {selectedTenantId && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Flags {isNew && '(new — will be created on save)'}
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={1}>
                {Object.entries(flags).map(([key, value]) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!value}
                          onChange={() => handleToggle(key)}
                          color="primary"
                        />
                      }
                      label={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    />
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={20} /> : 'Save Flags'}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      )}
    </AdminLayout>
  );
};

export default FeatureFlags;
