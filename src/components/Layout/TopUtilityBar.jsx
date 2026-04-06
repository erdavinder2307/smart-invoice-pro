import React, { useState } from "react";
import { Box, InputBase, IconButton, Tooltip, Avatar, Typography, Badge } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import NotificationDropdown from "../Notifications/NotificationDropdown";
import { useNotifications } from "../../context/NotificationContext";

const TopUtilityBar = ({ searchPlaceholder = "Search invoices, customers, products...", onSearchChange, onMenuClick }) => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const username = storedUser.username || "User";
  const initials = username.charAt(0).toUpperCase();
  const { unreadCount } = useNotifications();
  const [notifAnchor, setNotifAnchor] = useState(null);

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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          maxWidth: 560,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "grey.50",
          px: 1,
          height: 36,
        }}
      >
        <IconButton
          color="inherit"
          onClick={onMenuClick}
          sx={{ display: { xs: "flex", md: "none" }, mr: 0.5 }}
          aria-label="open navigation menu"
        >
          <MenuIcon fontSize="small" />
        </IconButton>
        <SearchIcon sx={{ color: "text.secondary", fontSize: 18, mr: 1 }} />
        <InputBase
          placeholder={searchPlaceholder}
          onChange={(e) => onSearchChange?.(e.target.value)}
          sx={{ fontSize: "0.8125rem", width: "100%" }}
          inputProps={{ "aria-label": "global search" }}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Tooltip title="Notifications">
          <IconButton color="inherit" onClick={(e) => setNotifAnchor(e.currentTarget)}>
            <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error" max={99}>
              <NotificationsOutlinedIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>
        <NotificationDropdown anchorEl={notifAnchor} onClose={() => setNotifAnchor(null)} />
        <Tooltip title="Settings">
          <IconButton color="inherit">
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
