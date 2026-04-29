import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { safeClick } from "../../utils/safeClick";

const SectionHeader = ({
  title,
  subtitle,
  primaryAction,
  secondaryActions = [],
  sx = {},
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
        mb: 2,
        ...sx,
      }}
    >
      <Box>
        <Typography variant="h5" color="text.primary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      <Stack direction="row" spacing={1}>
        {secondaryActions.map((action) => (
          <Button
            key={action.key || action.label}
            variant={action.variant || "outlined"}
            onClick={safeClick(action.onClick)}
            startIcon={action.icon}
            color={action.color || "inherit"}
            disabled={action.disabled || typeof action.onClick !== "function"}
          >
            {action.label}
          </Button>
        ))}

        {primaryAction && (
          <Button
            variant="contained"
            onClick={safeClick(primaryAction.onClick)}
            startIcon={primaryAction.icon}
            disabled={primaryAction.disabled || typeof primaryAction.onClick !== "function"}
            color={primaryAction.color || "primary"}
          >
            {primaryAction.label}
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default SectionHeader;
