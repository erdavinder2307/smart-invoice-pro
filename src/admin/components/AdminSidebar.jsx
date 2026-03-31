import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import FlagIcon from '@mui/icons-material/Flag';
import BarChartIcon from '@mui/icons-material/BarChart';

const DRAWER_WIDTH = 240;

const MENU_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Tenants', icon: <BusinessIcon />, path: '/admin/tenants' },
  { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
  { text: 'Feature Flags', icon: <FlagIcon />, path: '/admin/feature-flags' },
  { text: 'System Stats', icon: <BarChartIcon />, path: '/admin/stats' },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: '#16213e',
          color: '#fff',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Navigation
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List>
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={isActive}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'rgba(37, 99, 235, 0.2)',
                    '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.3)' },
                  },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                  color: isActive ? '#60a5fa' : '#fff',
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.6)', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export { DRAWER_WIDTH, MENU_ITEMS };
export default AdminSidebar;
