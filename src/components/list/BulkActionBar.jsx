import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const BulkActionBar = ({ selectedCount, actions = [] }) => {
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
      <Typography variant="body2" fontWeight={600}>{selectedCount} selected</Typography>
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
