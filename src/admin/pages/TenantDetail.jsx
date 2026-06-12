import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Menu,
  MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminLayout from '../components/AdminLayout';
import {
  getTenant,
  updateTenantStatus,
  deleteTenant,
} from '../services/adminApiService';

const STATUS_COLORS = {
  active: 'success',
  inactive: 'default',
  suspended: 'warning',
  deleted: 'error',
};

const TenantDetail = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  const fetchTenant = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTenant(tenantId);
      setTenant(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tenant');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  const handleStatusChange = async (status) => {
    setAnchorEl(null);
    try {
      const updated = await updateTenantStatus(tenantId, status);
      setTenant(updated);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    setAnchorEl(null);
    try {
      await deleteTenant(tenantId);
      navigate('/admin/tenants');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete tenant');
    }
  };

  return (
    <AdminLayout>
      <Button
        component={RouterLink}
        to="/admin/tenants"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Back to Tenants
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : tenant ? (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {tenant.name || tenant.id}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                ID: {tenant.id}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={tenant.status || 'active'}
                color={STATUS_COLORS[tenant.status] || 'default'}
              />
              <Button variant="outlined" onClick={(e) => setAnchorEl(e.currentTarget)}>
                Actions
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">Plan</Typography>
              <Typography>{tenant.plan || 'trial'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">Created</Typography>
              <Typography>
                {tenant.created_at
                  ? new Date(tenant.created_at).toLocaleString()
                  : '—'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">Updated</Typography>
              <Typography>
                {tenant.updated_at
                  ? new Date(tenant.updated_at).toLocaleString()
                  : '—'}
              </Typography>
            </Grid>
            {tenant.owner_user_id && (
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" color="text.secondary">Owner User</Typography>
                <Typography>{tenant.owner_user_id}</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      ) : (
        <Alert severity="warning">Tenant not found</Alert>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleStatusChange('active')}>Activate</MenuItem>
        <MenuItem onClick={() => handleStatusChange('inactive')}>Deactivate</MenuItem>
        <MenuItem onClick={() => handleStatusChange('suspended')}>Suspend</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>
    </AdminLayout>
  );
};

export default TenantDetail;
