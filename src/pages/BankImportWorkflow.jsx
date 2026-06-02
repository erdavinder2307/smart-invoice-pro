import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RuleFolderIcon from '@mui/icons-material/RuleFolder';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import LockIcon from '@mui/icons-material/Lock';
import DeleteIcon from '@mui/icons-material/Delete';
import MainLayout from '../components/Layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { getBankAccounts } from '../services/bankAccountService';
import {
  approveImportBatch,
  createImportBatch,
  deleteImportBatch,
  getImportBatch,
  getImportJob,
  getImportRows,
  listImportBatches,
  updateImportRow,
} from '../services/bankImportService';

const confidenceColor = {
  high: 'success',
  medium: 'warning',
  low: 'error',
};

const reviewStatusOptions = ['ready', 'reviewed', 'pending_review', 'rejected'];

const fmt = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
}).format(Number(value || 0));

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const BankImportWorkflow = () => {
  const authValue = useAuth?.() || {};
  const user = authValue.user || null;
  const location = useLocation();
  const navigate = useNavigate();

  const preselectedBankAccountId = location.state?.bankAccountId || '';

  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState(preselectedBankAccountId);
  const [recentBatches, setRecentBatches] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfPassword, setPdfPassword] = useState('');
  const [needsPdfPassword, setNeedsPdfPassword] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const selectValue = bankAccounts.some((account) => account.id === selectedBankAccountId)
    ? selectedBankAccountId
    : '';

  const warningMessages = useMemo(
    () => [
      ...(currentBatch?.warnings || []).map((warning) => warning.message || warning.code),
      ...rows.flatMap((row) => row.warnings || []),
    ],
    [currentBatch, rows]
  );

  const loadBankAccounts = async () => {
    if (!user?.id) return;
    try {
      const data = await getBankAccounts(user.id);
      setBankAccounts(data || []);
      if (!selectedBankAccountId && data?.[0]?.id) {
        setSelectedBankAccountId(data[0].id);
      }
    } catch {
      setToast({ open: true, message: 'Failed to load bank accounts.', severity: 'error' });
    }
  };

  const loadRecentBatches = async (bankAccountId = selectedBankAccountId) => {
    setLoading(true);
    try {
      const items = await listImportBatches(bankAccountId || undefined);
      setRecentBatches(items || []);
    } catch {
      setToast({ open: true, message: 'Failed to load import history.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBankAccounts();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadRecentBatches();
  }, [selectedBankAccountId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-poll while any batch in the list is still processing (self-rescheduling every 2 s).
  // Stops automatically once all batches leave the 'processing'/'uploaded' state.
  useEffect(() => {
    const processingBatches = recentBatches.filter(
      (b) => b.status === 'processing' || b.status === 'uploaded',
    );
    if (processingBatches.length === 0) return;

    const timerId = setTimeout(async () => {
      try {
        const items = await listImportBatches(selectedBankAccountId || undefined);
        setRecentBatches(items || []);

        // If the currently open batch finished processing, also refresh rows
        if (currentBatch && processingBatches.some((b) => b.id === currentBatch.id)) {
          const updated = (items || []).find((b) => b.id === currentBatch.id);
          if (updated) {
            setCurrentBatch(updated);
            if (updated.status !== 'processing' && updated.status !== 'uploaded') {
              const rowDocs = await getImportRows(currentBatch.id);
              setRows(rowDocs || []);
            }
          }
        }
      } catch {
        // ignore transient poll errors
      }
    }, 2000);

    return () => clearTimeout(timerId);
  }, [recentBatches, currentBatch, selectedBankAccountId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectFile = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setSelectedFile(nextFile);
    setPdfPassword('');
    setNeedsPdfPassword(false);
  };

  const isPdf = selectedFile?.name?.toLowerCase().endsWith('.pdf');
  const isExcel = /\.(xlsx|xls)$/i.test(selectedFile?.name || '');
  const canBePasswordProtected = isPdf || isExcel;

  const handleUpload = async () => {
    if (!selectedFile) {
      setToast({ open: true, message: 'Choose a file to upload.', severity: 'error' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (selectedBankAccountId) {
        formData.append('bank_account_id', selectedBankAccountId);
      }
      if (pdfPassword) {
        formData.append('pdf_password', pdfPassword);
      }

      const payload = await createImportBatch(formData);
      setCurrentBatch(payload.batch);
      setRows(payload.rows || []);
      setSelectedFile(null);

      // Immediately add the new batch to the recent list so polling can track it
      await loadRecentBatches(selectedBankAccountId);

      const uploadedJobId = payload.job?.id;
      if (uploadedJobId && payload.job?.status !== 'completed') {
        for (let attempt = 0; attempt < 25; attempt += 1) {
          await wait(1200);
          const job = await getImportJob(uploadedJobId);

          if (job.status === 'failed') {
            setToast({
              open: true,
              message: job.error || 'Import processing failed.',
              severity: 'error',
            });
            break;
          }

          if (job.status === 'completed') {
            const [batchDoc, rowDocs] = await Promise.all([
              getImportBatch(payload.batch.id),
              getImportRows(payload.batch.id),
            ]);
            setCurrentBatch(batchDoc);
            setRows(rowDocs || []);
            break;
          }
        }
      }

      await loadRecentBatches(selectedBankAccountId);
      setToast({ open: true, message: 'Statement imported for review.', severity: 'success' });
    } catch (error) {
      const errCode = error.response?.data?.error_code;
      if (errCode === 'FILE_PASSWORD_REQUIRED' || errCode === 'PDF_PASSWORD_REQUIRED') {
        setNeedsPdfPassword(true);
        setToast({ open: true, message: 'This file is password-protected. Enter the password below and try again.', severity: 'warning' });
      } else {
        setToast({
          open: true,
          message: error.response?.data?.error || 'Failed to import statement.',
          severity: 'error',
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleOpenBatch = async (batch) => {
    setCurrentBatch(batch);
    try {
      const rowData = await getImportRows(batch.id);
      setRows(rowData || []);
    } catch {
      setToast({ open: true, message: 'Failed to load import preview.', severity: 'error' });
    }
  };

  const handleRowChange = (rowId, field, value) => {
    setRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)));
  };

  const handleSaveRow = async (rowId) => {
    const row = rows.find((item) => item.id === rowId);
    if (!currentBatch || !row) return;

    try {
      const updated = await updateImportRow(currentBatch.id, rowId, {
        normalized_date: row.normalized_date,
        description: row.description,
        amount: Number(row.amount || 0),
        review_status: row.review_status,
      });
      setRows((prev) => prev.map((item) => (item.id === rowId ? updated : item)));
      setToast({ open: true, message: 'Row updated.', severity: 'success' });
    } catch {
      setToast({ open: true, message: 'Failed to update row.', severity: 'error' });
    }
  };

  const handleApprove = async () => {
    if (!currentBatch) return;

    setApproving(true);
    try {
      const result = await approveImportBatch(currentBatch.id);
      setCurrentBatch(result.batch);
      await loadRecentBatches(selectedBankAccountId);
      navigate('/bank-reconciliation', {
        state: {
          bankAccountId: selectedBankAccountId,
          importBatchId: currentBatch.id,
          importedCount: result.transactions_created,
        },
      });
    } catch (error) {
      setToast({
        open: true,
        message: error.response?.data?.error || 'Failed to approve import batch.',
        severity: 'error',
      });
    } finally {
      setApproving(false);
    }
  };

  const handleDeleteBatch = async (batch) => {
    if (!window.confirm(`Delete import batch "${batch.file_name || batch.id}"? This cannot be undone.`)) return;
    try {
      await deleteImportBatch(batch.id);
      if (currentBatch?.id === batch.id) setCurrentBatch(null);
      await loadRecentBatches(selectedBankAccountId);
      setToast({ open: true, message: 'Import batch deleted.', severity: 'success' });
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to delete import batch.';
      setToast({ open: true, message: msg, severity: 'error' });
    }
  };

  return (
    <MainLayout title="Bank Import" subtitle="Review-first statement intake with approval before reconciliation">
      <Box sx={{ display: 'grid', gap: 3 }}>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: 'minmax(320px, 420px) minmax(0, 1fr)' } }}>
          <Box>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Upload Statement</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reuse your existing bank account context, upload the raw file, then review normalized rows before approval.
                  </Typography>
                </Box>

                <FormControl fullWidth size="small">
                  <InputLabel>Bank Account</InputLabel>
                  <Select
                    label="Bank Account"
                    value={selectValue}
                    onChange={(event) => setSelectedBankAccountId(event.target.value)}
                  >
                    {bankAccounts.map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.bank_name} - {account.account_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: 'grey.50',
                    display: 'grid',
                    gap: 1,
                    textAlign: 'center',
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 34, color: 'primary.main', mx: 'auto' }} />
                  <Typography variant="body2" fontWeight={600}>
                    {selectedFile ? selectedFile.name : 'Choose CSV, QIF, PDF, or XLSX'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    CSV and QIF are parsed instantly. PDF and Excel are parsed using AI — any bank format supported.
                  </Typography>
                  <Button component="label" variant="outlined" sx={{ textTransform: 'none' }}>
                    Select File
                    <input hidden type="file" accept=".csv,.qif,.pdf,.xlsx,.xls,.txt,.docx" onChange={handleSelectFile} data-testid="bank-import-file-input" />
                  </Button>
                </Paper>

                {(canBePasswordProtected || needsPdfPassword) && (
                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    label="File Password (if password-protected)"
                    placeholder="e.g. date of birth DDMMYYYY or account number"
                    value={pdfPassword}
                    onChange={(e) => setPdfPassword(e.target.value)}
                    error={needsPdfPassword && !pdfPassword}
                    helperText={
                      needsPdfPassword && !pdfPassword
                        ? 'Password required — enter it and click Import again'
                        : 'Most SBI/HDFC/ICICI statements use DOB (DDMMYYYY) or account number'
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon fontSize="small" color={needsPdfPassword && !pdfPassword ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}

                <Button
                  variant="contained"
                  startIcon={uploading ? <CircularProgress color="inherit" size={16} /> : <RuleFolderIcon />}
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile}
                  sx={{ textTransform: 'none', borderRadius: 2.5 }}
                >
                  {uploading ? 'Importing…' : 'Create Review Batch'}
                </Button>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' } }}>
              <Box>
                <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">Batch Status</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {(currentBatch?.status === 'processing' || currentBatch?.status === 'uploaded') && (
                        <CircularProgress size={16} thickness={5} />
                      )}
                      <Typography variant="h5" fontWeight={700}>{currentBatch?.status || 'Idle'}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
              <Box>
                <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">Preview Rows</Typography>
                    <Typography variant="h5" fontWeight={700}>{currentBatch?.row_count || 0}</Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box>
                <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">Storage Mode</Typography>
                    <Typography variant="h6" fontWeight={700}>{currentBatch?.storage_mode || 'n/a'}</Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            <Card sx={{ mt: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>Recent Import Batches</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reopen a batch to continue review or approval.
                    </Typography>
                  </Box>
                  {(loading || recentBatches.some((b) => b.status === 'processing' || b.status === 'uploaded')) && (
                    <CircularProgress size={18} />
                  )}
                </Box>
                <Divider sx={{ my: 2 }} />
                {recentBatches.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No import batches yet.</Typography>
                ) : (
                  <Box sx={{ display: 'grid', gap: 1.25 }}>
                    {recentBatches.slice(0, 6).map((batch) => (
                      <Paper
                        key={batch.id}
                        variant="outlined"
                        sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, borderRadius: 2 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                          {(batch.status === 'processing' || batch.status === 'uploaded') && (
                            <CircularProgress size={14} thickness={5} />
                          )}
                          <Box>
                            <Typography fontWeight={600}>{batch.filename}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {batch.workflow_mode} • {batch.row_count || 0} rows • {batch.warning_count || 0} warnings
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip
                            label={batch.status}
                            size="small"
                            color={
                              batch.status === 'approved' ? 'success'
                              : batch.status === 'review_ready' ? 'primary'
                              : batch.status === 'failed' ? 'error'
                              : 'default'
                            }
                            variant="outlined"
                          />
                          <Button size="small" variant="outlined" sx={{ textTransform: 'none' }} onClick={() => handleOpenBatch(batch)}>
                            Open
                          </Button>
                          {batch.status !== 'approved' && (
                            <IconButton
                              size="small"
                              color="error"
                              title="Delete batch"
                              onClick={() => handleDeleteBatch(batch)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        {warningMessages.length > 0 && (
          <Alert severity="warning" sx={{ borderRadius: 3 }}>
            {warningMessages.join(' | ')}
          </Alert>
        )}

        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>Preview and Review</Typography>
                <Typography variant="body2" color="text.secondary">
                  Edit or reject rows before sending approved transactions to reconciliation.
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="success"
                startIcon={approving ? <CircularProgress color="inherit" size={16} /> : <PublishedWithChangesIcon />}
                onClick={handleApprove}
                disabled={approving || !currentBatch || rows.length === 0}
                sx={{ textTransform: 'none', borderRadius: 2.5 }}
              >
                {approving ? 'Approving…' : 'Approve and Prepare Reconciliation'}
              </Button>
            </Box>

            {rows.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Upload or open an import batch to preview normalized rows.
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2.5 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Confidence</TableCell>
                      <TableCell>Review Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ minWidth: 140 }}>
                          <TextField
                            size="small"
                            type="date"
                            value={row.normalized_date || ''}
                            onChange={(event) => handleRowChange(row.id, 'normalized_date', event.target.value)}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 260 }}>
                          <TextField
                            size="small"
                            fullWidth
                            value={row.description || ''}
                            onChange={(event) => handleRowChange(row.id, 'description', event.target.value)}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 140 }}>
                          <TextField
                            size="small"
                            type="number"
                            value={row.amount}
                            onChange={(event) => handleRowChange(row.id, 'amount', event.target.value)}
                          />
                          <Typography variant="caption" color="text.secondary">{fmt(row.amount)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${row.confidence_level || 'n/a'}${row.confidence_score ? ` (${row.confidence_score})` : ''}`}
                            color={confidenceColor[row.confidence_level] || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 170 }}>
                          <FormControl fullWidth size="small">
                            <Select
                              value={row.review_status || 'pending_review'}
                              onChange={(event) => handleRowChange(row.id, 'review_status', event.target.value)}
                            >
                              {reviewStatusOptions.map((status) => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" variant="outlined" sx={{ textTransform: 'none' }} onClick={() => handleSaveRow(row.id)}>
                            Save Row
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={3200}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      >
        <Alert onClose={() => setToast((prev) => ({ ...prev, open: false }))} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default BankImportWorkflow;