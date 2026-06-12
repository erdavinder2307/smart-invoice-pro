import React, { useState } from "react";
import {
  Box, IconButton, Tooltip, Avatar, Typography, Badge, FormControl,
  Select, MenuItem, Popover, Divider, Button, List, ListItem,
  ListItemIcon, ListItemText, ListItemButton, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import TuneIcon from "@mui/icons-material/Tune";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationDropdown from "../Notifications/NotificationDropdown";
import { useNotifications } from "../../context/NotificationContext";
import GlobalSearchInput from "../search/GlobalSearchInput";
import { useKeyboardShortcutsContext } from "../../context/KeyboardShortcutsContext";
import { useTranslation } from "react-i18next";
import { safeClick } from "../../utils/safeClick";
import { useAuth } from "../../context/AuthContext";
import { useMe } from "../../context/MeContext";
import { usePermission } from "../../context/PermissionContext";

const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

// ── Role badge ────────────────────────────────────────────────────────────────
const ROLE_COLORS = {
  Admin:      { bg: "#EFF6FF", color: "#2563EB" },
  Manager:    { bg: "#F0FDF4", color: "#16A34A" },
  Accountant: { bg: "#FFF7ED", color: "#EA580C" },
  Sales:      { bg: "#F5F3FF", color: "#7C3AED" },
};
const RoleChip = ({ role }) => {
  const s = ROLE_COLORS[role] || { bg: "#F3F4F6", color: "#6B7280" };
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", px: 1, py: 0.25, borderRadius: 1, bgcolor: s.bg, color: s.color, fontSize: "0.6875rem", fontWeight: 600, letterSpacing: 0.3 }}>
      {role || "User"}
    </Box>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const TopUtilityBar = ({ searchPlaceholder = "", onSearchChange, onMenuClick }) => {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const { me, meLoading, displayName } = useMe();
  const { unreadCount } = useNotifications();
  const { can, isAdmin: permIsAdmin } = usePermission();
  const canAccessSettings = permIsAdmin || can('settings', 'view') || can('user_management', 'view') || can('roles', 'view');
  const { openShortcutsModal } = useKeyboardShortcutsContext();
  const navigate = useNavigate();

  const [notifAnchor, setNotifAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const activeLanguage = String(i18n.language || "en").startsWith("hi") ? "hi" : "en";
  const handleLanguageChange = async (e) => {
    await i18n.changeLanguage(e.target.value);
    localStorage.setItem("app_language", e.target.value);
  };

  // Resolve display values — prefer MeContext, fall back to localStorage
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const resolvedName = displayName || storedUser.name || storedUser.username || "User";
  const resolvedInitials = (() => {
    const p = resolvedName.trim().split(/\s+/).filter(Boolean);
    return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : (p[0]?.[0]?.toUpperCase() || "U");
  })();
  const avatarUrl = me?.avatar_url || "";
  const role = me?.role || storedUser.role || "";
  const orgName = me?.organization_name || "";

  const closeMenu = () => setUserMenuAnchor(null);

  const menuItems = [
    { icon: <PersonOutlineIcon fontSize="small" />,    label: "My Profile",    action: () => navigate("/settings/my-profile") },
    { icon: <NotificationsNoneIcon fontSize="small" />, label: "Notifications", action: () => navigate("/settings/notifications") },
    { icon: <TuneIcon fontSize="small" />,             label: "Preferences",   action: () => navigate("/settings/preferences") },
    { icon: <LockOutlinedIcon fontSize="small" />,     label: "Security",      action: () => navigate("/settings/security") },
    { icon: <HelpOutlineIcon fontSize="small" />,      label: "Help Center",   action: () => window.open("https://solidevbooks.com/support", "_blank") },
  ];

  return (
    <Box sx={{ height: 56, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper", px: { xs: 1.5, md: 2.5 }, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
      {/* Left */}
      <Box sx={{ display: "flex", alignItems: "center", width: "100%", maxWidth: 560, gap: 1 }}>
        <IconButton color="inherit" onClick={safeClick(onMenuClick)} sx={{ display: { xs: "flex", md: "none" } }} aria-label={t("topBar.openNavigation")}>
          <MenuIcon fontSize="small" />
        </IconButton>
        <GlobalSearchInput placeholder={searchPlaceholder || t("topBar.searchPlaceholder")} onSearchChange={onSearchChange} />
      </Box>

      {/* Right */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
        <FormControl size="small" sx={{ minWidth: 92 }}>
          <Select value={activeLanguage} onChange={handleLanguageChange} sx={{ fontSize: "0.75rem", height: 30, "& .MuiSelect-select": { py: 0.5, pr: 3 } }} inputProps={{ "aria-label": t("common.language") }}>
            <MenuItem value="en">{t("common.english")}</MenuItem>
            <MenuItem value="hi">{t("common.hindi")}</MenuItem>
          </Select>
        </FormControl>

        <Tooltip title={t("common.notifications")}>
          <IconButton color="inherit" onClick={(e) => setNotifAnchor(e.currentTarget)}>
            <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error" max={99}>
              <NotificationsOutlinedIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>
        <NotificationDropdown anchorEl={notifAnchor} onClose={() => setNotifAnchor(null)} />

        <Tooltip title={t("topBar.keyboardShortcuts", { combo: isMac ? "⌘/" : "Ctrl+/" })}>
          <IconButton color="inherit" onClick={safeClick(openShortcutsModal)} aria-label="keyboard shortcuts">
            <KeyboardIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {canAccessSettings && (
          <Tooltip title={t("common.settings")}>
            <IconButton color="inherit" onClick={() => navigate("/settings")}>
              <SettingsOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {/* Avatar button */}
        <Tooltip title="Account">
          <IconButton onClick={(e) => setUserMenuAnchor(e.currentTarget)} sx={{ p: 0.5, ml: 0.25 }}>
            <Avatar src={avatarUrl} sx={{ width: 32, height: 32, fontSize: "0.8125rem", fontWeight: 700, bgcolor: "primary.main", background: avatarUrl ? "transparent" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              {!avatarUrl && (meLoading ? <CircularProgress size={14} color="inherit" /> : resolvedInitials)}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>

      {/* User dropdown */}
      <Popover
        open={Boolean(userMenuAnchor)}
        anchorEl={userMenuAnchor}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ elevation: 4, sx: { mt: 1, minWidth: 260, maxWidth: 300, borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" } }}
      >
        {/* Identity header */}
        <Box sx={{ px: 2, py: 2, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar src={avatarUrl} sx={{ width: 44, height: 44, fontSize: "1rem", fontWeight: 700, flexShrink: 0, bgcolor: "primary.main", background: avatarUrl ? "transparent" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              {!avatarUrl && resolvedInitials}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ lineHeight: 1.3 }}>{resolvedName}</Typography>
              {role && <Box sx={{ mt: 0.4 }}><RoleChip role={role} /></Box>}
              {orgName && <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", mt: 0.4, lineHeight: 1.3 }}>{orgName}</Typography>}
            </Box>
          </Box>
        </Box>

        {/* Menu */}
        <List dense disablePadding sx={{ py: 0.5 }}>
          {menuItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton onClick={() => { closeMenu(); item.action(); }} sx={{ px: 2, py: 0.75, "&:hover": { bgcolor: "action.hover" } }}>
                <ListItemIcon sx={{ minWidth: 32, color: "text.secondary" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ variant: "body2", fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />

        {/* Switch org (coming soon) */}
        <List dense disablePadding sx={{ py: 0.5 }}>
          <ListItem disablePadding>
            <ListItemButton disabled sx={{ px: 2, py: 0.75, opacity: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32, color: "text.disabled" }}><SwitchAccountIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Switch Organization" primaryTypographyProps={{ variant: "body2", fontWeight: 500 }} />
              <Chip label="Soon" size="small" sx={{ height: 18, fontSize: "0.625rem" }} />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider />

        {/* Sign out */}
        <Box sx={{ px: 1.5, py: 1 }}>
          <Button fullWidth variant="text" color="error" startIcon={<LogoutIcon fontSize="small" />}
            onClick={() => { closeMenu(); setShowLogoutDialog(true); }}
            sx={{ justifyContent: "flex-start", textTransform: "none", fontWeight: 600, py: 0.75, px: 1, borderRadius: 1.5, "&:hover": { bgcolor: "error.50" } }}
          >
            Sign Out
          </Button>
        </Box>
      </Popover>

      {/* Logout confirm */}
      <Dialog open={showLogoutDialog} onClose={() => setShowLogoutDialog(false)} PaperProps={{ sx: { borderRadius: 3, minWidth: 360 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Sign Out</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to sign out? You will need to log in again to access your dashboard.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setShowLogoutDialog(false)} variant="outlined" sx={{ textTransform: "none", borderRadius: 2 }}>Cancel</Button>
          <Button onClick={() => { setShowLogoutDialog(false); logout(); }} variant="contained" color="error" autoFocus sx={{ textTransform: "none", borderRadius: 2 }}>Sign Out</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TopUtilityBar;
