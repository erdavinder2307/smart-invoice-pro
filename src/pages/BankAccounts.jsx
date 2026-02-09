import React, { useEffect, useState } from "react";
import {
    getBankAccounts,
} from "../services/bankAccountService";
import Sidebar from "../components/Sidebar";
import {
    Box,
    Button,
    Typography,
    Paper,
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useTheme } from "@mui/material/styles";

const BankAccounts = () => {
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const theme = useTheme();

    const filteredAccounts = bankAccounts.filter(account =>
        account.bank_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.account_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.account_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        setLoading(true);
        setError("");
        try {
            const data = await getBankAccounts();
            setBankAccounts(data);
        } catch (err) {
            setError("Failed to fetch bank accounts. Please try again.");
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBankAccounts();
    }, []);

    const handleView = (account) => {
        navigate(`/bank-accounts/${account.id}`);
    };

    const handleImportStatement = (account) => {
        // Placeholder for future implementation
        alert(`Import statement for ${account.bank_name} - Coming soon!`);
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "grey.50" }}>
            <Sidebar />
            <Box component="main" sx={{ flex: 1, width: 0, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{
                    bgcolor: 'white',
                    borderBottom: '1px solid',
                    borderColor: 'grey.300',
                    px: { xs: 1.5, md: 2.5 },
                    py: 1.5,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Box>
                            <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom sx={{ mb: 0.5 }}>
                                Bank Accounts
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Manage your bank accounts and import statements
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Main Content */}
                <Box sx={{ flex: 1, p: { xs: 1.5, md: 2.5 }, bgcolor: "grey.50", overflowY: "auto" }}>
                    <Grid container spacing={2}>
                        {/* Stats Cards */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Card
                                elevation={0}
                                sx={{
                                    border: '1px solid',
                                    borderColor: 'grey.200',
                                    borderRadius: 4,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                    color: 'white',
                                    transition: 'transform 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                    }
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <AccountBalanceIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                                    <Typography variant="h4" fontWeight={700} gutterBottom>
                                        {bankAccounts.length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Total Accounts
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card
                                elevation={0}
                                sx={{
                                    border: '1px solid',
                                    borderColor: 'grey.200',
                                    borderRadius: 4,
                                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                    color: 'white',
                                    transition: 'transform 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                    }
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <AccountBalanceIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                                    <Typography variant="h4" fontWeight={700} gutterBottom>
                                        {bankAccounts.filter(acc => acc.status === 'active').length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Active Accounts
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

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
                                            Bank Account Management
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            View and manage all your connected bank accounts
                                        </Typography>
                                    </Box>
                                </Box>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<AddIcon />}
                                    onClick={() => alert('Add account functionality - Coming soon!')}
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
                                    Add Bank Account
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
                            <TableContainer sx={{
                                borderRadius: 3,
                                overflow: 'hidden',
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
                                                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                                    <AccountBalanceIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                                                    <Typography variant="h5" color="text.secondary" gutterBottom fontWeight={600}>
                                                        No bank accounts yet
                                                    </Typography>
                                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                                        Get started by adding your first bank account
                                                    </Typography>
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<AddIcon />}
                                                        onClick={() => alert('Add account functionality - Coming soon!')}
                                                        sx={{
                                                            borderRadius: 2,
                                                            px: 3,
                                                            py: 1.2,
                                                            fontWeight: 600,
                                                            textTransform: 'none',
                                                        }}
                                                    >
                                                        Add Your First Account
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredAccounts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                    <AccountBalanceIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                                        No accounts found
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Try adjusting your search criteria
                                                    </Typography>
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
                                                                <Tooltip title="View Details">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleView(account)}
                                                                        sx={{
                                                                            color: 'primary.main',
                                                                            bgcolor: 'primary.50',
                                                                            '&:hover': {
                                                                                bgcolor: 'primary.100',
                                                                                transform: 'scale(1.1)'
                                                                            },
                                                                            transition: 'all 0.2s ease'
                                                                        }}
                                                                    >
                                                                        <VisibilityIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Import Statement">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleImportStatement(account)}
                                                                        sx={{
                                                                            color: 'success.main',
                                                                            bgcolor: 'success.50',
                                                                            '&:hover': {
                                                                                bgcolor: 'success.100',
                                                                                transform: 'scale(1.1)'
                                                                            },
                                                                            transition: 'all 0.2s ease'
                                                                        }}
                                                                    >
                                                                        <UploadFileIcon fontSize="small" />
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
            </Box>
        </Box>
    );
};

export default BankAccounts;
