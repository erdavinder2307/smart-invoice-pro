import React, { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/profileService";
import { getReminderSettings, saveReminderSettings } from "../services/reminderService";
import {
    Box,
    Button,
    TextField,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Avatar,
    InputAdornment,
    Tabs,
    Tab,
    Fade,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Switch,
    FormControlLabel,
    Snackbar,
    Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/Layout/MainLayout";

import { useAuth } from "../context/AuthContext";
import {
    Save as SaveIcon,
    Business as BusinessIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationOnIcon,
    Person as PersonIcon,
    AccountCircle as AccountCircleIcon,
    Settings as SettingsIcon,
    Cancel as CancelIcon,
    NotificationsActive as NotificationsActiveIcon,
} from "@mui/icons-material";


const Profile = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [activeTab, setActiveTab] = useState(0);

    // Reminder settings state
    const [reminders, setReminders] = useState({
        reminders_enabled: true,
        before_due_days: [3],
        after_due_days: [1, 3, 7],
    });
    const [reminderSaving, setReminderSaving] = useState(false);
    const [reminderToast, setReminderToast] = useState({ open: false, message: '', severity: 'success' });

    const BEFORE_OPTIONS = [1, 2, 3, 5, 7, 10, 14];
    const AFTER_OPTIONS  = [1, 2, 3, 5, 7, 10, 14, 21, 30];

    const toggleDay = (field, day) => {
        setReminders(prev => {
            const current = prev[field] || [];
            const next = current.includes(day)
                ? current.filter(d => d !== day)
                : [...current, day].sort((a, b) => a - b);
            return { ...prev, [field]: next };
        });
    };

    const handleSaveReminders = async () => {
        setReminderSaving(true);
        try {
            await saveReminderSettings(reminders);
            setReminderToast({ open: true, message: 'Reminder settings saved successfully.', severity: 'success' });
        } catch (err) {
            setReminderToast({ open: true, message: 'Failed to save reminder settings.', severity: 'error' });
        } finally {
            setReminderSaving(false);
        }
    };

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        business_name: "",
        gstin: "",
        address: "",
        business_logo_url: "",
        default_currency: "INR",
        date_format: "DD/MM/YYYY",
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const [data, reminderData] = await Promise.all([
                    getProfile(),
                    getReminderSettings().catch(() => null),
                ]);
                setForm({
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    business_name: data.business_name || "",
                    gstin: data.gstin || "",
                    address: data.address || "",
                    business_logo_url: data.business_logo_url || "",
                    default_currency: data.default_currency || "INR",
                    date_format: data.date_format || "DD/MM/YYYY",
                });
                if (reminderData) {
                    setReminders({
                        reminders_enabled: reminderData.reminders_enabled ?? true,
                        before_due_days:   reminderData.before_due_days ?? [3],
                        after_due_days:    reminderData.after_due_days  ?? [1, 3, 7],
                    });
                };
            } catch (err) {
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await updateProfile(form);
            setSuccess("Profile updated successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/dashboard');
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'grey.50' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
        <MainLayout title="My Profile" subtitle="Manage your account and business information">
            <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
                {/* Main Content Card */}
                <Card elevation={0} sx={{
                    borderRadius: 4,
                    overflow: 'visible',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: 1000,
                    mx: 'auto'
                }}>
                    <CardContent sx={{ p: 4 }}>
                        {/* Header Section */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{
                                    bgcolor: 'primary.main',
                                    width: 56,
                                    height: 56,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}>
                                    <AccountCircleIcon sx={{ fontSize: 32 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                                        My Profile
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Manage your account and business information
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Success/Error Messages */}
                        {success && (
                            <Fade in={!!success}>
                                <Alert
                                    severity="success"
                                    sx={{
                                        mb: 3,
                                        borderRadius: 2,
                                        '& .MuiAlert-icon': { fontSize: 24 }
                                    }}
                                >
                                    {success}
                                </Alert>
                            </Fade>
                        )}

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

                        {/* Tabs */}
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                            <Tabs value={activeTab} onChange={handleTabChange} aria-label="profile tabs">
                                <Tab label="Basic Info" icon={<PersonIcon />} iconPosition="start" />
                                <Tab label="Business Info" icon={<BusinessIcon />} iconPosition="start" />
                                <Tab label="Preferences" icon={<SettingsIcon />} iconPosition="start" />
                                <Tab label="Payment Reminders" icon={<NotificationsActiveIcon />} iconPosition="start" />
                            </Tabs>
                        </Box>

                        <Box component="form" onSubmit={handleSubmit} autoComplete="off">
                            {/* Tab Panel 0: Basic Info */}
                            {activeTab === 0 && (
                                <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PersonIcon color="primary" />
                                            Basic Information
                                        </Typography>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Full Name"
                                                    name="name"
                                                    value={form.name}
                                                    onChange={handleChange}
                                                    required
                                                    fullWidth
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <PersonIcon fontSize="small" color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            bgcolor: 'grey.50',
                                                            '&:hover': { bgcolor: 'grey.100' },
                                                            '&.Mui-focused': {
                                                                bgcolor: 'white',
                                                                boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Email Address"
                                                    name="email"
                                                    type="email"
                                                    value={form.email}
                                                    onChange={handleChange}
                                                    required
                                                    fullWidth
                                                    InputProps={{
                                                        readOnly: true,
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <EmailIcon fontSize="small" color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    helperText="Email cannot be changed"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            bgcolor: 'grey.100',
                                                            '&.Mui-focused': {
                                                                boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Phone Number"
                                                    name="phone"
                                                    value={form.phone}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <PhoneIcon fontSize="small" color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            bgcolor: 'grey.50',
                                                            '&:hover': { bgcolor: 'grey.100' },
                                                            '&.Mui-focused': {
                                                                bgcolor: 'white',
                                                                boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Tab Panel 1: Business Info */}
                            {activeTab === 1 && (
                                <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <BusinessIcon color="primary" />
                                            Business Information
                                        </Typography>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Business Name"
                                                    name="business_name"
                                                    value={form.business_name}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <BusinessIcon fontSize="small" color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            bgcolor: 'grey.50',
                                                            '&:hover': { bgcolor: 'grey.100' },
                                                            '&.Mui-focused': {
                                                                bgcolor: 'white',
                                                                boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="GSTIN"
                                                    name="gstin"
                                                    value={form.gstin}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    placeholder="22AAAAA0000A1Z5"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            bgcolor: 'grey.50',
                                                            '&:hover': { bgcolor: 'grey.100' },
                                                            '&.Mui-focused': {
                                                                bgcolor: 'white',
                                                                boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Business Address"
                                                    name="address"
                                                    value={form.address}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                                                                <LocationOnIcon fontSize="small" color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            bgcolor: 'grey.50',
                                                            '&:hover': { bgcolor: 'grey.100' },
                                                            '&.Mui-focused': {
                                                                bgcolor: 'white',
                                                                boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                                    Business logo upload will be available in a future update
                                                </Alert>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Tab Panel 2: Preferences */}
                            {activeTab === 2 && (
                                <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <SettingsIcon color="primary" />
                                            Preferences
                                        </Typography>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Default Currency</InputLabel>
                                                    <Select
                                                        label="Default Currency"
                                                        name="default_currency"
                                                        value={form.default_currency}
                                                        onChange={handleChange}
                                                        sx={{
                                                            borderRadius: 2,
                                                            bgcolor: 'grey.50',
                                                            '&.Mui-focused': {
                                                                boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                                                            }
                                                        }}
                                                    >
                                                        <MenuItem value="INR">INR (₹)</MenuItem>
                                                        <MenuItem value="USD">USD ($)</MenuItem>
                                                        <MenuItem value="EUR">EUR (€)</MenuItem>
                                                        <MenuItem value="GBP">GBP (£)</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Date Format</InputLabel>
                                                    <Select
                                                        label="Date Format"
                                                        name="date_format"
                                                        value={form.date_format}
                                                        onChange={handleChange}
                                                        sx={{
                                                            borderRadius: 2,
                                                            bgcolor: 'grey.50',
                                                            '&.Mui-focused': {
                                                                boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                                                            }
                                                        }}
                                                    >
                                                        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                                                        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                                                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Tab Panel 3: Payment Reminders */}
                            {activeTab === 3 && (
                                <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <NotificationsActiveIcon color="primary" />
                                            Payment Reminders
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                            Automatically email customers about upcoming and overdue invoices.
                                        </Typography>

                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={reminders.reminders_enabled}
                                                    onChange={(e) => setReminders(p => ({ ...p, reminders_enabled: e.target.checked }))}
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Typography fontWeight={600}>
                                                    {reminders.reminders_enabled ? 'Reminders Enabled' : 'Reminders Disabled'}
                                                </Typography>
                                            }
                                            sx={{ mb: 3 }}
                                        />

                                        <Box sx={{ opacity: reminders.reminders_enabled ? 1 : 0.45, pointerEvents: reminders.reminders_enabled ? 'auto' : 'none' }}>
                                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Before Due Date</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Send a reminder N days before the invoice is due.</Typography>
                                            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
                                                {BEFORE_OPTIONS.map(d => (
                                                    <Chip
                                                        key={d}
                                                        label={`${d} day${d !== 1 ? 's' : ''}`}
                                                        onClick={() => toggleDay('before_due_days', d)}
                                                        color={reminders.before_due_days.includes(d) ? 'primary' : 'default'}
                                                        variant={reminders.before_due_days.includes(d) ? 'filled' : 'outlined'}
                                                        clickable
                                                    />
                                                ))}
                                            </Stack>

                                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>After Due Date (Overdue)</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Send a follow-up reminder N days after the invoice is overdue.</Typography>
                                            <Stack direction="row" flexWrap="wrap" gap={1}>
                                                {AFTER_OPTIONS.map(d => (
                                                    <Chip
                                                        key={d}
                                                        label={`${d} day${d !== 1 ? 's' : ''}`}
                                                        onClick={() => toggleDay('after_due_days', d)}
                                                        color={reminders.after_due_days.includes(d) ? 'error' : 'default'}
                                                        variant={reminders.after_due_days.includes(d) ? 'filled' : 'outlined'}
                                                        clickable
                                                    />
                                                ))}
                                            </Stack>
                                        </Box>

                                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="contained"
                                                startIcon={reminderSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                                                onClick={handleSaveReminders}
                                                disabled={reminderSaving}
                                                sx={{
                                                    borderRadius: 2,
                                                    px: 3,
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)' },
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {reminderSaving ? 'Saving…' : 'Save Reminder Settings'}
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Action Buttons */}
                            <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
                                <Button
                                    variant="outlined"
                                    startIcon={<CancelIcon />}
                                    onClick={handleCancel}
                                    disabled={saving}
                                    sx={{
                                        borderRadius: 2,
                                        px: 3,
                                        py: 1.5,
                                        borderColor: 'grey.300',
                                        color: 'text.secondary',
                                        '&:hover': {
                                            borderColor: 'grey.400',
                                            bgcolor: 'grey.50'
                                        }
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    disabled={saving}
                                    sx={{
                                        borderRadius: 2,
                                        px: 3,
                                        py: 1.5,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                                            boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
                                        }
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </MainLayout>

        <Snackbar
            open={reminderToast.open}
            autoHideDuration={4000}
            onClose={() => setReminderToast(t => ({ ...t, open: false }))}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert
                onClose={() => setReminderToast(t => ({ ...t, open: false }))}
                severity={reminderToast.severity}
                sx={{ width: '100%' }}
            >
                {reminderToast.message}
            </Alert>
        </Snackbar>
        </>
    );
};

export default Profile;
