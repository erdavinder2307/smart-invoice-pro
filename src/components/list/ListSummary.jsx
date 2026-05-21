import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

const ListSummary = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
      {items.map((item) => (
        <Chip
          key={item.label}
          label={`${item.label}: ${item.value}`}
          color={item.color || "default"}
          variant={item.variant || (item.active ? "filled" : "outlined")}
          onClick={item.onClick}
          clickable={Boolean(item.onClick)}
          sx={{
            fontWeight: 600,
            transition: "all 0.2s ease",
            ...(item.active ? { boxShadow: 2 } : {}),
            ...(item.onClick
              ? {
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: item.active ? 3 : 1,
                  },
                }
              : {}),
          }}
        />
      ))}
      <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center", ml: 0.5 }}>
        Summary
      </Typography>
    </Box>
  );
};

export default ListSummary;
