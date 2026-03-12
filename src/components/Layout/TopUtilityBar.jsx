import React from "react";
import { Box, InputBase, IconButton, Tooltip, Avatar, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

const TopUtilityBar = ({ searchPlaceholder = "Search invoices, customers, products...", onSearchChange }) => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const username = storedUser.username || "User";
  const initials = username.charAt(0).toUpperCase();

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
          <IconButton color="inherit">
            <NotificationsOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
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
