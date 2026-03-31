import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import adminAuthService from '../services/adminAuthService';

const AdminHeader = () => {
  const navigate = useNavigate();
  const user = adminAuthService.getUser();

  const handleLogout = async () => {
    await adminAuthService.logout();
    navigate('/admin/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: '#1a1a2e',
      }}
    >
      <Toolbar>
        <AdminPanelSettingsIcon sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700 }}>
          Super Admin Console
        </Typography>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={user.username}
              color="primary"
              size="small"
              variant="outlined"
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
            />
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              size="small"
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;
