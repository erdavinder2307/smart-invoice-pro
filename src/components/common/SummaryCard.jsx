import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

/**
 * SummaryCard — lightweight stat card for summary strips.
 *
 * Props:
 *  label       {string}   Bottom label text
 *  value       {string|number}
 *  icon        {ReactNode} Optional MUI icon
 *  accentColor {string}   MUI color token, e.g. "primary.main" (default)
 *  sx          {object}   Extra sx overrides
 */
const SummaryCard = ({
    label,
    value,
    icon,
    accentColor = "primary.main",
    sx = {},
}) => (
    <Paper
        elevation={0}
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2.5,
            py: 2,
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "grey.200",
            bgcolor: "background.paper",
            height: "100%",
            ...sx,
        }}
    >
        {icon && (
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    borderRadius: "10px",
                    bgcolor: `${accentColor}14`,  // 8% opacity version
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "& svg": { fontSize: 20, color: accentColor },
                }}
            >
                {icon}
            </Box>
        )}
        <Box sx={{ minWidth: 0 }}>
            <Typography
                variant="h6"
                fontWeight={700}
                color="text.primary"
                lineHeight={1.2}
                noWrap
            >
                {value ?? "—"}
            </Typography>
            <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
                noWrap
            >
                {label}
            </Typography>
        </Box>
    </Paper>
);

export default SummaryCard;
