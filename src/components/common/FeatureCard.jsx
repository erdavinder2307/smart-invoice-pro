import React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

/**
 * FeatureCard — Product capability overview card.
 *
 * Props:
 *   icon    {ReactNode}                           MUI icon element
 *   title   {string}                              Feature name
 *   status  {"Live" | "In Progress" | "Planned"}  Release status
 */
const STATUS_CONFIG = {
    Live: { color: "success", label: "Live" },
    "In Progress": { color: "warning", label: "In Progress" },
    Planned: { color: "default", label: "Planned" },
};

const FeatureCard = ({ icon, title, status = "Planned" }) => {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Planned;

    return (
        <Paper
            elevation={1}
            sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: "background.paper",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 1.5,
                height: "100%",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3,
                },
            }}
        >
            {/* Icon */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor:
                        cfg.color === "success"
                            ? "success.50"
                            : cfg.color === "warning"
                                ? "warning.50"
                                : "grey.100",
                    color:
                        cfg.color === "success"
                            ? "success.main"
                            : cfg.color === "warning"
                                ? "warning.main"
                                : "text.secondary",
                }}
            >
                {icon}
            </Box>

            {/* Title */}
            <Typography variant="body1" fontWeight={600} color="text.primary">
                {title}
            </Typography>

            {/* Status badge */}
            <Chip
                label={cfg.label}
                color={cfg.color}
                size="small"
                variant={cfg.color === "default" ? "outlined" : "filled"}
                sx={{ fontWeight: 600, fontSize: "0.7rem" }}
            />
        </Paper>
    );
};

export default FeatureCard;
