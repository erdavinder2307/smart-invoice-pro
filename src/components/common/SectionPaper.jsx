import React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/**
 * SectionPaper — Consistent section/panel wrapper.
 *
 * Props:
 *   title     {string}     Section heading
 *   subtitle  {string}     Optional sub-heading
 *   action    {ReactNode}  Optional right-aligned element (chip, button, select, etc.)
 *   children  {ReactNode}  Section body content
 *   sx        {object}     Additional sx overrides for the Paper
 */
const SectionPaper = ({ title, subtitle, action, children, sx = {} }) => {
    return (
        <Paper
            elevation={1}
            sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "background.paper",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                ...sx,
            }}
        >
            {/* Header Row */}
            {(title || action) && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: subtitle ? 0.5 : 2,
                    }}
                >
                    {/* Title + Subtitle */}
                    <Box>
                        {title && (
                            <Typography variant="h6" fontWeight={600} color="text.primary">
                                {title}
                            </Typography>
                        )}
                        {subtitle && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.25, mb: 1.5 }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>

                    {/* Right-aligned action */}
                    {action && (
                        <Box sx={{ flexShrink: 0, ml: 2 }}>
                            {action}
                        </Box>
                    )}
                </Box>
            )}

            {/* Body */}
            <Box sx={{ flex: 1 }}>{children}</Box>
        </Paper>
    );
};

export default SectionPaper;
