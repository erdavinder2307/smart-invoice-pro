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
  DialogActions,
  TextField,
  TablePagination,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AdminLayout from '../components/AdminLayout';
import { listUsers, updateUserStatus, resetUserPassword } from '../services/adminApiService';

const STATUS_COLORS = {
  active: 'success',
  inactive: 'default',
  suspended: 'warning',
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetDialog, setResetDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listUsers(page, rowsPerPage);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async (status) => {
    handleMenuClose();
    if (!selectedUser) return;
    try {
      await updateUserStatus(selectedUser.id, status);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleResetPassword = async () => {
    setResetError('');
    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters');
      return;
    }
    setResetLoading(true);
    try {
      await resetUserPassword(selectedUser.id, newPassword);
      setResetDialog(false);
      setNewPassword('');
    } catch (err) {
      setResetError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Users
        </Typography>
        <Button variant="outlined" onClick={fetchUsers}>
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
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Tenant ID</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.username || '—'}</TableCell>
                      <TableCell>{user.email || '—'}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {user.tenant_id || '—'}
                      </TableCell>
                      <TableCell>{user.role || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.status || 'active'}
                          color={STATUS_COLORS[user.status] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}>
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
            setResetDialog(true);
            setNewPassword('');
            setResetError('');
          }}
        >
          Reset Password
        </MenuItem>
      </Menu>

      <Dialog open={resetDialog} onClose={() => setResetDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set a new password for user "{selectedUser?.username}"
          </Typography>
          {resetError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {resetError}
            </Alert>
          )}
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={resetLoading}
            helperText="Minimum 8 characters"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(false)} disabled={resetLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleResetPassword}
            variant="contained"
            disabled={resetLoading}
          >
            {resetLoading ? <CircularProgress size={20} /> : 'Reset'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default Users;
