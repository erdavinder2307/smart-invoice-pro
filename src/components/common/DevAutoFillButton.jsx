import React from "react";
import { Button, Tooltip } from "@mui/material";

const isDev = process.env.NODE_ENV === "development";

const DevAutoFillButton = ({ onClick, sx, disabled = false }) => {
  if (!isDev) return null;

  return (
    <Tooltip title="Auto-fill empty fields with realistic mock data (Ctrl/Cmd+Shift+F)">
      <span>
        <Button
          type="button"
          variant="outlined"
          size="small"
          onClick={onClick}
          disabled={disabled}
          sx={{ textTransform: "none", borderRadius: 1.5, ...sx }}
        >
          ⚡ Auto Fill
        </Button>
      </span>
    </Tooltip>
  );
};

export default DevAutoFillButton;