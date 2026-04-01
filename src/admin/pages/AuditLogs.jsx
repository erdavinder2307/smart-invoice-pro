import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AdminLayout from '../components/AdminLayout';
import { getAdminAuditLogs } from '../services/adminApiService';

const ACTION_COLORS = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'error',
  LOGIN: 'default',
  LOGOUT: 'default',
  PAYMENT: 'warning',
};

const ACTION_OPTIONS = ['', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PAYMENT'];

const pretty = (obj) => JSON.stringify(obj ?? {}, null, 2);

const DetailDialog = ({ log, onClose }) => {
  if (!log) return null;
  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography component="span" variant="h6">Audit Detail</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {log.created_at ? new Date(log.created_at).toLocaleString() : '-'}
        </Typography>
        <Typography variant="subtitle2">Before</Typography>
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2, maxHeight: 220, overflow: 'auto', bgcolor: '#fafafa' }}>
          <pre style={{ margin: 0, fontSize: 12 }}>{pretty(log.before)}</pre>
        </Paper>
        <Typography variant="subtitle2">After</Typography>
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2, maxHeight: 220, overflow: 'auto', bgcolor: '#fafafa' }}>
          <pre style={{ margin: 0, fontSize: 12 }}>{pretty(log.after)}</pre>
        </Paper>
        <Typography variant="subtitle2">Metadata</Typography>
        <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 220, overflow: 'auto', bgcolor: '#fafafa' }}>
          <pre style={{ margin: 0, fontSize: 12 }}>{pretty(log.metadata)}</pre>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [tenantId, setTenantId] = useState('');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAdminAuditLogs({ action, entity, tenant_id: tenantId, limit: 100, page: 0 });
        setLogs(data.logs || []);
      } catch (e) {
        setError(e?.response?.data?.error || 'Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [action, entity, tenantId]);

  const rows = useMemo(() => logs, [logs]);

  return (
    <AdminLayout>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>Audit Logs</Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label="Tenant ID"
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
          sx={{ minWidth: 220 }}
        />
        <TextField
          size="small"
          label="Entity"
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
          sx={{ minWidth: 180 }}
        />
        <Select
          size="small"
          value={action}
          displayEmpty
          onChange={(e) => setAction(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Actions</MenuItem>
          {ACTION_OPTIONS.filter(Boolean).map((a) => (
            <MenuItem key={a} value={a}>{a}</MenuItem>
          ))}
        </Select>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Tenant</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Entity ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No audit logs found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((log) => {
                  const actionCode = String(log.action || '').toUpperCase();
                  return (
                    <TableRow key={log.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelected(log)}>
                      <TableCell>{log.created_at ? new Date(log.created_at).toLocaleString() : '-'}</TableCell>
                      <TableCell>{log.user_email || log.user_id || '-'}</TableCell>
                      <TableCell>{log.tenant_id || '-'}</TableCell>
                      <TableCell>
                        <Chip size="small" label={actionCode || '-'} color={ACTION_COLORS[actionCode] || 'default'} />
                      </TableCell>
                      <TableCell>{log.entity || log.entity_type || '-'}</TableCell>
                      <TableCell>{log.entity_id || '-'}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <DetailDialog log={selected} onClose={() => setSelected(null)} />
    </AdminLayout>
  );
};

export default AuditLogs;
