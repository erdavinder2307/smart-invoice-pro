import React, { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Sidebar from "../Sidebar";
import DemoBanner from "../DemoBanner";
import DemoAttribution from "../DemoAttribution";
import { useAuth } from "../../context/AuthContext";
import { isDemoHost, isDemoUser, openInteractiveWorkspace } from "../../utils/demoMode";

const AppLayout = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && isDemoUser(user) && !isDemoHost()) {
      openInteractiveWorkspace(window.location.pathname || '/dashboard');
    }
  }, [loading, user]);

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
      <Box sx={{ flex: 1, width: 0, minWidth: 0, overflowX: "hidden", display: "flex", flexDirection: "column" }}>
        <DemoBanner />
        <Box sx={{ flex: 1, overflowX: "hidden", display: "flex", flexDirection: "column" }}>
          <Outlet />
          <DemoAttribution />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
