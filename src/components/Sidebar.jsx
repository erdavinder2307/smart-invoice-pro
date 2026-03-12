import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";

// ── Icons ────────────────────────────────────────────────────────────────────
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PeopleIcon from "@mui/icons-material/People";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import ReceiptIcon from "@mui/icons-material/Receipt";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import BusinessIcon from "@mui/icons-material/Business";

import { useAuth } from "../context/AuthContext";

// ── Constants ────────────────────────────────────────────────────────────────
// ── Constants ────────────────────────────────────────────────────────────────
const DRAWER_EXPANDED = 256;
const DRAWER_COLLAPSED = 72;

// ── Navigation Configuration ─────────────────────────────────────────────────
const NAV_CONFIG = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  items: {
    id: 'items',
    label: 'Items',
    icon: <Inventory2Icon />,
    path: '/products',
  },
  sales: {
    id: 'sales',
    label: 'Sales',
    icon: <PointOfSaleIcon />,
    expandable: true,
    children: [
      { id: 'customers', label: 'Customers', icon: <PeopleIcon />, path: '/customers' },
      { id: 'quotes', label: 'Quotes', icon: <RequestQuoteIcon />, path: '/quotes' },
      { id: 'invoices', label: 'Invoices', icon: <ReceiptIcon />, path: '/invoices' },
      { id: 'recurring', label: 'Recurring Invoices', icon: <EventRepeatIcon />, path: '/recurring-profiles' },
    ],
  },
  purchases: {
    id: 'purchases',
    label: 'Purchases',
    icon: <ShoppingCartIcon />,
    expandable: true,
    children: [
      { id: 'vendors', label: 'Vendors', icon: <LocalShippingIcon />, path: '/vendors' },
      { id: 'purchase-orders', label: 'Purchase Orders', icon: <ShoppingCartIcon />, path: '/purchase-orders' },
      { id: 'bills', label: 'Bills', icon: <AssignmentIcon />, path: '/bills' },
    ],
  },
  banking: {
    id: 'banking',
    label: 'Banking',
    icon: <AccountBalanceIcon />,
    expandable: true,
    children: [
      { id: 'bank-accounts', label: 'Bank Accounts', icon: <AccountBalanceIcon />, path: '/bank-accounts' },
    ],
  },
  reports: {
    id: 'reports',
    label: 'Reports',
    icon: <AssessmentIcon />,
    path: '/reports',
  },
  settings: {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings/users',
    adminOnly: true,
  },
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { logout, isAdmin } = useAuth();

  // ── Sidebar collapse state (persisted) ───────────────────────────────────
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );

  // ── Expanded sections state (persisted per section) ──────────────────────
  const [expandedSections, setExpandedSections] = useState(() => {
    const stored = localStorage.getItem("navExpandedSections");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }
    // Auto-expand section based on current route
    const autoExpand = {};
    Object.entries(NAV_CONFIG).forEach(([key, config]) => {
      if (config.expandable && config.children) {
        const isActive = config.children.some(child => 
          location.pathname.startsWith(child.path)
        );
        autoExpand[key] = isActive;
      }
    });
    return autoExpand;
  });

  // ── Logout dialog ────────────────────────────────────────────────────────
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const drawerWidth = isCollapsed ? DRAWER_COLLAPSED : DRAWER_EXPANDED;

  // ── Toggle sidebar collapse ──────────────────────────────────────────────
  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("sidebarCollapsed", String(next));
  };

  // ── Toggle section expansion ─────────────────────────────────────────────
  const toggleSection = (sectionId) => {
    const next = { ...expandedSections, [sectionId]: !expandedSections[sectionId] };
    setExpandedSections(next);
    localStorage.setItem("navExpandedSections", JSON.stringify(next));
  };

  // ── Auto-expand section when navigating to child route ───────────────────
  useEffect(() => {
    Object.entries(NAV_CONFIG).forEach(([key, config]) => {
      if (config.expandable && config.children) {
        const isActive = config.children.some(child => 
          location.pathname.startsWith(child.path)
        );
        if (isActive && !expandedSections[key]) {
          setExpandedSections(prev => {
            const next = { ...prev, [key]: true };
            localStorage.setItem("navExpandedSections", JSON.stringify(next));
            return next;
          });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // ── Auto-collapse on small screens ───────────────────────────────────────
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 768 && !isCollapsed) {
        setIsCollapsed(true);
        localStorage.setItem("sidebarCollapsed", "true");
      }
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isCollapsed]);

  // ── User info ─────────────────────────────────────────────────────────────
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const username = storedUser.username || "Admin User";
  const email = storedUser.email || "admin@smartinvoice.com";
  const initials = username.charAt(0).toUpperCase();

  // ── Logout handlers ───────────────────────────────────────────────────────
  const handleLogoutClick = () => setShowLogoutDialog(true);
  const handleLogoutCancel = () => setShowLogoutDialog(false);
  const handleLogoutConfirm = () => { 
    setShowLogoutDialog(false); 
    logout(); 
    navigate("/"); 
  };

  // ── Check if path is active ───────────────────────────────────────────────
  const isPathActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // ── Check if section has active child ─────────────────────────────────────
  const isSectionActive = (section) => {
    if (!section.expandable || !section.children) return false;
    return section.children.some(child => isPathActive(child.path));
  };

  // ── Drawer styles ─────────────────────────────────────────────────────────
  const drawerPaperSx = {
    width: drawerWidth,
    bgcolor: "grey.900",
    border: "none",
    boxSizing: "border-box",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.standard,
    }),
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  // ── Nav button styles ─────────────────────────────────────────────────────
  const navButtonSx = (isActive, isChild = false) => ({
    borderRadius: 1.5,
    py: 1.25,
    px: isCollapsed ? 0 : (isChild ? 1.5 : 2),
    pl: isCollapsed ? 0 : (isChild ? 3.5 : 2),
    justifyContent: isCollapsed ? "center" : "flex-start",
    minHeight: isChild ? 40 : 44,
    mb: 0.5,
    bgcolor: isActive ? "primary.main" : "transparent",
    color: isActive ? "common.white" : "rgba(255,255,255,0.7)",
    transition: "all 0.2s ease",
    "& .MuiListItemIcon-root": {
      minWidth: isCollapsed ? 0 : (isChild ? 32 : 40),
      justifyContent: "center",
      color: isActive ? "common.white" : "rgba(255,255,255,0.65)",
    },
    "& .MuiListItemText-primary": {
      fontSize: isChild ? "0.8125rem" : "0.875rem",
      fontWeight: isActive ? 600 : 500,
      color: isActive ? "common.white" : "rgba(255,255,255,0.85)",
    },
    "&:hover": {
      bgcolor: isActive ? "primary.dark" : "rgba(255,255,255,0.08)",
      "& .MuiListItemIcon-root": { color: "common.white" },
      "& .MuiListItemText-primary": { color: "common.white" },
    },
  });

  // ── Render simple nav item ────────────────────────────────────────────────
  const renderNavItem = (config, isChild = false) => {
    if (config.adminOnly && !isAdmin) return null;
    
    const isActive = isPathActive(config.path);
    
    const button = (
      <ListItemButton
        onClick={() => navigate(config.path)}
        sx={navButtonSx(isActive, isChild)}
      >
        <ListItemIcon>{config.icon}</ListItemIcon>
        {!isCollapsed && <ListItemText primary={config.label} />}
      </ListItemButton>
    );

    return (
      <ListItem key={config.id} disablePadding>
        {isCollapsed ? (
          <Tooltip title={config.label} placement="right" arrow>
            {button}
          </Tooltip>
        ) : button}
      </ListItem>
    );
  };

  // ── Render expandable section ─────────────────────────────────────────────
  const renderExpandableSection = (sectionKey, config) => {
    const isExpanded = expandedSections[sectionKey] || false;
    const hasActiveChild = isSectionActive(config);

    const parentButton = (
      <ListItemButton
        onClick={() => {
          if (isCollapsed) {
            // In collapsed mode, navigate to first child
            if (config.children && config.children.length > 0) {
              navigate(config.children[0].path);
            }
          } else {
            toggleSection(sectionKey);
          }
        }}
        sx={{
          ...navButtonSx(hasActiveChild && isCollapsed, false),
          mb: isCollapsed ? 0.5 : 0,
        }}
      >
        <ListItemIcon>{config.icon}</ListItemIcon>
        {!isCollapsed && (
          <>
            <ListItemText primary={config.label} />
            {isExpanded ? (
              <ExpandLessIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.65)" }} />
            ) : (
              <ExpandMoreIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.65)" }} />
            )}
          </>
        )}
      </ListItemButton>
    );

    return (
      <ListItem key={sectionKey} disablePadding sx={{ flexDirection: "column", alignItems: "stretch" }}>
        {isCollapsed ? (
          <Tooltip title={config.label} placement="right" arrow>
            {parentButton}
          </Tooltip>
        ) : parentButton}

        {/* Children - only shown in expanded mode */}
        {!isCollapsed && config.children && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List disablePadding>
              {config.children.map(child => renderNavItem(child, true))}
            </List>
          </Collapse>
        )}
      </ListItem>
    );
  };

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          flexShrink: 0,
          width: drawerWidth,
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          "& .MuiDrawer-paper": drawerPaperSx,
        }}
      >
        {/* ── Brand / Logo ─────────────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            gap: 1.5,
            px: isCollapsed ? 1.5 : 2.5,
            py: 2.5,
            borderBottom: "1px solid",
            borderColor: "grey.800",
          }}
        >
          <BusinessIcon sx={{ fontSize: 28, color: "primary.main", flexShrink: 0 }} />
          {!isCollapsed && (
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="common.white" lineHeight={1.2}>
                Smart Invoice
              </Typography>
              <Typography variant="caption" sx={{ color: "grey.500" }}>
                Pro Edition
              </Typography>
            </Box>
          )}
        </Box>

        {/* ── Collapse Toggle ───────────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            justifyContent: isCollapsed ? "center" : "flex-end",
            px: 1,
            py: 0.75,
            borderBottom: "1px solid",
            borderColor: "grey.800",
          }}
        >
          <Tooltip title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right" arrow>
            <IconButton
              onClick={toggleSidebar}
              size="small"
              sx={{
                color: "grey.500",
                "&:hover": { color: "primary.main", bgcolor: "grey.800" },
                borderRadius: 1.5,
              }}
            >
              {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* ── Navigation List ───────────────────────────────────────────── */}
        <Box sx={{ flex: 1, py: 2, overflowY: "auto", overflowX: "hidden" }}>
          <List sx={{ px: isCollapsed ? 1 : 1.5 }} disablePadding>
            {/* Dashboard */}
            {renderNavItem(NAV_CONFIG.dashboard)}

            {/* Items */}
            {renderNavItem(NAV_CONFIG.items)}

            {/* Sales - expandable */}
            {renderExpandableSection('sales', NAV_CONFIG.sales)}

            {/* Purchases - expandable */}
            {renderExpandableSection('purchases', NAV_CONFIG.purchases)}

            {/* Banking - expandable */}
            {renderExpandableSection('banking', NAV_CONFIG.banking)}

            {/* Reports */}
            {renderNavItem(NAV_CONFIG.reports)}

            {/* Settings (admin only) */}
            {renderNavItem(NAV_CONFIG.settings)}
          </List>
        </Box>

        {/* ── User Profile + Logout ──────────────────────────────────────── */}
        <Divider sx={{ borderColor: "grey.800" }} />
        <Box sx={{ p: isCollapsed ? 1 : 2 }}>
          {/* Profile row (expanded only) */}
          {!isCollapsed && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 1.5,
                p: 1.5,
                borderRadius: 2,
                bgcolor: "grey.800",
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "primary.main",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} color="common.white" noWrap>
                  {username}
                </Typography>
                <Typography variant="caption" sx={{ color: "grey.500" }} noWrap>
                  {email}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Logout */}
          {isCollapsed ? (
            <Tooltip title="Sign out" placement="right" arrow>
              <IconButton
                onClick={handleLogoutClick}
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  py: 1.25,
                  color: "grey.500",
                  "&:hover": { bgcolor: "error.900", color: "error.light" },
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
              sx={{
                borderRadius: 2,
                py: 1,
                fontWeight: 600,
                textTransform: "none",
                borderColor: "grey.700",
                color: "grey.400",
                "&:hover": {
                  borderColor: "error.main",
                  bgcolor: "error.900",
                  color: "error.light",
                },
              }}
            >
              Sign out
            </Button>
          )}
        </Box>
      </Drawer>

      {/* ── Logout Confirmation Dialog ──────────────────────────────────────── */}
      <Dialog
        open={showLogoutDialog}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        PaperProps={{ sx: { borderRadius: 3, minWidth: 380 } }}
      >
        <DialogTitle id="logout-dialog-title" sx={{ fontWeight: 600 }}>
          Confirm Sign Out
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to sign out? You will need to log in again to access your dashboard.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleLogoutCancel}
            variant="outlined"
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            color="error"
            autoFocus
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar;
