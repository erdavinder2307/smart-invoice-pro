
import React from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import Sidebar from "../Sidebar";
import UserHeaderProfile from "../UserHeaderProfile";
import { useLocation } from "react-router-dom";
import Typography from "@mui/material/Typography";
import DashboardHeader from "../DashboardHeader";

const MainLayout = ({ children, title, subtitle, showDashboardHeader = false }) => {
    const theme = useTheme();

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "grey.50" }}>
            <Sidebar />
            <Box component="main" sx={{ flex: 1, width: 0, display: 'flex', flexDirection: 'column' }}>
                {/* Modern Header Area */}
                <Box sx={{
                    bgcolor: 'white',
                    borderBottom: '1px solid',
                    borderColor: 'grey.300',
                    px: { xs: 1.5, md: 2.5 },
                    py: 1.5,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1100
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: showDashboardHeader ? 1.5 : 0 }}>
                        {/* Title Section */}
                        <Box>
                            {title && (
                                <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ mb: subtitle ? 0.5 : 0 }}>
                                    {title}
                                </Typography>
                            )}
                            {subtitle && (
                                <Typography variant="body2" color="text.secondary">
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>

                        {/* User Profile Section */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <UserHeaderProfile />
                        </Box>
                    </Box>

                    {/* Optional Dashboard Header Components (Search, Filters etc) */}
                    {showDashboardHeader && <DashboardHeader />}
                </Box>

                {/* Main Content Area */}
                <Box sx={{ flex: 1, p: { xs: 1.5, md: 2.5 }, bgcolor: "grey.50", overflowY: "auto" }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;
