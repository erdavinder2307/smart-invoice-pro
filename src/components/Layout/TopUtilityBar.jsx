import React, { useState } from "react";
import { Box, IconButton, Tooltip, Avatar, Typography, Badge, FormControl, Select, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import NotificationDropdown from "../Notifications/NotificationDropdown";
import { useNotifications } from "../../context/NotificationContext";
import GlobalSearchInput from "../search/GlobalSearchInput";
import { useKeyboardShortcutsContext } from "../../context/KeyboardShortcutsContext";
import { useTranslation } from "react-i18next";
import { safeClick } from "../../utils/safeClick";

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const TopUtilityBar = ({ searchPlaceholder = "", onSearchChange, onMenuClick }) => {
  const { t, i18n } = useTranslation();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const username = storedUser.username || "User";
  const initials = username.charAt(0).toUpperCase();
  const { unreadCount } = useNotifications();
  const [notifAnchor, setNotifAnchor] = useState(null);
  const { openShortcutsModal } = useKeyboardShortcutsContext();
  const navigate = useNavigate();

  const activeLanguage = String(i18n.language || 'en').startsWith('hi') ? 'hi' : 'en';

  const handleLanguageChange = async (event) => {
    const nextLanguage = event.target.value;
    await i18n.changeLanguage(nextLanguage);
    localStorage.setItem('app_language', nextLanguage);
  };

  return (
    <Box
      sx={{
        height: 56,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        px: { xs: 1.5, md: 2.5 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", width: "100%", maxWidth: 560, gap: 1 }}>
        <IconButton
          color="inherit"
          onClick={safeClick(onMenuClick)}
          sx={{ display: { xs: "flex", md: "none" } }}
          aria-label={t('topBar.openNavigation')}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
        <GlobalSearchInput placeholder={searchPlaceholder || t('topBar.searchPlaceholder')} onSearchChange={onSearchChange} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <FormControl size="small" sx={{ minWidth: 92 }}>
          <Select
            value={activeLanguage}
            onChange={handleLanguageChange}
            sx={{
              fontSize: '0.75rem',
              height: 30,
              '& .MuiSelect-select': { py: 0.5, pr: 3 },
            }}
            inputProps={{ 'aria-label': t('common.language') }}
          >
            <MenuItem value="en">{t('common.english')}</MenuItem>
            <MenuItem value="hi">{t('common.hindi')}</MenuItem>
          </Select>
        </FormControl>

        <Tooltip title={t('common.notifications')}>
          <IconButton color="inherit" onClick={(e) => setNotifAnchor(e.currentTarget)}>
            <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error" max={99}>
              <NotificationsOutlinedIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>
        <NotificationDropdown anchorEl={notifAnchor} onClose={() => setNotifAnchor(null)} />
        <Tooltip title={t('topBar.keyboardShortcuts', { combo: isMac ? '⌘/' : 'Ctrl+/' })}>
          <IconButton color="inherit" onClick={safeClick(openShortcutsModal)} aria-label="keyboard shortcuts">
            <KeyboardIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('common.settings')}>
          <IconButton color="inherit" onClick={() => navigate('/settings')}>
            <SettingsOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 0.5 }}>
          <Avatar sx={{ width: 28, height: 28, fontSize: "0.75rem", bgcolor: "primary.main" }}>
            {initials}
          </Avatar>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
            {username}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default TopUtilityBar;
