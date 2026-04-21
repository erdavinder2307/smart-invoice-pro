import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AdminLayout from '../components/AdminLayout';
import { listTenants, updateTenantStatus, deleteTenant } from '../services/adminApiService';

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
        <Button variant="outlined" onClick={fetchTenants}>
          Refresh
        </Button>
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
                      <TableCell>{tenant.name || tenant.id}</TableCell>
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
