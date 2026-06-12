import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import AdminLayout from '../components/AdminLayout';
import {
  listTenants,
  createTenant,
  updateTenantStatus,
  deleteTenant,
} from '../services/adminApiService';

const STATUS_COLORS = {
  active: 'success',
  inactive: 'default',
  suspended: 'warning',
  deleted: 'error',
};

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', plan: 'trial' });
  const [creating, setCreating] = useState(false);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listTenants(page, rowsPerPage);
      setTenants(data.tenants || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleMenuOpen = (event, tenant) => {
    setAnchorEl(event.currentTarget);
    setSelectedTenant(tenant);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async (status) => {
    handleMenuClose();
    if (!selectedTenant) return;
    try {
      await updateTenantStatus(selectedTenant.id, status);
      fetchTenants();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) return;
    setCreating(true);
    setError('');
    try {
      await createTenant({
        name: createForm.name.trim(),
        plan: createForm.plan,
      });
      setCreateDialog(false);
      setCreateForm({ name: '', plan: 'trial' });
      fetchTenants();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create tenant');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    setDeleteDialog(false);
    if (!selectedTenant) return;
    try {
      await deleteTenant(selectedTenant.id);
      fetchTenants();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete tenant');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Tenants
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
          >
            Create Tenant
          </Button>
          <Button variant="outlined" onClick={fetchTenants}>
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No tenants found
                    </TableCell>
                  </TableRow>
                ) : (
                  tenants.map((tenant) => (
                    <TableRow key={tenant.id} hover>
                      <TableCell>
                        <Button
                          component={RouterLink}
                          to={`/admin/tenants/${tenant.id}`}
                          sx={{ textTransform: 'none', p: 0, minWidth: 0 }}
                        >
                          {tenant.name || tenant.id}
                        </Button>
                      </TableCell>
                      <TableCell>{tenant.plan || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={tenant.status || 'active'}
                          color={STATUS_COLORS[tenant.status] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {tenant.created_at
                          ? new Date(tenant.created_at).toLocaleDateString()
                          : '—'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, tenant)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </Paper>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleStatusChange('active')}>Activate</MenuItem>
        <MenuItem onClick={() => handleStatusChange('inactive')}>Deactivate</MenuItem>
        <MenuItem onClick={() => handleStatusChange('suspended')}>Suspend</MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setDeleteDialog(true);
          }}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Tenant</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Organization Name"
            fullWidth
            value={createForm.name}
            onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Plan</InputLabel>
            <Select
              value={createForm.plan}
              label="Plan"
              onChange={(e) => setCreateForm((f) => ({ ...f, plan: e.target.value }))}
            >
              <MenuItem value="trial">Trial</MenuItem>
              <MenuItem value="starter">Starter</MenuItem>
              <MenuItem value="pro">Pro</MenuItem>
              <MenuItem value="enterprise">Enterprise</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={creating || !createForm.name.trim()}
          >
            {creating ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Tenant</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete tenant "{selectedTenant?.name || selectedTenant?.id}"?
            This is a soft delete and can be reversed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default Tenants;
