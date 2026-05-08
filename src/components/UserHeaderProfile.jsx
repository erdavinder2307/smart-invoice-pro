
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    IconButton,
    Tooltip,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    Dashboard,
    Logout,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Person
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const UserHeaderProfile = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleDashboard = () => {
        handleCloseUserMenu();
        navigate('/dashboard');
    };

    const handleProfile = () => {
        handleCloseUserMenu();
        navigate('/profile');
    };

    const handleSettings = () => {
        handleCloseUserMenu();
        navigate('/settings');
    };

    const handleLogoutClick = () => {
        handleCloseUserMenu();
        setShowLogoutDialog(true);
    };

    const handleLogoutConfirm = () => {
        setShowLogoutDialog(false);
        logout();
        navigate('/');
    };

    const handleLogoutCancel = () => {
        setShowLogoutDialog(false);
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                        <Avatar
                            alt={user?.name || user?.username || "User"}
                            src={user?.profile_image || user?.avatar}
                            sx={{
                                bgcolor: 'primary.main',
                                background: user?.profile_image || user?.avatar
                                    ? 'transparent'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                width: 40,
                                height: 40,
                                border: '2px solid',
                                borderColor: 'grey.300'
                            }}
                        >
                            {!user?.profile_image && !user?.avatar && (
                                user?.name || user?.username ? ((user?.name || user?.username).split(/\s+/)[0].charAt(0) + (((user?.name || user?.username).split(/\s+/).length > 1) ? (user?.name || user?.username).split(/\s+/)[((user?.name || user?.username).split(/\s+/).length - 1)].charAt(0) : '')).toUpperCase() : <Person />
                            )}
                        </Avatar>
                    </IconButton>
                </Tooltip>
                <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                    PaperProps={{
                        elevation: 3,
                        sx: {
                            borderRadius: 2,
                            minWidth: 180,
                            overflow: 'visible',
                            mt: 1.5,
                            '&:before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        }
                    }}
                >
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                            {user?.name || user?.username || 'User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            User Account
                        </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={handleDashboard}>
                        <ListItemIcon>
                            <Dashboard fontSize="small" />
                        </ListItemIcon>
                        Dashboard
                    </MenuItem>
                    <MenuItem onClick={handleProfile}>
                        <ListItemIcon>
                            <PersonIcon fontSize="small" />
                        </ListItemIcon>
                        Profile
                    </MenuItem>
                    <MenuItem onClick={handleSettings}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        Settings
                    </MenuItem>
                    <MenuItem onClick={handleLogoutClick}>
                        <ListItemIcon>
                            <Logout fontSize="small" color="error" />
                        </ListItemIcon>
                        <Typography color="error">Logout</Typography>
                    </MenuItem>
                </Menu>
            </Box>

            {/* Logout Confirmation Dialog */}
            <Dialog
                open={showLogoutDialog}
                onClose={handleLogoutCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirm Sign Out"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to sign out of your account?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleLogoutCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleLogoutConfirm} color="error" variant="contained" autoFocus>
                        Sign Out
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default UserHeaderProfile;
