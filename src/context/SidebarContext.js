import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("sidebarCollapsed", String(next));
  }, [isCollapsed]);

  const toggleMobileDrawer = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      isCollapsed,
      setIsCollapsed,
      toggleSidebar,
      mobileOpen,
      setMobileOpen,
      toggleMobileDrawer,
      isMobile,
    }),
    [isCollapsed, mobileOpen, isMobile, toggleSidebar, toggleMobileDrawer]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isCollapsed: false,
      setIsCollapsed: () => {},
      toggleSidebar: () => {},
      mobileOpen: false,
      setMobileOpen: () => {},
      toggleMobileDrawer: () => {},
      isMobile: false,
    };
  }
  return context;
};
