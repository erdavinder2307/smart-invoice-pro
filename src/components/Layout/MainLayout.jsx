
import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import DashboardHeader from "../DashboardHeader";
import TopUtilityBar from "./TopUtilityBar";
import AppBreadcrumbs from "./AppBreadcrumbs";
import { useSidebar } from "../../context/SidebarContext";
import CommandPalette from "../keyboard/CommandPalette";
import KeyboardShortcutsModal from "../keyboard/KeyboardShortcutsModal";
import QuickCreateCustomerModal from "../keyboard/QuickCreateCustomerModal";
import QuickCreateInvoiceStarter from "../keyboard/QuickCreateInvoiceStarter";

const MainLayout = ({
    children,
    title,
    subtitle,
    showDashboardHeader = false,
    showUtilityBar = true,
    showBreadcrumbs = true,
}) => {
    const { toggleMobileDrawer } = useSidebar();

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
            {/* Global keyboard overlays — always mounted while app is open */}
            <CommandPalette />
            <KeyboardShortcutsModal />
            <QuickCreateCustomerModal />
            <QuickCreateInvoiceStarter />

            <Box component="main" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                {/* Top Utility Bar */}
                {showUtilityBar && (
                    <Box sx={{ position: 'sticky', top: 0, zIndex: 1200 }}>
                        <TopUtilityBar onMenuClick={toggleMobileDrawer} />
                    </Box>
                )}

                {/* Breadcrumb Row */}
                {showBreadcrumbs && <AppBreadcrumbs />}

                {/* Page Header Area */}
                <Box sx={{
                    bgcolor: 'white',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    px: { xs: 1.5, md: 2.5 },
                    py: title || subtitle || showDashboardHeader ? 1.5 : 0.5,
                }}>
                    {(title || subtitle) && (
                        <Box sx={{ mb: showDashboardHeader ? 1.5 : 0 }}>
                            {title && (
                                <Typography variant="h5" color="text.primary" sx={{ mb: subtitle ? 0.25 : 0 }}>
                                    {title}
                                </Typography>
                            )}
                            {subtitle && (
                                <Typography variant="body2" color="text.secondary">
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Optional Dashboard Header Components (Search, Filters etc) */}
                    {showDashboardHeader && <DashboardHeader />}
                </Box>

                {/* Main Content Area */}
                <Box sx={{ flex: 1, minWidth: 0, bgcolor: "grey.50", overflowY: "auto" }}>
                    <Container maxWidth={false} sx={{ px: { xs: 1.5, md: 2.5 }, py: 2 }}>
                        {children}
                    </Container>
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;
