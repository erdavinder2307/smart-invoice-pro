import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert,
  Chip, Tooltip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Select,
  FormControl, InputLabel, Tabs, Tab, Snackbar, Divider,
  LinearProgress, InputAdornment, Badge,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PsychologyIcon from '@mui/icons-material/Psychology';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import ListSummary from '../components/list/ListSummary';
import buildSummaryFilterItems from '../utils/summaryFilterChips';
import { useLocation } from 'react-router-dom';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n ?? 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const STATUS_COLORS = { matched: 'success', unmatched: 'warning', excluded: 'default' };
const STATUS_LABELS = { matched: 'Matched', unmatched: 'Unmatched', excluded: 'Excluded' };

const EXPENSE_CATEGORIES = [
  'Travel', 'Office Supplies', 'Utilities', 'Rent', 'Salaries',
  'Marketing', 'Professional Fees', 'Software', 'Hardware', 'Meals',
  'Entertainment', 'Insurance', 'Taxes', 'Bank Charges', 'Uncategorized',
];

// ─────────────────────────────────────────────────────────────────────────────
const BankReconciliation = () => {
  const { user } = useAuth();
  const location = useLocation();

  // ── State ──────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState(0);                  // 0=Transactions, 1=Upload
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [autoMatching, setAutoMatching] = useState(false);
  const [aiMatching, setAiMatching] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });
  const [importNotice, setImportNotice] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [allTransactionsTotal, setAllTransactionsTotal] = useState(0);
  const [search, setSearch]             = useState('');

  // Upload
  const fileRef = useRef(null);
  const prefillAppliedRef = useRef(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadFile, setUploadFile]   = useState(null);
  const [bankAccountId, setBankAccountId] = useState('');
  const [bankAccounts, setBankAccounts]   = useState([]);

  // Match dialog
  const [matchDlg, setMatchDlg]         = useState(false);
  const [matchTxn, setMatchTxn]         = useState(null);
  const [matchType, setMatchType]       = useState('invoice');
  const [matchSearch, setMatchSearch]   = useState('');
  const [matchables, setMatchables]     = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Create expense dialog
  const [expDlg, setExpDlg]     = useState(false);
  const [expTxn, setExpTxn]     = useState(null);
  const [expForm, setExpForm]   = useState({ vendor_name: '', category: 'Uncategorized', notes: '' });
  const [expLoading, setExpLoading] = useState(false);

  // ── Load transactions ──────────────────────────────────────────────────────
  const loadTransactions = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (bankAccountId) params.bank_account_id = bankAccountId;
      const res = await axios.get(createApiUrl('/api/reconciliation/transactions'), { params });
      setTransactions(res.data);
      if (!statusFilter) setAllTransactionsTotal(res.data.length);
    } catch {
      showToast('Failed to load transactions', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, statusFilter, bankAccountId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load bank accounts for filter dropdown
  const loadBankAccounts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(createApiUrl('/api/bank-accounts'));
      setBankAccounts(res.data || []);
    } catch { /* non-fatal */ }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadTransactions(); }, [loadTransactions]);
  useEffect(() => { loadBankAccounts(); }, [loadBankAccounts]);

  useEffect(() => {
    const navState = location.state || {};
    if (prefillAppliedRef.current) return;

    if (navState.importBatchId) {
      const importedCount = Number(navState.importedCount || 0);
      setImportNotice({
        batchId: navState.importBatchId,
        importedCount,
      });
      setTab(0);
    }

    if (!navState.openImportTab && !navState.bankAccountId) {
      prefillAppliedRef.current = true;
      return;
    }

    if (navState.bankAccountId) {
      setBankAccountId(navState.bankAccountId);
    }
    if (navState.openImportTab) {
      setTab(1);
    }
    prefillAppliedRef.current = true;
  }, [location.state]);

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = (msg, severity = 'success') => setToast({ open: true, msg, severity });

  // ── Upload ─────────────────────────────────────────────────────────────────
  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (f) setUploadFile(f);
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      if (bankAccountId) fd.append('bank_account_id', bankAccountId);

      const res = await axios.post(createApiUrl('/api/reconciliation/upload'), fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast(`Imported ${res.data.imported} transactions (${res.data.transactions.filter(t => t.match_status === 'matched').length} auto-matched)`);
      setUploadFile(null);
      setTab(0);
      loadTransactions();
    } catch (err) {
      showToast(err.response?.data?.error || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  // ── AI Match (Claude-powered) ────────────────────────────────────────────
  const handleAiMatch = async () => {
    setAiMatching(true);
    try {
      const res = await axios.post(createApiUrl('/api/reconciliation/ai-match'), { confidence_threshold: 0.80 });
      showToast(`AI matched ${res.data.newly_matched} of ${res.data.processed} transactions`);
      loadTransactions();
    } catch (err) {
      const msg = err?.response?.status === 503
        ? 'AI matching unavailable — ANTHROPIC_API_KEY not configured'
        : 'AI match failed';
      showToast(msg, 'error');
    } finally {
      setAiMatching(false);
    }
  };

  // ── Auto-match ─────────────────────────────────────────────────────────────
  const handleAutoMatch = async () => {
    setAutoMatching(true);
    try {
      const res = await axios.post(createApiUrl('/api/reconciliation/auto-match'), {});
      showToast(`Auto-matched ${res.data.newly_matched} of ${res.data.processed} unmatched transactions`);
      loadTransactions();
    } catch {
      showToast('Auto-match failed', 'error');
    } finally {
      setAutoMatching(false);
    }
  };

  // ── Unmatch ────────────────────────────────────────────────────────────────
  const handleUnmatch = async (txn) => {
    try {
      await axios.post(createApiUrl(`/api/reconciliation/${txn.id}/unmatch`), {});
      showToast('Transaction unmatched');
      loadTransactions();
    } catch {
      showToast('Failed to unmatch', 'error');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (txn) => {
    if (!window.confirm(`Delete transaction "${txn.description}"?`)) return;
    try {
      await axios.delete(createApiUrl(`/api/reconciliation/${txn.id}`));
      showToast('Transaction deleted');
      loadTransactions();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  // ── Open match dialog ──────────────────────────────────────────────────────
  const openMatchDlg = (txn) => {
    setMatchTxn(txn);
    setMatchType('invoice');
    setMatchSearch('');
    setMatchables([]);
    setSelectedMatch(null);
    setMatchDlg(true);
  };

  const loadMatchables = useCallback(async () => {
    if (!matchDlg || !user?.id) return;
    setMatchLoading(true);
    try {
      const res = await axios.get(createApiUrl('/api/reconciliation/matchable'), {
        params: { type: matchType, q: matchSearch },
      });
      setMatchables(res.data);
    } catch { setMatchables([]); }
    finally { setMatchLoading(false); }
  }, [matchDlg, matchType, matchSearch, user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (matchDlg) loadMatchables(); }, [matchDlg, matchType, matchSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveMatch = async () => {
    if (!selectedMatch) return;
    try {
      await axios.post(createApiUrl(`/api/reconciliation/${matchTxn.id}/match`), {
        match_type: matchType,
        match_id: selectedMatch.id,
      });
      showToast(`Matched to ${matchType} #${selectedMatch.invoice_number || selectedMatch.vendor_name}`);
      setMatchDlg(false);
      loadTransactions();
    } catch {
      showToast('Match failed', 'error');
    }
  };

  // ── Open create-expense dialog ─────────────────────────────────────────────
  const openExpDlg = (txn) => {
    setExpTxn(txn);
    setExpForm({ vendor_name: txn.description || '', category: 'Uncategorized', notes: '' });
    setExpDlg(true);
  };

  const handleCreateExpense = async () => {
    setExpLoading(true);
    try {
      await axios.post(createApiUrl(`/api/reconciliation/${expTxn.id}/create-expense`), expForm);
      showToast('Expense created and transaction matched');
      setExpDlg(false);
      loadTransactions();
    } catch {
      showToast('Failed to create expense', 'error');
    } finally {
      setExpLoading(false);
    }
  };

  // ── Filtered transactions ──────────────────────────────────────────────────
  const filtered = transactions.filter(t => {
    const q = search.toLowerCase();
    return !q || (t.description || '').toLowerCase().includes(q);
  });

  // ── Summary stats ──────────────────────────────────────────────────────────
  const stats = {
    total: transactions.length,
    matched: transactions.filter(t => t.match_status === 'matched').length,
    unmatched: transactions.filter(t => t.match_status === 'unmatched').length,
    totalIn:  transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0),
    totalOut: transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0),
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <MainLayout title="Bank Reconciliation" subtitle="Import bank statements and match transactions to invoices & expenses">
      <Box sx={{ flex: 1, width: '100%' }}>

        {importNotice && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setImportNotice(null)}
          >
            Import batch <strong>{importNotice.batchId}</strong> approved and sent to reconciliation.
            {importNotice.importedCount > 0 ? ` ${importNotice.importedCount} transaction(s) were created.` : ''}
          </Alert>
        )}

        {/* ── Summary Chips ─────────────────────────────────────────── */}
        <ListSummary
          items={buildSummaryFilterItems({
            activeFilter: statusFilter,
            allFilterValue: '',
            onFilterChange: setStatusFilter,
            filteredCount: transactions.length,
            viewAllValue: allTransactionsTotal,
            chips: [
              { label: 'All Transactions', value: stats.total,     filterValue: '' },
              { label: 'Matched',          value: stats.matched,   color: 'success', filterValue: 'matched' },
              { label: 'Unmatched',        value: stats.unmatched, color: 'warning', filterValue: 'unmatched' },
            ],
          })}
        />

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <Paper sx={{ borderRadius: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', px: 2, pt: 1 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ flex: 1 }}>
              <Tab label={
                <Badge badgeContent={stats.unmatched || null} color="warning" max={999}>
                  <Box sx={{ pr: stats.unmatched ? 2 : 0 }}>Transactions</Box>
                </Badge>
              } />
              <Tab label="Import Statement" icon={<UploadFileIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
            </Tabs>

            {/* Actions */}
            {tab === 0 && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small" variant="outlined" startIcon={<AutoFixHighIcon />}
                  onClick={handleAutoMatch} disabled={autoMatching || !stats.unmatched}
                >
                  {autoMatching ? 'Matching…' : 'Auto-Match'}
                </Button>
                <Tooltip title="Use Claude AI to intelligently match unmatched transactions by description, amount & date">
                  <span>
                    <Button
                      size="small" variant="contained" color="secondary"
                      startIcon={aiMatching ? <CircularProgress size={14} color="inherit" /> : <PsychologyIcon />}
                      onClick={handleAiMatch}
                      disabled={aiMatching || !stats.unmatched}
                    >
                      {aiMatching ? 'AI Matching…' : 'AI Match'}
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            )}
          </Box>

          {/* ────────────── TAB 0: TRANSACTIONS ─────────────────────────── */}
          {tab === 0 && (
            <Box sx={{ p: 2 }}>
              {/* Filters row */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small" placeholder="Search description…"
                  value={search} onChange={e => setSearch(e.target.value)}
                  sx={{ minWidth: 220 }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                />
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Status</InputLabel>
                  <Select label="Status" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); }}>
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="matched">Matched</MenuItem>
                    <MenuItem value="unmatched">Unmatched</MenuItem>
                  </Select>
                </FormControl>
                {bankAccounts.length > 0 && (
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Bank Account</InputLabel>
                    <Select label="Bank Account" value={bankAccountId} onChange={e => setBankAccountId(e.target.value)}>
                      <MenuItem value="">All Accounts</MenuItem>
                      {bankAccounts.map(a => (
                        <MenuItem key={a.id} value={a.id}>{a.bank_name} – {a.account_name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>

              {loading ? (
                <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress /></Box>
              ) : filtered.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <ReceiptLongIcon sx={{ fontSize: 56, color: 'grey.300', mb: 2 }} />
                  <Typography color="text.secondary">
                    {transactions.length === 0
                      ? 'No transactions imported yet. Go to Import Statement to get started.'
                      : 'No transactions match your filters.'}
                  </Typography>
                  {transactions.length === 0 && (
                    <Button sx={{ mt: 2 }} variant="contained" startIcon={<UploadFileIcon />} onClick={() => setTab(1)}>
                      Import Statement
                    </Button>
                  )}
                </Box>
              ) : (
                <TableContainer sx={{ overflowX: 'hidden' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
                        <TableCell>Date</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Matched To</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.map(txn => (
                        <TableRow key={txn.id} hover sx={{
                          '&:hover': { bgcolor: 'grey.50' },
                          opacity: txn.match_status === 'excluded' ? 0.5 : 1,
                        }}>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{fmtDate(txn.date)}</TableCell>
                          <TableCell sx={{ maxWidth: 280 }}>
                            <Typography variant="body2" noWrap title={txn.description}>
                              {txn.description || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2" fontWeight={600}
                              color={txn.amount >= 0 ? 'success.main' : 'error.main'}
                            >
                              {txn.amount >= 0 ? '+' : ''}{fmt(txn.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={STATUS_LABELS[txn.match_status] || txn.match_status}
                              color={STATUS_COLORS[txn.match_status] || 'default'}
                              icon={txn.match_status === 'matched'
                                ? <CheckCircleIcon style={{ fontSize: 14 }} />
                                : <RadioButtonUncheckedIcon style={{ fontSize: 14 }} />}
                            />
                          </TableCell>
                          <TableCell>
                            {txn.match_status === 'matched' && txn.match_type ? (
                              <Chip
                                size="small" variant="outlined"
                                label={`${txn.match_type === 'invoice' ? '🧾 Invoice' : '💸 Expense'}`}
                                color={txn.match_type === 'invoice' ? 'primary' : 'secondary'}
                              />
                            ) : '—'}
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                              {txn.match_status !== 'matched' ? (
                                <>
                                  <Tooltip title="Match to invoice/expense">
                                    <IconButton size="small" color="primary" onClick={() => openMatchDlg(txn)}>
                                      <LinkIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  {txn.amount < 0 && (
                                    <Tooltip title="Create expense record">
                                      <IconButton size="small" color="secondary" onClick={() => openExpDlg(txn)}>
                                        <AddIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </>
                              ) : (
                                <Tooltip title="Unmatch">
                                  <IconButton size="small" color="warning" onClick={() => handleUnmatch(txn)}>
                                    <LinkOffIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => handleDelete(txn)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* ────────────── TAB 1: UPLOAD ────────────────────────────────── */}
          {tab === 1 && (
            <Box sx={{ p: 3, maxWidth: 640, mx: 'auto' }}>
              <Typography variant="h6" gutterBottom>Import Bank Statement</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload a CSV or QIF file exported from your bank. Transactions will be parsed and
                auto-matched to open invoices and expenses where possible.
              </Typography>

              {/* Bank account selector */}
              {bankAccounts.length > 0 && (
                <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                  <InputLabel>Link to Bank Account (optional)</InputLabel>
                  <Select
                    label="Link to Bank Account (optional)"
                    value={bankAccountId}
                    onChange={e => setBankAccountId(e.target.value)}
                  >
                    <MenuItem value="">None</MenuItem>
                    {bankAccounts.map(a => (
                      <MenuItem key={a.id} value={a.id}>{a.bank_name} – {a.account_name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Drop zone */}
              <Box
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileRef.current?.click()}
                sx={{
                  border: '2px dashed',
                  borderColor: dragOver ? 'primary.main' : 'grey.300',
                  borderRadius: 3,
                  p: 5,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: dragOver ? 'primary.50' : 'grey.50',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'primary.light', bgcolor: 'primary.50' },
                }}
              >
                <input
                  ref={fileRef} type="file" accept=".csv,.qif"
                  style={{ display: 'none' }} onChange={handleFileDrop}
                />
                <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                {uploadFile ? (
                  <>
                    <Typography variant="h6" color="primary.main">{uploadFile.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(uploadFile.size / 1024).toFixed(1)} KB — click to change
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="subtitle1" gutterBottom>Drag & drop your file here</Typography>
                    <Typography variant="body2" color="text.secondary">
                      or click to browse — supports <strong>.csv</strong> and <strong>.qif</strong>
                    </Typography>
                  </>
                )}
              </Box>

              {/* Format hints */}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'info.50', borderRadius: 2, border: '1px solid', borderColor: 'info.200' }}>
                <Typography variant="caption" color="info.dark" fontWeight={600}>Supported CSV columns:</Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  <code>Date, Description, Debit, Credit</code> &nbsp;or&nbsp; <code>Date, Description, Amount, Balance</code>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  QIF files (Quicken Interchange Format) are also supported.
                </Typography>
              </Box>

              {uploading && <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />}

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained" size="large" startIcon={<UploadFileIcon />}
                  onClick={handleUpload} disabled={!uploadFile || uploading}
                  sx={{ flex: 1 }}
                >
                  {uploading ? 'Importing…' : 'Import Statement'}
                </Button>
                <Button variant="outlined" size="large" onClick={() => setUploadFile(null)} disabled={uploading || !uploadFile}>
                  Clear
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      {/* ── MATCH DIALOG ───────────────────────────────────────────────────── */}
      <Dialog open={matchDlg} onClose={() => setMatchDlg(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Match Transaction
          <Typography variant="body2" color="text.secondary">
            {matchTxn?.description} — {fmt(matchTxn?.amount)}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Match Type</InputLabel>
              <Select label="Match Type" value={matchType} onChange={e => { setMatchType(e.target.value); setSelectedMatch(null); }}>
                <MenuItem value="invoice">Invoice</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small" fullWidth placeholder={`Search ${matchType}s…`}
              value={matchSearch} onChange={e => setMatchSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            />
          </Box>

          {matchLoading ? (
            <Box sx={{ py: 3, textAlign: 'center' }}><CircularProgress size={28} /></Box>
          ) : matchables.length === 0 ? (
            <Alert severity="info">
              No open {matchType}s found{matchSearch ? ` matching "${matchSearch}"` : ''}.
            </Alert>
          ) : (
            <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
              {matchables.map(item => {
                const isSelected = selectedMatch?.id === item.id;
                return (
                  <Box
                    key={item.id}
                    onClick={() => setSelectedMatch(item)}
                    sx={{
                      p: 1.5, mb: 1, borderRadius: 2, cursor: 'pointer', border: '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'grey.200',
                      bgcolor: isSelected ? 'primary.50' : 'background.paper',
                      '&:hover': { borderColor: 'primary.light', bgcolor: 'primary.50' },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        {matchType === 'invoice' ? (
                          <>
                            <Typography variant="subtitle2">{item.invoice_number}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Balance due: {fmt(item.balance_due)} · {item.status}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography variant="subtitle2">{item.vendor_name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {fmtDate(item.date)} · {item.category}
                            </Typography>
                          </>
                        )}
                      </Box>
                      <Typography variant="subtitle2" fontWeight={700} color={matchType === 'invoice' ? 'primary.main' : 'error.main'}>
                        {fmt(matchType === 'invoice' ? item.balance_due : item.amount)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMatchDlg(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveMatch} disabled={!selectedMatch} startIcon={<LinkIcon />}>
            Confirm Match
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── CREATE EXPENSE DIALOG ──────────────────────────────────────────── */}
      <Dialog open={expDlg} onClose={() => setExpDlg(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create Expense</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Creating expense from: <strong>{expTxn?.description}</strong> ({fmt(expTxn?.amount)})
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TextField
            fullWidth size="small" label="Vendor / Payee" sx={{ mb: 2 }}
            value={expForm.vendor_name} onChange={e => setExpForm(f => ({ ...f, vendor_name: e.target.value }))}
          />
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select label="Category" value={expForm.category}
              onChange={e => setExpForm(f => ({ ...f, category: e.target.value }))}>
              {EXPENSE_CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            fullWidth size="small" label="Notes" multiline rows={2}
            value={expForm.notes} onChange={e => setExpForm(f => ({ ...f, notes: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpDlg(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={handleCreateExpense} disabled={expLoading || !expForm.vendor_name}>
            {expLoading ? 'Creating…' : 'Create Expense'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── TOAST ─────────────────────────────────────────────────────────── */}
      <Snackbar
        open={toast.open} autoHideDuration={5000}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast(t => ({ ...t, open: false }))} sx={{ width: '100%' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default BankReconciliation;
