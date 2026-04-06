import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Popover from "@mui/material/Popover";
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

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";

import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { NAV_CONFIG } from "../config/navConfig";
import Logo from "./common/Logo";
import { BRANDING } from "../config/branding";

// ── Constants ────────────────────────────────────────────────────────────────
const DRAWER_EXPANDED = 256;
const DRAWER_COLLAPSED = 72;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { logout, isAdmin } = useAuth();
  const {
    isCollapsed,
    toggleSidebar,
    mobileOpen,
    setMobileOpen,
    isMobile,
  } = useSidebar();
  const isDesktopCollapsed = !isMobile && isCollapsed;

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
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [popoverKey, setPopoverKey] = useState(null);

  const drawerWidth = isDesktopCollapsed ? DRAWER_COLLAPSED : DRAWER_EXPANDED;

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

  // ── Close transient navigation surfaces on route change ─────────────────
  useEffect(() => {
    setMobileOpen(false);
    setPopoverAnchor(null);
    setPopoverKey(null);
  }, [location.pathname, setMobileOpen]);

  // ── User info ─────────────────────────────────────────────────────────────
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const username = storedUser.username || "Admin User";
  const email = storedUser.email || "admin@solidevbooks.com";
  const initials = username.charAt(0).toUpperCase();

  // ── Logout handlers ───────────────────────────────────────────────────────
  const handleLogoutClick = () => setShowLogoutDialog(true);
  const handleLogoutCancel = () => setShowLogoutDialog(false);
  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    logout();
    navigate("/");
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
    setPopoverKey(null);
  };

  const handleNavigate = (path) => {
    handlePopoverClose();
    setMobileOpen(false);
    navigate(path);
  };

  // ── Check if path is active ───────────────────────────────────────────────
  const isPathActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  // ── Check if section has active child ─────────────────────────────────────
  const isSectionActive = (section) => {
    if (!section.expandable || !section.children) return false;
    return section.children.some((child) => isPathActive(child.path));
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
  const navButtonSx = (isActive, isChild = false, forceExpanded = false) => ({
    borderRadius: 1.5,
    py: isChild ? 1 : 1.25,
    px: isDesktopCollapsed && !forceExpanded ? 0 : isChild ? 1.5 : 2,
    pl: isDesktopCollapsed && !forceExpanded ? 0 : isChild ? 3.5 : 2,
    justifyContent: isDesktopCollapsed && !forceExpanded ? "center" : "flex-start",
    minHeight: isChild ? 40 : 44,
    mb: 0.5,
    bgcolor: isActive ? "primary.main" : "transparent",
    color: isActive ? "common.white" : "rgba(255,255,255,0.7)",
    transition: "all 0.2s ease",
    "& .MuiListItemIcon-root": {
      minWidth: isDesktopCollapsed && !forceExpanded ? 0 : isChild ? 32 : 40,
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
  const renderNavItem = (config, isChild = false, forceExpanded = false) => {
    if (config.adminOnly && !isAdmin) return null;

    const showLabels = forceExpanded || !isDesktopCollapsed;
    const showTooltip = isDesktopCollapsed && !forceExpanded;
    const isActive = isPathActive(config.path);

    const button = (
      <ListItemButton
        onClick={() => handleNavigate(config.path)}
        sx={navButtonSx(isActive, isChild, forceExpanded)}
      >
        <ListItemIcon>{config.icon}</ListItemIcon>
        {showLabels && <ListItemText primary={config.label} />}
      </ListItemButton>
    );

    return (
      <ListItem key={config.id} disablePadding>
        {showTooltip ? (
          <Tooltip title={config.label} placement="right" arrow>
            {button}
          </Tooltip>
        ) : button}
      </ListItem>
    );
  };

  // ── Render expandable section ─────────────────────────────────────────────
  const renderExpandableSection = (sectionKey, config, forceExpanded = false) => {
    if (config.adminOnly && !isAdmin) return null;

    const showLabels = forceExpanded || !isDesktopCollapsed;
    const showTooltip = isDesktopCollapsed && !forceExpanded;
    const usePopover = isDesktopCollapsed && !forceExpanded;
    const isExpanded = expandedSections[sectionKey] || false;
    const hasActiveChild = isSectionActive(config);

    const parentButton = (
      <ListItemButton
        onClick={(event) => {
          if (usePopover) {
            setPopoverAnchor(event.currentTarget);
            setPopoverKey(sectionKey);
          } else {
            toggleSection(sectionKey);
          }
        }}
        sx={{
          ...navButtonSx(hasActiveChild && usePopover, false, forceExpanded),
          mb: usePopover ? 0.5 : 0,
        }}
      >
        <ListItemIcon>{config.icon}</ListItemIcon>
        {showLabels && (
          <>
            <ListItemText primary={config.label} />
            {!usePopover &&
              (isExpanded ? (
                <ExpandLessIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.65)" }} />
              ) : (
                <ExpandMoreIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.65)" }} />
              ))}
          </>
        )}
      </ListItemButton>
    );

    return (
      <ListItem key={sectionKey} disablePadding sx={{ flexDirection: "column", alignItems: "stretch" }}>
        {showTooltip ? (
          <Tooltip title={config.label} placement="right" arrow>
            {parentButton}
          </Tooltip>
        ) : parentButton}

        {/* Children - only shown in expanded mode */}
        {!usePopover && showLabels && config.children && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List disablePadding>
              {config.children.map((child) => renderNavItem(child, true, forceExpanded))}
            </List>
          </Collapse>
        )}
      </ListItem>
    );
  };

  const renderNavContent = (forceExpanded = false) => (
    <>
      {!isMobile && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: isDesktopCollapsed ? "center" : "flex-start",
            gap: 1.5,
            px: isDesktopCollapsed ? 1.5 : 2.5,
            py: 2.5,
            borderBottom: "1px solid",
            borderColor: "grey.800",
          }}
        >
          <Logo size={28} showText={false} variant="light" />
          {!isDesktopCollapsed && (
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="common.white" lineHeight={1.2}>
                {BRANDING.appName}
              </Typography>
              <Typography variant="caption" sx={{ color: "grey.500" }}>
                {BRANDING.tagline}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {!isMobile && (
        <Box
          sx={{
            display: "flex",
            justifyContent: isDesktopCollapsed ? "center" : "flex-end",
            px: 1,
            py: 0.75,
            borderBottom: "1px solid",
            borderColor: "grey.800",
          }}
        >
          <Tooltip title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right" arrow>
            <IconButton
              onClick={toggleSidebar}
              size="small"
              sx={{
                color: "grey.500",
                "&:hover": { color: "primary.main", bgcolor: "grey.800" },
                borderRadius: 1.5,
              }}
            >
              {isDesktopCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <Box sx={{ flex: 1, py: 2, overflowY: "auto", overflowX: "hidden" }}>
        <List sx={{ px: isDesktopCollapsed && !forceExpanded ? 1 : 1.5 }} disablePadding>
          {renderNavItem(NAV_CONFIG.dashboard, false, forceExpanded)}
          {renderNavItem(NAV_CONFIG.items, false, forceExpanded)}
          {renderExpandableSection("sales", NAV_CONFIG.sales, forceExpanded)}
          {renderExpandableSection("purchases", NAV_CONFIG.purchases, forceExpanded)}
          {renderExpandableSection("banking", NAV_CONFIG.banking, forceExpanded)}
          {renderNavItem(NAV_CONFIG.reports, false, forceExpanded)}
          {renderExpandableSection("settings", NAV_CONFIG.settings, forceExpanded)}
        </List>
      </Box>

      <Divider sx={{ borderColor: "grey.800" }} />
      <Box sx={{ p: isDesktopCollapsed && !forceExpanded ? 1 : 2 }}>
        {(!isDesktopCollapsed || forceExpanded) && (
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

        {isDesktopCollapsed && !forceExpanded ? (
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
    </>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              ...drawerPaperSx,
              width: DRAWER_EXPANDED,
            },
          }}
        >
          {renderNavContent(true)}
        </Drawer>
      ) : (
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
          {renderNavContent(false)}
        </Drawer>
      )}

      <Popover
        open={Boolean(popoverAnchor) && Boolean(popoverKey)}
        anchorEl={popoverAnchor}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            width: 260,
            bgcolor: "grey.900",
            color: "common.white",
            border: "1px solid",
            borderColor: "grey.700",
            boxShadow: 8,
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        {popoverKey && NAV_CONFIG[popoverKey]?.children && (
          <>
            <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "grey.800" }}>
              <Typography variant="subtitle2" fontWeight={700} color="common.white">
                {NAV_CONFIG[popoverKey].label}
              </Typography>
            </Box>
            <List sx={{ px: 1.5, py: 1 }} disablePadding>
              {NAV_CONFIG[popoverKey].children.map((child) => {
                const isActive = isPathActive(child.path);
                return (
                  <ListItem key={child.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigate(child.path)}
                      sx={navButtonSx(isActive, true, true)}
                    >
                      <ListItemIcon>{child.icon}</ListItemIcon>
                      <ListItemText primary={child.label} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </>
        )}
      </Popover>

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
