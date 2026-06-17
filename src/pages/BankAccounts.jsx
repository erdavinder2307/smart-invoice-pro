import React, { useEffect, useMemo, useState } from "react";
import {
    getBankAccounts,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
} from "../services/bankAccountService";
import MainLayout from "../components/Layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Chip,
    Avatar,
    InputAdornment,
    TextField,
    Fade,
    Card,
    CardContent,
    Grid,
    Tooltip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from "@mui/material/styles";
import EmptyState from '../components/common/EmptyState';
import ListSummary from '../components/list/ListSummary';
import buildSummaryFilterItems from '../utils/summaryFilterChips';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const BankAccounts = () => {
    const navigate = useNavigate();
    const fallbackUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch {
            return null;
        }
    }, []);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState('All');
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [addForm, setAddForm] = useState({ bank_name: '', account_name: '', account_type: 'current', status: 'active' });
    const [addLoading, setAddLoading] = useState(false);
    const [editAccount, setEditAccount] = useState(null);
    const [editForm, setEditForm] = useState({ bank_name: '', account_name: '', account_type: '' });
    const [editLoading, setEditLoading] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const theme = useTheme();
    const authValue = useAuth?.() || {};
    const user = authValue.user || fallbackUser || null;
    const { t } = useTranslation();

    const activeCount = bankAccounts.filter(acc => acc.status === 'active').length;
    const inactiveCount = bankAccounts.length - activeCount;

    const filteredAccounts = bankAccounts.filter(account => {
        const matchesSearch =
            account.bank_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.account_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.account_type?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === 'All' ? true :
            statusFilter === 'Active' ? account.status === 'active' :
            account.status !== 'active';
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'success';
            case 'error': return 'error';
            default: return 'default';
        }
    };

    const getAccountTypeColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'savings': return 'info';
            case 'current': return 'primary';
            case 'credit': return 'warning';
            default: return 'default';
        }
    };

    const fetchBankAccounts = async () => {
        if (!user?.id) return;
        setLoading(true);
        setError("");
        try {
            const data = await getBankAccounts(user.id);
            setBankAccounts(data);
        } catch (err) {
            setError("Failed to fetch bank accounts. Please try again.");
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBankAccounts();
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleOpenAddDialog = () => {
        setError('');
        setAddForm({ bank_name: '', account_name: '', account_type: 'current', status: 'active' });
        setAddDialogOpen(true);
    };

    const handleAddSave = async () => {
        if (!addForm.bank_name || !addForm.account_name || !addForm.account_type) {
            setError('Please fill all required fields.');
            return;
        }

        setAddLoading(true);
        try {
            await createBankAccount(addForm, user?.id);
            setAddDialogOpen(false);
            await fetchBankAccounts();
        } catch {
            setError('Failed to create bank account. Please try again.');
        } finally {
            setAddLoading(false);
        }
    };

    const handleImportStatement = (account) => {
        navigate('/bank-import', {
            state: {
                bankAccountId: account?.id || '',
            },
        });
    };

    const handleEditOpen = (account) => {
        setEditAccount(account);
        setEditForm({
            bank_name: account.bank_name || '',
            account_name: account.account_name || '',
            account_type: account.account_type || '',
        });
    };

    const handleEditSave = async () => {
        if (!editAccount) return;
        setEditLoading(true);
        try {
            await updateBankAccount(editAccount.id, editForm, user?.id);
            setEditAccount(null);
            await fetchBankAccounts();
        } catch {
            setError(t('bankAccounts.failedUpdate'));
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await deleteBankAccount(id, user?.id);
            setConfirmDeleteId(null);
            await fetchBankAccounts();
        } catch {
            setError(t('bankAccounts.failedDelete'));
            setLoading(false);
        }
    };

    return (
        <MainLayout title={t('bankAccounts.title')} subtitle={t('bankAccounts.subtitle')}>
            <Box sx={{ flex: 1, width: '100%' }}>
                {/* Clickable summary chips */}
                <ListSummary
                    items={buildSummaryFilterItems({
                        activeFilter: statusFilter,
                        allFilterValue: 'All',
                        onFilterChange: setStatusFilter,
                        filteredCount: filteredAccounts.length,
                        viewAllValue: bankAccounts.length,
                        chips: [
                            { label: t('bankAccounts.totalAccounts'), value: bankAccounts.length, filterValue: 'All' },
                            { label: t('bankAccounts.activeAccounts'), value: activeCount,         color: 'success', filterValue: 'Active' },
                            { label: 'Inactive',                       value: inactiveCount,        color: 'default', filterValue: 'Inactive' },
                        ],
                    })}
                />

                {/* Main Card */}
                <Card elevation={0} sx={{
                    borderRadius: 4,
                    mt: 3,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}>
                    <CardContent sx={{ p: 4 }}>
                        {/* Header Section */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{
                                    bgcolor: 'primary.main',
                                    width: 56,
                                    height: 56,
                                }}>
                                    <AccountBalanceIcon sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
                                        {t('bankAccounts.management')}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {t('bankAccounts.managementSubtitle')}
                                    </Typography>
                                </Box>
                            </Box>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<AddIcon />}
                                onClick={handleOpenAddDialog}
                                sx={{
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1.5,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                    boxShadow: '0 8px 24px rgba(102,126,234,0.3)',
                                    '&:hover': {
                                        boxShadow: '0 12px 32px rgba(102,126,234,0.4)',
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {t('bankAccounts.addButton')}
                            </Button>
                        </Box>

                        {/* Search */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Search by bank name, account name, or type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            bgcolor: 'grey.50',
                                            '&:hover': {
                                                bgcolor: 'grey.100',
                                            },
                                            '&.Mui-focused': {
                                                bgcolor: 'white',
                                                boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        {error && (
                            <Fade in={!!error}>
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 3,
                                        borderRadius: 2,
                                        '& .MuiAlert-icon': { fontSize: 24 }
                                    }}
                                >
                                    {error}
                                </Alert>
                            </Fade>
                        )}

                        {/* Table */}
                        <TableContainer className="tour-banking-accounts" sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            overflowX: 'hidden',
                            border: '1px solid',
                            borderColor: 'grey.200',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                        }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{
                                        bgcolor: 'grey.50',
                                        '& .MuiTableCell-head': {
                                            fontWeight: 700,
                                            color: 'text.primary',
                                            fontSize: '0.95rem',
                                            borderBottom: '2px solid',
                                            borderColor: 'grey.200',
                                            py: 2
                                        }
                                    }}>
                                        <TableCell>Bank Name</TableCell>
                                        <TableCell>Account Name</TableCell>
                                        <TableCell>Account Type</TableCell>
                                        <TableCell>Last Imported</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="center" width={180}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                <CircularProgress size={40} />
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                                    Loading bank accounts...
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredAccounts.length === 0 && !searchTerm ? (
                                        <TableRow>
                                            <TableCell colSpan={6}>
                                                <EmptyState
                                                    icon={<AccountBalanceIcon />}
                                                    title="No bank accounts yet"
                                                    subtitle="Get started by adding your first bank account"
                                                    action={{ label: 'Add Your First Account', onClick: handleOpenAddDialog }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredAccounts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6}>
                                                <EmptyState
                                                    icon={<AccountBalanceIcon />}
                                                    title="No accounts found"
                                                    subtitle="Try adjusting your search criteria"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredAccounts.map((account, index) => (
                                            <Fade in={true} timeout={300 + index * 100} key={account.id}>
                                                <TableRow sx={{
                                                    '&:hover': {
                                                        bgcolor: 'grey.50',
                                                        transform: 'scale(1.001)',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    },
                                                    transition: 'all 0.2s ease',
                                                    '& .MuiTableCell-root': {
                                                        borderBottom: '1px solid',
                                                        borderColor: 'grey.100',
                                                        py: 2
                                                    }
                                                }}>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={2}>
                                                            <Avatar sx={{
                                                                bgcolor: 'primary.50',
                                                                color: 'primary.main',
                                                                width: 40,
                                                                height: 40
                                                            }}>
                                                                <AccountBalanceIcon fontSize="small" />
                                                            </Avatar>
                                                            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                                                {account.bank_name}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" color="text.primary" fontWeight={500}>
                                                            {account.account_name}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={account.account_type}
                                                            size="small"
                                                            color={getAccountTypeColor(account.account_type)}
                                                            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {account.last_imported_at ? new Date(account.last_imported_at).toLocaleDateString() : 'Never'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={account.status}
                                                            size="small"
                                                            color={getStatusColor(account.status)}
                                                            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                            <Tooltip title="Edit">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleEditOpen(account)}
                                                                    sx={{
                                                                        color: 'primary.main',
                                                                        bgcolor: 'primary.50',
                                                                        '&:hover': { bgcolor: 'primary.100' },
                                                                    }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Import Statement">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleImportStatement(account)}
                                                                    sx={{
                                                                        color: 'success.main',
                                                                        bgcolor: 'success.50',
                                                                        '&:hover': { bgcolor: 'success.100' },
                                                                    }}
                                                                >
                                                                    <UploadFileIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => setConfirmDeleteId(account.id)}
                                                                    sx={{
                                                                        color: 'error.main',
                                                                        bgcolor: 'error.50',
                                                                        '&:hover': { bgcolor: 'error.100' },
                                                                    }}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            </Fade>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Box>

            {/* Add Dialog */}
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Add Bank Account</DialogTitle>
                <DialogContent sx={{ pt: '12px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Bank Name"
                        fullWidth
                        size="small"
                        value={addForm.bank_name}
                        onChange={(e) => setAddForm((f) => ({ ...f, bank_name: e.target.value }))}
                    />
                    <TextField
                        label="Account Name"
                        fullWidth
                        size="small"
                        value={addForm.account_name}
                        onChange={(e) => setAddForm((f) => ({ ...f, account_name: e.target.value }))}
                    />
                    <FormControl fullWidth size="small">
                        <InputLabel>Account Type</InputLabel>
                        <Select
                            label="Account Type"
                            value={addForm.account_type}
                            onChange={(e) => setAddForm((f) => ({ ...f, account_type: e.target.value }))}
                        >
                            {['savings', 'current', 'credit', 'cash'].map((t) => (
                                <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                            label="Status"
                            value={addForm.status}
                            onChange={(e) => setAddForm((f) => ({ ...f, status: e.target.value }))}
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setAddDialogOpen(false)} disabled={addLoading}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddSave} disabled={addLoading}>
                        {addLoading ? 'Creating…' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editAccount} onClose={() => setEditAccount(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Edit Bank Account</DialogTitle>
                <DialogContent sx={{ pt: '12px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Bank Name"
                        fullWidth
                        size="small"
                        value={editForm.bank_name}
                        onChange={(e) => setEditForm((f) => ({ ...f, bank_name: e.target.value }))}
                    />
                    <TextField
                        label="Account Name"
                        fullWidth
                        size="small"
                        value={editForm.account_name}
                        onChange={(e) => setEditForm((f) => ({ ...f, account_name: e.target.value }))}
                    />
                    <FormControl fullWidth size="small">
                        <InputLabel>Account Type</InputLabel>
                        <Select
                            label="Account Type"
                            value={editForm.account_type}
                            onChange={(e) => setEditForm((f) => ({ ...f, account_type: e.target.value }))}
                        >
                            {['savings', 'current', 'credit', 'cash'].map((t) => (
                                <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setEditAccount(null)} disabled={editLoading}>Cancel</Button>
                    <Button variant="contained" onClick={handleEditSave} disabled={editLoading}>
                        {editLoading ? 'Saving…' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Bank Account</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this bank account? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={() => handleDelete(confirmDeleteId)}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </MainLayout>
    );
};

export default BankAccounts;
