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
import { useTheme } from "@mui/material/styles";
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
  const theme = useTheme();

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
          background: `linear-gradient(180deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`,
          color: 'white',
          border: 'none',
          boxShadow: `4px 0 20px ${theme.palette.grey[900]}40`
        },
      }}
    >
      {/* Logo/Brand Section */}
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          borderBottom: `1px solid ${theme.palette.grey[700]}`,
          background: `${theme.palette.grey[800]}60`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <BusinessIcon sx={{ fontSize: 32, color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="h6" fontWeight={700} color="white">
            Smart Invoice
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: theme.palette.grey[400] }}>
          Professional Edition
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, py: 2 }}>
        <List sx={{ px: 2 }}>
          {navItems.map((item) => {
            const isSelected = location.pathname === item.path;
            const primaryTypographyProps = {
              fontWeight: isSelected ? 600 : 500,
              fontSize: '0.95rem'
            };

            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    color: isSelected ? 'white' : theme.palette.grey[300],
                    background: isSelected 
                      ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)` 
                      : 'transparent',
                    '&:hover': {
                      background: isSelected 
                        ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.darker || theme.palette.primary.dark} 100%)`
                        : `${theme.palette.grey[700]}40`,
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
                    primaryTypographyProps={primaryTypographyProps}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Profile & Logout Section */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.grey[700]}` }}>
        <Box sx={{ 
          p: 2, 
          mb: 2,
          borderRadius: 2,
          background: `${theme.palette.grey[800]}60`,
          textAlign: 'center'
        }}>
          <Typography variant="body2" fontWeight={600} color="white" gutterBottom>
            Admin User
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.grey[400] }}>
            admin@smartinvoice.com
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ 
            borderColor: theme.palette.grey[600],
            color: theme.palette.grey[300],
            borderRadius: 2,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              borderColor: theme.palette.error.main,
              backgroundColor: `${theme.palette.error.main}20`,
              color: theme.palette.error.light,
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
