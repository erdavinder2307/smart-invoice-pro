import React from "react";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import Sidebar from "../Sidebar";

const AppLayout = () => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "grey.50" }}>
      <Sidebar />
      <Box sx={{ flex: 1, width: 0, minWidth: 0, overflowX: "hidden" }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
