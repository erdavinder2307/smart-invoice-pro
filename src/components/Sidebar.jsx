import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LogoutIcon from "@mui/icons-material/Logout";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import BusinessIcon from "@mui/icons-material/Business";
import "./Sidebar.css";
import authService from "../services/authService";

const navItems = [
  { text: "Dashboard", icon: <HomeIcon />, path: "/dashboard" },
  { text: "Customers", icon: <PeopleIcon />, path: "/customers", badge: null },
  { text: "Invoices", icon: <ReceiptIcon />, path: "/invoices", badge: "new" },
  { text: "Products", icon: <Inventory2Icon />, path: "/products", badge: null },
  { text: "Stock Control", icon: <SyncAltIcon />, path: "/stock-adjustment", badge: "5" },
];

const drawerWidth = 260;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
          color: 'white',
          border: 'none',
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
        },
      }}
    >
      {/* Logo/Brand Section */}
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <BusinessIcon sx={{ fontSize: 32, color: '#60a5fa', mr: 1 }} />
          <Typography variant="h6" fontWeight={700} color="white">
            Smart Invoice
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Professional Edition
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, py: 2 }}>
        <List sx={{ px: 2 }}>
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  color: location.pathname === item.path ? 'white' : 'rgba(255,255,255,0.8)',
                  background: location.pathname === item.path 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
                    : 'transparent',
                  '&:hover': {
                    background: location.pathname === item.path 
                      ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                      : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    transform: 'translateX(4px)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'transparent',
                  },
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: 'inherit',
                    minWidth: 40
                  }}
                >
                  {item.badge ? (
                    <Badge 
                      badgeContent={item.badge} 
                      color={item.badge === 'new' ? 'success' : 'error'}
                      variant={item.badge === 'new' ? 'dot' : 'standard'}
                    >
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={React.useMemo(() => ({
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    fontSize: '0.95rem'
                  }), [location.pathname, item.path])}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* User Profile & Logout Section */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ 
          p: 2, 
          mb: 2,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.05)',
          textAlign: 'center'
        }}>
          <Typography variant="body2" fontWeight={600} color="white" gutterBottom>
            Admin User
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            admin@smartinvoice.com
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ 
            borderColor: 'rgba(255,255,255,0.3)',
            color: 'rgba(255,255,255,0.9)',
            borderRadius: 2,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#fca5a5',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Sign out
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
