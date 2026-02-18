import React, { useState, useEffect } from "react";
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
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LogoutIcon from "@mui/icons-material/Logout";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import BusinessIcon from "@mui/icons-material/Business";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuIcon from "@mui/icons-material/Menu";
import "../styles/components/sidebar.css";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { text: "Dashboard", icon: <HomeIcon />, path: "/dashboard" },
  { text: "Customers", icon: <PeopleIcon />, path: "/customers", badge: null },
  { text: "Invoices", icon: <ReceiptIcon />, path: "/invoices", badge: "new" },
  { text: "Products", icon: <Inventory2Icon />, path: "/products", badge: null },
  { text: "Stock Control", icon: <SyncAltIcon />, path: "/stock-adjustment", badge: "5" },
  { text: "Bank Accounts", icon: <AccountBalanceIcon />, path: "/bank-accounts", badge: null },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { logout } = useAuth();

  // Sidebar collapse state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  // Sign-out confirmation dialog state
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Dynamic drawer width based on collapse state
  const drawerWidth = isCollapsed ? 80 : 260;

  // Toggle sidebar collapse/expand
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  };

  // Auto-collapse on mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !isCollapsed) {
        setIsCollapsed(true);
        localStorage.setItem('sidebarCollapsed', 'true');
      }
    };

    // Check on mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed]);

  // Logout handlers with confirmation
  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    logout(); // Use AuthContext logout instead of authService
    navigate('/');
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  return (
    <>
      <Drawer
        variant="permanent"
        className="sidebar-drawer"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            background: `linear-gradient(180deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`,
            boxShadow: `4px 0 20px ${theme.palette.grey[900]}40`,
          },
        }}
        classes={{
          paper: 'sidebar-drawer-paper'
        }}
      >
        {/* Logo/Brand Section */}
        <Box
          className="sidebar-logo-section"
          sx={{
            p: isCollapsed ? 2 : 3,
            borderBottom: `1px solid ${theme.palette.grey[700]}`,
            background: `${theme.palette.grey[800]}60`,
          }}
        >
          <Box
            className="sidebar-logo-container"
            sx={{ mb: isCollapsed ? 0 : 1 }}
          >
            <BusinessIcon
              className="sidebar-logo-icon"
              sx={{
                color: theme.palette.primary.main,
                mr: isCollapsed ? 0 : 1
              }}
            />
            {!isCollapsed && (
              <Typography variant="h6" className="sidebar-logo-text">
                Smart Invoice
              </Typography>
            )}
          </Box>
          {!isCollapsed && (
            <Typography
              variant="caption"
              className="sidebar-subtitle"
              sx={{ color: theme.palette.grey[400] }}
            >
              Professional Edition
            </Typography>
          )}
        </Box>

        {/* Collapse Toggle Button */}
        <Box
          className={`sidebar-toggle-container ${isCollapsed ? 'sidebar-toggle-container--collapsed' : 'sidebar-toggle-container--expanded'}`}
          sx={{
            borderBottom: `1px solid ${theme.palette.grey[700]}`
          }}
        >
          <Tooltip title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right" arrow>
            <IconButton
              onClick={toggleSidebar}
              size="small"
              className="sidebar-toggle-button"
              sx={{
                color: theme.palette.grey[400],
                '&:hover': {
                  color: theme.palette.primary.main,
                  backgroundColor: `${theme.palette.primary.main}20`
                }
              }}
            >
              {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Navigation Menu */}
        <Box className="sidebar-nav-container">
          <List className={isCollapsed ? 'sidebar-nav-list--collapsed' : 'sidebar-nav-list--expanded'}>
            {navItems.map((item) => {
              const isSelected = location.pathname === item.path;
              const primaryTypographyProps = {
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.95rem',
                // Explicitly set color to override MUI defaults
                color: isSelected ? 'white' : 'rgba(255, 255, 255, 0.85)'
              };

              const menuButton = (
                <ListItemButton
                  selected={isSelected}
                  onClick={() => navigate(item.path)}
                  className={`sidebar-menu-button ${isCollapsed ? 'sidebar-menu-button--collapsed' : 'sidebar-menu-button--expanded'}`}
                  sx={{
                    // Enhanced text visibility: white with opacity for inactive, pure white for active
                    color: isSelected ? 'white' : 'rgba(255, 255, 255, 0.85)',
                    background: isSelected
                      ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                      : 'transparent',
                    '&:hover': {
                      background: isSelected
                        ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.darker || theme.palette.primary.dark} 100%)`
                        : `${theme.palette.grey[700]}60`,
                      color: 'white',
                      // Add left border indicator on hover
                      borderLeft: `3px solid ${theme.palette.primary.main}`
                    },
                    // Enhanced focus state for keyboard navigation
                    '&:focus-visible': {
                      outline: `2px solid ${theme.palette.primary.light}`,
                      backgroundColor: `${theme.palette.primary.main}30`
                    },
                  }}
                >
                  <ListItemIcon
                    className={`sidebar-menu-icon ${isCollapsed ? 'sidebar-menu-icon--collapsed' : 'sidebar-menu-icon--expanded'}`}
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
                  {!isCollapsed && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={primaryTypographyProps}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: isSelected ? 'white !important' : 'rgba(255, 255, 255, 0.85) !important'
                        }
                      }}
                    />
                  )}
                </ListItemButton>
              );

              return (
                <ListItem key={item.text} disablePadding className="sidebar-menu-item">
                  {isCollapsed ? (
                    <Tooltip title={item.text} placement="right" arrow>
                      {menuButton}
                    </Tooltip>
                  ) : (
                    menuButton
                  )}
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* User Profile & Logout Section */}
        <Box
          className="sidebar-user-section"
          sx={{
            p: isCollapsed ? 1 : 2,
            borderTop: `1px solid ${theme.palette.grey[700]}`
          }}
        >
          {!isCollapsed && (
            <Box
              className="sidebar-user-profile"
              sx={{
                background: `${theme.palette.grey[800]}60`,
              }}
            >
              {(() => {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const username = user.username || 'Admin User';
                const email = user.email || 'admin@smartinvoice.com';

                return (
                  <>
                    <Typography variant="body2" className="sidebar-user-name" gutterBottom>
                      {username}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.grey[400] }}
                    >
                      {email}
                    </Typography>
                  </>
                );
              })()}
            </Box>
          )}

          {/* Sign Out Button */}
          {isCollapsed ? (
            <Tooltip title="Sign out" placement="right" arrow>
              <IconButton
                onClick={handleLogoutClick}
                className="sidebar-signout-button-icon"
                sx={{
                  color: theme.palette.grey[300],
                  '&:hover': {
                    backgroundColor: `${theme.palette.error.main}20`,
                    color: theme.palette.error.light,
                  },
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              variant="outlined"
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={handleLogoutClick}
              className="sidebar-signout-button"
              sx={{
                borderColor: theme.palette.grey[600],
                color: theme.palette.grey[300],
                '&:hover': {
                  borderColor: theme.palette.error.main,
                  backgroundColor: `${theme.palette.error.main}20`,
                  color: theme.palette.error.light,
                },
              }}
            >
              Sign out
            </Button>
          )}
        </Box>
      </Drawer>

      {/* Sign Out Confirmation Dialog */}
      <Dialog
        open={showLogoutDialog}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        PaperProps={{
          className: 'sidebar-dialog-paper'
        }}
      >
        <DialogTitle id="logout-dialog-title" className="sidebar-dialog-title">
          Confirm Sign Out
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to sign out? You will need to log in again to access your dashboard.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="sidebar-dialog-actions">
          <Button
            onClick={handleLogoutCancel}
            variant="outlined"
            className="sidebar-dialog-button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            color="error"
            autoFocus
            className="sidebar-dialog-button"
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar;
