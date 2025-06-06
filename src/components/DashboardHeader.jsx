import React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";

const DashboardHeader = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 2,
        p: 2,
        borderBottom: 1,
        borderColor: "divider",
        borderRadius: 0,
        bgcolor: "background.paper",
      }}
    >
      <InputBase
        placeholder="Search invoices, payments, and reports"
        sx={{
          flex: 1,
          px: 2,
          py: 1.5,
          borderRadius: 3,
          bgcolor: "#f5f7fa",
          fontSize: 16,
        }}
        inputProps={{ 'aria-label': 'search invoices, payments, and reports' }}
      />
      <Box sx={{ ml: 2 }}>
        <Avatar src="https://i.pravatar.cc/40" alt="user avatar" sx={{ width: 40, height: 40, border: '2px solid #ddd' }} />
      </Box>
    </Paper>
  );
};

export default DashboardHeader;
