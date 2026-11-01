import React from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";

const PortalLayout = () => {
  const { user, loading, logout, isCustomerWorkspace } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Staff who accidentally land on /portal/* should go to financial dashboard
  if (!isCustomerWorkspace) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "grey.50" }}>
      <AppBar position="static" elevation={1} sx={{ bgcolor: "white", color: "text.primary" }}>
        <Toolbar>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ flexGrow: 1, color: "primary.main", cursor: "pointer" }}
            onClick={() => navigate("/portal/dashboard")}
          >
            Solidev Books — Customer Portal
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, color: "text.secondary" }}>
            {user.name || user.username}
          </Typography>
          <Button variant="outlined" size="small" onClick={handleLogout}>
            Log out
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default PortalLayout;
