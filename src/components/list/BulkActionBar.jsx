import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const BulkActionBar = ({ selectedCount, infoText = "", actions = [] }) => {
  if (!selectedCount) return null;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
        flexWrap: "wrap",
        p: 1.25,
        borderRadius: 2,
        bgcolor: "primary.50",
        border: "1px solid",
        borderColor: "primary.100",
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, mr: 0.5 }}>
        <Typography variant="body2" fontWeight={600}>{selectedCount} selected</Typography>
        {infoText ? (
          <Typography variant="caption" color="text.secondary">{infoText}</Typography>
        ) : null}
      </Box>
      {actions.map((action) => (
        <Button
          key={action.label}
          size="small"
          variant={action.variant || "outlined"}
          color={action.color || "primary"}
          onClick={action.onClick}
          disabled={action.disabled}
          sx={{ textTransform: "none" }}
        >
          {action.label}
        </Button>
      ))}
    </Box>
  );
};

export default BulkActionBar;
