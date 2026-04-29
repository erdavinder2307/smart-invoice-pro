import React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import { TrendingUp, TrendingDown } from "@mui/icons-material";
import { safeClick } from "../../utils/safeClick";

/**
 * StatCard — Zoho-inspired metric summary card.
 *
 * Props:
 *   icon        {ReactNode}  MUI icon element (sized & colored by parent)
 *   label       {string}     Card label (e.g. "Total Customers")
 *   value       {any}        Metric value to display
 *   trend       {number}     Optional trend % (positive = up, negative = down)
 *   trendLabel  {string}     Optional trend context (e.g. "from last month")
 *   accentColor {string}     Top border accent color (can be theme token string or hex)
 *   loading     {boolean}    Shows spinner when true
 *   iconBg      {string}     Icon container background (theme token or hex)
 */
const StatCard = ({
    icon,
    label,
    value,
    trend,
    trendLabel = "from last month",
    accentColor = "primary.main",
    loading = false,
    iconBg = "primary.50",
    sx = {},
    onClick,
    emptyState,
}) => {
    const trendPositive = trend >= 0;
    // isClickable is based on the original prop so StatCard only renders as a
    // button when an intentional handler is passed.  safeClick ensures MUI
    // never receives undefined (which causes "onClick is not a function").
    const isClickable = typeof onClick === "function";
    const clickHandler = safeClick(onClick);
    const hasEmptyState = !loading && Boolean(emptyState?.message);

    const onKeyDown = (event) => {
        if (!isClickable) return;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            clickHandler(event);
        }
    };

    return (
        <Paper
            component="div"
            onClick={clickHandler}
            onKeyDown={onKeyDown}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
            aria-label={isClickable ? label : undefined}
            elevation={1}
            sx={[
                {
                    p: 3,
                    borderRadius: 3,
                    borderTop: "4px solid",
                    borderTopColor: accentColor,
                    bgcolor: "background.paper",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    textAlign: "left",
                    borderLeft: "none",
                    borderRight: "none",
                    borderBottom: "none",
                    borderColor: "transparent",
                    ...(isClickable
                        ? {
                            cursor: "pointer",
                            "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: 3,
                            },
                        }
                        : {}),
                },
                sx,
            ]}
        >
            {/* Icon + Trend Row */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 0.5,
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
                        bgcolor: iconBg,
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </Box>

                {/* Trend badge */}
                {trend !== undefined && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.3,
                            color: trendPositive ? "success.main" : "error.main",
                        }}
                    >
                        {trendPositive ? (
                            <TrendingUp sx={{ fontSize: 16 }} />
                        ) : (
                            <TrendingDown sx={{ fontSize: 16 }} />
                        )}
                        <Typography
                            variant="caption"
                            fontWeight={600}
                            color={trendPositive ? "success.main" : "error.main"}
                        >
                            {trendPositive ? "+" : ""}
                            {trend}%
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Metric value */}
            {loading ? (
                <CircularProgress size={22} thickness={5} />
            ) : hasEmptyState ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {emptyState.message}
                    </Typography>
                    {emptyState.actionLabel && typeof emptyState.onAction === "function" && (
                        <Button
                            size="small"
                            variant="outlined"
                            sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
                            onClick={(event) => {
                                event.stopPropagation();
                                emptyState.onAction();
                            }}
                        >
                            {emptyState.actionLabel}
                        </Button>
                    )}
                </Box>
            ) : (
                <Typography variant="h5" fontWeight={700} color="text.primary" lineHeight={1.2}>
                    {value ?? "—"}
                </Typography>
            )}

            {/* Label */}
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {label}
            </Typography>

            {/* Trend context */}
            {trendLabel && trend !== undefined && !hasEmptyState && (
                <Typography variant="caption" color="text.disabled">
                    {trendLabel}
                </Typography>
            )}
        </Paper>
    );
};

export default StatCard;
