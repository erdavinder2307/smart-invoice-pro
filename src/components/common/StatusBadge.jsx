import React from "react";
import Chip from "@mui/material/Chip";

/**
 * StatusBadge — maps invoice/customer status → styled MUI Chip.
 *
 * Props:
 *  status  {string}  e.g. "Paid", "Overdue", "Draft", "Pending", "Active", "Inactive"
 *  size    {string}  "small" (default) | "medium"
 */

const STATUS_MAP = {
    open: { label: "Open", color: "info" },
    unpaid: { label: "Open", color: "info" },
    paid: { label: "Paid", color: "success" },
    "partially paid": { label: "Partially Paid", color: "warning" },
    overdue: { label: "Overdue", color: "error" },
    draft: { label: "Draft", color: "default" },
    pending: { label: "Pending", color: "info" },
    issued: { label: "Issued", color: "info" },
    active: { label: "Active", color: "success" },
    inactive: { label: "Inactive", color: "default" },
    archived: { label: "Archived", color: "default" },
    discontinued: { label: "Discontinued", color: "default" },
};

const StatusBadge = ({ status = "", size = "small" }) => {
    const key = status.toLowerCase();
    const cfg = STATUS_MAP[key] || { label: status, color: "default" };

    return (
        <Chip
            label={cfg.label}
            color={cfg.color}
            size={size}
            sx={{
                fontWeight: 600,
                fontSize: "0.72rem",
                letterSpacing: 0.3,
                minWidth: 68,
                borderRadius: "6px",
            }}
        />
    );
};

export default StatusBadge;
