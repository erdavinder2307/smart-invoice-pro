import React from "react";
import { Button, Menu, MenuItem, Tooltip } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const isDev = process.env.NODE_ENV !== "production";

const DevAutoFillButton = ({
  onClick,
  onSelectMode,
  modes = [],
  sx,
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const hasModes = Array.isArray(modes) && modes.length > 0;

  if (!isDev) return null;

  const handleButtonClick = (event) => {
    if (hasModes) {
      setAnchorEl(event.currentTarget);
      return;
    }
    onClick?.();
  };

  const handleClose = () => setAnchorEl(null);

  const handleModeClick = (mode) => {
    onSelectMode?.(mode);
    handleClose();
  };

  return (
    <>
      <Tooltip title={hasModes ? "Auto-fill test data modes" : "Auto-fill empty fields with realistic mock data (Ctrl/Cmd+Shift+F)"}>
        <span>
          <Button
            type="button"
            variant="outlined"
            size="small"
            onClick={handleButtonClick}
            disabled={disabled}
            endIcon={hasModes ? <ArrowDropDownIcon /> : null}
            sx={{ textTransform: "none", borderRadius: 1.5, ...sx }}
          >
            Auto Fill
          </Button>
        </span>
      </Tooltip>

      {hasModes && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {modes.map((mode) => (
            <MenuItem key={mode.value} onClick={() => handleModeClick(mode.value)}>
              {mode.label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
};

export default DevAutoFillButton;