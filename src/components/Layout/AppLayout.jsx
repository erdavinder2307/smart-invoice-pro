import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Sidebar from "../Sidebar";
import { useAuth } from "../../context/AuthContext";
import { isDemoHost } from "../../utils/demoMode";

const AppLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to={isDemoHost() ? "/" : "/login"} replace />;
  }

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
