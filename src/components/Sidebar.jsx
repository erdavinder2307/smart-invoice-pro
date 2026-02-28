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
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useAuth } from "../context/AuthContext";

const DRAWER_EXPANDED = 256;
const DRAWER_COLLAPSED = 72;

// ── Sidebar colours (shared) ─────────────────────────────────────────────────
const ICON_DEFAULT = "rgba(255,255,255,0.65)";
const ICON_ACTIVE = "common.white";
const TEXT_DEFAULT = "rgba(255,255,255,0.85)";
const TEXT_ACTIVE = "common.white";
const BG_HOVER = "grey.800";
const BG_ACTIVE = "primary.main";
const BG_ACTIVE_DARK = "primary.dark";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { logout } = useAuth();

  // ── Sidebar collapse (localStorage-persisted) ────────────────────────────
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );

  // ── Sales submenu collapse ───────────────────────────────────────────────
  const salesPaths = ["/customers", "/invoices"];
  const [salesOpen, setSalesOpen] = useState(() => {
    const stored = localStorage.getItem("salesMenuOpen");
    if (stored !== null) return stored === "true";
    return salesPaths.some((p) => location.pathname.startsWith(p));
  });

  // ── Logout dialog ────────────────────────────────────────────────────────
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const drawerWidth = isCollapsed ? DRAWER_COLLAPSED : DRAWER_EXPANDED;

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("sidebarCollapsed", String(next));
  };

  // Auto-collapse on small screens
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

  // Keep Sales open when navigating to a sales route
  useEffect(() => {
    if (salesPaths.some((p) => location.pathname.startsWith(p))) {
      setSalesOpen(true);
      localStorage.setItem("salesMenuOpen", "true");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Persist salesOpen state
  const toggleSalesMenu = () => {
    const next = !salesOpen;
    setSalesOpen(next);
    localStorage.setItem("salesMenuOpen", String(next));
  };

  // ── User info ─────────────────────────────────────────────────────────────
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const username = storedUser.username || "Admin User";
  const email = storedUser.email || "admin@smartinvoice.com";
  const initials = username.charAt(0).toUpperCase();

  // ── Logout handlers ───────────────────────────────────────────────────────
  const handleLogoutClick = () => setShowLogoutDialog(true);
  const handleLogoutCancel = () => setShowLogoutDialog(false);
  const handleLogoutConfirm = () => { setShowLogoutDialog(false); logout(); navigate("/"); };

  // ── Shared drawer paper sx ────────────────────────────────────────────────
  const drawerPaperSx = {
    width: drawerWidth,
    bgcolor: "grey.900",
    "& .MuiTypography-root": { color: TEXT_DEFAULT },
    "& .MuiListItemIcon-root": { color: ICON_DEFAULT },
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

  // ── Shared nav-button sx factory ─────────────────────────────────────────
  const navBtnSx = (isActive) => ({
    borderRadius: 2,
    py: 1.25,
    px: isCollapsed ? 0 : 1.5,
    justifyContent: isCollapsed ? "center" : "flex-start",
    minHeight: 48,
    mb: 0.5,
    bgcolor: isActive ? BG_ACTIVE : "transparent",
    transition: "background-color 0.15s ease",
    "& .MuiListItemIcon-root": {
      color: isActive ? ICON_ACTIVE : ICON_DEFAULT,
    },
    "& .MuiListItemText-primary": {
      color: isActive ? TEXT_ACTIVE : TEXT_DEFAULT,
      fontWeight: isActive ? 600 : 500,
      fontSize: "0.9rem",
    },
    "&:hover": {
      bgcolor: isActive ? BG_ACTIVE_DARK : BG_HOVER,
      "& .MuiListItemIcon-root": { color: "common.white" },
      "& .MuiListItemText-primary": { color: "common.white" },
    },
    "&.Mui-selected": { bgcolor: BG_ACTIVE, "&:hover": { bgcolor: BG_ACTIVE_DARK } },
    "&.Mui-selected.MuiListItemButton-root": { bgcolor: BG_ACTIVE },
  });

  // ── Render a simple flat nav button ──────────────────────────────────────
  const renderNavBtn = ({ text, icon, path, badge }) => {
    const isActive = location.pathname === path;
    const iconNode = badge ? (
      <Badge
        badgeContent={badge}
        color={badge === "new" ? "success" : "error"}
        variant={badge === "new" ? "dot" : "standard"}
      >
        {icon}
      </Badge>
    ) : icon;

    const btn = (
      <ListItemButton
        selected={isActive}
        onClick={() => navigate(path)}
        sx={navBtnSx(isActive)}
      >
        <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40, justifyContent: "center" }}>
          {iconNode}
        </ListItemIcon>
        {!isCollapsed && <ListItemText primary={text} />}
      </ListItemButton>
    );

    return (
      <ListItem key={text} disablePadding>
        {isCollapsed ? (
          <Tooltip title={text} placement="right" arrow>{btn}</Tooltip>
        ) : btn}
      </ListItem>
    );
  };

  // ── Sales sub-items ───────────────────────────────────────────────────────
  const salesChildren = [
    { text: "Customers", icon: <PeopleIcon />, path: "/customers" },
    { text: "Invoices", icon: <ReceiptIcon />, path: "/invoices", badge: "new" },
  ];

  const isSalesActive = salesPaths.some((p) => location.pathname.startsWith(p));

  // ── Sales parent button ───────────────────────────────────────────────────
  const salesParentBtn = (
    <ListItemButton
      onClick={() => {
        if (isCollapsed) {
          // In collapsed mode navigate to first sales child
          navigate("/customers");
        } else {
          toggleSalesMenu();
        }
      }}
      sx={{
        ...navBtnSx(isSalesActive && isCollapsed),
        mb: 0, // no bottom margin — children follow immediately
      }}
    >
      <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40, justifyContent: "center" }}>
        <PointOfSaleIcon />
      </ListItemIcon>
      {!isCollapsed && (
        <>
          <ListItemText primary="Sales" />
          {salesOpen ? (
            <ExpandLessIcon sx={{ fontSize: 18, color: TEXT_DEFAULT, mr: 0.5 }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 18, color: TEXT_DEFAULT, mr: 0.5 }} />
          )}
        </>
      )}
    </ListItemButton>
  );

  // ── Flat navigation items (non-Sales) ─────────────────────────────────────
  const flatNavItems = [
    { text: "Products", icon: <Inventory2Icon />, path: "/products" },
    { text: "Stock Control", icon: <SyncAltIcon />, path: "/stock-adjustment", badge: "5" },
    { text: "Bank Accounts", icon: <AccountBalanceIcon />, path: "/bank-accounts" },
  ];

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
                Professional Edition
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
            py: 0.5,
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
        <Box sx={{ flex: 1, py: 1.5, overflowY: "auto", overflowX: "hidden" }}>
          <List sx={{ px: isCollapsed ? 0.75 : 1.5 }} disablePadding>

            {/* Dashboard */}
            {renderNavBtn({ text: "Dashboard", icon: <HomeIcon />, path: "/dashboard" })}

            {/* ── Sales Group ─────────────────────────────────────────── */}
            <ListItem disablePadding sx={{ flexDirection: "column", alignItems: "stretch" }}>
              {isCollapsed ? (
                <Tooltip title="Sales" placement="right" arrow>
                  {salesParentBtn}
                </Tooltip>
              ) : salesParentBtn}

              {/* Subitems — shown only in expanded mode */}
              {!isCollapsed && (
                <Collapse in={salesOpen} timeout="auto" unmountOnExit>
                  <List disablePadding sx={{ pl: 1.5 }}>
                    {salesChildren.map(({ text, icon, path, badge }) => {
                      const isActive = location.pathname.startsWith(path);
                      const iconNode = badge ? (
                        <Badge
                          badgeContent={badge}
                          color="success"
                          variant="dot"
                        >
                          {icon}
                        </Badge>
                      ) : icon;

                      return (
                        <ListItem key={text} disablePadding>
                          <ListItemButton
                            selected={isActive}
                            onClick={() => navigate(path)}
                            sx={{
                              borderRadius: 2,
                              py: 1,
                              px: 1.5,
                              minHeight: 44,
                              mb: 0.5,
                              ml: 1,                    // indent under Sales
                              bgcolor: isActive ? BG_ACTIVE : "transparent",
                              transition: "background-color 0.15s ease",
                              "& .MuiListItemIcon-root": {
                                color: isActive ? ICON_ACTIVE : ICON_DEFAULT,
                              },
                              "& .MuiListItemText-primary": {
                                color: isActive ? TEXT_ACTIVE : TEXT_DEFAULT,
                                fontWeight: isActive ? 600 : 400,
                                fontSize: "0.875rem",
                              },
                              "&:hover": {
                                bgcolor: isActive ? BG_ACTIVE_DARK : BG_HOVER,
                                "& .MuiListItemIcon-root": { color: "common.white" },
                                "& .MuiListItemText-primary": { color: "common.white" },
                              },
                              "&.Mui-selected": {
                                bgcolor: BG_ACTIVE,
                                "&:hover": { bgcolor: BG_ACTIVE_DARK },
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 36, justifyContent: "center" }}>
                              {iconNode}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}

                    {/* Coming soon placeholders */}
                    {[
                      { text: "Quotes (Coming Soon)" },
                      { text: "Recurring (Coming Soon)" },
                    ].map(({ text }) => (
                      <ListItem key={text} disablePadding>
                        <ListItemButton
                          disabled
                          sx={{
                            borderRadius: 2,
                            py: 0.75,
                            px: 1.5,
                            ml: 1,
                            mb: 0.25,
                            "& .MuiListItemText-primary": {
                              fontSize: "0.8rem",
                              color: "grey.600",
                              fontStyle: "italic",
                            },
                            "& .MuiListItemIcon-root": { color: "grey.700" },
                          }}
                        >
                          <ListItemText primary={text} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </ListItem>

            {/* ── Remaining flat items ─────────────────────────────────── */}
            {flatNavItems.map((item) => renderNavBtn(item))}
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
